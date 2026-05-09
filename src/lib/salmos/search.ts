import type { SalmoDetailRow, SalmoSearchResult } from './types';

const MIN_SALMO_NUMBER = 1;
const MAX_SALMO_NUMBER = 150;

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseNumberQuery(query: string): number | null {
  const parsed = Number.parseInt(query, 10);
  if (Number.isNaN(parsed) || parsed < MIN_SALMO_NUMBER || parsed > MAX_SALMO_NUMBER) {
    return null;
  }

  return parsed;
}

function isMatch(haystack: string, query: string): boolean {
  return normalizeText(haystack).includes(normalizeText(query));
}

function collectMatchedPurposes(row: SalmoDetailRow, query: string): string[] {
  const normalizedQuery = normalizeText(query);
  const purposes = (row.salmos_propositos ?? [])
    .map((purpose) => purpose.nome)
    .filter((purpose) => isMatch(purpose, normalizedQuery));

  if (purposes.length > 0) {
    return purposes;
  }

  return [];
}

export function normalizeSalmoQuery(query: string): string {
  return query.trim();
}

export function extractSalmoNumber(query: string): number | null {
  return parseNumberQuery(normalizeSalmoQuery(query));
}

export function buildSearchResult(row: SalmoDetailRow, query: string): SalmoSearchResult {
  return {
    id: row.id,
    number: row.number,
    title: `Salmo ${row.number}`,
    nome_divino: row.nome_divino,
    matched_purposes: collectMatchedPurposes(row, query),
  };
}

export function dedupeSearchResults(results: SalmoSearchResult[]): SalmoSearchResult[] {
  const seen = new Map<string, SalmoSearchResult>();

  for (const result of results) {
    const current = seen.get(result.id);
    if (!current) {
      seen.set(result.id, result);
      continue;
    }

    const mergedPurposes = new Set([...current.matched_purposes, ...result.matched_purposes]);
    seen.set(result.id, {
      ...current,
      matched_purposes: Array.from(mergedPurposes),
    });
  }

  return Array.from(seen.values()).sort((left, right) => left.number - right.number);
}

export function findLocalSalmoResults(rows: SalmoDetailRow[], query: string): SalmoSearchResult[] {
  const normalizedQuery = normalizeSalmoQuery(query);

  if (normalizedQuery === '') {
    return [];
  }

  const salmoNumber = extractSalmoNumber(normalizedQuery);
  if (salmoNumber !== null) {
    const exactMatch = rows.find((row) => row.number === salmoNumber);
    return exactMatch
      ? [
          {
            ...buildSearchResult(exactMatch, normalizedQuery),
            matched_purposes: ['Busca por número'],
          },
        ]
      : [];
  }

  const matchingRows = rows.filter((row) => {
    const searchableContent = [
      String(row.number),
      row.nome_divino ?? '',
      row.page_start ?? '',
      row.page_end ?? '',
      ...(row.salmos_propositos ?? []).map((purpose) => purpose.nome),
    ].join(' ');

    return isMatch(searchableContent, normalizedQuery);
  });

  return dedupeSearchResults(matchingRows.map((row) => buildSearchResult(row, normalizedQuery)));
}
