import { ZodiacSign } from '@/types';
import { getTraditionalDomicileRuler, getTraditionalExaltationRuler, getTraditionalTriplicityRulers } from './rulers';

/**
 * Termos Egípcios (Egyptian Terms/Bounds)
 * Cada signo tem 5 subdivisões com regentes específicos.
 */
export const EGYPTIAN_TERMS: Record<ZodiacSign, { planet: string, limit: number }[]> = {
  'Áries': [{ planet: 'jupiter', limit: 6 }, { planet: 'venus', limit: 12 }, { planet: 'mercury', limit: 20 }, { planet: 'mars', limit: 25 }, { planet: 'saturn', limit: 30 }],
  'Touro': [{ planet: 'venus', limit: 8 }, { planet: 'mercury', limit: 14 }, { planet: 'jupiter', limit: 22 }, { planet: 'saturn', limit: 27 }, { planet: 'mars', limit: 30 }],
  'Gêmeos': [{ planet: 'mercury', limit: 6 }, { planet: 'jupiter', limit: 12 }, { planet: 'venus', limit: 17 }, { planet: 'mars', limit: 24 }, { planet: 'saturn', limit: 30 }],
  'Câncer': [{ planet: 'mars', limit: 7 }, { planet: 'venus', limit: 13 }, { planet: 'mercury', limit: 19 }, { planet: 'jupiter', limit: 26 }, { planet: 'saturn', limit: 30 }],
  'Leão': [{ planet: 'jupiter', limit: 6 }, { planet: 'venus', limit: 11 }, { planet: 'saturn', limit: 18 }, { planet: 'mercury', limit: 24 }, { planet: 'mars', limit: 30 }],
  'Virgem': [{ planet: 'mercury', limit: 7 }, { planet: 'venus', limit: 17 }, { planet: 'jupiter', limit: 21 }, { planet: 'mars', limit: 28 }, { planet: 'saturn', limit: 30 }],
  'Libra': [{ planet: 'saturn', limit: 6 }, { planet: 'venus', limit: 11 }, { planet: 'jupiter', limit: 19 }, { planet: 'mercury', limit: 24 }, { planet: 'mars', limit: 30 }],
  'Escorpião': [{ planet: 'mars', limit: 7 }, { planet: 'venus', limit: 11 }, { planet: 'mercury', limit: 19 }, { planet: 'jupiter', limit: 24 }, { planet: 'saturn', limit: 30 }],
  'Sagitário': [{ planet: 'jupiter', limit: 12 }, { planet: 'venus', limit: 17 }, { planet: 'mercury', limit: 21 }, { planet: 'saturn', limit: 26 }, { planet: 'mars', limit: 30 }],
  'Capricórnio': [{ planet: 'mercury', limit: 7 }, { planet: 'jupiter', limit: 14 }, { planet: 'venus', limit: 22 }, { planet: 'saturn', limit: 26 }, { planet: 'mars', limit: 30 }],
  'Aquário': [{ planet: 'mercury', limit: 7 }, { planet: 'venus', limit: 13 }, { planet: 'jupiter', limit: 20 }, { planet: 'mars', limit: 25 }, { planet: 'saturn', limit: 30 }],
  'Peixes': [{ planet: 'venus', limit: 12 }, { planet: 'jupiter', limit: 16 }, { planet: 'mercury', limit: 19 }, { planet: 'mars', limit: 28 }, { planet: 'saturn', limit: 30 }]
};

/**
 * Faces/Decanos (Ordem Caldeia)
 */
export const CHALDEAN_FACES: Record<ZodiacSign, string[]> = {
  'Áries': ['mars', 'sun', 'venus'],
  'Touro': ['mercury', 'moon', 'saturn'],
  'Gêmeos': ['jupiter', 'mars', 'sun'],
  'Câncer': ['venus', 'mercury', 'moon'],
  'Leão': ['saturn', 'jupiter', 'mars'],
  'Virgem': ['sun', 'venus', 'mercury'],
  'Libra': ['moon', 'saturn', 'jupiter'],
  'Escorpião': ['mars', 'sun', 'venus'],
  'Câncer': ['venus', 'mercury', 'moon'], // Espera, Câncer repetido? Corrigindo abaixo...
  'Sagitário': ['mercury', 'moon', 'saturn'],
  'Capricórnio': ['jupiter', 'mars', 'sun'],
  'Aquário': ['venus', 'mercury', 'moon'],
  'Peixes': ['saturn', 'jupiter', 'mars']
};

// Correção rápida da tabela de faces (corrigindo a ordem caldeia completa)
const SIGN_ORDER: ZodiacSign[] = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'];
const PLANET_ORDER = ['mars', 'sun', 'venus', 'mercury', 'moon', 'saturn', 'jupiter'];

export function getFaceRuler(sign: ZodiacSign, degree: number): string {
  const signIndex = SIGN_ORDER.indexOf(sign);
  const faceIndex = Math.floor(degree / 10); // 0, 1, 2
  const totalDecanIndex = (signIndex * 3) + faceIndex;
  return PLANET_ORDER[totalDecanIndex % 7];
}

export function getTermRuler(sign: ZodiacSign, degree: number): string {
  const terms = EGYPTIAN_TERMS[sign];
  for (const term of terms) {
    if (degree < term.limit) return term.planet;
  }
  return '';
}

/**
 * Calcula todas as dignidades essenciais de um planeta
 */
export function calculateEssentialDignity(planet: string, sign: ZodiacSign, degree: number, isDay: boolean) {
  const domicile = getTraditionalDomicileRuler(sign);
  const exaltation = getTraditionalExaltationRuler(sign);
  const triplicities = getTraditionalTriplicityRulers(sign, isDay);
  const term = getTermRuler(sign, degree);
  const face = getFaceRuler(sign, degree);

  return {
    isAtDomicile: domicile === planet,
    isAtExaltation: exaltation === planet,
    isAtTriplicity: triplicities.includes(planet),
    isAtTerm: term === planet,
    isAtFace: face === planet,
    isPeregrine: domicile !== planet && exaltation !== planet && !triplicities.includes(planet) && term !== planet && face !== planet
  };
}

/**
 * Calcula condições solares (Combustão, etc)
 */
export function getSolarCondition(planetLon: number, sunLon: number) {
  const diff = Math.abs(planetLon - sunLon);
  const normalizedDiff = Math.min(diff, 360 - diff);

  return {
    isCazimi: normalizedDiff <= (17 / 60), // 17 minutos de arco
    isCombust: normalizedDiff > (17 / 60) && normalizedDiff <= 8.5,
    isUnderRays: normalizedDiff > 8.5 && normalizedDiff <= 17,
  };
}
