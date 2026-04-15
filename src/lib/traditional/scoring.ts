import { TraditionalAssessment, TraditionalScore } from './types';
import { getTraditionalDomicileRuler, getTraditionalExaltationRuler, getTraditionalTriplicityRulers } from './rulers';
import { getFaceRuler, getTermRuler, calculateEssentialDignity, getSolarCondition } from './dignities';
import { calculateHayz, getSectStatus, isPlanetDiurnal } from './sect';
import { getDignityVibe } from './interpretations';
import { PlanetPosition, ZodiacSign } from '@/types';

const PLANET_NAME_PT: Record<string, string> = {
  sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio', venus: 'Vênus', mars: 'Marte', jupiter: 'Júpiter', saturn: 'Saturno'
};

export function calculateTraditionalAssessment(
  planet: PlanetPosition,
  allPlanets: PlanetPosition[],
  isDayChart: boolean
): TraditionalAssessment {
  const sign = planet.sign as ZodiacSign;
  const sun = allPlanets.find(p => p.id === 'sun')!;
  
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
  // Se o regente do signo é o próprio planeta, ele não está em exílio
  if (domRuler !== planet.id && getTraditionalDomicileRuler(getOppositeSign(sign)) === planet.id) {
    essential['Exílio'] = -5;
  }
  // Queda (Oposto da exaltação) - Simplificado para os 7
  if (isAtFall(planet.id, sign)) {
    essential['Queda'] = -4;
  }

  // 2. Dignidades Acidentais
  const solarCond = planet.id !== 'sun' 
    ? getSolarCondition(planet.longitude, sun.longitude)
    : { isCazimi: false, isCombust: false, isUnderRays: false };

  if (solarCond.isCazimi) accidental['Cazimi'] = 5;
  if (solarCond.isCombust) accidental['Combusto'] = -5;
  if (solarCond.isUnderRays) accidental['Sob os Raios'] = -2;
  if (planet.retrograde) accidental['Retrógrado'] = -5;
  
  // Sect & Hayz
  const hayz = calculateHayz(planet.id, planet.house || 1, sign, isDayChart);
  const sectStatus = getSectStatus(planet.id, isDayChart);
  
  if (sectStatus === 'in_sect' || sectStatus === 'benefic') accidental['Na Seita'] = 2;
  if (hayz) accidental['Hayz'] = 3;

  // Casas Angulares (Força Acidental)
  const angularHouses = [1, 4, 7, 10];
  const succedentHouses = [2, 5, 8, 11];
  if (angularHouses.includes(planet.house || 0)) accidental['House Angular'] = 5;
  else if (succedentHouses.includes(planet.house || 0)) accidental['House Sucedente'] = 3;

  // Recepção Mútua (Domicílio)
  const mutualReceptions: string[] = [];
  allPlanets.forEach(other => {
    if (other.id === planet.id) return;
    const classicIds = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
    if (!classicIds.includes(other.id)) return;

    const mySignRuler = getTraditionalDomicileRuler(sign);
    const otherSignRuler = getTraditionalDomicileRuler(other.sign as ZodiacSign);

    if (mySignRuler === other.id && otherSignRuler === planet.id) {
      accidental['Recepção Mútua'] = 2;
      mutualReceptions.push(PLANET_NAME_PT[other.id] || other.id);
    }
  });

  // Calcular Totais
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
    dignity: dignities.isPeregrine ? 'Peregrino' : (dignities.isAtDomicile ? 'Domicílio' : 'Afligido'),
    totalScore: score.total,
    sectStatus: sectStatus.toUpperCase(),
    dignities: {
      domicile: PLANET_NAME_PT[domRuler] || '',
      exaltation: PLANET_NAME_PT[exRuler || ''] || '',
      detriment: '', // TODO
      fall: '',
    },
    condition: {
      ...solarCond,
      isInMutualReception: mutualReceptions,
      sectStatus: sectStatus as any,
      isHayz: hayz
    },
    score,
    technicalSummary: generateTechnicalSummary(PLANET_NAME_PT[planet.id] || planet.id, score),
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
    sun: 'Libra', moon: 'Escorpião', jupiter: 'Capricórnio', venus: 'Virgem', mars: 'Câncer', saturn: 'Áries', mercury: 'Peixes'
  };
  return falls[planet] === sign;
}

function generateTechnicalSummary(name: string, score: TraditionalScore): string {
  if (score.total >= 10) return `${name} está em condição soberana e excepcional.`;
  if (score.total >= 5) return `${name} está em condição forte e benéfica.`;
  if (score.total <= -10) return `${name} está em estado crítico de debilidade.`;
  if (score.total <= -5) return `${name} está severamente debilitado.`;
  return `${name} possui condição moderada.`;
}
