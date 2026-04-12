export * from './types';
import { TraditionalAssessment, TraditionalScore } from './types';
import { isAtDomicile, isAtExaltation, TRADITIONAL_DETRIMENTS, TRADITIONAL_FALLS } from './rulers';
import { hasTriplicity, getSolarCondition } from './dignities';
import { isInSect, calculateHayz } from './sect';
import { PlanetPosition, ZodiacSign } from '@/types';

const PLANET_NAME_MAP: Record<string, string> = {
  'sun': 'Sol',
  'moon': 'Lua',
  'mercury': 'Mercúrio',
  'venus': 'Vênus',
  'mars': 'Marte',
  'jupiter': 'Júpiter',
  'saturn': 'Saturno',
};

export function calculateTraditionalAssessment(
  planet: PlanetPosition,
  sun: PlanetPosition,
  isDayChart: boolean
): TraditionalAssessment {
  const name = PLANET_NAME_MAP[planet.id] || planet.name;
  const sign = planet.sign as ZodiacSign;
  
  const essential: { [key: string]: number } = {};
  const accidental: { [key: string]: number } = {};

  // 1. Dignidades Essenciais
  if (isAtDomicile(name, sign)) essential['Domicílio'] = 5;
  if (isAtExaltation(name, sign)) essential['Exaltação'] = 4;
  if (hasTriplicity(name, sign, isDayChart)) essential['Triplicidade'] = 3;
  
  // Debilidades Essenciais
  if (TRADITIONAL_DETRIMENTS[name]?.includes(sign)) essential['Exílio'] = -5;
  if (TRADITIONAL_FALLS[name] === sign) essential['Queda'] = -4;

  // 2. Dignidades Acidentais
  const solarCond = planet.id !== 'sun' 
    ? getSolarCondition(planet.longitude, sun.longitude)
    : { isCazimi: false, isCombust: false, isUnderRays: false };

  if (solarCond.isCazimi) accidental['Cazimi'] = 5;
  if (solarCond.isCombust) accidental['Combusto'] = -5;
  if (solarCond.isUnderRays) accidental['Sob os Raios'] = -2;
  if (planet.retrograde) accidental['Retrógrado'] = -5;
  
  // Sect & Hayz
  const inSect = isInSect(planet.id, isDayChart);
  const hayz = calculateHayz(planet.id, planet.house || 1, isDayChart);
  
  if (inSect) accidental['Na Seita'] = 2;
  if (hayz) accidental['Hayz'] = 3;

  // Calcular Totais
  const totalEssential = Object.values(essential).reduce((a, b) => a + b, 0);
  const totalAccidental = Object.values(accidental).reduce((a, b) => a + b, 0);

  const score: TraditionalScore = {
    essential: totalEssential,
    accidental: totalAccidental,
    total: totalEssential + totalAccidental,
    breakdown: { essential, accidental }
  };

  let dignity = 'Peregrino';
  if (essential['Domicílio']) dignity = 'Domicílio';
  else if (essential['Exaltação']) dignity = 'Exaltação';
  else if (essential['Triplicidade']) dignity = 'Triplicidade';
  else if (essential['Exílio']) dignity = 'Exílio';
  else if (essential['Queda']) dignity = 'Queda';

  return {
    planetId: planet.id,
    sign: planet.sign,
    degree: planet.degree,
    house: planet.house || 1,
    isRetrograde: planet.retrograde,
    dignity,
    totalScore: score.total,
    sectStatus: inSect ? 'In-Sect' : 'Out-of-Sect',
    dignities: {
      domicile: '', 
      exaltation: '',
      detriment: '',
      fall: '',
    },
    condition: {
      ...solarCond,
      isInMutualReception: [],
      sectStatus: inSect ? 'benefic' : 'neutral',
      isHayz: hayz
    },
    score,
    technicalSummary: generateTechnicalSummary(name, score)
  };
}

function generateTechnicalSummary(name: string, score: TraditionalScore): string {
  if (score.total >= 5) return `${name} está em condição forte e benéfica.`;
  if (score.total <= -5) return `${name} está severamente debilitado.`;
  return `${name} possui condição moderada.`;
}
