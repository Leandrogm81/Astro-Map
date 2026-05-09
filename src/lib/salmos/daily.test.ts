import { describe, expect, it } from 'vitest';
import type { SalmoRow } from './types';
import { getPlanetOfTheDay, selectDailySalmo } from './daily';

function buildSalmo(overrides: Partial<SalmoRow>): SalmoRow {
  return {
    id: overrides.id ?? 'salmo-1',
    number: overrides.number ?? 1,
    nome_divino: overrides.nome_divino ?? null,
    page_start: overrides.page_start ?? '1',
    page_end: overrides.page_end ?? '2',
  };
}

describe('salmos daily helpers', () => {
  it('maps weekday to the planetary ruler', () => {
    expect(getPlanetOfTheDay(new Date(2026, 4, 8))).toBe('Vênus');
    expect(getPlanetOfTheDay(new Date(2026, 4, 9))).toBe('Saturno');
  });

  it('selects the first matching salmo for the planetary day', () => {
    const rows = [
      buildSalmo({ id: '20', number: 20 }),
      buildSalmo({ id: '34', number: 34 }),
      buildSalmo({ id: '51', number: 51 }),
    ];

    const selected = selectDailySalmo(rows, new Date(2026, 4, 8));

    expect(selected?.number).toBe(51);
  });

  it('wraps around deterministically when the index exceeds the list length', () => {
    const rows = [
      buildSalmo({ id: '20', number: 20 }),
      buildSalmo({ id: '51', number: 51 }),
    ];

    const selected = selectDailySalmo(rows, new Date(2026, 4, 9));

    expect(selected?.number).toBe(20);
  });
});
