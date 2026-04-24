export enum SkillLevel {
  Newbie = 'Newbie',
  Intermediate = 'Intermediate'
}

export enum Medium {
  Acrylic = 'Acrylic',
  Pastels = 'Pastels',
  OilPastels = 'Oil Pastels',
  Watercolor = 'Watercolor',
  Oil = 'Oil'
}

export enum Subject {
  SingleObjects = 'Single Objects',
  HumanAnatomy = 'Human Anatomy',
  Animals = 'Animals',
  Plants = 'Plants'
}

export interface Challenge {
  title: string;
  description: string;
  focusAreas: string[];
  tips: string[];
}

export interface Evaluation {
  proportions: string;
  composition: string;
  colorTheory: string;
  volume: string;
  lightingShadow: string;
  overallEncouragement: string;
  meetsChallenge: boolean;
}

export interface UserPreferences {
  level: SkillLevel | null;
  medium: Medium | null;
  subject: Subject | null;
}

export type AppState = 'setup' | 'assessment' | 'challenge' | 'upload' | 'evaluation';
