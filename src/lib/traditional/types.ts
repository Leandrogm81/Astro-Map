import type { PlanetKey } from './magic-correspondences';

export interface EssentialDignities {
  domicile: string;
  exaltation: string;
  detriment: string;
  fall: string;
  term?: string;
  face?: string;
  triplicity?: string;
}

export interface TraditionalScore {
  essential: number;
  accidental: number;
  total: number;
  breakdown: {
    essential: { [key: string]: number };
    accidental: { [key: string]: number };
  };
}

export interface TraditionalAssessment {
  planetId: string;
  sign: string;
  degree: number;
  house: number;
  isRetrograde: boolean;
  dignity: string;
  totalScore: number;
  sectStatus: string;
  dignities: EssentialDignities;
  condition: {
    isCombust: boolean;
    isUnderRays: boolean;
    isCazimi: boolean;
    isInMutualReception: string[];
    sectStatus: string;
    isHayz?: boolean;
  };
  score: TraditionalScore;
  technicalSummary: string;
  interpretations: {
    term: string;
    face: string;
  };
}

export interface TraditionalStatus {
  essentialDignities: 'ready' | 'partial' | 'none';
  sect: 'ready' | 'partial' | 'none';
  lots: 'ready' | 'partial' | 'none';
  almuten?: 'ready' | 'partial' | 'none';
  hyleg?: 'ready' | 'partial' | 'none';
  alcocoden?: 'ready' | 'partial' | 'none';
}

export type MagicPurpose =
  | 'authority' // Sol
  | 'emotion' // Lua
  | 'communication' // Mercúrio
  | 'love' // Vênus
  | 'conflict' // Marte
  | 'expansion' // Júpiter
  | 'structure'; // Saturno

export interface ElectiveRitualMaterials {
  colors?: string[];
  metals?: string[];
  incenses?: string[];
}

export interface ElectiveRitualRemedies {
  stones?: string[];
  plants?: string[];
  baths?: string[];
  disclaimer?: string;
}

export interface ElectiveRitualContext {
  purpose?: MagicPurpose;
  planetId?: string;
  planetKey?: PlanetKey;
  sephirah?: string;
  angel?: string;
  hourAngel?: string;
  olympicSpirit?: {
    name: string;
    description: string;
  };
  intelligence?: {
    name: string;
    description: string;
  };
  spirit?: {
    name: string;
    description: string;
  };
  orphicHymn?: {
    title: string;
    theme: string;
  };
  materials?: ElectiveRitualMaterials;
  remedies?: ElectiveRitualRemedies;
  charity?: string;
  intentions?: string[];
}

export interface ElectiveRemedyRecommendations {
  stones: string[];
  plants: string[];
  baths: string[];
  disclaimer: string;
}

export interface PlanetHour {
  planetId: string;
  isDaytime: boolean;
  hourNumber: number; // 1-12
  startTime: string;
  endTime: string;
}

export interface LunarMansion {
  number: number; // 1-28
  name: string;
  sign: string;
  degreeRange: string;
  summary: string;
}

export type ElectiveScore = 'propitious' | 'neutral' | 'challenging';

export interface ElectiveVeredict {
  score: ElectiveScore;
  rawScore?: number;
  normalizedScore?: number;
  purpose: MagicPurpose;
  planetHour: PlanetHour;
  lunarMansion: LunarMansion;
  moonStatus: {
    phase: string;
    voidOfCourseStatus: 'not_calculated' | 'void' | 'not_void';
    /** @deprecated Use voidOfCourseStatus */
    isVoidOfCourse?: boolean | null;
    aspects: string[];
    nextMajorAspect?: string;
  };
  rulerCondition: {
    planetId: string;
    totalScore: number;
    dignity: string;
  };
  planetConditions: Record<string, {
    planetId: string;
    totalScore: number;
    dignity: string;
    sign: string;
    degree: number;
    house: number;
  }>;
  ritualContext?: ElectiveRitualContext;
  ritualCorrespondences?: {
    colors?: string[];
    metals?: string[];
    incenses?: string[];
    charity?: string;
    intentions?: string[];
  };
  remedyRecommendations?: ElectiveRemedyRecommendations;
}

export type ElectiveMode = 'sky_only' | 'sky_plus_natal';
