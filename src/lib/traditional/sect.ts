import { ZodiacSign } from '@/types';

/**
 * Determina se um planeta pertence à seita (sect) do nascimento
 */
export function isPlanetDiurnal(planetId: string): boolean {
  return ['sun', 'jupiter', 'saturn'].includes(planetId);
}

export function isPlanetNocturnal(planetId: string): boolean {
  return ['moon', 'venus', 'mars'].includes(planetId);
}

/**
 * Determina o gênero do signo (Essencial para Hayz)
 */
export function isSignMasculine(sign: ZodiacSign): boolean {
  const masculineSigns: ZodiacSign[] = ['Áries', 'Gêmeos', 'Leão', 'Libra', 'Sagitário', 'Aquário'];
  return masculineSigns.includes(sign);
}

/**
 * Calcula se um planeta está em "Hayz" (Dignidade Acidental Suprema)
 * Requisitos Diurnos: Planeta diurno + Acima do horizonte + Signo Masculino
 * Requisitos Noturnos: Planeta noturno + Abaixo do horizonte + Signo Feminino
 */
export function calculateHayz(planetId: string, house: number, sign: ZodiacSign, isDayChart: boolean): boolean {
  const isAboveHorizon = house >= 7 && house <= 12;
  const signIsMasculine = isSignMasculine(sign);

  if (isPlanetDiurnal(planetId)) {
    // Planeta Diurno precisa de: Mapa Diurno + Acima do Horizonte + Signo Masculino
    return isDayChart && isAboveHorizon && signIsMasculine;
  } else if (isPlanetNocturnal(planetId)) {
    // Planeta Noturno precisa de: Mapa Noturno + Abaixo do Horizonte + Signo Feminino
    return !isDayChart && !isAboveHorizon && !signIsMasculine;
  }

  return false; // Mercúrio é neutro e geralmente não entra em Hayz clássico sem condições específicas
}

/**
 * Retorna o status de seita (Benefic/Malefic da Seita)
 */
export function getSectStatus(planetId: string, isDayChart: boolean) {
  if (isDayChart) {
    if (planetId === 'jupiter') return 'benefic';
    if (planetId === 'saturn') return 'malefic_out_of_sect';
    return isPlanetDiurnal(planetId) ? 'in_sect' : 'out_of_sect';
  } else {
    if (planetId === 'venus') return 'benefic';
    if (planetId === 'mars') return 'malefic_out_of_sect';
    return isPlanetNocturnal(planetId) ? 'in_sect' : 'out_of_sect';
  }
}
