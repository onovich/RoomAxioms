import { enumerateModels } from '@room-axioms/oracle';
import { describe, expect, it } from 'vitest';
import type { CellKind, Comparator, Observation, PuzzleDefinition, RuleDefinition } from '@room-axioms/domain';

import { countGuestLayouts, findForcedCells, findPossibleRecordSets, isGuestLayoutUnique, isSatisfiable } from './queries.js';

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

describe('guest-layout uniqueness and counting', () => {
  it('treats safe-object differences as the same unique guest layout', () => {
    const puzzle = makePuzzle({
      width: 2,
      height: 2,
      allowedKinds: ['empty', 'bottle', 'guest'],
      rules: [globalCountRule('one-guest', 'guest', { op: 'eq', value: 1 })],
    });
    const input = {
      puzzle,
      observations: [{ cellId: 'A1', kind: 'guest' }],
    } as const;

    expect(isGuestLayoutUnique(input)).toMatchObject({
      unique: true,
      guestCells: ['A1'],
      stats: { truncated: false },
    });
    expect(countGuestLayouts(input, 10)).toMatchObject({
      count: 1,
      stats: { truncated: false },
    });
  });

  it('detects multiple guest layouts', () => {
    const input = { puzzle: oneGuestPuzzle() };

    expect(isGuestLayoutUnique(input)).toMatchObject({
      unique: false,
      guestCells: null,
      stats: { truncated: false },
    });
    expect(countGuestLayouts(input, 10)).toMatchObject({
      count: 4,
      stats: { truncated: false },
    });
  });

  it('reports guest-layout count caps with greaterThan instead of pretending exactness', () => {
    const result = countGuestLayouts({ puzzle: oneGuestPuzzle() }, 2);

    expect(result).toMatchObject({
      count: 2,
      greaterThan: 2,
      stats: { truncated: false },
    });
  });

  it('honors maxGuestLayouts as an additional count budget', () => {
    const result = countGuestLayouts({ puzzle: oneGuestPuzzle() }, 10, { maxGuestLayouts: 1 });

    expect(result).toMatchObject({
      count: 1,
      greaterThan: 1,
      stats: { truncated: false },
    });
  });

  it('marks layout queries truncated when node budget is exhausted', () => {
    const result = countGuestLayouts({ puzzle: oneGuestPuzzle() }, 10, { maxNodes: 1 });

    expect(result.count).toBe(0);
    expect(result.stats.truncated).toBe(true);
  });
});

describe('contaminated record-set queries', () => {
  it('enumerates possible false-record assignments against observations', () => {
    const puzzle = contaminatedOneOrTwoGuestPuzzle();
    const result = findPossibleRecordSets({
      puzzle,
      observations: [
        { cellId: 'A1', kind: 'guest' },
        { cellId: 'B1', kind: 'empty' },
        { cellId: 'A2', kind: 'empty' },
        { cellId: 'B2', kind: 'empty' },
      ],
    });

    expect(result.possibleAssignments.map((assignment) => assignment.falseRecordIds)).toEqual([
      ['card-two'],
    ]);
    expect(result.stats.truncated).toBe(false);
  });

  it('solves and counts layouts across possible false-record assignments', () => {
    const puzzle = contaminatedOneOrTwoGuestPuzzle();

    expect(isSatisfiable({ puzzle })).toMatchObject({
      satisfiable: true,
      stats: { truncated: false },
    });
    expect(countGuestLayouts({ puzzle }, 20)).toMatchObject({
      count: 10,
      stats: { truncated: false },
    });
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

function contaminatedOneOrTwoGuestPuzzle(): PuzzleDefinition {
  return makePuzzle({
    width: 2,
    height: 2,
    allowedKinds: ['empty', 'guest'],
    records: [
      { id: 'card-one', title: 'Card One', ruleIds: ['one-guest'] },
      { id: 'card-two', title: 'Card Two', ruleIds: ['two-guests'] },
    ],
    rules: [
      globalCountRule('one-guest', 'guest', { op: 'eq', value: 1 }),
      globalCountRule('two-guests', 'guest', { op: 'eq', value: 2 }),
      {
        id: 'one-card-false',
        type: 'recordSet',
        recordIds: ['card-one', 'card-two'],
        falseRecords: { op: 'eq', value: 1 },
        presentation: { title: 'One card is polluted' },
      },
    ],
  });
}

function makePuzzle(input: {
  readonly width: number;
  readonly height: number;
  readonly allowedKinds: readonly CellKind[];
  readonly records?: PuzzleDefinition['records'];
  readonly rules: readonly RuleDefinition[];
}): PuzzleDefinition {
  return {
    schemaVersion: 1,
    id: 'solver-forced-cells-test',
    title: 'Solver Forced Cells Test',
    board: { width: input.width, height: input.height },
    allowedKinds: input.allowedKinds,
    ...(input.records === undefined ? {} : { records: input.records }),
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
