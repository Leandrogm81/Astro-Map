import { describe, it, expect } from 'vitest';
import { calculateTraditionalPoints, calculateAlmutenFigurisBreakdown } from '../lib/traditional/points';
import type { PlanetPosition, HouseCusp, ZodiacSign } from '@/types';

function mockPlanet(id: string, name: string, longitude: number, house: number): PlanetPosition {
  const signs = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'];
  const sign = signs[Math.floor(longitude / 30)];
  return {
    id,
    name,
    symbol: '☉',
    longitude,
    latitude: 0,
    speed: 1,
    sign: sign as ZodiacSign,
    degree: longitude % 30,
    house,
    retrograde: false,
  };
}

function mockHouses(): HouseCusp[] {
  const signs = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'];
  return Array.from({ length: 12 }, (_, i) => ({
    number: i + 1,
    longitude: i * 30,
    sign: signs[i] as ZodiacSign,
    degree: 0,
  }));
}

describe('calculateTraditionalPoints', () => {
  const sun = mockPlanet('sun', 'Sol', 120, 5); // Leão
  const moon = mockPlanet('moon', 'Lua', 200, 8); // Libra
  const mars = mockPlanet('mars', 'Marte', 30, 2); // Touro
  const jupiter = mockPlanet('jupiter', 'Júpiter', 240, 9); // Sagitário
  const saturn = mockPlanet('saturn', 'Saturno', 300, 11); // Aquário
  const mercury = mockPlanet('mercury', 'Mercúrio', 90, 4); // Câncer
  const venus = mockPlanet('venus', 'Vênus', 180, 7); // Libra

  const planets = [sun, moon, mars, jupiter, saturn, mercury, venus];
  const houses = mockHouses();

  it('includes prenatal syzygy in Almuten when available', () => {
    const result = calculateTraditionalPoints(0, planets, houses, true, 45.0);
    expect(result.almutenFigurisBreakdown).toBeDefined();
    expect(result.almutenFigurisBreakdown!.points).toContainEqual(
      expect.objectContaining({ label: 'Sizígia Pré-Natal' })
    );
    expect(result.methodMetadata?.almutenFiguris).toBe('complete_with_prenatal_syzygy');
  });

  it('does not break without prenatal syzygy', () => {
    const result = calculateTraditionalPoints(0, planets, houses, true);
    expect(result.almutenFiguris).toBeDefined();
    expect(result.almutenFigurisBreakdown).toBeDefined();
    expect(result.almutenFigurisBreakdown!.points).not.toContainEqual(
      expect.objectContaining({ label: 'Sizígia Pré-Natal' })
    );
    expect(result.methodMetadata?.almutenFiguris).toBe('complete');
  });

  it('marks hyleg and alcocoden as simplified', () => {
    const result = calculateTraditionalPoints(0, planets, houses, true, 45.0);
    expect(result.hyleg.method).toBe('simplified');
    expect(result.alcocoden.method).toBe('simplified');
    expect(result.methodMetadata?.hyleg).toBe('simplified');
    expect(result.methodMetadata?.alcocoden).toBe('simplified');
  });

  it('returns fallback when sun or moon is missing', () => {
    const result = calculateTraditionalPoints(0, [], houses, true);
    expect(result.hyleg.name).toBe('Sol');
    expect(result.hyleg.method).toBe('basic');
  });

  it('includes methodMetadata with correct values', () => {
    const result = calculateTraditionalPoints(0, planets, houses, true, 45.0);
    expect(result.methodMetadata).toBeDefined();
    expect(result.methodMetadata!.houseSystem).toBe('placidus');
    expect(result.methodMetadata!.sect).toBe('corrected_basic');
    expect(result.methodMetadata!.aspects).toBe('moiety_basic');
  });
});

describe('calculateAlmutenFigurisBreakdown', () => {
  const sun = mockPlanet('sun', 'Sol', 120, 5);
  const moon = mockPlanet('moon', 'Lua', 200, 8);
  const planets = [sun, moon];

  it('computes scores for all 7 classic planets', () => {
    const breakdown = calculateAlmutenFigurisBreakdown(planets, 0, 0, true);
    expect(Object.keys(breakdown.scores).sort()).toEqual(['jupiter', 'mars', 'mercury', 'moon', 'saturn', 'sun', 'venus']);
  });

  it('includes 4 points without prenatal syzygy', () => {
    const breakdown = calculateAlmutenFigurisBreakdown(planets, 0, 0, true);
    expect(breakdown.points.length).toBe(4);
  });

  it('includes 5 points with prenatal syzygy', () => {
    const breakdown = calculateAlmutenFigurisBreakdown(planets, 0, 0, true, 45.0);
    expect(breakdown.points.length).toBe(5);
    const syzygyPoint = breakdown.points.find(p => p.label === 'Sizígia Pré-Natal');
    expect(syzygyPoint).toBeDefined();
    expect(syzygyPoint!.sign).toBe('Touro');
  });
});
