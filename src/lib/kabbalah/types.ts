import type { NatalChart, PlanetPosition, ZodiacSign } from '@/types';

export type SephirahName =
  | 'Kether'
  | 'Chokmah'
  | 'Binah'
  | 'Daath'
  | 'Chesed'
  | 'Geburah'
  | 'Tiphereth'
  | 'Netzach'
  | 'Hod'
  | 'Yesod'
  | 'Malkuth';

export type PillarName = 'Misericórdia' | 'Severidade' | 'Equilíbrio';

export interface SephirahDefinition {
  readonly name: SephirahName;
  readonly number: number;
  readonly hebrew: string;
  readonly transliteration: string;
  readonly meaning: string;
  readonly planetId: string;
  readonly pillar: PillarName;
  readonly color: string;
  readonly description: {
    readonly pt: string;
    readonly he: string;
  };
}

export interface Angel72 {
  readonly number: number;
  readonly name: string;
  readonly hebrew: string;
  readonly sign: ZodiacSign;
  readonly degreesStart: number;
  readonly degreesEnd: number;
  readonly virtues: string;
  readonly psalm: string;
}

export type GematriaSystem = 'standard' | 'ordinal' | 'misparKatan' | 'latin';

export interface LetterBreakdown {
  readonly letter: string;
  readonly value: number;
}

export interface GematriaResult {
  readonly inputText: string;
  readonly hebrewText: string;
  readonly system: GematriaSystem;
  readonly totalValue: number;
  readonly reducedValue: number;
  readonly sephirah: SephirahName;
  readonly breakdown: readonly LetterBreakdown[];
}

export interface SephirothPlanetMapping {
  readonly sephirah: SephirahDefinition;
  readonly planetName: string;
  readonly planetSymbol: string;
  readonly longitude: number;
  readonly sign: ZodiacSign;
  readonly degree: number;
  readonly house: number;
  readonly retrograde: boolean;
  readonly angel: Angel72;
}

export interface MalkuthMapping {
  readonly sephirah: SephirahDefinition;
  readonly longitude: number;
  readonly sign: ZodiacSign;
  readonly degree: number;
  readonly house: 1;
  readonly angel: Angel72;
}

export type SephirothMapping = SephirothPlanetMapping | MalkuthMapping;

export interface TranslateRequest {
  readonly text: string;
  readonly targetLang: string;
}

export interface TranslateResponse {
  readonly translatedText: string;
  readonly detectedSourceLang?: string;
}

export type NatalChartLike = NatalChart;
export type PlanetPositionLike = PlanetPosition;
