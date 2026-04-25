import { PlanetPosition, HouseCusp, ZodiacSign, TraditionalPoints, AlmutenFigurisBreakdown, AlmutenFigurisBreakdownPoint } from '@/types';
import { getFaceRuler, getTermRuler } from './dignities';
import { getTraditionalDomicileRuler, getTraditionalExaltationRuler, getTraditionalTriplicityRulers } from './rulers';

/**
 * Calcula os pontos fundamentais da Astrologia Tradicional
 */
export function calculateTraditionalPoints(
  ascendant: number,
  planets: PlanetPosition[],
  houses: HouseCusp[],
  isDay: boolean,
  prenatalSyzygy?: number
): TraditionalPoints {
  const getPlanet = (id: string) => planets.find(p => p.id === id);
  const sun = getPlanet('sun');
  const moon = getPlanet('moon');

  if (!sun || !moon) {
    return {
      hyleg: { id: 'sun', name: 'Sol', label: 'Hyleg', description: 'Dados insuficientes.', method: 'basic' },
      alcocoden: { id: 'sun', name: 'Sol', label: 'Alcocoden', description: 'Dados insuficientes.', method: 'basic' },
      almutenFiguris: { id: 'sun', name: 'Sol', label: 'Almuten Figuris', description: 'Dados insuficientes.' },
      lordOfNativity: { id: 'sun', name: 'Sol', label: 'Senhor do Ascendente', description: 'Dados insuficientes.' }
    };
  }

  const fortuneLon = calculateFortune(sun, moon, ascendant, isDay);

  // 1. Lord of Nativity (Regente do Ascendente)
  const ascSign = houses?.[0]?.sign as ZodiacSign ?? 'Áries';
  const lordOfNativityId = getTraditionalDomicileRuler(ascSign);
  const lordOfNativityPlanet = getPlanet(lordOfNativityId) ?? { name: 'Desconhecido', symbol: '?' };

  // 2. Hyleg (Doador da Vida)
  const hylegId = calculateHylegId(sun, moon, ascendant, isDay);
  const hylegPlanet = hylegId === 'ascendant' ? { name: 'Ascendente', symbol: 'ASC' } : (getPlanet(hylegId) ?? { name: 'Desconhecido', symbol: '?' });

  // 3. Almuten Figuris (Vencedor do Mapa)
  const almutenId = calculateAlmutenFigurisId(planets, fortuneLon, houses, ascendant, isDay, prenatalSyzygy);
  const almutenPlanet = getPlanet(almutenId) ?? { name: 'Desconhecido', symbol: '?' };

  // 4. Alcocoden (Doador de Anos)
  const alcocodenId = calculateAlcocodenId(hylegId, planets, isDay, houses);
  const alcocodenPlanet = getPlanet(alcocodenId) ?? { name: 'Desconhecido', symbol: '?' };

  const almutenGrade: 'complete_with_prenatal_syzygy' | 'complete' = prenatalSyzygy !== undefined ? 'complete_with_prenatal_syzygy' : 'complete';

  return {
    hyleg: {
      id: hylegId,
      name: hylegPlanet.name,
      label: 'Hyleg',
      description: 'O Doador da Vida. (Método simplificado experimental — não representa cálculo medieval completo.)',
      method: 'simplified'
    },
    alcocoden: {
      id: alcocodenId,
      name: alcocodenPlanet.name,
      label: 'Alcocoden',
      description: 'O Doador de Anos. (Método simplificado experimental baseado no regente do signo do Hyleg.)',
      method: 'simplified'
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
    },
    almutenFigurisBreakdown: calculateAlmutenFigurisBreakdown(planets, fortuneLon, ascendant, isDay, prenatalSyzygy),
    methodMetadata: {
      almutenFiguris: almutenGrade,
      hyleg: 'simplified',
      alcocoden: 'simplified',
      houseSystem: 'placidus',
      sect: 'corrected_basic',
      aspects: 'moiety_basic'
    }
  };
}

