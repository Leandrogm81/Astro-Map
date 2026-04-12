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
    sectStatus: 'benefic' | 'malefic' | 'neutral';
    isHayz?: boolean;
  };
  score: TraditionalScore;
  technicalSummary: string;
}

export interface TraditionalStatus {
  essentialDignities: 'ready' | 'partial' | 'none';
  sect: 'ready' | 'partial' | 'none';
  lots: 'ready' | 'partial' | 'none';
  almuten?: 'ready' | 'partial' | 'none';
  hyleg?: 'ready' | 'partial' | 'none';
  alcocoden?: 'ready' | 'partial' | 'none';
}
