import { ZodiacSign, Aspect, AspectType } from '@/types';
import { SephirothMapping, SephirahName } from './types';
import { getTraditionalDomicileRuler, getTraditionalExaltationRuler } from '../traditional/rulers';

export const SCORING_CONSTANTS = {
  BASE_SCORE: 50,
  SIGN_DIGNITIES: {
    DOMICILE: 20,
    EXALTATION: 15,
    DETRIMENT: -15,
    FALL: -20,
  },
  ASPECT_MODIFIERS: {
    conjunction: 10,
    trine: 8,
    sextile: 5,
    square: -8,
    opposition: -10,
    semisextile: 0,
    semisquare: 0,
    quintile: 0,
    sesquiquadrate: 0,
    biquintile: 0,
    quincunx: 0
  } as Record<AspectType, number>,
  RETROGRADE_PENALTY: -10,
  ASCENDANT_RULER_BONUS: 10,
  SUN_COMBUSTION: {
    CAZIMI: 15,    // <= 0.28 degrees (17 mins)
    COMBUST: -15,  // <= 8 degrees
    UNDER_RAYS: -5 // <= 15 degrees
  }
};

export interface ScoreDetail {
  reason: string;
  value: number;
}

export interface SephirahScore {
  sephirah: SephirahName;
  score: number;       // clamped 0-100
  trueScore: number;   // raw score
  details: ScoreDetail[];
}

function getOppositeSign(sign: ZodiacSign): ZodiacSign {
  const signs: ZodiacSign[] = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'];
  const idx = signs.indexOf(sign);
  return signs[(idx + 6) % 12];
}

function isAtFall(planetId: string, sign: ZodiacSign): boolean {
  const falls: Record<string, ZodiacSign> = {
    sun: 'Libra',
    moon: 'Escorpião',
    jupiter: 'Capricórnio',
    venus: 'Virgem',
    mars: 'Câncer',
    saturn: 'Áries',
    mercury: 'Peixes'
  };
  return falls[planetId.toLowerCase()] === sign;
}

