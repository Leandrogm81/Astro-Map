import { HEBREW_KATAN_VALUES, HEBREW_ORDINAL_VALUES, HEBREW_VALUES } from './constants';
import type { GematriaResult, GematriaSystem, LetterBreakdown, SephirahName } from './types';

const LATIN_VALUES = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  I: 9,
  J: 10,
  K: 11,
  L: 12,
  M: 13,
  N: 14,
  O: 15,
  P: 16,
  Q: 17,
  R: 18,
  S: 19,
  T: 20,
  U: 21,
  V: 22,
  W: 23,
  X: 24,
  Y: 25,
  Z: 26,
} satisfies Record<string, number>;

const SYSTEM_MAP: Record<GematriaSystem, Record<string, number>> = {
  standard: HEBREW_VALUES,
  ordinal: HEBREW_ORDINAL_VALUES,
  misparKatan: HEBREW_KATAN_VALUES,
  latin: LATIN_VALUES,
};

const SEPHIRAH_BY_NUMBER: Record<number, SephirahName> = {
  1: 'Kether',
  2: 'Chokmah',
  3: 'Binah',
  4: 'Chesed',
  5: 'Geburah',
  6: 'Tiphereth',
  7: 'Netzach',
  8: 'Hod',
  9: 'Yesod',
  10: 'Malkuth',
};

const COMBINING_MARKS_REGEX = /\p{M}/gu;

function normalizeInput(text: string, system: GematriaSystem): string {
  const withoutMarks = text.normalize('NFKD').replace(COMBINING_MARKS_REGEX, '');

  if (system === 'latin') {
    return withoutMarks.toUpperCase();
  }

  return withoutMarks;
}

function collectRecognizedLetters(text: string, system: GematriaSystem): string[] {
  const normalized = normalizeInput(text, system);
  const values = SYSTEM_MAP[system];

  return Array.from(normalized).filter((letter) => values[letter] !== undefined);
}

function buildBreakdown(letters: string[], system: GematriaSystem): LetterBreakdown[] {
  const values = SYSTEM_MAP[system];

  return letters.map((letter) => ({
    letter,
    value: values[letter],
  }));
}

export function reduceToSephirah(value: number): number {
  let current = Math.abs(Math.trunc(value));

  if (current <= 0) {
    return 10;
  }

  while (current > 10) {
    current = String(current)
      .split('')
      .reduce((sum, digit) => sum + Number(digit), 0);
  }

  return current;
}

export function getSephirahNameFromReducedValue(value: number): SephirahName {
  const reduced = reduceToSephirah(value);
  return SEPHIRAH_BY_NUMBER[reduced] ?? 'Malkuth';
}

export function calculateGematria(text: string, system: GematriaSystem): GematriaResult {
  const letters = collectRecognizedLetters(text, system);
  const breakdown = buildBreakdown(letters, system);
  const totalValue = breakdown.reduce((sum, item) => sum + item.value, 0);
  const reducedValue = reduceToSephirah(totalValue);

  return {
    inputText: text,
    hebrewText: normalizeInput(text, system),
    system,
    totalValue,
    reducedValue,
    sephirah: SEPHIRAH_BY_NUMBER[reducedValue],
    breakdown,
  };
}
