import { describe, expect, it } from 'vitest';
import type { CellKind, Comparator, PuzzleDefinition, RuleDefinition } from '@room-axioms/domain';

import { targetSatisfiesRules, verifyPuzzleWithOracle } from './verification.js';
import type { CellAssignment } from './types.js';

const metadata: PuzzleDefinition['metadata'] = {
  difficulty: 1,
  tags: ['oracle-test'],
  status: 'draft',
};

describe('oracle verification harness', () => {
  it('accepts a hand-calculated 2x2 fixture with satisfiable initial observations', () => {
    const puzzle = makePuzzle({
      id: 'one-guest-2x2',
      allowedKinds: ['empty', 'guest'],
      rules: [globalCountRule('one-guest', 'guest', { op: 'eq', value: 1 })],
      initialReveals: ['B2'],
      target: makeAssignment([
        ['empty', 'empty'],
        ['empty', 'guest'],
      ]),
    });

    const report = verifyPuzzleWithOracle(puzzle);
    const initialNodeCount = report.metrics.initialNodeCount;

    expect(targetSatisfiesRules(puzzle)).toBe(true);
    expect(report).toMatchObject({
      targetSatisfiesRules: true,
      initialSatisfiable: true,
      issues: [],
      metrics: {
        targetSatisfiesRules: true,
        initialSatisfiable: true,
        initialModelCount: 1,
        initialTruncated: false,
      },
    });
    if (typeof initialNodeCount !== 'number') {
      throw new Error('Expected initialNodeCount to be numeric');
    }
    expect(initialNodeCount).toBeGreaterThan(0);
  });

  it('reports an unsatisfiable 2x2 fixture', () => {
    const puzzle = makePuzzle({
      id: 'impossible-five-guests-2x2',
      allowedKinds: ['empty', 'guest'],
      rules: [globalCountRule('five-guests', 'guest', { op: 'eq', value: 5 })],
      initialReveals: [],
      target: makeAssignment([
        ['empty', 'empty'],
        ['empty', 'empty'],
      ]),
    });

    expect(verifyPuzzleWithOracle(puzzle)).toMatchObject({
      targetSatisfiesRules: false,
      initialSatisfiable: false,
      issues: [
        'Target assignment does not satisfy all rules.',
        'Initial observations are unsatisfiable.',
      ],
    });
  });

  it('reports target assignments that violate rules while initial observations remain satisfiable', () => {
    const puzzle = makePuzzle({
      id: 'target-has-two-guests-2x2',
      allowedKinds: ['empty', 'guest'],
      rules: [globalCountRule('one-guest', 'guest', { op: 'eq', value: 1 })],
      initialReveals: [],
      target: makeAssignment([
        ['guest', 'guest'],
        ['empty', 'empty'],
      ]),
    });

    expect(verifyPuzzleWithOracle(puzzle)).toMatchObject({
      targetSatisfiesRules: false,
      initialSatisfiable: true,
      issues: ['Target assignment does not satisfy all rules.'],
      metrics: {
        initialModelCount: 4,
        initialTruncated: false,
      },
    });
  });

  it('surfaces truncated model-space metrics', () => {
    const puzzle = makePuzzle({
      id: 'capped-one-guest-2x2',
      allowedKinds: ['empty', 'guest'],
      rules: [globalCountRule('one-guest', 'guest', { op: 'eq', value: 1 })],
      initialReveals: [],
      target: makeAssignment([
        ['empty', 'empty'],
        ['empty', 'guest'],
      ]),
    });

    expect(verifyPuzzleWithOracle(puzzle, { maxModels: 1 })).toMatchObject({
      targetSatisfiesRules: true,
      initialSatisfiable: true,
      issues: ['Initial observation search was truncated by oracle limits.'],
      metrics: {
        initialModelCount: 2,
        initialTruncated: true,
      },
    });
  });
});

function makePuzzle(input: {
  readonly id: string;
  readonly allowedKinds: readonly CellKind[];
  readonly rules: readonly RuleDefinition[];
  readonly initialReveals: readonly string[];
  readonly target: CellAssignment;
}): PuzzleDefinition {
  return {
    schemaVersion: 1,
    id: input.id,
    title: input.id,
    board: { width: 2, height: 2 },
    allowedKinds: input.allowedKinds,
    rules: input.rules,
    initialReveals: input.initialReveals,
    target: input.target,
    metadata,
  };
}

function makeAssignment(rows: readonly (readonly CellKind[])[]): CellAssignment {
  const cells: Record<string, CellKind> = {};

  rows.forEach((row, y) => {
    row.forEach((kind, x) => {
      cells[`${String.fromCharCode(65 + x)}${y + 1}`] = kind;
    });
  });

  return cells;
}

function globalCountRule(id: string, target: CellKind, count: Comparator): RuleDefinition {
  return {
    id,
    type: 'globalCount',
    target,
    count,
    presentation: { title: id },
  };
}
