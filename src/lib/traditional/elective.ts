import { MagicPurpose, PlanetHour, LunarMansion, ElectiveVeredict, ElectiveScore } from './types';
import { ZodiacSign } from '@/types';
import { calculateTraditionalAssessment } from './scoring';
import { PlanetPosition } from '@/types';
import { calculateTraditionalAspects, calculateMoonVoidOfCourse, getPlanetNamePT } from './aspects';
import { PLANETARY_CORRESPONDENCES, PlanetKey } from './magic-correspondences';

/**
 * Ordem Caldeia de Regência (descendente de velocidade/distância)
 */
export const CHALDEAN_ORDER = ['saturn', 'jupiter', 'mars', 'sun', 'venus', 'mercury', 'moon'];

/**
 * Regente do Dia (0=Domingo(Sol), 1=Segunda(Lua), 2=Terça(Marte), 3=Quarta(Mercúrio), 4=Quinta(Júpiter), 5=Sexta(Vênus), 6=Sábado(Saturno))
 */
export const DAY_RULERS = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

/**
 * Mapeamento de Propósito para Planeta Regente
 */
export const PURPOSE_RULER: Record<MagicPurpose, string> = {
  authority: 'sun',
  emotion: 'moon',
  communication: 'mercury',
  love: 'venus',
  conflict: 'mars',
  expansion: 'jupiter',
  structure: 'saturn',
};

const PLANET_ID_TO_KEY: Partial<Record<string, PlanetKey>> = {
  sun: 'Sun',
  moon: 'Moon',
  mercury: 'Mercury',
  venus: 'Venus',
  mars: 'Mars',
  jupiter: 'Jupiter',
  saturn: 'Saturn',
};

/**
 * Mansões Lunares (Sistema de 28 divisões iguais de 12°51'26")
 */
export const LUNAR_MANSIONS: LunarMansion[] = Array.from({ length: 28 }, (_, i) => {
  const startDegree = i * (360 / 28);
  const signIndex = Math.floor(startDegree / 30);
  const signs: ZodiacSign[] = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'];
  
  return {
    number: i + 1,
    name: `Mansão ${i + 1}`,
    sign: signs[signIndex],
    degreeRange: `${Math.floor(startDegree % 30)}° - ${Math.floor((startDegree + 360/28) % 30)}°`,
    summary: getMansionSummary(i + 1),
  };
});

function getMansionSummary(n: number): string {
  const summaries: Record<number, string> = {
    1: 'Inícios, força vital e coragem.',
    2: 'Busca de recursos e lucros.',
    3: 'Fortuna, brilho e sucesso social.',
    4: 'Influência, vingança e paixão.',
    5: 'Viagens e comunicação.',
    6: 'Amizades e parcerias.',
    7: 'Ganho e prosperidade.',
    8: 'Amor e vitória.',
    9: 'Desfortuna e cautela.',
    10: 'Poder e autoridade.',
    11: 'Respeito e lucro.',
    12: 'Conflitos e separação.',
    13: 'Prazer e fertilidade.',
    14: 'Justiça e verdade.',
    15: 'Extração de tesouros e descobertas.',
    16: 'Desejo e luxúria.',
    17: 'Proteção e defesa.',
    18: 'Expulsão e limpeza.',
    19: 'Ataque e estratégia.',
    20: 'Vigilância e proteção.',
    21: 'Destruição de edifícios e novos planos.',
    22: 'Fuga e ocultamento.',
    23: 'Divórcio e discórdia.',
    24: 'Saúde e cura.',
    25: 'Crescimento e agricultura.',
    26: 'Amor e união duradoura.',
    27: 'Riqueza e contenção.',
    28: 'Paz e conclusão.',
  };
  return summaries[n] || 'Influência geral lunar.';
}

/**
 * Calcula a Mansão Lunar atual
 */
export function getLunarMansion(moonLongitude: number): LunarMansion {
  const mansionIndex = Math.floor((moonLongitude % 360) / (360 / 28));
  return LUNAR_MANSIONS[mansionIndex];
}

/**
 * Retorna o Planeta Regente do Dia Astrológico (começa no nascer do sol)
 */
export function getPlanetaryDay(
  targetDate: Date,
  sunrise: Date,
): string {
  let dayOfWeek = targetDate.getDay(); // 0-6
  
  // Se ainda não amanheceu, astrologicamente ainda é o dia anterior
  if (targetDate < sunrise) {
    dayOfWeek = (dayOfWeek - 1 + 7) % 7;
  }
  
  return DAY_RULERS[dayOfWeek];
}

/**
 * Calcula a Hora Planetária
 * @param date Data e hora alvo
 * @param sunrise Nascer do sol do dia
 * @param sunset Pôr do sol do dia
 * @param nextSunrise Nascer do sol de amanhã
 * @param previousSunset Pôr do sol de ontem
 * @param dayOfWeek Dia da semana civil (0-6)
 */
