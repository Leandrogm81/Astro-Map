import { PlanetPosition } from '@/types';

export interface LotConfig {
  id: string;
  name: string;
  symbol: string;
  description: string;
}

export const HERMETIC_LOTS: LotConfig[] = [
  { id: 'fortune', name: 'Roda da Fortuna', symbol: '⊗', description: 'Prosperidade, vitalidade física e fortuna material.' },
  { id: 'spirit', name: 'Lote do Espírito', symbol: '✦', description: 'Propósito espiritual, intelecto e carreira.' },
  { id: 'eros', name: 'Lote de Eros', symbol: '♥', description: 'Amor, desejos, amizades e inclinações.' },
  { id: 'necessity', name: 'Lote da Necessidade', symbol: '⚖', description: 'Restrições, deveres, inimizades e esforço.' },
  { id: 'courage', name: 'Lote da Coragem', symbol: '⚔', description: 'Audácia, força de vontade e ímpeto.' },
  { id: 'victory', name: 'Lote da Vitória', symbol: '🏆', description: 'Sucesso, reconhecimento e honra.' },
  { id: 'nemesis', name: 'Lote de Nêmesis', symbol: '⚡', description: 'Justiça retributiva, karma e destino inevitável.' },
];

/**
 * Calcula a longitude de um Lote Hermético
 */
export function calculateLotLongitude(
  lotId: string,
  ascendant: number,
  planets: PlanetPosition[],
  isDay: boolean
): number {
  const getLon = (id: string) => planets.find(p => p.id === id)?.longitude || 0;
  
  const sun = getLon('sun');
  const moon = getLon('moon');
  const merc = getLon('mercury');
  const venus = getLon('venus');
  const mars = getLon('mars');
  const jup = getLon('jupiter');
  const sat = getLon('saturn');

  // Lote do Espírito (Lote de DAEMON) é necessário para alguns cálculos
  const fortuneDay = (ascendant + moon - sun + 360) % 360;
  const fortuneNight = (ascendant + sun - moon + 360) % 360;
  const spiritDay = (ascendant + sun - moon + 360) % 360;
  const spiritNight = (ascendant + moon - sun + 360) % 360;

  const fortune = isDay ? fortuneDay : fortuneNight;
  const spirit = isDay ? spiritDay : spiritNight;

  let lon = 0;

  switch (lotId) {
    case 'fortune':
      lon = fortune;
      break;
    case 'spirit':
      lon = spirit;
      break;
    case 'eros':
      // Asc + Venus - Spirit (Day) | Asc + Spirit - Venus (Night)
      lon = isDay ? (ascendant + venus - spirit) : (ascendant + spirit - venus);
      break;
    case 'necessity':
      // Asc + Fortune - Mercury (Day) | Asc + Mercury - Fortune (Night)
      lon = isDay ? (ascendant + fortune - merc) : (ascendant + merc - fortune);
      break;
    case 'courage':
      // Asc + Fortune - Mars (Day) | Asc + Mars - Fortune (Night)
      lon = isDay ? (ascendant + fortune - mars) : (ascendant + mars - fortune);
      break;
    case 'victory':
      // Asc + Jupiter - Spirit (Day) | Asc + Spirit - Jupiter (Night)
      lon = isDay ? (ascendant + jup - spirit) : (ascendant + spirit - jup);
      break;
    case 'nemesis':
      // Asc + Fortune - Saturn (Day) | Asc + Saturn - Fortune (Night)
      lon = isDay ? (ascendant + fortune - sat) : (ascendant + sat - fortune);
      break;
    default:
      lon = fortune;
  }

  return (lon + 360) % 360;
}
