import type { SalmoRow } from './types';

const PLANET_BY_DAY_INDEX: Record<number, string> = {
  0: 'Sol',
  1: 'Lua',
  2: 'Marte',
  3: 'Mercúrio',
  4: 'Júpiter',
  5: 'Vênus',
  6: 'Saturno',
};

export function getPlanetOfTheDay(date: Date = new Date()): string {
  return PLANET_BY_DAY_INDEX[date.getDay()] ?? 'Sol';
}

export function selectDailySalmo(rows: SalmoRow[], date: Date = new Date()): SalmoRow | null {
  if (rows.length === 0) {
    return null;
  }

  const orderedRows = rows.slice().sort((left, right) => left.number - right.number);
  const index = date.getDay() % orderedRows.length;
  return orderedRows[index] ?? null;
}