export function calculatePlanetHour(
  targetDate: Date,
  sunrise: Date,
  sunset: Date,
  nextSunrise: Date,
  previousSunset: Date
): PlanetHour {
  const isDaytime = targetDate >= sunrise && targetDate < sunset;
  
  // Define os limites reais do período (Dia ou Noite)
  let startTime: Date;
  let endTime: Date;

  if (isDaytime) {
    startTime = sunrise;
    endTime = sunset;
  } else {
    // Se for antes do amanhecer, a noite começou no pôr do sol de ontem
    if (targetDate < sunrise) {
      startTime = previousSunset;
      endTime = sunrise;
    } else {
      // Se for depois do pôr do sol, a noite termina no amanhecer de amanhã
      startTime = sunset;
      endTime = nextSunrise;
    }
  }
  
  const totalDuration = endTime.getTime() - startTime.getTime();
  const hourDuration = totalDuration / 12;
  const elapsed = targetDate.getTime() - startTime.getTime();
  const hourNumber = Math.max(1, Math.min(12, Math.floor(elapsed / hourDuration) + 1));

  const dayRuler = getPlanetaryDay(targetDate, sunrise);
  
  // Ordem Caldeia a partir do regente do dia
  const startIdx = CHALDEAN_ORDER.indexOf(dayRuler);
  // Noite começa na 13ª hora (25ª se contar linearmente)
  const offset = isDaytime ? (hourNumber - 1) : (12 + hourNumber - 1);
  const planetId = CHALDEAN_ORDER[(startIdx + offset) % 7];

  const hStart = new Date(startTime.getTime() + (hourNumber - 1) * hourDuration);
  const hEnd = new Date(startTime.getTime() + hourNumber * hourDuration);

  return {
    planetId,
    isDaytime,
    hourNumber,
    startTime: hStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    endTime: hEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

/**
 * Engine de Veredito para Eletiva Mágica
 */
export function getElectiveVeredict(
  purpose: MagicPurpose,
  targetPlanets: PlanetPosition[],
  isDayChart: boolean,
  planetHour: PlanetHour,
  moonMansion: LunarMansion
): ElectiveVeredict {
  const rulerId = PURPOSE_RULER[purpose];
  const ruler = targetPlanets.find(p => p.id?.toLowerCase() === rulerId.toLowerCase());
  const moon = targetPlanets.find(p => p.id?.toLowerCase() === 'moon')!;
  const sun = targetPlanets.find(p => p.id?.toLowerCase() === 'sun')!;
  const planetKey = PLANET_ID_TO_KEY[rulerId];
  const correspondences = planetKey ? PLANETARY_CORRESPONDENCES[planetKey] : undefined;
  
  if (!ruler) throw new Error(`Regente ${rulerId} não encontrado.`);
  if (!sun) throw new Error(`Sol não encontrado.`);

  const assessment = calculateTraditionalAssessment(ruler, targetPlanets, isDayChart);
  const moonAssessment = calculateTraditionalAssessment(moon, targetPlanets, isDayChart);
  const voc = calculateMoonVoidOfCourse(moon, targetPlanets);
  const aspects = calculateTraditionalAspects(targetPlanets);

  let points = 0;

  // 1. Hora Planetária (Crucial)
  if (planetHour.planetId === rulerId) points += 5;
  else if (['jupiter', 'venus'].includes(planetHour.planetId)) points += 2; // Benéficos ajudam
  else if (['mars', 'saturn'].includes(planetHour.planetId)) points -= 3; // Maléficos atrapalham

  // 2. Condição do Regente
  points += Math.floor(assessment.score.total / 2);

  // 3. Condição da Lua (A Lua transmite a influência)
  points += Math.floor(moonAssessment.score.total / 3);
  if (moonAssessment.condition.isCombust) points -= 10;
  
  // Mansão Lunar (Simplificado: algumas mansões são "más" para tudo)
  if ([9, 12, 21, 23].includes(moonMansion.number)) points -= 5;

  let score: ElectiveScore = 'neutral';
  if (points >= 7) score = 'propitious';
  else if (points < 0) score = 'challenging';

  return {
    score,
    purpose,
    planetHour,
    lunarMansion: moonMansion,
    moonStatus: {
      phase: getMoonPhaseName(moon.longitude, sun.longitude),
      voidOfCourseStatus: voc.isVoid ? 'void' : 'not_void',
      isVoidOfCourse: voc.isVoid,
      aspects: aspects
        .filter(a => a.p1 === 'moon' || a.p2 === 'moon')
        .map(a => {
          const other = a.p1 === 'moon' ? a.p2 : a.p1;
          const status = a.isApplying ? 'aplicativo' : 'separativo';
          return `${getPlanetNamePT(other)} (${status})`;
        }),
      nextMajorAspect: voc.nextAspect,
    },
    rulerCondition: {
      planetId: rulerId,
      totalScore: assessment.score.total,
      dignity: assessment.dignity,
    },
    planetConditions: ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'].reduce((acc, id) => {
      const p = targetPlanets.find(pl => pl.id?.toLowerCase() === id.toLowerCase());
      if (p) {
        const ass = calculateTraditionalAssessment(p, targetPlanets, isDayChart);
        acc[id] = {
          planetId: id,
          totalScore: ass.score.total,
          dignity: ass.dignity,
          sign: p.sign,
          degree: p.degree,
          house: p.house,
        };
      }
      return acc;
    }, {} as Record<string, {
      planetId: string;
      totalScore: number;
      dignity: string;
      sign: string;
      degree: number;
      house: number;
    }>),
    ritualCorrespondences: correspondences
      ? {
          colors: correspondences.colors,
          metals: correspondences.metals,
          incenses: correspondences.incense,
          charity: correspondences.charity,
          intentions: correspondences.intentions,
        }
      : undefined,
  };
}

function getMoonPhaseName(moonLon: number, sunLon: number): string {
  const diff = (moonLon - sunLon + 360) % 360;
  if (diff < 45) return 'Nova';
  if (diff < 90) return 'Crescente';
  if (diff < 135) return 'Quarto Crescente';
  if (diff < 180) return 'Gibosa Crescente';
  if (diff < 225) return 'Cheia';
  if (diff < 270) return 'Gibosa Minguante';
  if (diff < 315) return 'Quarto Minguante';
  return 'Balsâmica';
}
