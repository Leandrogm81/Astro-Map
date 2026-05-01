import type { NatalChart, PlanetPosition } from '@/types';
import { getAngelByDegree } from './shem72';
import { getDegreeInSign, getZodiacSignFromLongitude, normalizeLongitude } from './constants';
import type { MalkuthMapping, SephirahDefinition, SephirahName, SephirothMapping, SephirothPlanetMapping } from './types';

export const SEPHIRAH_DEFINITIONS: Record<SephirahName, SephirahDefinition> = {
  Kether: {
    name: 'Kether',
    number: 1,
    hebrew: 'כתר',
    transliteration: 'Kéter',
    meaning: 'Coroa',
    planetId: 'neptune',
    pillar: 'Equilíbrio',
    color: '#FFFFFF', // Brilho Branco (Escala da Rainha)
    description: {
      pt: 'A fonte da unidade e da consciência suprema.',
      he: 'הכתר העליון',
    },
  },
  Chokmah: {
    name: 'Chokmah',
    number: 2,
    hebrew: 'חכמה',
    transliteration: 'Chokmah',
    meaning: 'Sabedoria',
    planetId: 'uranus',
    pillar: 'Misericórdia',
    color: '#A9A9A9', // Cinza (Escala da Rainha)
    description: {
      pt: 'Impulso criador, sabedoria em estado puro.',
      he: 'חכמה ראשונית',
    },
  },
  Binah: {
    name: 'Binah',
    number: 3,
    hebrew: 'בינה',
    transliteration: 'Binah',
    meaning: 'Entendimento',
    planetId: 'saturn',
    pillar: 'Severidade',
    color: '#000000', // Preto (Escala da Rainha)
    description: {
      pt: 'Estrutura, discernimento e forma.',
      he: 'בינה מעצבת',
    },
  },
  Daath: {
    name: 'Daath',
    number: 0,
    hebrew: 'דעת',
    transliteration: 'Daath',
    meaning: 'Conhecimento',
    planetId: 'pluto',
    pillar: 'Equilíbrio',
    color: '#D8BFD8', // Lavanda (Escala da Rainha)
    description: {
      pt: 'Conhecimento oculto que faz a ponte entre mente e manifestação.',
      he: 'דעת נסתרת',
    },
  },
  Chesed: {
    name: 'Chesed',
    number: 4,
    hebrew: 'חסד',
    transliteration: 'Chesed',
    meaning: 'Misericórdia',
    planetId: 'jupiter',
    pillar: 'Misericórdia',
    color: '#0000FF', // Azul (Escala da Rainha)
    description: {
      pt: 'Expansão benevolente, ordem justa e proteção.',
      he: 'חסד מתפשט',
    },
  },
  Geburah: {
    name: 'Geburah',
    number: 5,
    hebrew: 'גבורה',
    transliteration: 'Geburah',
    meaning: 'Rigor',
    planetId: 'mars',
    pillar: 'Severidade',
    color: '#FF0000', // Escarlate (Escala da Rainha)
    description: {
      pt: 'Força, limite e coragem para agir.',
      he: 'גבורה לוחמת',
    },
  },
  Tiphereth: {
    name: 'Tiphereth',
    number: 6,
    hebrew: 'תפארת',
    transliteration: 'Tiphereth',
    meaning: 'Beleza',
    planetId: 'sun',
    pillar: 'Equilíbrio',
    color: '#FFD700', // Ouro/Amarelo (Escala da Rainha)
    description: {
      pt: 'Centro solar de harmonia, integridade e revelação.',
      he: 'תפארת מרכזית',
    },
  },
  Netzach: {
    name: 'Netzach',
    number: 7,
    hebrew: 'נצח',
    transliteration: 'Netzach',
    meaning: 'Vitória',
    planetId: 'venus',
    pillar: 'Misericórdia',
    color: '#008000', // Esmeralda (Escala da Rainha)
    description: {
      pt: 'Persistência, desejo e magnetismo.',
      he: 'נצח מנצח',
    },
  },
  Hod: {
    name: 'Hod',
    number: 8,
    hebrew: 'הוד',
    transliteration: 'Hod',
    meaning: 'Esplendor',
    planetId: 'mercury',
    pillar: 'Severidade',
    color: '#FFA500', // Laranja (Escala da Rainha)
    description: {
      pt: 'Linguagem, forma mental e precisão.',
      he: 'הוד בהיר',
    },
  },
  Yesod: {
    name: 'Yesod',
    number: 9,
    hebrew: 'יסוד',
    transliteration: 'Yesod',
    meaning: 'Fundamento',
    planetId: 'moon',
    pillar: 'Equilíbrio',
    color: '#8A2BE2', // Violeta (Escala da Rainha)
    description: {
      pt: 'Base psíquica, memória e imaginação.',
      he: 'יסוד מחבר',
    },
  },
  Malkuth: {
    name: 'Malkuth',
    number: 10,
    hebrew: 'מלכות',
    transliteration: 'Malkuth',
    meaning: 'Reino',
    planetId: 'ascendant',
    pillar: 'Equilíbrio',
    color: '#1A1A1A', // Citrino/Oliva/Ferrugem/Preto (Escala da Rainha)
    description: {
      pt: 'Manifestação encarnada, o reino material.',
      he: 'מלכות בעולם',
    },
  },
};

const MAPPING_ORDER: readonly [SephirahName, string][] = [
  ['Kether', 'neptune'],
  ['Chokmah', 'uranus'],
  ['Binah', 'saturn'],
  ['Daath', 'pluto'],
  ['Chesed', 'jupiter'],
  ['Geburah', 'mars'],
  ['Tiphereth', 'sun'],
  ['Netzach', 'venus'],
  ['Hod', 'mercury'],
  ['Yesod', 'moon'],
];

function findPlanet(chart: NatalChart, planetId: string): PlanetPosition | undefined {
  return chart.planets.find((planet) => planet.id === planetId);
}

function buildPlanetMapping(sephirahName: SephirahName, planet: PlanetPosition): SephirothPlanetMapping {
  return {
    sephirah: SEPHIRAH_DEFINITIONS[sephirahName],
    planetName: planet.name,
    planetSymbol: planet.symbol,
    longitude: normalizeLongitude(planet.longitude),
    sign: planet.sign,
    degree: planet.degree,
    house: planet.house,
    retrograde: planet.retrograde,
    angel: getAngelByDegree(planet.longitude),
  };
}

function buildMalkuthMapping(chart: NatalChart): MalkuthMapping {
  const longitude = normalizeLongitude(chart.ascendant);

  return {
    sephirah: SEPHIRAH_DEFINITIONS.Malkuth,
    longitude,
    sign: getZodiacSignFromLongitude(longitude),
    degree: getDegreeInSign(longitude),
    house: 1,
    angel: getAngelByDegree(longitude),
  };
}

export function getSephirahDefinition(name: SephirahName): SephirahDefinition {
  return SEPHIRAH_DEFINITIONS[name];
}

export function getSephirahDefinitionByNumber(number: number): SephirahDefinition | undefined {
  return Object.values(SEPHIRAH_DEFINITIONS).find((definition) => definition.number === number);
}

export function mapChartToSephiroth(chart: NatalChart): SephirothMapping[] {
  const mappings: SephirothMapping[] = [];

  for (const [sephirahName, planetId] of MAPPING_ORDER) {
    const planet = findPlanet(chart, planetId);
    if (!planet) continue;
    mappings.push(buildPlanetMapping(sephirahName, planet));
  }

  mappings.push(buildMalkuthMapping(chart));
  return mappings;
}
