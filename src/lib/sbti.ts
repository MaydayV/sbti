import {
  DIM_EXPLANATIONS,
  DRUNK_TRIGGER_QUESTION_ID,
  NORMAL_TYPES,
  RESULT_COPY,
  TYPE_LIBRARY,
  dimensionMeta,
  dimensionOrder,
  questions,
  specialQuestions,
} from '@/data/sbti-data';
import type {
  AnswerMap,
  ComputeResultOutput,
  Question,
  RankedType,
  ScoreLevel,
  TypeEntry,
} from '@/types/sbti';

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getVisibleQuestions(
  shuffledQuestions: Question[],
  answers: AnswerMap,
  specials: Question[] = specialQuestions,
): Question[] {
  const visible = [...shuffledQuestions];
  const gateIndex = visible.findIndex((q) => q.id === 'drink_gate_q1');
  if (gateIndex !== -1 && answers.drink_gate_q1 === 3) {
    visible.splice(gateIndex + 1, 0, specials[1]);
  }
  return visible;
}

export function getQuestionMetaLabel(q: Question, previewMode: boolean): string {
  if (q.special) return '补充题';
  if (!q.dim) return '维度已隐藏';
  return previewMode ? dimensionMeta[q.dim]?.name ?? '补充题' : '维度已隐藏';
}

function sumToLevel(score: number): ScoreLevel {
  if (score <= 3) return 'L';
  if (score === 4) return 'M';
  return 'H';
}

function levelNum(level: ScoreLevel): number {
  return { L: 1, M: 2, H: 3 }[level];
}

function parsePattern(pattern: string): ScoreLevel[] {
  return pattern.replaceAll('-', '').split('') as ScoreLevel[];
}

function getDrunkTriggered(answers: AnswerMap): boolean {
  return answers[DRUNK_TRIGGER_QUESTION_ID] === 2;
}

export function computeResult(answers: AnswerMap): ComputeResultOutput {
  const rawScores: Record<string, number> = {};
  const levels: Record<string, ScoreLevel> = {};

  Object.keys(dimensionMeta).forEach((dim) => {
    rawScores[dim] = 0;
  });

  questions.forEach((q) => {
    if (q.dim) {
      rawScores[q.dim] += Number(answers[q.id] || 0);
    }
  });

  Object.entries(rawScores).forEach(([dim, score]) => {
    levels[dim] = sumToLevel(score);
  });

  const userVector = dimensionOrder.map((dim) => levelNum(levels[dim]));

  const ranked: RankedType[] = NORMAL_TYPES.map((type) => {
    const vector = parsePattern(type.pattern).map(levelNum);
    let distance = 0;
    let exact = 0;
    for (let i = 0; i < vector.length; i += 1) {
      const diff = Math.abs(userVector[i] - vector[i]);
      distance += diff;
      if (diff === 0) exact += 1;
    }
    const similarity = Math.max(0, Math.round((1 - distance / 30) * 100));
    return {
      ...type,
      ...TYPE_LIBRARY[type.code],
      distance,
      exact,
      similarity,
    };
  }).sort((a, b) => {
    if (a.distance !== b.distance) return a.distance - b.distance;
    if (b.exact !== a.exact) return b.exact - a.exact;
    return b.similarity - a.similarity;
  });

  const bestNormal = ranked[0];
  const drunkTriggered = getDrunkTriggered(answers);

  let finalType: TypeEntry = bestNormal;
  let modeKicker = RESULT_COPY.defaultModeKicker;
  let badge = `匹配度 ${bestNormal.similarity}% · 精准命中 ${bestNormal.exact}/15 维`;
  let sub = RESULT_COPY.defaultSub;
  let special = false;
  let secondaryType: RankedType | null = null;

  if (drunkTriggered) {
    finalType = TYPE_LIBRARY.DRUNK;
    secondaryType = bestNormal;
    modeKicker = RESULT_COPY.drunkModeKicker;
    badge = RESULT_COPY.drunkBadge;
    sub = RESULT_COPY.drunkSub;
    special = true;
  } else if (bestNormal.similarity < 60) {
    finalType = TYPE_LIBRARY.HHHH;
    modeKicker = RESULT_COPY.fallbackModeKicker;
    badge = `标准人格库最高匹配仅 ${bestNormal.similarity}%`;
    sub = RESULT_COPY.fallbackSub;
    special = true;
  }

  return {
    rawScores,
    levels,
    ranked,
    bestNormal,
    finalType,
    modeKicker,
    badge,
    sub,
    special,
    secondaryType,
  };
}

export function buildDimensionSummary(result: ComputeResultOutput) {
  return dimensionOrder.map((dim) => {
    const level = result.levels[dim];
    return {
      dim,
      name: dimensionMeta[dim].name,
      score: result.rawScores[dim],
      level,
      explanation: DIM_EXPLANATIONS[dim][level],
    };
  });
}
