import { ZodiacSign } from '@/types';

// Triplicidades Dorotheanas (Diurno, Noturno, Participante)
export const TRIPLICITIES: Record<string, string[]> = {
  'Fogo': ['Sol', 'Júpiter', 'Saturno'], // Áries, Leão, Sagitário
  'Terra': ['Vênus', 'Lua', 'Marte'],     // Touro, Virgem, Capricórnio
  'Ar': ['Saturno', 'Mercúrio', 'Júpiter'], // Gêmeos, Libra, Aquário
  'Água': ['Vênus', 'Marte', 'Lua'],       // Câncer, Escorpião, Peixes
};

const ELEMENT_MAP: Record<ZodiacSign, string> = {
  'Áries': 'Fogo', 'Leão': 'Fogo', 'Sagitário': 'Fogo',
  'Touro': 'Terra', 'Virgem': 'Terra', 'Capricórnio': 'Terra',
  'Gêmeos': 'Ar', 'Libra': 'Ar', 'Aquário': 'Ar',
  'Câncer': 'Água', 'Escorpião': 'Água', 'Peixes': 'Água',
};

/**
 * Retorna se um planeta tem dignidade por triplicidade no signo e seita
 */
export function hasTriplicity(planet: string, sign: ZodiacSign, isDayChart: boolean): boolean {
  const element = ELEMENT_MAP[sign];
  const rulers = TRIPLICITIES[element];
  if (!rulers) return false;

  const dayRuler = rulers[0];
  const nightRuler = rulers[1];

  return isDayChart ? (planet === dayRuler) : (planet === nightRuler);
}

/**
 * Calcula combustão e condições solares
 */
export function getSolarCondition(planetLon: number, sunLon: number) {
  const diff = Math.abs(planetLon - sunLon);
  const normalizedDiff = Math.min(diff, 360 - diff);

  return {
    isCazimi: normalizedDiff <= 0.28, // 17 minutes of arc
    isCombust: normalizedDiff > 0.28 && normalizedDiff <= 8.5,
    isUnderRays: normalizedDiff > 8.5 && normalizedDiff <= 17,
  };
}
