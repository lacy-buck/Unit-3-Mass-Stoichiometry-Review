import { ParticleKind, SetId } from '../data/reviewSets';

export interface Q1UserState {
  flaggedIds: string[];
  coeffs: [string, string, string, string];
  step1Num: string;
  step1Den: string;
  step2Num: string;
  step2Den: string;
  step3Num: string;
  step3Den: string;
  finalMass: string;
  submitted: boolean;
}

export interface Q2UserState {
  prediction: 'more' | 'less' | 'same' | '';
  moleRatioRelation: 'more_moles' | 'fewer_moles' | 'equal_moles' | '';
  molarMassRelation: 'greater_mm' | 'smaller_mm' | 'equal_mm' | '';
  explanationChoice?: number;
  submitted: boolean;
}

export interface Q3UserState {
  answers: Record<string, number>;
  submitted: boolean;
}

export interface Q4UserState {
  flaggedZoneIds: string[];
  builtCounts: Partial<Record<ParticleKind, number>>;
  limitingReactant: string;
  productCount: string;
  explanationChoice?: number;
  submitted: boolean;
}

export interface Q5UserState {
  molesR1: string;
  molesR2: string;
  limiting: string;
  partAChoice?: number;
  maxProductMoles: string;
  excessMolesRemaining: string;
  submitted: boolean;
}

export interface ReflectionState {
  studentName: string;
  commonMistake: string;
  strongestTakeaway: string;
  testDayStrategy: string;
  submitted: boolean;
}

export interface SetUserProgress {
  q1: Q1UserState;
  q2: Q2UserState;
  q3: Q3UserState;
  q4: Q4UserState;
  q5: Q5UserState;
}

export type AllSetsProgress = Record<SetId, SetUserProgress>;

export function createEmptySetProgress(): SetUserProgress {
  return {
    q1: {
      flaggedIds: [],
      coeffs: ['', '', '', ''],
      step1Num: '',
      step1Den: '',
      step2Num: '',
      step2Den: '',
      step3Num: '',
      step3Den: '',
      finalMass: '',
      submitted: false,
    },
    q2: {
      prediction: '',
      moleRatioRelation: '',
      molarMassRelation: '',
      explanationChoice: undefined,
      submitted: false,
    },
    q3: {
      answers: {},
      submitted: false,
    },
    q4: {
      flaggedZoneIds: [],
      builtCounts: {},
      limitingReactant: '',
      productCount: '',
      explanationChoice: undefined,
      submitted: false,
    },
    q5: {
      molesR1: '',
      molesR2: '',
      limiting: '',
      partAChoice: undefined,
      maxProductMoles: '',
      excessMolesRemaining: '',
      submitted: false,
    },
  };
}

export type SectionKey = 'q1' | 'q2' | 'q3' | 'q4' | 'q5';

export interface EngagementLog {
  startedAtIso: string;
  timeSpentSec: Record<SectionKey | 'reflection', number>;
  attempts: Record<SectionKey, number>;
}

export function createEmptyReflection(): ReflectionState {
  return {
    studentName: '',
    commonMistake: '',
    strongestTakeaway: '',
    testDayStrategy: '',
    submitted: false,
  };
}

export function createEmptyEngagementLog(): EngagementLog {
  return {
    startedAtIso: new Date().toISOString(),
    timeSpentSec: {
      q1: 0,
      q2: 0,
      q3: 0,
      q4: 0,
      q5: 0,
      reflection: 0,
    },
    attempts: {
      q1: 0,
      q2: 0,
      q3: 0,
      q4: 0,
      q5: 0,
    },
  };
}