export function calculateAlmutenFigurisBreakdown(
  planets: PlanetPosition[],
  fortuneLon: number,
  ascLon: number,
  isDay: boolean,
  prenatalSyzygy?: number
): AlmutenFigurisBreakdown {
  const classicIds = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  const scores: Record<string, number> = {};
  classicIds.forEach(id => scores[id] = 0);

  const sun = planets.find(p => p.id === 'sun');
  const moon = planets.find(p => p.id === 'moon');

  const points: AlmutenFigurisBreakdownPoint[] = [
    {
      label: 'Sol',
      longitude: sun?.longitude ?? ascLon,
      sign: getSignFromLon(sun?.longitude ?? ascLon),
      degree: (sun?.longitude ?? ascLon) % 30,
      domicileRuler: getTraditionalDomicileRuler(getSignFromLon(sun?.longitude ?? ascLon)),
      exaltationRuler: getTraditionalExaltationRuler(getSignFromLon(sun?.longitude ?? ascLon)),
      triplicityRulers: getTraditionalTriplicityRulers(getSignFromLon(sun?.longitude ?? ascLon), isDay),
      termRuler: getTermRuler(getSignFromLon(sun?.longitude ?? ascLon), (sun?.longitude ?? ascLon) % 30),
      faceRuler: getFaceRuler(getSignFromLon(sun?.longitude ?? ascLon), (sun?.longitude ?? ascLon) % 30)
    },
    {
      label: 'Lua',
      longitude: moon?.longitude ?? ascLon,
      sign: getSignFromLon(moon?.longitude ?? ascLon),
      degree: (moon?.longitude ?? ascLon) % 30,
      domicileRuler: getTraditionalDomicileRuler(getSignFromLon(moon?.longitude ?? ascLon)),
      exaltationRuler: getTraditionalExaltationRuler(getSignFromLon(moon?.longitude ?? ascLon)),
      triplicityRulers: getTraditionalTriplicityRulers(getSignFromLon(moon?.longitude ?? ascLon), isDay),
      termRuler: getTermRuler(getSignFromLon(moon?.longitude ?? ascLon), (moon?.longitude ?? ascLon) % 30),
      faceRuler: getFaceRuler(getSignFromLon(moon?.longitude ?? ascLon), (moon?.longitude ?? ascLon) % 30)
    },
    {
      label: 'Ascendente',
      longitude: ascLon,
      sign: getSignFromLon(ascLon),
      degree: ascLon % 30,
      domicileRuler: getTraditionalDomicileRuler(getSignFromLon(ascLon)),
      exaltationRuler: getTraditionalExaltationRuler(getSignFromLon(ascLon)),
      triplicityRulers: getTraditionalTriplicityRulers(getSignFromLon(ascLon), isDay),
      termRuler: getTermRuler(getSignFromLon(ascLon), ascLon % 30),
      faceRuler: getFaceRuler(getSignFromLon(ascLon), ascLon % 30)
    },
    {
      label: 'Parte da Fortuna',
      longitude: fortuneLon,
      sign: getSignFromLon(fortuneLon),
      degree: fortuneLon % 30,
      domicileRuler: getTraditionalDomicileRuler(getSignFromLon(fortuneLon)),
      exaltationRuler: getTraditionalExaltationRuler(getSignFromLon(fortuneLon)),
      triplicityRulers: getTraditionalTriplicityRulers(getSignFromLon(fortuneLon), isDay),
      termRuler: getTermRuler(getSignFromLon(fortuneLon), fortuneLon % 30),
      faceRuler: getFaceRuler(getSignFromLon(fortuneLon), fortuneLon % 30)
    }
  ];

  if (prenatalSyzygy !== undefined) {
    points.push({
      label: 'Sizígia Pré-Natal',
      longitude: prenatalSyzygy,
      sign: getSignFromLon(prenatalSyzygy),
      degree: prenatalSyzygy % 30,
      domicileRuler: getTraditionalDomicileRuler(getSignFromLon(prenatalSyzygy)),
      exaltationRuler: getTraditionalExaltationRuler(getSignFromLon(prenatalSyzygy)),
      triplicityRulers: getTraditionalTriplicityRulers(getSignFromLon(prenatalSyzygy), isDay),
      termRuler: getTermRuler(getSignFromLon(prenatalSyzygy), prenatalSyzygy % 30),
      faceRuler: getFaceRuler(getSignFromLon(prenatalSyzygy), prenatalSyzygy % 30)
    });
  }

  points.forEach(pt => {
    const dom = pt.domicileRuler;
    const exa = pt.exaltationRuler;
    const tris = pt.triplicityRulers;
    const term = pt.termRuler;
    const face = pt.faceRuler;

    if (scores[dom] !== undefined) scores[dom] += 5;
    if (exa && scores[exa] !== undefined) scores[exa] += 4;
    tris.forEach(tri => { if (scores[tri] !== undefined) scores[tri] += 3; });
    if (scores[term] !== undefined) scores[term] += 2;
    if (scores[face] !== undefined) scores[face] += 1;
  });

  return { points, scores };
}

function calculateFortune(sun: PlanetPosition, moon: PlanetPosition, asc: number, isDay: boolean): number {
  if (isDay) {
    return (asc + moon.longitude - sun.longitude + 360) % 360;
  } else {
    return (asc + sun.longitude - moon.longitude + 360) % 360;
  }
}

