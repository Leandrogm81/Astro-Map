import { ZodiacSign } from '@/types';

/**
 * Regência de Domicílio Tradicional (Septenário)
 */
export function getTraditionalDomicileRuler(sign: ZodiacSign): string {
  const rulers: Record<ZodiacSign, string> = {
    'Áries': 'mars',
    'Touro': 'venus',
    'Gêmeos': 'mercury',
    'Câncer': 'moon',
    'Leão': 'sun',
    'Virgem': 'mercury',
    'Libra': 'venus',
    'Escorpião': 'mars', // Tradicional: Marte
    'Sagitário': 'jupiter',
    'Capricórnio': 'saturn',
    'Aquário': 'saturn', // Tradicional: Saturno
    'Peixes': 'jupiter'  // Tradicional: Júpiter
  };
  return rulers[sign];
}

/**
 * Regência de Exaltação Tradicional
 */
export function getTraditionalExaltationRuler(sign: ZodiacSign): string | null {
  const exaltations: Partial<Record<ZodiacSign, string>> = {
    'Áries': 'sun',
    'Touro': 'moon',
    'Câncer': 'jupiter',
    'Virgem': 'mercury',
    'Libra': 'venus',
    'Capricórnio': 'mars',
    'Peixes': 'venus'
  };
  return exaltations[sign] || null;
}

/**
 * Regência de Triplicidade (Sistema de Dorotheus/Lilly)
 * @param sign Signo do planeta
 * @param isDay Mapa diurno ou noturno
 */
export function getTraditionalTriplicityRulers(sign: ZodiacSign, isDay: boolean): string[] {
  const elements: Record<ZodiacSign, 'fire' | 'earth' | 'air' | 'water'> = {
    'Áries': 'fire', 'Leão': 'fire', 'Sagitário': 'fire',
    'Touro': 'earth', 'Virgem': 'earth', 'Capricórnio': 'earth',
    'Gêmeos': 'air', 'Libra': 'air', 'Aquário': 'air',
    'Câncer': 'water', 'Escorpião': 'water', 'Peixes': 'water'
  };

  const element = elements[sign];
  
  switch (element) {
    case 'fire': return isDay ? ['sun', 'jupiter', 'saturn'] : ['jupiter', 'sun', 'saturn'];
    case 'earth': return isDay ? ['venus', 'moon', 'mars'] : ['moon', 'venus', 'mars'];
    case 'air': return isDay ? ['saturn', 'mercury', 'jupiter'] : ['mercury', 'saturn', 'jupiter'];
    case 'water': return isDay ? ['venus', 'mars', 'moon'] : ['mars', 'venus', 'moon'];
    default: return [];
  }
}

/**
 * Retorna se um planeta está em seu domicílio tradicional
 */
export function isAtDomicile(planet: string, sign: ZodiacSign): boolean {
  return getTraditionalDomicileRuler(sign) === planet;
}

/**
 * Retorna se um planeta está em sua exaltação tradicional
 */
export function isAtExaltation(planet: string, sign: ZodiacSign): boolean {
  return getTraditionalExaltationRuler(sign) === planet;
}
