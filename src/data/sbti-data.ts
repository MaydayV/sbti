import type {
  DimensionExplanations,
  DimensionMeta,
  Question,
  TypeEntry,
} from '@/types/sbti';

import rawDump from '../../sbti_dump.json';
import computeData from './sbti-compute.json';

type DumpShape = {
  questions: Question[];
  specialQuestions: Question[];
  resultTypes: Record<string, TypeEntry>;
  resultImages: Record<string, string>;
  dimensionMeta: DimensionMeta;
  dimensionExplanations: DimensionExplanations;
};

type ComputeShape = {
  normalTypes: Array<{ code: string; pattern: string }>;
  dimensionOrder: string[];
  resultPageCopy: {
    defaultModeKicker: string;
    defaultSub: string;
    drunkModeKicker: string;
    drunkBadge: string;
    drunkSub: string;
    fallbackModeKicker: string;
    fallbackSub: string;
    matchBadgeTemplate: string;
    funNoteNormal: string;
    funNoteSpecial: string;
  };
};

const dump = rawDump as DumpShape;
const compute = computeData as ComputeShape;

export const questions = dump.questions;
export const specialQuestions = dump.specialQuestions;
export const TYPE_LIBRARY = dump.resultTypes;

export const TYPE_IMAGES = Object.entries(dump.resultImages).reduce<Record<string, string>>(
  (acc, [code, relative]) => {
    const fileName = relative.replace('./image/', '');
    if (code === 'WOC!') {
      acc[code] = '/images/results/WOC_.png';
      return acc;
    }
    acc[code] = `/images/results/${fileName}`;
    return acc;
  },
  {},
);

export const dimensionMeta = dump.dimensionMeta;
export const DIM_EXPLANATIONS = dump.dimensionExplanations;
export const NORMAL_TYPES = compute.normalTypes;
export const dimensionOrder = compute.dimensionOrder;
export const RESULT_COPY = compute.resultPageCopy;

export const DRUNK_TRIGGER_QUESTION_ID = 'drink_gate_q2';
