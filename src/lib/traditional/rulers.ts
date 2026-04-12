import { ZodiacSign } from '@/types';

export const TRADITIONAL_RULERS: Record<string, ZodiacSign[]> = {
  'Sol': ['Leão'],
  'Lua': ['Câncer'],
  'Mercúrio': ['Gêmeos', 'Virgem'],
  'Vênus': ['Touro', 'Libra'],
  'Marte': ['Áries', 'Escorpião'],
  'Júpiter': ['Sagitário', 'Peixes'],
  'Saturno': ['Capricórnio', 'Aquário'],
};

export const TRADITIONAL_EXALTATIONS: Record<string, ZodiacSign> = {
  'Sol': 'Áries',
  'Lua': 'Touro',
  'Mercúrio': 'Virgem',
  'Vênus': 'Peixes',
  'Marte': 'Capricórnio',
  'Júpiter': 'Câncer',
  'Saturno': 'Libra',
};

export const TRADITIONAL_DETRIMENTS: Record<string, ZodiacSign[]> = {
  'Sol': ['Aquário'],
  'Lua': ['Capricórnio'],
  'Mercúrio': ['Sagitário', 'Peixes'],
  'Vênus': ['Áries', 'Escorpião'],
  'Marte': ['Libra', 'Touro'],
  'Júpiter': ['Gêmeos', 'Virgem'],
  'Saturno': ['Câncer', 'Leão'],
};

export const TRADITIONAL_FALLS: Record<string, ZodiacSign> = {
  'Sol': 'Libra',
  'Lua': 'Escorpião',
  'Mercúrio': 'Peixes',
  'Vênus': 'Virgem',
  'Marte': 'Câncer',
  'Júpiter': 'Capricórnio',
  'Saturno': 'Áries',
};

/**
 * Retorna o regente tradicional de um signo (sempre um dos 7 planetas clássicos)
 */
export function getTraditionalRuler(sign: ZodiacSign): string {
  for (const [planet, signs] of Object.entries(TRADITIONAL_RULERS)) {
    if (signs.includes(sign)) return planet;
  }
  return '';
}

/**
 * Retorna se um planeta está em seu domicílio tradicional
 */
export function isAtDomicile(planet: string, sign: ZodiacSign): boolean {
  const rulers = TRADITIONAL_RULERS[planet];
  return rulers ? rulers.includes(sign) : false;
}

/**
 * Retorna se um planeta está em sua exaltação tradicional
 */
export function isAtExaltation(planet: string, sign: ZodiacSign): boolean {
  return TRADITIONAL_EXALTATIONS[planet] === sign;
}
