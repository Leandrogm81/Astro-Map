import { PlanetPosition, HouseCusp, ZodiacSign } from '@/types';
import { calculateEssentialDignity } from './dignities';
import { getTraditionalDomicileRuler } from './rulers';

export interface TraditionalPoints {
  hyleg: string;
  alcocoden: string;
  almutenFiguris: string;
  lordOfNativity: string;
}

/**
 * Calcula os pontos fundamentais da Astrologia Tradicional
 */
export function calculateTraditionalPoints(
  ascendant: number,
  planets: PlanetPosition[],
  houses: HouseCusp[],
  isDay: boolean
): TraditionalPoints {
  const getPlanet = (id: string) => planets.find(p => p.id === id);
  const sun = getPlanet('sun')!;
  const moon = getPlanet('moon')!;
  
  // 1. Lord of Nativity (Regente do Ascendente)
  const ascSign = houses[0].sign as ZodiacSign;
  const lordOfNativity = getTraditionalDomicileRuler(ascSign);

  // 2. Hyleg (Doador da Vida) - Regras de Ptolomeu simplificadas
  let hyleg = 'ascendant';
  const hylegPlaces = [1, 10, 11, 7, 9]; // Casas hylegiacais

  if (isDay) {
    if (hylegPlaces.includes(sun.house || 0)) hyleg = 'sun';
    else if (hylegPlaces.includes(moon.house || 0)) hyleg = 'moon';
  } else {
    if (hylegPlaces.includes(moon.house || 0)) hyleg = 'moon';
    else if (hylegPlaces.includes(sun.house || 0)) hyleg = 'sun';
  }

  // 3. Almuten Figuris (Vencedor do Mapa)
  // Cálculo baseado na soma de dignidades em 5 pontos: Sol, Lua, ASC, Parte da Fortuna e Sizígia Pre-natal
  // Simplificado para o planeta com maior score total no momento
  const almuten = calculateAlmuten(planets, isDay);

  return {
    hyleg,
    alcocoden: calculateAlcocoden(hyleg, planets),
    almutenFiguris: almuten,
    lordOfNativity
  };
}

function calculateAlmuten(planets: PlanetPosition[], isDay: boolean): string {
  // O planeta com o score total mais alto de dignidades acidentais e essenciais
  // Para uma implementação real, precisaríamos do Almuten dos 5 pontos Hylegiacais
  // Por enquanto, retornamos o planeta mais forte do Septenário
  return planets
    .filter(p => !['uranus', 'neptune', 'pluto'].includes(p.id))
    .sort((a, b) => (b.longitude % 30) - (a.longitude % 30)) // Placeholder
    [0].id;
}

function calculateAlcocoden(hyleg: string, planets: PlanetPosition[]): string {
  // O Alcocoden é o regente (por dignidade) do Hyleg que faz aspecto com ele
  // Simplificado: retorna o regente do domicílio do Hyleg
  return 'jupiter'; // Placeholder para expansão futura
}
