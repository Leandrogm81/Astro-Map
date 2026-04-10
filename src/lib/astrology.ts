export { ZODIAC_SIGNS } from '@/types';
import { ZodiacSign, PlanetPosition, HouseCusp } from '@/types';
import { ZODIAC_SIGNS } from '@/types';

export function getZodiacSign(longitude: number): ZodiacSign {
  const normalized = longitude % 360;
  const index = Math.floor(normalized / 30) % 12;
  return ZODIAC_SIGNS[index].name;
}

export function getSignDegree(longitude: number): number {
  return longitude % 30;
}

export function formatDegree(degree: number): string {
  const d = Math.floor(degree);
  const m = Math.floor((degree - d) * 60);
  return `${d}°${m.toString().padStart(2, '0')}'`;
}

export function getHouseForPlanet(longitude: number, houses: HouseCusp[]): number {
  // Encontra em qual casa o planeta está
  for (let i = 0; i < 12; i++) {
    const houseStart = houses[i].longitude;
    const houseEnd = houses[(i + 1) % 12].longitude;
    
    // Trata o caso de "wrap around" (casa que cruza 0°)
    if (houseEnd < houseStart) {
      if (longitude >= houseStart || longitude < houseEnd) {
        return i + 1;
      }
    } else {
      if (longitude >= houseStart && longitude < houseEnd) {
        return i + 1;
      }
    }
  }
  return 1; // Default para casa 1
}

export function getElementColor(element: 'fire' | 'earth' | 'air' | 'water'): string {
  switch (element) {
    case 'fire':
      return '#ef4444'; // red-500
    case 'earth':
      return '#22c55e'; // green-500
    case 'air':
      return '#3b82f6'; // blue-500
    case 'water':
      return '#06b6d4'; // cyan-500
  }
}

export function getDignity(planet: string, sign: ZodiacSign): string {
  // Traduzir para chaves internas simplificadas se vier em português
  const p = planet.toLowerCase();
  
  // Domicílios
  const dom: Record<string, ZodiacSign[]> = {
    'sol': ['Leão'],
    'lua': ['Câncer'],
    'mercúrio': ['Gêmeos', 'Virgem'],
    'vênus': ['Touro', 'Libra'],
    'marte': ['Áries', 'Escorpião'],
    'júpiter': ['Sagitário', 'Peixes'],
    'saturno': ['Capricórnio', 'Aquário'],
    'urano': ['Aquário'], // Moderno
    'netuno': ['Peixes'], // Moderno
    'plutão': ['Escorpião'], // Moderno
  };

  // Exílio (Oposto do Domicílio)
  const exilio: Record<string, ZodiacSign[]> = {
    'sol': ['Aquário'],
    'lua': ['Capricórnio'],
    'mercúrio': ['Sagitário', 'Peixes'],
    'vênus': ['Escorpião', 'Áries'],
    'marte': ['Libra', 'Touro'],
    'júpiter': ['Gêmeos', 'Virgem'],
    'saturno': ['Câncer', 'Leão'],
    'urano': ['Leão'],
    'netuno': ['Virgem'],
    'plutão': ['Touro'],
  };

  // Exaltações
  const exaltacao: Record<string, ZodiacSign[]> = {
    'sol': ['Áries'],
    'lua': ['Touro'],
    'mercúrio': ['Virgem'],
    'vênus': ['Peixes'],
    'marte': ['Capricórnio'],
    'júpiter': ['Câncer'],
    'saturno': ['Libra'],
  };

  // Queda (Oposto da exaltação)
  const queda: Record<string, ZodiacSign[]> = {
    'sol': ['Libra'],
    'lua': ['Escorpião'],
    'mercúrio': ['Peixes'],
    'vênus': ['Virgem'],
    'marte': ['Câncer'],
    'júpiter': ['Capricórnio'],
    'saturno': ['Áries'],
  };

  if (dom[p]?.includes(sign)) return 'Domicílio';
  if (exaltacao[p]?.includes(sign)) return 'Exaltação';
  if (exilio[p]?.includes(sign)) return 'Exílio';
  if (queda[p]?.includes(sign)) return 'Queda';
  return 'Neutro / Peregrino';
}

export function calculateAspectType(angle: number): { type: string; exactAngle: number } | null {
  const aspects = [
    { angle: 0, name: 'conjunção' },
    { angle: 60, name: 'sextil' },
    { angle: 90, name: 'quadratura' },
    { angle: 120, name: 'trígono' },
    { angle: 180, name: 'oposição' },
    { angle: 30, name: 'semisextil' },
    { angle: 45, name: 'semiquadratura' },
    { angle: 135, name: 'sesquiquadratura' },
    { angle: 150, name: 'quincúncio' },
  ];

  for (const aspect of aspects) {
    const diff = Math.abs(angle - aspect.angle);
    if (diff <= 8 || diff >= 352) { // orb de 8°
      return { type: aspect.name, exactAngle: aspect.angle };
    }
    // Verifica ângulo no outro sentido
    const diff2 = Math.abs(angle - (360 - aspect.angle));
    if (diff2 <= 8) {
      return { type: aspect.name, exactAngle: aspect.angle };
    }
  }

  return null;
}

export function calculateCrossAspects(planetsA: PlanetPosition[], planetsB: PlanetPosition[]) {
  const aspects: any[] = [];
  
  planetsA.forEach(p1 => {
    planetsB.forEach(p2 => {
      const diff = Math.abs(p1.longitude - p2.longitude);
      const angle = diff > 180 ? 360 - diff : diff;
      
      const aspectData = calculateAspectType(angle);
      
      if (aspectData) {
        // Mapear nomes de volta para AspectType se necessário, ou manter string
        aspects.push({
          planet1: p1.name,
          planet2: p2.name,
          type: aspectData.type,
          angle: angle,
          orb: Math.abs(angle - aspectData.exactAngle),
          applying: false // Simplificado para revolução
        });
      }
    });
  });
  
  return aspects;
}
