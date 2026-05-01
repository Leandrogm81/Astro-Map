import { describe, expect, it } from 'vitest';
import { calculateGematria, getSephirahNameFromReducedValue, reduceToSephirah } from '@/lib/kabbalah/gematria';

describe('Kabbalah gematria', () => {
  it('calculates standard Hebrew gematria and reduces it to the right sephirah', () => {
    const result = calculateGematria('שָׁלוֹם', 'standard');

    expect(result.inputText).toBe('שָׁלוֹם');
    expect(result.hebrewText).toBe('שלום');
    expect(result.totalValue).toBe(376);
    expect(result.reducedValue).toBe(7);
    expect(result.sephirah).toBe('Netzach');
    expect(result.breakdown).toEqual([
      { letter: 'ש', value: 300 },
      { letter: 'ל', value: 30 },
      { letter: 'ו', value: 6 },
      { letter: 'ם', value: 40 },
    ]);
  });

  it('supports ordinal gematria with final forms as distinct values', () => {
    const result = calculateGematria('ך', 'ordinal');

    expect(result.totalValue).toBe(23);
    expect(result.reducedValue).toBe(5);
    expect(result.sephirah).toBe('Geburah');
    expect(result.breakdown).toEqual([{ letter: 'ך', value: 23 }]);
  });

  it('supports mispar katan and latin simple values', () => {
    const hebrewResult = calculateGematria('שָׁלוֹם', 'misparKatan');
    const latinResult = calculateGematria('LEANDRO', 'latin');

    expect(hebrewResult.totalValue).toBe(16);
    expect(hebrewResult.reducedValue).toBe(7);
    expect(hebrewResult.sephirah).toBe('Netzach');

    expect(latinResult.totalValue).toBe(69);
    expect(latinResult.reducedValue).toBe(6);
    expect(latinResult.sephirah).toBe('Tiphereth');
    expect(latinResult.breakdown).toEqual([
      { letter: 'L', value: 12 },
      { letter: 'E', value: 5 },
      { letter: 'A', value: 1 },
      { letter: 'N', value: 14 },
      { letter: 'D', value: 4 },
      { letter: 'R', value: 18 },
      { letter: 'O', value: 15 },
    ]);
  });

  it('reduces values to a single sephirah number', () => {
    expect(reduceToSephirah(376)).toBe(7);
    expect(reduceToSephirah(10)).toBe(10);
    expect(reduceToSephirah(0)).toBe(10);
    expect(getSephirahNameFromReducedValue(Number.NaN)).toBe('Malkuth');
  });
});
