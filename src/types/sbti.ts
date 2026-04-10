export type ScoreLevel = 'L' | 'M' | 'H';

export type QuestionOption = {
  label: string;
  value: number;
};

export type Question = {
  id: string;
  dim?: string;
  text: string;
  options: QuestionOption[];
  special?: boolean;
  kind?: 'drink_gate' | 'drink_trigger' | string;
};

export type TypeEntry = {
  code: string;
  cn: string;
  intro: string;
  desc: string;
};

export type DimensionMeta = Record<string, { name: string; model: string }>;
export type DimensionExplanations = Record<string, Record<ScoreLevel, string>>;

export type AnswerMap = Record<string, number>;

export type RankedType = TypeEntry & {
  pattern: string;
  distance: number;
  exact: number;
  similarity: number;
};

export type ComputeResultOutput = {
  rawScores: Record<string, number>;
  levels: Record<string, ScoreLevel>;
  ranked: RankedType[];
  bestNormal: RankedType;
  finalType: TypeEntry;
  modeKicker: string;
  badge: string;
  sub: string;
  special: boolean;
  secondaryType: RankedType | null;
};
