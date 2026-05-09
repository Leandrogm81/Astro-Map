import { describe, expect, it } from 'vitest';
import type { SalmoDetailRow, SalmoSearchResult } from './types';
import { dedupeSearchResults, extractSalmoNumber, findLocalSalmoResults } from './search';

function buildSalmo(overrides: Partial<SalmoDetailRow>): SalmoDetailRow {
  return {
    id: overrides.id ?? 'salmo-1',
    number: overrides.number ?? 1,
    nome_divino: overrides.nome_divino ?? null,
    page_start: overrides.page_start ?? '1',
    page_end: overrides.page_end ?? '2',
    salmos_propositos: overrides.salmos_propositos ?? [],
    salmos_elementos: overrides.salmos_elementos ?? [],
    salmos_fontes: overrides.salmos_fontes ?? [],
    salmos_condicoes_astro: overrides.salmos_condicoes_astro ?? [],
  };
}

describe('salmos search helpers', () => {
  it('extracts a numeric salmo query when the input is a pure number', () => {
    expect(extractSalmoNumber('23')).toBe(23);
    expect(extractSalmoNumber('151')).toBeNull();
    expect(extractSalmoNumber('salmo 23')).toBeNull();
  });

  it('finds local results by name and purposes', () => {
    const rows = [
      buildSalmo({
        id: '119',
        number: 119,
        nome_divino: 'YAH',
        page_start: '10',
        page_end: '12',
        salmos_propositos: [{ id: 'p1', salmo_id: '119', nome: 'aprendizado', evidencia: null }],
      }),
      buildSalmo({
        id: '134',
        number: 134,
        nome_divino: 'SHALOM',
        page_start: '12',
        page_end: '14',
        salmos_propositos: [{ id: 'p2', salmo_id: '134', nome: 'quietude', evidencia: null }],
      }),
    ];

    const results = findLocalSalmoResults(rows, 'aprendizado');

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('119');
    expect(results[0].matched_purposes).toContain('aprendizado');
  });

  it('returns the exact salmo for a numeric query', () => {
    const rows = [
      buildSalmo({ id: '23', number: 23 }),
      buildSalmo({ id: '24', number: 24 }),
    ];

    const results = findLocalSalmoResults(rows, '23');

    expect(results).toHaveLength(1);
    expect(results[0].number).toBe(23);
  });

  it('deduplicates salmos and merges matched purposes', () => {
    const results: SalmoSearchResult[] = [
      { id: '1', number: 1, title: 'Salmo 1', nome_divino: null, matched_purposes: ['proteção'] },
      { id: '1', number: 1, title: 'Salmo 1', nome_divino: null, matched_purposes: ['paz'] },
    ];

    const deduped = dedupeSearchResults(results);

    expect(deduped).toHaveLength(1);
    expect(deduped[0].matched_purposes).toEqual(expect.arrayContaining(['proteção', 'paz']));
  });
});

