import { describe, expect, it } from 'vitest';
import type { CellKind, Comparator, PuzzleDefinition, RuleDefinition } from '@room-axioms/domain';

import { containsKind, createInitialDomains, kindsInMask, singletonKind } from './bitset.js';
import { compileConstraints } from './constraints.js';
import {
  assignCellKind,
  checkpoint,
  createSolverState,
  createTrail,
  propagate,
  rollback,
} from './propagation.js';

describe('solver propagation and trail rollback', () => {
  it('propagates saturated global count upper bounds', () => {
    const puzzle = makePuzzle({
      width: 2,
      height: 2,
      allowedKinds: ['empty', 'guest'],
      rules: [globalCountRule('one-guest', 'guest', { op: 'eq', value: 1 })],
    });
    const state = createSolverState({ puzzle });
    const trail = createTrail();

    assignCellKind(state, trail, 'A1', 'guest');
    const result = propagate(state, compileConstraints(puzzle), trail);

    expect(result.ok).toBe(true);
    expect(singletonKind(state.domains.A1)).toBe('guest');
    expect(singletonKind(state.domains.B1)).toBe('empty');
    expect(singletonKind(state.domains.A2)).toBe('empty');
    expect(singletonKind(state.domains.B2)).toBe('empty');
  });

  it('propagates global count lower bounds by forcing all possible targets', () => {
    const puzzle = makePuzzle({
      width: 2,
      height: 2,
      allowedKinds: ['empty', 'guest'],
      rules: [globalCountRule('three-guests', 'guest', { op: 'gte', value: 3 })],
    });
    const state = createSolverState({ puzzle, observations: [{ cellId: 'A1', kind: 'empty' }] });
    const trail = createTrail();
    const result = propagate(state, compileConstraints(puzzle), trail);

    expect(result.ok).toBe(true);
    expect(singletonKind(state.domains.A1)).toBe('empty');
    expect(singletonKind(state.domains.B1)).toBe('guest');
    expect(singletonKind(state.domains.A2)).toBe('guest');
    expect(singletonKind(state.domains.B2)).toBe('guest');
  });

  it('propagates saturated region count upper bounds only inside the named region', () => {
    const puzzle = makePuzzle({
      width: 3,
      height: 3,
      allowedKinds: ['empty', 'guest'],
      regions: [
        {
          id: 'north-wing',
          title: 'North wing',
          cells: ['A1', 'B1', 'C1'],
        },
      ],
      rules: [regionCountRule('north-one-guest', 'north-wing', 'guest', { op: 'eq', value: 1 })],
    });
    const state = createSolverState({ puzzle });
    const trail = createTrail();

    assignCellKind(state, trail, 'A1', 'guest');
    const result = propagate(state, compileConstraints(puzzle), trail);

    expect(result.ok).toBe(true);
    expect(singletonKind(state.domains.B1)).toBe('empty');
    expect(singletonKind(state.domains.C1)).toBe('empty');
    expect(containsKind(state.domains.A2, 'guest')).toBe(true);
  });

  it('propagates saturated static line count upper bounds only inside the line', () => {
    const puzzle = makePuzzle({
      width: 3,
      height: 3,
      allowedKinds: ['empty', 'guest'],
      rules: [lineCountRule('row-one-guest', { kind: 'row', index: 0 }, 'guest', { op: 'eq', value: 1 })],
    });
    const state = createSolverState({ puzzle });
    const trail = createTrail();

    assignCellKind(state, trail, 'A1', 'guest');
    const result = propagate(state, compileConstraints(puzzle), trail);

    expect(result.ok).toBe(true);
    expect(singletonKind(state.domains.B1)).toBe('empty');
    expect(singletonKind(state.domains.C1)).toBe('empty');
    expect(containsKind(state.domains.A2, 'guest')).toBe(true);
  });

  it('propagates anchor target exclusion after the anchor subject is forced', () => {
    const puzzle = makePuzzle({
      width: 3,
      height: 3,
      allowedKinds: ['empty', 'bottle', 'guest'],
      anchors: [
        {
          id: 'known-bottle',
          title: 'Known bottle',
          subject: 'bottle',
        },
      ],
      rules: [anchorCountRule('bottle-no-guests', 'known-bottle', 'orthogonal', 'guest', { op: 'eq', value: 0 })],
    });
    const state = createSolverState({ puzzle });
    const trail = createTrail();

    assignCellKind(state, trail, 'B2', 'bottle');
    const result = propagate(state, compileConstraints(puzzle), trail);

    expect(result.ok).toBe(true);
    expect(containsKind(state.domains.B1, 'guest')).toBe(false);
    expect(containsKind(state.domains.A2, 'guest')).toBe(false);
    expect(containsKind(state.domains.C2, 'guest')).toBe(false);
    expect(containsKind(state.domains.B3, 'guest')).toBe(false);
  });

  it('propagates local target exclusion for active subjects', () => {
    const puzzle = makePuzzle({
      width: 2,
      height: 2,
      allowedKinds: ['empty', 'bottle', 'guest'],
      rules: [
        forEachCountRule('bottle-no-orthogonal-guests', 'bottle', 'orthogonal', 'guest', {
          op: 'eq',
          value: 0,
        }),
      ],
    });
    const state = createSolverState({ puzzle });
    const trail = createTrail();

    assignCellKind(state, trail, 'A1', 'bottle');
    const result = propagate(state, compileConstraints(puzzle), trail);

    expect(result.ok).toBe(true);
    expect(containsKind(state.domains.B1, 'guest')).toBe(false);
    expect(containsKind(state.domains.A2, 'guest')).toBe(false);
    expect(containsKind(state.domains.B2, 'guest')).toBe(true);
  });

  it('propagates local lower bounds for active subjects', () => {
    const puzzle = makePuzzle({
      width: 2,
      height: 2,
      allowedKinds: ['empty', 'bottle', 'guest'],
      rules: [
        forEachCountRule('corner-bottle-two-guests', 'bottle', 'orthogonal', 'guest', {
          op: 'eq',
          value: 2,
        }),
      ],
    });
    const state = createSolverState({ puzzle });
    const trail = createTrail();

    assignCellKind(state, trail, 'A1', 'bottle');
    const result = propagate(state, compileConstraints(puzzle), trail);

    expect(result.ok).toBe(true);
    expect(singletonKind(state.domains.B1)).toBe('guest');
    expect(singletonKind(state.domains.A2)).toBe('guest');
  });

  it('removes subject kinds when local target bounds make that subject impossible', () => {
    const puzzle = makePuzzle({
      width: 2,
      height: 2,
      allowedKinds: ['empty', 'bottle', 'guest'],
      rules: [
        forEachCountRule('bottle-needs-one-guest', 'bottle', 'orthogonal', 'guest', {
          op: 'eq',
          value: 1,
        }),
      ],
    });
    const state = createSolverState({
      puzzle,
      observations: [
        { cellId: 'B1', kind: 'empty' },
        { cellId: 'A2', kind: 'empty' },
      ],
    });
    const trail = createTrail();
    const result = propagate(state, compileConstraints(puzzle), trail);

    expect(result.ok).toBe(true);
    expect(containsKind(state.domains.A1, 'bottle')).toBe(false);
  });

  it('reports contradictions when count bounds are impossible', () => {
    const puzzle = makePuzzle({
      width: 2,
      height: 2,
      allowedKinds: ['empty', 'guest'],
      rules: [globalCountRule('one-guest', 'guest', { op: 'eq', value: 1 })],
    });
    const state = createSolverState({
      puzzle,
      observations: [
        { cellId: 'A1', kind: 'guest' },
        { cellId: 'B1', kind: 'guest' },
      ],
    });
    const trail = createTrail();
    const result = propagate(state, compileConstraints(puzzle), trail);

    expect(result.ok).toBe(false);
    expect(result.contradiction).toContain('one-guest');
  });

  it('rolls back domain mutations after an assumption branch', () => {
    const puzzle = makePuzzle({
      width: 2,
      height: 2,
      allowedKinds: ['empty', 'guest'],
      rules: [globalCountRule('one-guest', 'guest', { op: 'eq', value: 1 })],
    });
    const state = createSolverState({ puzzle });
    const trail = createTrail();
    const before = createInitialDomains(puzzle);
    const mark = checkpoint(trail);

    assignCellKind(state, trail, 'A1', 'guest');
    propagate(state, compileConstraints(puzzle), trail);
    rollback(state, trail, mark);

    expect(kindsInMask(state.domains.A1, puzzle.allowedKinds)).toEqual(kindsInMask(before.A1, puzzle.allowedKinds));
    expect(kindsInMask(state.domains.B1, puzzle.allowedKinds)).toEqual(kindsInMask(before.B1, puzzle.allowedKinds));
    expect(kindsInMask(state.domains.A2, puzzle.allowedKinds)).toEqual(kindsInMask(before.A2, puzzle.allowedKinds));
    expect(kindsInMask(state.domains.B2, puzzle.allowedKinds)).toEqual(kindsInMask(before.B2, puzzle.allowedKinds));
  });
});

