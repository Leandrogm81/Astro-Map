import { NatalChart } from '@/types';
import { calculateLotLongitude, calculateTraditionalPoints } from '@/lib/ephemeris';
import { getZodiacSign, getSignDegree, getHouseForPlanet } from '@/lib/astrology';

export function hydrateNatalChart(chart: NatalChart): NatalChart {
  // Se o mapa já tem lotes e pontos tradicionais, não faz nada
  if (chart.lots && chart.traditionalPoints) {
    return chart;
  }

  try {
    const { ascendant, planets, housesPlacidus } = chart;
    const sun = planets.find(p => p.id === 'sun');
    const sunHouse = sun ? sun.house : 1;
    const isDay = chart.isDayChart ?? (sunHouse >= 7 && sunHouse <= 12);

    const lotConfigs = [
      { id: 'fortune', name: 'Roda da Fortuna', symbol: '⊗', description: 'Prosperidade e vitalidade física.' },
      { id: 'spirit', name: 'Lote do Espírito', symbol: '✦', description: 'Carreira e propósito espiritual.' },
      { id: 'eros', name: 'Lote de Eros', symbol: '♥', description: 'Desejos e amizades.' },
      { id: 'necessity', name: 'Lote da Necessidade', symbol: '⚖', description: 'Restrições e deveres.' },
      { id: 'courage', name: 'Lote da Coragem', symbol: '⚔', description: 'Audácia e força de vontade.' },
      { id: 'victory', name: 'Lote da Vitória', symbol: '🏆', description: 'Sucesso por mérito.' },
      { id: 'nemesis', name: 'Lote de Nêmesis', symbol: '⚡', description: 'Karma e justiça divina.' },
    ];

    const lots = lotConfigs.map(config => {
      const lon = calculateLotLongitude(config.id, ascendant, planets, isDay);
      return {
        ...config,
        longitude: lon,
        sign: getZodiacSign(lon),
        degree: getSignDegree(lon),
        house: getHouseForPlanet(lon, housesPlacidus)
      };
    });

    const trad = calculateTraditionalPoints(ascendant, planets, housesPlacidus, isDay);

    return {
      ...chart,
      lots,
      traditionalPoints: trad,
      isDayChart: isDay
    };
  } catch (err) {
    console.error('Erro ao hidratar mapa astral:', err);
    return chart;
  }
}
