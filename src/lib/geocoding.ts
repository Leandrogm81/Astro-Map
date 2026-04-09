import { GeocodingResult } from '@/types';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

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

    const data = await response.json();
    
    return (data as any[]).map((item) => ({
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

export function isBrazilianDST(date: Date): boolean {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Brasil aboliu o horário de verão em 2019
  if (year >= 2019) return false;

  // Antes de 1985, não havia horário de verão consistente
  if (year < 1985) return false;

  // Verão brasileiro: de outubro a fevereiro
  // Início: terceiro domingo de outubro do ano anterior
  // Fim: terceiro domingo de fevereiro do ano atual (ou terceiro domingo de março em alguns anos)

  // Simplificação: considerar DST ativo de outubro a fevereiro
  // Isso cobre a grande maioria dos casos com precisão suficiente para astrologia
  if (month === 11 || month === 12 || month === 1) return true;
  if (month === 10 && day >= 15) return true;
  if (month === 2 && day <= 15) return true;

  // Alguns anos tinham março também
  if (month === 2 && day <= 28) return true;

  return false;
}

export function getBrazilianTimezone(lon: number): number {
  // Garantir longitude negativa para o hemisfério ocidental
  const normalizedLon = lon > 0 ? -lon : lon;

  if (normalizedLon >= -35) return -2;      // Fernando de Noronha
  if (normalizedLon >= -44.5) return -3;      // Brasília (SP, RJ, MG, BA, etc.)
  if (normalizedLon >= -52) return -3;        // Sul (PR, SC, RS)
  if (normalizedLon >= -56) return -4;        // Mato Grosso do Sul oeste
  if (normalizedLon >= -60) return -4;        // Mato Grosso, Amazonas leste
  if (normalizedLon >= -66) return -4;        // Amazonas, Rondônia, Roraima
  if (normalizedLon >= -74) return -5;        // Acre

  return -3; // Default: Brasília
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
