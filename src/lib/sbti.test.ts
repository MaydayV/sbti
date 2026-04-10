import { describe, expect, it } from 'vitest';

import { specialQuestions } from '@/data/sbti-data';
import { computeResult, getVisibleQuestions } from './sbti';

describe('getVisibleQuestions', () => {
  it('inserts drink trigger only when drink_gate_q1 is option 3', () => {
    const base = [
      { id: 'q1', text: 'a', options: [] },
      { id: 'drink_gate_q1', text: 'gate', options: [] },
      { id: 'q2', text: 'b', options: [] },
    ];

    expect(getVisibleQuestions(base, {}).map((q) => q.id)).toEqual(['q1', 'drink_gate_q1', 'q2']);

    expect(getVisibleQuestions(base, { drink_gate_q1: 3 }, specialQuestions).map((q) => q.id)).toEqual([
      'q1',
      'drink_gate_q1',
      'drink_gate_q2',
      'q2',
    ]);
  });
});

describe('computeResult', () => {
  it('forces DRUNK when drink trigger answer is 2', () => {
    const answers: Record<string, number> = {};
    for (let i = 1; i <= 30; i += 1) answers[`q${i}`] = 2;
    answers.drink_gate_q2 = 2;

    const result = computeResult(answers);
    expect(result.finalType.code).toBe('DRUNK');
    expect(result.special).toBe(true);
    expect(result.modeKicker).toBe('隐藏人格已激活');
  });

  it('returns normal non-special type when drink trigger is absent', () => {
    const answers: Record<string, number> = {};
    for (let i = 1; i <= 30; i += 1) answers[`q${i}`] = 3;

    const result = computeResult(answers);
    expect(result.finalType.code).not.toBe('DRUNK');
    expect(result.special).toBe(false);
    expect(result.modeKicker).toBe('你的主类型');
    expect(result.badge).toContain('匹配度');
  });
});
