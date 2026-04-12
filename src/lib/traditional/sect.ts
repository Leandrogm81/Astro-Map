/**
 * Determina se um planeta pertence à seita (sect) do mapa
 */
export function isInSect(planetId: string, isDayChart: boolean): boolean {
  if (isDayChart) {
    // Seita Diurna: Sol, Júpiter, Saturno
    return ['sun', 'jupiter', 'saturn'].includes(planetId);
  } else {
    // Seita Noturna: Lua, Vênus, Marte
    return ['moon', 'venus', 'mars'].includes(planetId);
  }
}

/**
 * Retorna o "Benefic" da seita
 */
export function getSectBenefic(isDayChart: boolean): string {
  return isDayChart ? 'Júpiter' : 'Vênus';
}

/**
 * Retorna o "Malefic" da seita
 */
export function getSectMalefic(isDayChart: boolean): string {
  return isDayChart ? 'Saturno' : 'Marte';
}

/**
 * Calcula se um planeta está em "Hayz" (Condição sectária perfeita)
 * - Diurno: Planeta diurno, acima do horizonte, em signo masculino (opcional Fase 2)
 * - Noturno: Planeta noturno, abaixo do horizonte, em signo feminino (opcional Fase 2)
 */
export function calculateHayz(planetId: string, house: number, isDayChart: boolean): boolean {
  const isAboveHorizon = house >= 7 && house <= 12;
  const planetInSect = isInSect(planetId, isDayChart);

  if (isDayChart) {
    return planetInSect && isAboveHorizon;
  } else {
    return planetInSect && !isAboveHorizon;
  }
}
