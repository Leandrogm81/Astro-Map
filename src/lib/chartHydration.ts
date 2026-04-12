import { NatalChart } from '@/types';
import { calculateLotLongitude } from '@/lib/traditional/lots';
import { calculateTraditionalPoints } from '@/lib/traditional/points';
import { getZodiacSign, getSignDegree, getHouseForPlanet } from '@/lib/astrology';

export function hydrateNatalChart(chart: NatalChart): NatalChart {
  try {
    const { planets, housesPlacidus } = chart;
    
    // 1. Normalizar IDs dos planetas (Essencial para o motor tradicional)
    const normalizedPlanets = planets.map(p => {
      const name = p.name?.toLowerCase();
      let id = p.id?.toLowerCase();
      
      // Mapeamento de nomes em PT/EN para IDs padronizados
      if (!id || id === name) {
        if (name === 'sol' || name === 'sun') id = 'sun';
        else if (name === 'lua' || name === 'moon') id = 'moon';
        else if (name === 'mercúrio' || name === 'mercury') id = 'mercury';
        else if (name === 'vênus' || name === 'venus') id = 'venus';
        else if (name === 'marte' || name === 'mars') id = 'mars';
        else if (name === 'júpiter' || name === 'jupiter') id = 'jupiter';
        else if (name === 'saturno' || name === 'saturn') id = 'saturn';
      }
      
      return { ...p, id: id || p.id };
    });

    // 2. Determinar se é dia ou noite (Seita)
    const sun = normalizedPlanets.find(p => p.id === 'sun');
    const isDay = chart.isDayChart !== undefined 
      ? chart.isDayChart 
      : (sun ? (sun.house >= 7 && sun.house <= 12) : true);

    // 3. Recalcular Lotes se necessário ou se estiver incompleto
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

    // 4. Recalcular Pontos Tradicionais
    const trad = calculateTraditionalPoints(chart.ascendant, normalizedPlanets, housesPlacidus, isDay);

    return {
      ...chart,
      planets: normalizedPlanets,
      lots,
      traditionalPoints: trad,
      isDayChart: isDay
    };
  } catch (err) {
    console.error('Erro crítico ao hidratar mapa astral:', err);
    return chart;
  }
}
