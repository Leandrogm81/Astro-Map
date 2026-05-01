import type { NatalChart, PlanetPosition } from '@/types';
import { getAngelByDegree } from './shem72';
import { getDegreeInSign, getZodiacSignFromLongitude, normalizeLongitude, PILLAR_COLORS } from './constants';
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
    color: '#f8fafc',
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
    color: '#60a5fa',
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
    color: '#f87171',
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
    color: '#8b5cf6',
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
    color: '#38bdf8',
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
    color: '#fb7185',
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
    color: PILLAR_COLORS['Equilíbrio'],
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
    color: '#34d399',
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
    color: '#f59e0b',
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
    color: '#c084fc',
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
    color: '#94a3b8',
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