function calculateHylegId(sun: PlanetPosition, moon: PlanetPosition, asc: number, isDay: boolean): string {
  // Casas Hilegiacas (Ptolomeu/Bonatti): 1, 10, 11, 7, 9
  // Ordem de preferência rigorosa:
  const hylegPlaces = [1, 10, 11, 7, 9];

  if (isDay) {
    // 1. Sol (se em casa hilegiaca)
    if (hylegPlaces.includes(sun.house || 0)) return 'sun';
    // 2. Lua (se em casa hilegiaca)
    if (hylegPlaces.includes(moon.house || 0)) return 'moon';
  } else {
    // 1. Lua (se em casa hilegiaca)
    if (hylegPlaces.includes(moon.house || 0)) return 'moon';
    // 2. Sol (se em casa hilegiaca)
    if (hylegPlaces.includes(sun.house || 0)) return 'sun';
  }
  
  // 3. Ascendente (sempre o candidato final)
  return 'ascendant';
}

function calculateAlmutenFigurisId(
  planets: PlanetPosition[], 
  fortuneLon: number, 
  houses: HouseCusp[], 
  ascLon: number, 
  isDay: boolean,
  prenatalSyzygy?: number
): string {
  const classicIds = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  const scores: Record<string, number> = {};
  classicIds.forEach(id => scores[id] = 0);

  const pointsToEvaluate = [
    { lon: planets.find(p => p.id === 'sun')?.longitude ?? ascLon, weight: 1 },
    { lon: planets.find(p => p.id === 'moon')?.longitude ?? ascLon, weight: 1 },
    { lon: ascLon, weight: 1 },
    { lon: fortuneLon, weight: 1 },
    { lon: prenatalSyzygy ?? ascLon, weight: 1 }
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

/**
 * Alcocoden: Regente do Hyleg que faz aspecto ao Hyleg.
 * Implementação de ranking de dignidades.
 */
function calculateAlcocodenId(hylegId: string, planets: PlanetPosition[], isDay: boolean, houses: HouseCusp[]): string {
  const getPlanet = (id: string) => planets.find(p => p.id === id);
  const hylegPlanet = hylegId === 'ascendant' ? { longitude: houses[0].longitude, id: 'asc' } : getPlanet(hylegId);
  
  if (!hylegPlanet) return 'sun';

  const hylegLon = hylegPlanet.longitude;
  const hylegSign = getSignFromLon(hylegLon);
  const hylegDeg = hylegLon % 30;

  // Candidatos: Regentes das 5 dignidades essenciais do Hyleg
  const candidates = new Set([
    getTraditionalDomicileRuler(hylegSign),
    getTraditionalExaltationRuler(hylegSign),
    ...getTraditionalTriplicityRulers(hylegSign, isDay),
    getTermRuler(hylegSign, hylegDeg),
    getFaceRuler(hylegSign, hylegDeg)
  ].filter(Boolean) as string[]);

  // Filtro: O Alcocoden DEVE fazer aspecto ao Hyleg (ou ser o próprio regente do ascendente se Hyleg for ASC)
  const classicIds = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  const validAlcocodens = Array.from(candidates).filter(cid => {
    if (!classicIds.includes(cid)) return false;
    const p = getPlanet(cid);
    if (!p) return false;
    
    // Simplificação de aspecto: mesmo signo ou aspecto ptolomaico (sign-based)
    const sign1 = Math.floor(p.longitude / 30);
    const sign2 = Math.floor(hylegLon / 30);
    const diff = Math.abs(sign1 - sign2);
    const shortestDistance = Math.min(diff, 12 - diff);
    return [0, 2, 3, 4, 6].includes(shortestDistance); // Conjunção, Sextil, Quadratura, Trígono, Oposição
  });

  if (validAlcocodens.length === 0) {
    // Fallback: Domicílio do Hyleg
    return getTraditionalDomicileRuler(hylegSign);
  }

  // Se houver mais de um, vence o com mais dignidade no ponto do Hyleg (similar ao Almuten)
  const candidateScores: Record<string, number> = {};
  validAlcocodens.forEach(cid => {
    candidateScores[cid] = 0;
    if (cid === getTraditionalDomicileRuler(hylegSign)) candidateScores[cid] += 5;
    if (cid === getTraditionalExaltationRuler(hylegSign)) candidateScores[cid] += 4;
    if (getTraditionalTriplicityRulers(hylegSign, isDay).includes(cid)) candidateScores[cid] += 3;
    if (cid === getTermRuler(hylegSign, hylegDeg)) candidateScores[cid] += 2;
    if (cid === getFaceRuler(hylegSign, hylegDeg)) candidateScores[cid] += 1;
  });

  return Object.entries(candidateScores).sort((a, b) => b[1] - a[1])[0][0];
}

function getSignFromLon(lon: number): ZodiacSign {
  const signs: ZodiacSign[] = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'];
  return signs[Math.floor(lon / 30)];
}
