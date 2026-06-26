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

  it('applies cellIs assumptions without polluting later searches', () => {
    const puzzle = oneGuestPuzzle();
    const assumed = findModel({ puzzle }, [{ kind: 'cellIs', cellId: 'A1', value: 'guest' }]);
    const unassumed = findModel({ puzzle });

    expect(guestCells(assumed.model)).toEqual(['A1']);
    expect(guestCells(unassumed.model)).toEqual(['B2']);
  });

  it('finds models constrained by Phase 24 count-scope rules', () => {
    const puzzle = phase24CountScopePuzzle();
    const result = findModel({ puzzle });

    expect(result.satisfiable).toBe(true);
    expect(guestCells(result.model)).toEqual(['B1']);
    expect(result.stats.truncated).toBe(false);
  });

  it('rejects complete assignments that violate comparative counts', () => {
    const puzzle = {
      ...phase24CountScopePuzzle(),
      rules: [
        globalCountRule('one-guest', 'guest', { op: 'eq', value: 1 }),
        {
          id: 'bottom-more-than-top',
          type: 'comparativeCount',
          left: { kind: 'region', regionId: 'bottom-row' },
          right: { kind: 'region', regionId: 'top-row' },
          target: 'guest',
          comparison: { op: 'gt' },
          presentation: { title: 'Bottom has more guests' },
        } satisfies RuleDefinition,
      ],
    } satisfies PuzzleDefinition;
    const result = isSatisfiable({
      puzzle,
      observations: [
        { cellId: 'B1', kind: 'guest' },
        { cellId: 'A1', kind: 'empty' },
        { cellId: 'A2', kind: 'empty' },
        { cellId: 'B2', kind: 'empty' },
      ],
    });

    expect(result.satisfiable).toBe(false);
    expect(result.stats.truncated).toBe(false);
  });

  it('applies cellIsNot assumptions', () => {
    const puzzle = oneGuestPuzzle();
    const result = findModel({ puzzle }, [{ kind: 'cellIsNot', cellId: 'B2', value: 'guest' }]);

    expect(result.satisfiable).toBe(true);
    expect(guestCells(result.model)).not.toEqual(['B2']);
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

function phase24CountScopePuzzle(): PuzzleDefinition {
  return makePuzzle({
    width: 2,
    height: 2,
    allowedKinds: ['empty', 'guest'],
    regions: [
      {
        id: 'top-row',
        title: 'Top row',
        cells: ['A1', 'B1'],
      },
      {
        id: 'bottom-row',
        title: 'Bottom row',
        cells: ['A2', 'B2'],
      },
    ],
    rules: [
      globalCountRule('one-guest', 'guest', { op: 'eq', value: 1 }),
      {
        id: 'top-right-overlap',
        type: 'scopeOverlapCount',
        left: { kind: 'region', regionId: 'top-row' },
        right: { kind: 'line', scope: { kind: 'column', index: 1 } },
        mode: 'intersection',
        target: 'guest',
        count: { op: 'eq', value: 1 },
        presentation: { title: 'Top right overlap' },
      },
      {
        id: 'top-more-than-bottom',
        type: 'comparativeCount',
        left: { kind: 'region', regionId: 'top-row' },
        right: { kind: 'region', regionId: 'bottom-row' },
        target: 'guest',
        comparison: { op: 'gt' },
        presentation: { title: 'Top has more guests' },
      },
      {
        id: 'if-top-one-bottom-zero',
        type: 'conditionalCount',
        condition: {
          scope: { kind: 'region', regionId: 'top-row' },
          target: 'guest',
          count: { op: 'eq', value: 1 },
        },
        then: {
          scope: { kind: 'region', regionId: 'bottom-row' },
          target: 'guest',
          count: { op: 'eq', value: 0 },
        },
        presentation: { title: 'If top has one guest then bottom has none' },
      },
    ],
  });
}

function makePuzzle(input: {
  readonly width: number;
  readonly height: number;
  readonly allowedKinds: readonly CellKind[];
  readonly regions?: PuzzleDefinition['regions'];
  readonly rules: readonly RuleDefinition[];
}): PuzzleDefinition {
  return {
    schemaVersion: 1,
    id: 'solver-search-test',
    title: 'Solver Search Test',
    board: { width: input.width, height: input.height },
    allowedKinds: input.allowedKinds,
    ...(input.regions === undefined ? {} : { regions: input.regions }),
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
