import { describe, expect, it } from 'vitest';
import { assertPuzzleDefinition } from '@room-axioms/schema';
import case004Fixture from '../../../content/cases/case-004.json' with { type: 'json' };

import { evaluateRule, targetSatisfiesRules } from './index.js';

describe('case-004 oracle regression', () => {
  it('parses the canonical fixture through schema and checks only target rule satisfaction', () => {
    const puzzle = assertPuzzleDefinition(case004Fixture);
    const model = { cells: puzzle.target };
    const ruleEvaluations = puzzle.rules.map((rule) => evaluateRule(rule, puzzle, model));

    expect(puzzle.id).toBe('case-004');
    expect(targetSatisfiesRules(puzzle)).toBe(true);
    expect(ruleEvaluations.map((evaluation) => evaluation.satisfied)).toEqual([
      true,
      true,
      true,
      true,
      true,
      true,
    ]);
  });
});
