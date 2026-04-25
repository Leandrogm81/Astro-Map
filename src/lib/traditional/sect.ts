import { ZodiacSign } from '@/types';
import { SectStatus, SectRole } from './types';

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
 * Retorna o status de seita (in_sect / out_of_sect / neutral / mercury_variable)
 */
export function getSectStatus(planetId: string, isDayChart: boolean): SectStatus {
  if (planetId === 'mercury') return 'mercury_variable';

  if (isDayChart) {
    if (planetId === 'sun') return 'in_sect';
    if (planetId === 'jupiter') return 'in_sect';
    if (planetId === 'saturn') return 'in_sect';
    if (planetId === 'moon') return 'out_of_sect';
    if (planetId === 'venus') return 'out_of_sect';
    if (planetId === 'mars') return 'out_of_sect';
  } else {
    if (planetId === 'moon') return 'in_sect';
    if (planetId === 'venus') return 'in_sect';
    if (planetId === 'mars') return 'in_sect';
    if (planetId === 'sun') return 'out_of_sect';
    if (planetId === 'jupiter') return 'out_of_sect';
    if (planetId === 'saturn') return 'out_of_sect';
  }

  return 'neutral';
}

/**
 * Retorna o papel (role) de seita do planeta no contexto do mapa
 */
export function getSectRole(planetId: string, isDayChart: boolean): SectRole {
  if (planetId === 'mercury') return 'mercury_variable';

  if (isDayChart) {
    if (planetId === 'sun') return 'luminary';
    if (planetId === 'jupiter') return 'benefic_of_sect';
    if (planetId === 'saturn') return 'malefic_of_sect';
    if (planetId === 'moon') return 'luminary';
    if (planetId === 'venus') return 'benefic_out_of_sect';
    if (planetId === 'mars') return 'malefic_out_of_sect';
  } else {
    if (planetId === 'moon') return 'luminary';
    if (planetId === 'venus') return 'benefic_of_sect';
    if (planetId === 'mars') return 'malefic_of_sect';
    if (planetId === 'sun') return 'luminary';
    if (planetId === 'jupiter') return 'benefic_out_of_sect';
    if (planetId === 'saturn') return 'malefic_out_of_sect';
  }

  return 'none';
}
