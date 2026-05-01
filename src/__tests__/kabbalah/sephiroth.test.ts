import type { NatalChart, PlanetPosition, ZodiacSign } from '@/types';
import { describe, expect, it } from 'vitest';
import { mapChartToSephiroth, getSephirahDefinition, getSephirahDefinitionByNumber } from '@/lib/kabbalah/sephiroth';

const ZODIAC_SIGNS: readonly ZodiacSign[] = [
  'Áries',
  'Touro',
  'Gêmeos',
  'Câncer',
  'Leão',
  'Virgem',
  'Libra',
  'Escorpião',
  'Sagitário',
  'Capricórnio',
  'Aquário',
  'Peixes',
];

function zodiacSignFromLongitude(longitude: number): ZodiacSign {
  const normalized = ((longitude % 360) + 360) % 360;
  return ZODIAC_SIGNS[Math.floor(normalized / 30)] ?? 'Áries';
}

function planet(id: string, name: string, symbol: string, longitude: number, house: number, retrograde = false): PlanetPosition {
  const normalized = ((longitude % 360) + 360) % 360;

  return {
    id,
    name,
    symbol,
    longitude: normalized,
    latitude: 0,
    speed: 1,
    sign: zodiacSignFromLongitude(normalized),
    degree: normalized % 30,
    house,
    retrograde,
  };
}

function buildChart(): NatalChart {
  return {
    birthData: {
      name: 'Kabbalah Test',
      date: '1990-01-01',
      time: '12:00',
      location: 'Test City',
      latitude: 0,
      longitude: 0,
      timezone: 'UTC',
    },
    planets: [
      planet('sun', 'Sol', '☉', 15, 10),
      planet('moon', 'Lua', '☽', 45, 2),
      planet('mercury', 'Mercúrio', '☿', 75, 3),
      planet('venus', 'Vênus', '♀', 105, 4),
      planet('mars', 'Marte', '♂', 135, 5),
      planet('jupiter', 'Júpiter', '♃', 165, 6),
      planet('saturn', 'Saturno', '♄', 195, 7, true),
      planet('uranus', 'Urano', '♅', 225, 8),
      planet('neptune', 'Netuno', '♆', 359, 9),
      planet('pluto', 'Plutão', '♇', 140, 11),
    ],
    housesPlacidus: Array.from({ length: 12 }, (_, index) => ({
      number: index + 1,
      longitude: index * 30,
      sign: 'Áries',
      degree: 0,
    })),
    housesWhole: Array.from({ length: 12 }, (_, index) => ({
      number: index + 1,
      longitude: index * 30,
      sign: 'Áries',
      degree: 0,
    })),
    aspects: [],
    ascendant: 123,
    mc: 210,
  };
}

describe('Kabbalah sephiroth mapping', () => {
  it('exposes canonical sephirah definitions', () => {
    expect(getSephirahDefinition('Tiphereth')).toMatchObject({
      name: 'Tiphereth',
      number: 6,
      planetId: 'sun',
      pillar: 'Equilíbrio',
    });

    expect(getSephirahDefinitionByNumber(0)).toMatchObject({
      name: 'Daath',
      planetId: 'pluto',
    });
  });

  it('maps the loaded chart onto the sephiroth and Daath plus Malkuth', () => {
    const mappings = mapChartToSephiroth(buildChart());

    expect(mappings).toHaveLength(11);

    const byName = new Map(mappings.map((mapping) => [mapping.sephirah.name, mapping] as const));

    expect(byName.get('Kether')).toMatchObject({
      planetName: 'Netuno',
      angel: expect.objectContaining({ name: 'Mumiah' }),
    });

    expect(byName.get('Tiphereth')).toMatchObject({
      planetName: 'Sol',
      planetSymbol: '☉',
      longitude: 15,
      sign: 'Áries',
      degree: 15,
      house: 10,
      retrograde: false,
      angel: expect.objectContaining({ name: 'Elemiah' }),
    });

    expect(byName.get('Daath')).toMatchObject({
      planetName: 'Plutão',
      planetSymbol: '♇',
      longitude: 140,
      angel: expect.objectContaining({ name: 'Reiiel' }),
    });

    expect(byName.get('Malkuth')).toMatchObject({
      longitude: 123,
      sign: 'Leão',
      degree: 3,
      house: 1,
      angel: expect.objectContaining({ name: 'Nith-Haiah' }),
    });
  });

  it('skips missing planets without breaking the rest of the mapping', () => {
    const chart = buildChart();
    chart.planets = chart.planets.filter((entry) => entry.id !== 'uranus');

    const mappings = mapChartToSephiroth(chart);
    const byName = new Map(mappings.map((mapping) => [mapping.sephirah.name, mapping] as const));

    expect(mappings).toHaveLength(10);
    expect(byName.has('Chokmah')).toBe(false);
    expect(byName.get('Kether')).toMatchObject({ planetName: 'Netuno' });
    expect(byName.get('Malkuth')).toMatchObject({ house: 1 });
  });
});
