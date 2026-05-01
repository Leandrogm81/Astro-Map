import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import GematriaCalculator from '@/components/kabbalah/GematriaCalculator';
import KabbalahView from '@/components/kabbalah/KabbalahView';
import SephiroticTree from '@/components/kabbalah/SephiroticTree';
import type { NatalChart } from '@/types';

function buildChart(): NatalChart {
  return {
    birthData: {
      name: 'Leandro',
      date: '1990-01-01',
      time: '12:00',
      location: 'São Paulo, SP',
      latitude: -23.5505,
      longitude: -46.6333,
      timezone: 'America/Sao_Paulo',
    },
    planets: [
      { id: 'neptune', name: 'Netuno', symbol: '♆', longitude: 0, latitude: 0, speed: 0, sign: 'Áries', degree: 0, house: 1, retrograde: false },
      { id: 'uranus', name: 'Urano', symbol: '♅', longitude: 30, latitude: 0, speed: 0, sign: 'Touro', degree: 0, house: 2, retrograde: false },
      { id: 'saturn', name: 'Saturno', symbol: '♄', longitude: 60, latitude: 0, speed: 0, sign: 'Gêmeos', degree: 0, house: 3, retrograde: false },
      { id: 'pluto', name: 'Plutão', symbol: '♇', longitude: 90, latitude: 0, speed: 0, sign: 'Câncer', degree: 0, house: 4, retrograde: false },
      { id: 'jupiter', name: 'Júpiter', symbol: '♃', longitude: 120, latitude: 0, speed: 0, sign: 'Leão', degree: 0, house: 5, retrograde: false },
      { id: 'mars', name: 'Marte', symbol: '♂', longitude: 150, latitude: 0, speed: 0, sign: 'Virgem', degree: 0, house: 6, retrograde: false },
      { id: 'sun', name: 'Sol', symbol: '☉', longitude: 180, latitude: 0, speed: 0, sign: 'Libra', degree: 0, house: 7, retrograde: false },
      { id: 'venus', name: 'Vênus', symbol: '♀', longitude: 210, latitude: 0, speed: 0, sign: 'Escorpião', degree: 0, house: 8, retrograde: false },
      { id: 'mercury', name: 'Mercúrio', symbol: '☿', longitude: 240, latitude: 0, speed: 0, sign: 'Sagitário', degree: 0, house: 9, retrograde: false },
      { id: 'moon', name: 'Lua', symbol: '☽', longitude: 270, latitude: 0, speed: 0, sign: 'Capricórnio', degree: 0, house: 10, retrograde: false },
    ],
    housesPlacidus: Array.from({ length: 12 }, (_, index) => ({
      number: index + 1,
      longitude: index * 30,
      sign: ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'][index] as NatalChart['housesPlacidus'][number]['sign'],
      degree: 0,
    })),
    housesWhole: Array.from({ length: 12 }, (_, index) => ({
      number: index + 1,
      longitude: index * 30,
      sign: ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'][index] as NatalChart['housesWhole'][number]['sign'],
      degree: 0,
    })),
    aspects: [],
    ascendant: 123,
    mc: 300,
  };
}

describe('Kabbalah UI', () => {
  it('renders the gematria calculator with a translated Hebrew result', () => {
    const markup = renderToStaticMarkup(
      <GematriaCalculator
        initialInputText="Leandro"
        initialHebrewText="שלום"
      />
    );

    expect(markup).toContain('Gematria do Nome');
    expect(markup).toContain('Traduzir');
    expect(markup).toContain('Leandro');
    expect(markup).toContain('Netzach');
    expect(markup).toContain('376');
  });

  it('renders the calculator error banner when requested', () => {
    const markup = renderToStaticMarkup(
      <GematriaCalculator
        initialInputText=""
        initialHebrewText=""
        initialError="Falha na tradução"
      />
    );

    expect(markup).toContain('Falha na tradução');
    expect(markup).toContain('Pronto para a tradução');
  });

  it('renders the Kabbalah view gematria section by default', () => {
    const markup = renderToStaticMarkup(
      <KabbalahView chart={buildChart()} />
    );

    expect(markup).toContain('Gematria + Árvore Sephirótica');
    expect(markup).toContain('Gematria');
    expect(markup).toContain('Exportar PDF Kabbalah');
    expect(markup).toContain('Leandro');
  });

  it('renders the tree preview section when selected', () => {
    const markup = renderToStaticMarkup(
      <KabbalahView chart={buildChart()} initialSection="tree" />
    );

    expect(markup).toContain('Árvore Sephirótica');
    expect(markup).toContain('Netuno');
    expect(markup).toContain('Ascendente');
  });

  it('renders the tree empty state without a chart', () => {
    const markup = renderToStaticMarkup(
      <SephiroticTree chart={null} />
    );

    expect(markup).toContain('Carregue um mapa natal');
    expect(markup).toContain('SVG interativo');
  });
});
