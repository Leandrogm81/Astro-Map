import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import DashboardView from '../components/DashboardView';
import type { NatalChart, PlanetPosition } from '../types';

const birthData = {
  name: 'Mapa Mobile',
  date: '1990-11-12',
  time: '10:30',
  location: 'Sao Paulo',
  latitude: -23.55,
  longitude: -46.63,
  timezone: 'America/Sao_Paulo',
};

const planet = (id: string, name: string, longitude: number, sign: string): PlanetPosition => ({
  id,
  name,
  symbol: '*',
  longitude,
  latitude: 0,
  speed: 1,
  sign: sign as PlanetPosition['sign'],
  degree: longitude % 30,
  house: 1,
  retrograde: false,
});

const chart: NatalChart = {
  birthData,
  planets: [
    planet('sun', 'Sol', 220, 'Escorpiao'),
    planet('moon', 'Lua', 70, 'Gemeos'),
    planet('mercury', 'Mercurio', 210, 'Escorpiao'),
    planet('venus', 'Venus', 45, 'Touro'),
  ],
  housesPlacidus: Array.from({ length: 12 }, (_, index) => ({
    number: index + 1,
    longitude: index * 30,
    sign: 'Aries' as NatalChart['housesPlacidus'][number]['sign'],
    degree: 0,
  })),
  housesWhole: [],
  aspects: [],
  ascendant: 0,
  mc: 90,
};

describe('DashboardView', () => {
  it('renders the mobile dashboard without throwing', () => {
    const html = renderToString(<DashboardView chart={chart} transitChart={chart} />);

    expect(html).toContain('Dashboard Astrologico');
    expect(html).toContain('Mapa Mobile');
    expect(html).toContain('Transitos');
  });
});
