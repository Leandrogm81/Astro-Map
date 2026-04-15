import { NatalChart } from '@/types';
import { calculateLotLongitude } from '@/lib/traditional/lots';
import { calculateTraditionalPoints } from '@/lib/traditional/points';
import { getZodiacSign, getSignDegree, getHouseForPlanet } from '@/lib/astrology';
import { normalizePlanetKey, isSupportedPlanet } from '@/lib/planetNaming';

export function hydrateNatalChart(chart: NatalChart): NatalChart {
  try {
    const { planets, housesPlacidus } = chart;

    const normalizedPlanets = planets.map(p => {
      const id = normalizePlanetKey(p.id ?? p.name ?? '');
      return { ...p, id: id ?? p.id };
    });

    const ignoredPairs = new Set<string>();
    const acceptedAspects: NatalChart['aspects'] = [];

    for (const as of (chart.aspects || [])) {
      const p1 = normalizePlanetKey(as.planet1);
      const p2 = normalizePlanetKey(as.planet2);

      if (!p1 || !p2) {
        ignoredPairs.add(`${as.planet1}–${as.planet2}`);
        continue;
      }

      if (!isSupportedPlanet(p1) || !isSupportedPlanet(p2)) {
        ignoredPairs.add(`${as.planet1}–${as.planet2}`);
        continue;
      }

      acceptedAspects.push({ ...as, planet1: p1, planet2: p2 });
    }

    if (process.env.NODE_ENV !== 'production' && ignoredPairs.size > 0) {
      console.debug(
        `[hydrateNatalChart] Aspectos ignorados (${ignoredPairs.size}):`,
        Array.from(ignoredPairs).slice(0, 10)
      );
    }

    const sun = normalizedPlanets.find(p => p.id === 'sun');
    const isDay = chart.isDayChart !== undefined
      ? chart.isDayChart
      : (sun ? (sun.house >= 7 && sun.house <= 12) : true);

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
      const lon = calculateLotLongitude(config.id, chart.ascendant, normalizedPlanets, isDay);
      return {
        ...config,
        longitude: lon,
        sign: getZodiacSign(lon),
        degree: getSignDegree(lon),
        house: getHouseForPlanet(lon, housesPlacidus)
      };
    });

    const trad = calculateTraditionalPoints(chart.ascendant, normalizedPlanets, housesPlacidus, isDay);

    return {
      ...chart,
      planets: normalizedPlanets,
      aspects: acceptedAspects,
      lots,
      traditionalPoints: trad,
      isDayChart: isDay
    };
  } catch (err) {
    console.error('Erro crítico ao hidratar mapa astral:', err);
    return chart;
  }
}
