import { PlanetPosition, HouseCusp, ZodiacSign, TraditionalPoint, TraditionalPoints } from '@/types';
import { calculateEssentialDignity, getFaceRuler, getTermRuler } from './dignities';
import { getTraditionalDomicileRuler, getTraditionalExaltationRuler, getTraditionalTriplicityRulers } from './rulers';

/**
 * Calcula os pontos fundamentais da Astrologia Tradicional
 */
export function calculateTraditionalPoints(
  ascendant: number,
  planets: PlanetPosition[],
  houses: HouseCusp[],
  isDay: boolean
): TraditionalPoints {
  const getPlanet = (id: string) => planets.find(p => p.id === id);
  const sun = getPlanet('sun')!;
  const moon = getPlanet('moon')!;
  const fortuneLon = calculateFortune(sun, moon, ascendant, isDay);
  
  // 1. Lord of Nativity (Regente do Ascendente)
  const ascSign = houses[0].sign as ZodiacSign;
  const lordOfNativityId = getTraditionalDomicileRuler(ascSign);
  const lordOfNativityPlanet = getPlanet(lordOfNativityId)!;

  // 2. Hyleg (Doador da Vida)
  const hylegId = calculateHylegId(sun, moon, ascendant, isDay);
  const hylegPlanet = hylegId === 'ascendant' ? { name: 'Ascendente', symbol: 'ASC' } : getPlanet(hylegId)!;

  // 3. Almuten Figuris (Vencedor do Mapa)
  const almutenId = calculateAlmutenFigurisId(planets, fortuneLon, houses, ascendant, isDay);
  const almutenPlanet = getPlanet(almutenId)!;

  // 4. Alcocoden (Doador de Anos)
  const alcocodenId = calculateAlcocodenId(hylegId, planets, isDay);
  const alcocodenPlanet = getPlanet(alcocodenId)!;

  return {
    hyleg: {
      id: hylegId,
      name: hylegPlanet.name,
      label: 'Hyleg',
      description: 'O Doador da Vida. Representa a vitalidade física e a força energética que sustenta o corpo.'
    },
    alcocoden: {
      id: alcocodenId,
      name: alcocodenPlanet.name,
      label: 'Alcocoden',
      description: 'O Doador de Anos. Indica a longevidade potencial e a qualidade da manutenção da vida.'
    },
    almutenFiguris: {
      id: almutenId,
      name: almutenPlanet.name,
      label: 'Almuten Figuris',
      description: 'O Guardião do Mapa. É o planeta com maior autoridade e dignidade sobre os pontos vitais.'
    },
    lordOfNativity: {
      id: lordOfNativityId,
      name: lordOfNativityPlanet.name,
      label: 'Senhor do Ascendente',
      description: 'O Leme da Vida. Governa a direção pessoal, o caráter e a expressão externa do indivíduo.'
    }
  };
}

function calculateFortune(sun: PlanetPosition, moon: PlanetPosition, asc: number, isDay: boolean): number {
  if (isDay) {
    return (asc + moon.longitude - sun.longitude + 360) % 360;
  } else {
    return (asc + sun.longitude - moon.longitude + 360) % 360;
  }
}

function calculateHylegId(sun: PlanetPosition, moon: PlanetPosition, asc: number, isDay: boolean): string {
  const hylegPlaces = [1, 10, 11, 7, 9];

  if (isDay) {
    if (hylegPlaces.includes(sun.house || 0)) return 'sun';
    if (hylegPlaces.includes(moon.house || 0)) return 'moon';
  } else {
    if (hylegPlaces.includes(moon.house || 0)) return 'moon';
    if (hylegPlaces.includes(sun.house || 0)) return 'sun';
  }
  
  return 'ascendant';
}

function calculateAlmutenFigurisId(
  planets: PlanetPosition[], 
  fortuneLon: number, 
  houses: HouseCusp[], 
  ascLon: number, 
  isDay: boolean
): string {
  const classicIds = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  const scores: Record<string, number> = {};
  classicIds.forEach(id => scores[id] = 0);

  const pointsToEvaluate = [
    { lon: planets.find(p => p.id === 'sun')!.longitude, weight: 1 },
    { lon: planets.find(p => p.id === 'moon')!.longitude, weight: 1 },
    { lon: ascLon, weight: 1 },
    { lon: fortuneLon, weight: 1 }
  ];

  pointsToEvaluate.forEach(pt => {
    const sign = getSignFromLon(pt.lon);
    const degree = pt.lon % 30;
    
    const dom = getTraditionalDomicileRuler(sign);
    const exa = getTraditionalExaltationRuler(sign);
    const tris = getTraditionalTriplicityRulers(sign, isDay);
    const term = getTermRuler(sign, degree);
    const face = getFaceRuler(sign, degree);

    if (scores[dom] !== undefined) scores[dom] += 5;
    if (exa && scores[exa] !== undefined) scores[exa] += 4;
    tris.forEach(tri => { if (scores[tri] !== undefined) scores[tri] += 3; });
    if (scores[term] !== undefined) scores[term] += 2;
    if (scores[face] !== undefined) scores[face] += 1;
  });

  planets.forEach(p => {
    if (!classicIds.includes(p.id)) return;
    const house = p.house || 0;
    if ([1, 4, 7, 10].includes(house)) scores[p.id] += 7;
    else if ([2, 5, 8, 11].includes(house)) scores[p.id] += 3;
  });

  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

function calculateAlcocodenId(hylegId: string, planets: PlanetPosition[], isDay: boolean): string {
  if (hylegId === 'ascendant' || hylegId === 'mc') {
    const ascSign = planets.find(p => p.id === 'sun')?.sign; // Fallback
    return getTraditionalDomicileRuler(ascSign as ZodiacSign || 'Áries');
  }
  
  const hylegPlanet = planets.find(p => p.id === hylegId)!;
  const hylegSign = hylegPlanet.sign as ZodiacSign;
  return getTraditionalDomicileRuler(hylegSign);
}

function getSignFromLon(lon: number): ZodiacSign {
  const signs: ZodiacSign[] = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'];
  return signs[Math.floor(lon / 30)];
}
