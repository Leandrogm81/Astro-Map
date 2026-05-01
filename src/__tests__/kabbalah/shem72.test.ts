import { describe, expect, it } from 'vitest';
import { ANGELS_72, getAngelByDegree, getAngelIndex } from '@/lib/kabbalah/shem72';
import { getZodiacSignFromLongitude } from '@/lib/kabbalah/constants';

describe('72 angels lookup', () => {
  it('exposes the full 72-angel sequence', () => {
    expect(ANGELS_72).toHaveLength(72);
    expect(ANGELS_72[0]).toMatchObject({
      number: 1,
      name: 'Vehuiah',
      hebrew: 'והו',
      sign: 'Áries',
      degreesStart: 0,
      degreesEnd: 5,
      psalm: 'Psalm 3',
    });
    expect(ANGELS_72[71]).toMatchObject({
      number: 72,
      name: 'Mumiah',
      hebrew: 'מום',
      sign: 'Peixes',
      degreesStart: 355,
      degreesEnd: 360,
      psalm: 'Psalm 114',
    });
  });

  it('maps degrees to the correct angel with proper boundaries', () => {
    expect(getAngelIndex(0)).toBe(0);
    expect(getAngelIndex(4.999)).toBe(0);
    expect(getAngelIndex(5)).toBe(1);
    expect(getAngelIndex(359)).toBe(71);
    expect(getAngelIndex(365)).toBe(1);
    expect(getAngelIndex(-1)).toBe(71);

    expect(getAngelByDegree(0).name).toBe('Vehuiah');
    expect(getAngelByDegree(5).name).toBe('Jeliel');
    expect(getAngelByDegree(15).name).toBe('Elemiah');
    expect(getAngelByDegree(359).name).toBe('Mumiah');
  });

  it('preserves zodiac sign and degree bands for the selected angel', () => {
    const angel = getAngelByDegree(123);

    expect(angel.sign).toBe('Leão');
    expect(angel.degreesStart).toBe(120);
    expect(angel.degreesEnd).toBe(125);
    expect(angel.psalm).toBe('Psalm 9');
  });

  it('falls back safely when longitude is not a finite number', () => {
    expect(getZodiacSignFromLongitude(Number.NaN)).toBe('Áries');
  });
});