export function calculateSephirothScores(
  mappings: SephirothMapping[],
  aspects: Aspect[],
  ascendantSign: ZodiacSign
): Record<SephirahName, SephirahScore> {
  const scores: Partial<Record<SephirahName, SephirahScore>> = {};

  const ascRuler = getTraditionalDomicileRuler(ascendantSign);
  const sunMapping = mappings.find(m => 'planetName' in m && m.planetName.toLowerCase() === 'sol');
  const sunLon = sunMapping?.longitude ?? 0;

  mappings.forEach(mapping => {
    let rawScore = SCORING_CONSTANTS.BASE_SCORE;
    const details: ScoreDetail[] = [];

    // Base
    details.push({ reason: 'Base', value: SCORING_CONSTANTS.BASE_SCORE });

    // Identify if it is Malkuth (Ascendant) or a Planet
    const isAscendant = !('planetName' in mapping);
    const planetId = 'planetName' in mapping ? mapping.planetName.toLowerCase() : 'ascendant';
    const planetMapId = planetId === 'sol' ? 'sun' : 
                        planetId === 'lua' ? 'moon' : 
                        planetId === 'mercúrio' ? 'mercury' : 
                        planetId === 'vênus' ? 'venus' : 
                        planetId === 'marte' ? 'mars' : 
                        planetId === 'júpiter' ? 'jupiter' : 
                        planetId === 'saturno' ? 'saturn' : 
                        planetId === 'urano' ? 'uranus' : 
                        planetId === 'netuno' ? 'neptune' : 
                        planetId === 'plutão' ? 'pluto' : planetId;

    if (!isAscendant) {
      // Dignities
      const domRuler = getTraditionalDomicileRuler(mapping.sign);
      const exRuler = getTraditionalExaltationRuler(mapping.sign);

      if (domRuler === planetMapId) {
        rawScore += SCORING_CONSTANTS.SIGN_DIGNITIES.DOMICILE;
        details.push({ reason: `Domicílio em ${mapping.sign}`, value: SCORING_CONSTANTS.SIGN_DIGNITIES.DOMICILE });
      } else if (exRuler === planetMapId) {
        rawScore += SCORING_CONSTANTS.SIGN_DIGNITIES.EXALTATION;
        details.push({ reason: `Exaltação em ${mapping.sign}`, value: SCORING_CONSTANTS.SIGN_DIGNITIES.EXALTATION });
      } else if (getTraditionalDomicileRuler(getOppositeSign(mapping.sign)) === planetMapId) {
        rawScore += SCORING_CONSTANTS.SIGN_DIGNITIES.DETRIMENT;
        details.push({ reason: `Exílio em ${mapping.sign}`, value: SCORING_CONSTANTS.SIGN_DIGNITIES.DETRIMENT });
      } else if (isAtFall(planetMapId, mapping.sign)) {
        rawScore += SCORING_CONSTANTS.SIGN_DIGNITIES.FALL;
        details.push({ reason: `Queda em ${mapping.sign}`, value: SCORING_CONSTANTS.SIGN_DIGNITIES.FALL });
      }

      // Retrograde
      if ('retrograde' in mapping && mapping.retrograde) {
        rawScore += SCORING_CONSTANTS.RETROGRADE_PENALTY;
        details.push({ reason: 'Retrógrado', value: SCORING_CONSTANTS.RETROGRADE_PENALTY });
      }

      // Ascendant Ruler Bonus
      if (planetMapId === ascRuler) {
        rawScore += SCORING_CONSTANTS.ASCENDANT_RULER_BONUS;
        details.push({ reason: 'Regente do Ascendente', value: SCORING_CONSTANTS.ASCENDANT_RULER_BONUS });
      }

      // Solar Condition (if not Sun)
      if (planetMapId !== 'sun' && sunMapping) {
        const diff = Math.abs(mapping.longitude - sunLon);
        const normalizedDiff = Math.min(diff, 360 - diff);
        
        if (normalizedDiff <= (17 / 60)) {
          rawScore += SCORING_CONSTANTS.SUN_COMBUSTION.CAZIMI;
          details.push({ reason: 'Cazimi', value: SCORING_CONSTANTS.SUN_COMBUSTION.CAZIMI });
        } else if (normalizedDiff <= 8.5) {
          rawScore += SCORING_CONSTANTS.SUN_COMBUSTION.COMBUST;
          details.push({ reason: 'Combusto', value: SCORING_CONSTANTS.SUN_COMBUSTION.COMBUST });
        } else if (normalizedDiff <= 17) {
          rawScore += SCORING_CONSTANTS.SUN_COMBUSTION.UNDER_RAYS;
          details.push({ reason: 'Sob os Raios', value: SCORING_CONSTANTS.SUN_COMBUSTION.UNDER_RAYS });
        }
      }
    } else {
      // It is the Ascendant (Malkuth)
      // Bonus to Ascendant if its ruler is strong? The spec says:
      // "Lógica de Malkuth: O Ascendente foi oficializado como o ponto de análise para Malkuth, com bônus para o seu planeta regente."
      // Let's add a fixed bonus to Malkuth just for being the anchor? No, it just receives base score and aspects.
    }

    // Aspects
    aspects.forEach(aspect => {
      // Determine if this planet/ascendant is involved in the aspect
      // Aspect uses planet1 and planet2 as string IDs (e.g. 'sun', 'moon', 'ascendant')
      const involved = aspect.planet1 === planetMapId || aspect.planet2 === planetMapId;
      if (involved) {
        const modifier = SCORING_CONSTANTS.ASPECT_MODIFIERS[aspect.type] || 0;
        if (modifier !== 0) {
          const otherPlanet = aspect.planet1 === planetMapId ? aspect.planet2 : aspect.planet1;
          const otherPlanetName = otherPlanet.charAt(0).toUpperCase() + otherPlanet.slice(1);
          const aspectName = getAspectNamePt(aspect.type);
          
          rawScore += modifier;
          details.push({ reason: `${aspectName} com ${otherPlanetName}`, value: modifier });
        }
      }
    });

    scores[mapping.sephirah.name] = {
      sephirah: mapping.sephirah.name,
      score: Math.max(0, Math.min(100, rawScore)),
      trueScore: rawScore,
      details
    };
  });

  return scores as Record<SephirahName, SephirahScore>;
}

function getAspectNamePt(type: AspectType): string {
  const map: Record<AspectType, string> = {
    conjunction: 'Conjunção',
    trine: 'Trígono',
    sextile: 'Sextil',
    square: 'Quadratura',
    opposition: 'Oposição',
    semisextile: 'Semisextil',
    quincunx: 'Quincúncio',
    semisquare: 'Semiquadratura',
    sesquiquadrate: 'Sesquiquadratura',
    quintile: 'Quintil',
    biquintile: 'Biquintil'
  };
  return map[type] || type;
}