function makePuzzle(input: {
  readonly width: number;
  readonly height: number;
  readonly allowedKinds: readonly CellKind[];
  readonly regions?: PuzzleDefinition['regions'];
  readonly anchors?: PuzzleDefinition['anchors'];
  readonly rules: readonly RuleDefinition[];
}): PuzzleDefinition {
  return {
    schemaVersion: 1,
    id: 'solver-propagation-test',
    title: 'Solver Propagation Test',
    board: { width: input.width, height: input.height },
    allowedKinds: input.allowedKinds,
    ...(input.regions === undefined ? {} : { regions: input.regions }),
    ...(input.anchors === undefined ? {} : { anchors: input.anchors }),
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

function regionCountRule(
  id: string,
  regionId: string,
  target: CellKind,
  count: Comparator,
): RuleDefinition {
  return {
    id,
    type: 'regionCount',
    regionId,
    target,
    count,
    presentation: { title: id },
  };
}

function lineCountRule(
  id: string,
  scope: Extract<RuleDefinition, { readonly type: 'lineCount' }>['scope'],
  target: CellKind,
  count: Comparator,
  origin?: string,
): RuleDefinition {
  return {
    id,
    type: 'lineCount',
    ...(origin === undefined ? {} : { origin }),
    scope,
    target,
    count,
    presentation: { title: id },
  };
}

function anchorCountRule(
  id: string,
  anchorId: string,
  scope: 'adjacent' | 'orthogonal',
  target: CellKind,
  count: Comparator,
): RuleDefinition {
  return {
    id,
    type: 'anchorCount',
    anchorId,
    scope: { kind: scope },
    target,
    count,
    presentation: { title: id },
  };
}

function forEachCountRule(
  id: string,
  subject: CellKind,
  scope: 'adjacent' | 'orthogonal',
  target: CellKind,
  count: Comparator,
): RuleDefinition {
  return {
    id,
    type: 'forEachCount',
    subject,
    scope: { kind: scope },
    target,
    count,
    presentation: { title: id },
  };
}
