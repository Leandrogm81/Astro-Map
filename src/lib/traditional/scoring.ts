import { TraditionalAssessment, TraditionalScore } from './types';
import { getTraditionalDomicileRuler, getTraditionalExaltationRuler } from './rulers';
import { getFaceRuler, getTermRuler, calculateEssentialDignity, getSolarCondition } from './dignities';
import { calculateHayz, getSectStatus } from './sect';
import { getDignityVibe } from './interpretations';
import { PLANET_NAME_PT } from './constants';
import { PlanetPosition, ZodiacSign } from '@/types';

export function calculateTraditionalAssessment(
  planet: PlanetPosition,
  allPlanets: PlanetPosition[],
  isDayChart: boolean
): TraditionalAssessment {
  const sign = planet.sign as ZodiacSign;
  const sun = allPlanets.find(p => p.id?.toLowerCase() === 'sun');

  const essential: Record<string, number> = {};
  const accidental: Record<string, number> = {};

  // 1. Dignidades Essenciais (Ptolomeu/Lilly)
  const dignities = calculateEssentialDignity(planet.id, sign, planet.degree, isDayChart);

  if (dignities.isAtDomicile) essential['Domicílio'] = 5;
  if (dignities.isAtExaltation) essential['Exaltação'] = 4;
  if (dignities.isAtTriplicity) essential['Triplicidade'] = 3;
  if (dignities.isAtTerm) essential['Termo'] = 2;
  if (dignities.isAtFace) essential['Face'] = 1;

  // Debilidades Essenciais
  const domRuler = getTraditionalDomicileRuler(sign);
  const exRuler = getTraditionalExaltationRuler(sign);
  const pIdLower = planet.id?.toLowerCase() || '';
  if (domRuler !== pIdLower && getTraditionalDomicileRuler(getOppositeSign(sign)) === pIdLower) {
    essential['Exílio'] = -5;
  }
  if (isAtFall(pIdLower, sign)) {
    essential['Queda'] = -4;
  }

  // 2. Dignidades Acidentais
  const solarCond = planet.id?.toLowerCase() !== 'sun' && sun
    ? getSolarCondition(planet.longitude, sun.longitude)
    : { isCazimi: false, isCombust: false, isUnderRays: false };

  if (solarCond.isCazimi) accidental['Cazimi'] = 5;
  if (solarCond.isCombust) accidental['Combusto'] = -5;
  if (solarCond.isUnderRays) accidental['Sob os Raios'] = -2;
  if (planet.retrograde) accidental['Retrógrado'] = -5;

  const hayz = calculateHayz(pIdLower, planet.house || 1, sign, isDayChart);
  const sectStatus = getSectStatus(pIdLower, isDayChart);

  if (sectStatus === 'in_sect' || sectStatus === 'benefic') accidental['Na Seita'] = 2;
  if (hayz) accidental['Hayz'] = 3;

  const angularHouses = [1, 4, 7, 10];
  const succedentHouses = [2, 5, 8, 11];
  if (angularHouses.includes(planet.house || 0)) accidental['Casa Angular'] = 5;
  else if (succedentHouses.includes(planet.house || 0)) accidental['Casa Sucedente'] = 3;

  const mutualReceptions: string[] = [];
  allPlanets.forEach(other => {
    if (other.id?.toLowerCase() === planet.id?.toLowerCase()) return;
    const classicIds = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
    if (!classicIds.includes(other.id?.toLowerCase())) return;

    const mySignRuler = getTraditionalDomicileRuler(sign);
    const otherSignRuler = getTraditionalDomicileRuler(other.sign as ZodiacSign);

    if (mySignRuler === other.id?.toLowerCase() && otherSignRuler === pIdLower) {
      accidental['Recepção Mútua'] = 2;
      mutualReceptions.push(PLANET_NAME_PT[other.id?.toLowerCase() || ''] || other.id);
    }
  });

  const totalEssential = Object.values(essential).reduce((a, b) => a + b, 0);
  const totalAccidental = Object.values(accidental).reduce((a, b) => a + b, 0);

  const score: TraditionalScore = {
    essential: totalEssential,
    accidental: totalAccidental,
    total: totalEssential + totalAccidental,
    breakdown: { essential, accidental }
  };

  return {
    planetId: planet.id,
    sign: planet.sign,
    degree: planet.degree,
    house: planet.house || 1,
    isRetrograde: planet.retrograde,
    dignity: getPrimaryDignityLabel(essential),
    totalScore: score.total,
    sectStatus: sectStatus.toUpperCase(),
    dignities: {
      domicile: PLANET_NAME_PT[domRuler] || '',
      exaltation: PLANET_NAME_PT[exRuler || ''] || '',
      detriment: '',
      fall: '',
    },
    condition: {
      ...solarCond,
      isInMutualReception: mutualReceptions,
      sectStatus,
      isHayz: hayz
    },
    score,
    technicalSummary: generateTechnicalSummary(PLANET_NAME_PT[pIdLower] || planet.id, score),
    interpretations: {
      term: getDignityVibe('term', getTermRuler(sign, planet.degree)),
      face: getDignityVibe('decan', getFaceRuler(sign, planet.degree))
    }
  };
}

function getOppositeSign(sign: ZodiacSign): ZodiacSign {
  const signs: ZodiacSign[] = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'];
  const idx = signs.indexOf(sign);
  return signs[(idx + 6) % 12];
}

function isAtFall(planet: string, sign: ZodiacSign): boolean {
  const falls: Record<string, ZodiacSign> = {
    sun: 'Libra' as ZodiacSign,
    moon: 'Escorpião' as ZodiacSign,
    jupiter: 'Capricórnio' as ZodiacSign,
    venus: 'Virgem' as ZodiacSign,
    mars: 'Câncer' as ZodiacSign,
    saturn: 'Áries' as ZodiacSign,
    mercury: 'Peixes' as ZodiacSign
  };
  return falls[planet.toLowerCase()] === sign;
}

function generateTechnicalSummary(_name: string, score: TraditionalScore): string {
  if (score.total >= 10) return 'Apresenta fortíssima dignidade essencial e acidental, operando com máxima eficácia.';
  if (score.total >= 5) return 'Apresenta boa dignidade, com capacidade de manifestação benéfica e estável.';
  if (score.total <= -10) return 'Encontra-se em severa debilidade, indicando corrupção ou supressão de sua natureza essencial.';
  if (score.total <= -5) return 'Encontra-se debilitado, exigindo mitigação por aspectos ou recepção mútua.';
  return 'Apresenta condição mista ou peregrina, dependendo inteiramente de seus dispositores.';
}

function getPrimaryDignityLabel(essential: Record<string, number>): string {
  if (essential['Domicílio']) return 'Domicílio';
  if (essential['Exaltação']) return 'Exaltação';
  if (essential['Exílio']) return 'Exílio';
  if (essential['Queda']) return 'Queda';
  if (essential['Triplicidade']) return 'Triplicidade';
  if (essential['Termo']) return 'Termo';
  if (essential['Face']) return 'Face';
  return 'Peregrino';
}
