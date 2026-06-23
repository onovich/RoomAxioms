import { enumerateModels } from '@room-axioms/oracle';
import { describe, expect, it } from 'vitest';
import type { CellKind, Comparator, Observation, PuzzleDefinition, RuleDefinition } from '@room-axioms/domain';

import { findForcedCells } from './queries.js';

describe('forced-cell queries', () => {
  it('finds forced safe cells when a guest is already observed', () => {
    const puzzle = oneGuestPuzzle();
    const result = findForcedCells({
      puzzle,
      observations: [{ cellId: 'A1', kind: 'guest' }],
    });

    expect(result.safe).toEqual(['B1', 'A2', 'B2']);
    expect(result.guests).toEqual([]);
    expect(result.stats.truncated).toBe(false);
  });

  it('finds forced guests when all other cells are observed safe', () => {
    const puzzle = oneGuestPuzzle();
    const result = findForcedCells({
      puzzle,
      observations: [
        { cellId: 'A1', kind: 'empty' },
        { cellId: 'B1', kind: 'empty' },
        { cellId: 'A2', kind: 'empty' },
      ],
    });

    expect(result.safe).toEqual([]);
    expect(result.guests).toEqual(['B2']);
    expect(result.stats.truncated).toBe(false);
  });

  it('returns no forced cells when every unobserved cell can still be guest or safe', () => {
    const result = findForcedCells({ puzzle: oneGuestPuzzle() });

    expect(result.safe).toEqual([]);
    expect(result.guests).toEqual([]);
  });

  it('does not claim forced cells from truncated assumption queries', () => {
    const result = findForcedCells({ puzzle: oneGuestPuzzle() }, { maxNodes: 1 });

    expect(result.safe).toEqual([]);
    expect(result.guests).toEqual([]);
    expect(result.stats.truncated).toBe(true);
  });

  it('matches oracle forced conclusions on a small observation-constrained fixture', () => {
    const puzzle = oneGuestPuzzle();
    const observations = [{ cellId: 'A1', kind: 'guest' }] as const satisfies readonly Observation[];
    const solver = findForcedCells({ puzzle, observations });
    const oracle = enumerateModels(puzzle, observations);
    const oracleGuestSets = oracle.models.map((model) =>
      Object.entries(model.cells)
        .filter(([, kind]) => kind === 'guest')
        .map(([cellId]) => cellId),
    );

    expect(oracleGuestSets).toEqual([['A1']]);
    expect(solver.safe).toEqual(['B1', 'A2', 'B2']);
    expect(solver.guests).toEqual([]);
  });
});

function oneGuestPuzzle(): PuzzleDefinition {
  return makePuzzle({
    width: 2,
    height: 2,
    allowedKinds: ['empty', 'guest'],
    rules: [globalCountRule('one-guest', 'guest', { op: 'eq', value: 1 })],
  });
}

function makePuzzle(input: {
  readonly width: number;
  readonly height: number;
  readonly allowedKinds: readonly CellKind[];
  readonly rules: readonly RuleDefinition[];
}): PuzzleDefinition {
  return {
    schemaVersion: 1,
    id: 'solver-forced-cells-test',
    title: 'Solver Forced Cells Test',
    board: { width: input.width, height: input.height },
    allowedKinds: input.allowedKinds,
    rules: input.rules,
    initialReveals: [],
    target: {},
    metadata: {
      difficulty: 1,
      tags: ['solver-test'],
      status: 'draft',
    },
  };
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
