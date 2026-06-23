import { enumerateModels } from '@room-axioms/oracle';
import { describe, expect, it } from 'vitest';
import type { CellKind, Comparator, PuzzleDefinition, RuleDefinition } from '@room-axioms/domain';

import { findModel, isSatisfiable } from './index.js';
import type { SolverModel } from './types.js';

describe('solver search and model finding', () => {
  it('finds a stable first model for a satisfiable tiny puzzle', () => {
    const puzzle = oneGuestPuzzle();
    const result = findModel({ puzzle });

    expect(result.satisfiable).toBe(true);
    expect(guestCells(result.model)).toEqual(['B2']);
    expect(result.stats.nodeCount).toBeGreaterThan(0);
    expect(result.stats.propagationCount).toBeGreaterThan(0);
    expect(result.stats.truncated).toBe(false);
  });

  it('reports unsatisfiable puzzles without truncation when search completes', () => {
    const puzzle = makePuzzle({
      width: 2,
      height: 2,
      allowedKinds: ['empty', 'guest'],
      rules: [globalCountRule('five-guests', 'guest', { op: 'eq', value: 5 })],
    });
    const result = isSatisfiable({ puzzle });

    expect(result).toMatchObject({
      satisfiable: false,
      model: null,
      stats: {
        truncated: false,
      },
    });
  });

  it('marks satisfiability search truncated when node budget is exhausted', () => {
    const result = findModel({ puzzle: oneGuestPuzzle() }, [], { maxNodes: 1 });

    expect(result.satisfiable).toBe(false);
    expect(result.model).toBeNull();
    expect(result.stats.nodeCount).toBe(1);
    expect(result.stats.truncated).toBe(true);
  });

  it('uses objective observations as constraints', () => {
    const puzzle = oneGuestPuzzle();
    const result = findModel({
      puzzle,
      observations: [{ cellId: 'A1', kind: 'guest' }],
    });

    expect(result.satisfiable).toBe(true);
    expect(guestCells(result.model)).toEqual(['A1']);
  });

  it('matches oracle existence and first-model ordering on small fixtures', () => {
    const puzzle = oneGuestPuzzle();
    const solverResult = findModel({ puzzle });
    const oracleResult = enumerateModels(puzzle);

    expect(solverResult.satisfiable).toBe(oracleResult.satisfiable);
    expect(guestCells(solverResult.model)).toEqual(guestCells(oracleResult.models[0] ?? null));
  });

  it('rejects non-empty assumptions until the assumption round implements them', () => {
    expect(() =>
      findModel(
        { puzzle: oneGuestPuzzle() },
        [{ kind: 'cellIs', cellId: 'A1', value: 'guest' }],
      ),
    ).toThrow(/Round 5/);
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
    id: 'solver-search-test',
    title: 'Solver Search Test',
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

function guestCells(model: SolverModel | null): readonly string[] {
  if (model === null) return [];

  return Object.entries(model.cells)
    .filter(([, kind]) => kind === 'guest')
    .map(([cellId]) => cellId);
}
