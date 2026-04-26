import { GeocodingResult } from '@/types';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

interface NominatimSearchResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

export async function geocodeLocation(query: string): Promise<GeocodingResult[]> {
  if (!query || query.length < 3) {
    return [];
  }

  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: '5',
      addressdetails: '1',
      'accept-language': 'pt-BR',
      countrycodes: 'br', // Filtra resultados para o Brasil
    });

    const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      headers: {
        'User-Agent': 'AstroMap/1.0 (astrology app)',
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding error: ${response.status}`);
    }

    const data = await response.json() as NominatimSearchResult[];
    
    return data.map((item) => ({
      display_name: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      address: {
        city: item.address?.city || item.address?.town || item.address?.village,
        state: item.address?.state,
        country: item.address?.country,
      },
    }));
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      format: 'json',
      'accept-language': 'pt-BR',
    });

    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
      headers: {
        'User-Agent': 'AstroMap/1.0 (astrology app)',
      },
    });

    if (!response.ok) {
      throw new Error(`Reverse geocoding error: ${response.status}`);
    }

    const data = await response.json();
    return data.display_name || null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

/**
 * Detecta se uma data estava dentro do Horário de Verão brasileiro.
 * Regra geral histórica: Inicia no 3º domingo de outubro e termina no 3º domingo de fevereiro.
 * Otimizado para o território brasileiro.
 */
export function isBrazilianDST(date: Date): boolean {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  // Brasil aboliu o horário de verão em 2019
  if (year >= 2019) return false;

  // Antes de 1985, não havia horário de verão consistente
  if (year < 1985) return false;

  // Meses garantidos (Novembro, Dezembro, Janeiro)
  if (month === 11 || month === 12 || month === 1) return true;
  
  // Meses de transição (Outubro e Fevereiro)
  if (month === 10 || month === 2) {
    const day = date.getDate();
    
    // Função auxiliar para encontrar o dia do 3º domingo do mês
    const getThirdSunday = (y: number, m: number) => {
      let count = 0;
      for (let d = 1; d <= 31; d++) {
        const dObj = new Date(y, m - 1, d);
        if (dObj.getMonth() + 1 !== m) break;
        if (dObj.getDay() === 0) { // 0 = Domingo
          count++;
          if (count === 3) return d;
        }
      }
      return 20; // Fallback seguro
    };

    const thirdSunday = getThirdSunday(year, month);

    if (month === 10) return day >= thirdSunday;
    if (month === 2) return day < thirdSunday;
  }

  return false;
}

/**
 * Retorna o fuso horário base (UTC offset) estimado para longitudes no Brasil.
 * @param lon Longitude em graus decimais
 */
export function getBrazilianTimezone(lon: number): number {
  // Nota: Longitudes brasileiras são negativas (oeste de Greenwich)
  if (lon >= -35) return -2;      // Fernando de Noronha
  if (lon >= -44.5) return -3;    // Brasília (Leste)
  if (lon >= -52) return -3;      // Sul/Sudeste/Nordeste
  if (lon >= -56) return -4;      // Mato Grosso do Sul / Mato Grosso leste
  if (lon >= -60) return -4;      // Amazonas leste
  if (lon >= -66) return -4;      // Amazonas oeste
  if (lon >= -74) return -5;      // Acre
  
  return -3; // Default: Brasília/Sudeste
}

export function getTimezoneFromCoordinates(lat: number, lon: number): string {
  const baseOffset = getBrazilianTimezone(lon);

  return `UTC${baseOffset >= 0 ? '+' : ''}${baseOffset}:00`;
}

export function getTimezoneOffsetForDate(lat: number, lon: number, date: Date): string {
  const baseOffset = getBrazilianTimezone(lon);
  const dst = isBrazilianDST(date);
  const effectiveOffset = dst ? baseOffset + 1 : baseOffset;

  return `UTC${effectiveOffset >= 0 ? '+' : ''}${effectiveOffset}:00`;
}
