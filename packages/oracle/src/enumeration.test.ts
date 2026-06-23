import { describe, expect, it } from 'vitest';
import type { CellKind, Comparator, PuzzleDefinition, RuleDefinition } from '@room-axioms/domain';

import { enumerateModels } from './enumeration.js';
import type { CellAssignment } from './types.js';

const metadata: PuzzleDefinition['metadata'] = {
  difficulty: 1,
  tags: ['oracle-test'],
  status: 'draft',
};

describe('brute-force model enumeration', () => {
  it('enumerates multiple satisfying models in stable cell and kind order', () => {
    const result = enumerateModels(oneGuestPuzzle());

    expect(result.satisfiable).toBe(true);
    expect(result.modelCount).toBe(4);
    expect(result.truncated).toBe(false);
    expect(result.models.map((model) => guestCells(model.cells))).toEqual([
      ['B2'],
      ['A2'],
      ['B1'],
      ['A1'],
    ]);
  });

  it('reports unsatisfiable puzzles', () => {
    const result = enumerateModels(
      makePuzzle({
        width: 2,
        height: 2,
        allowedKinds: ['empty', 'guest'],
        rules: [globalCountRule('five-guests', 'guest', { op: 'eq', value: 5 })],
      }),
    );

    expect(result.satisfiable).toBe(false);
    expect(result.modelCount).toBe(0);
    expect(result.models).toEqual([]);
    expect(result.truncated).toBe(false);
  });

  it('narrows search with observation facts', () => {
    const result = enumerateModels(oneGuestPuzzle(), [{ cellId: 'A1', kind: 'guest' }]);

    expect(result.satisfiable).toBe(true);
    expect(result.modelCount).toBe(1);
    expect(result.models.map((model) => guestCells(model.cells))).toEqual([['A1']]);
  });

  it('rejects contradictory or out-of-domain observation facts without searching', () => {
    const puzzle = oneGuestPuzzle();

    expect(
      enumerateModels(puzzle, [
        { cellId: 'A1', kind: 'guest' },
        { cellId: 'A1', kind: 'empty' },
      ]),
    ).toEqual({
      satisfiable: false,
      models: [],
      modelCount: 0,
      nodeCount: 0,
      truncated: false,
    });

    expect(enumerateModels(puzzle, [{ cellId: 'C1', kind: 'guest' }]).nodeCount).toBe(0);
    expect(enumerateModels(puzzle, [{ cellId: 'A1', kind: 'mirror' }]).nodeCount).toBe(0);
  });

  it('caps retained models while marking truncated after another model is found', () => {
    const result = enumerateModels(oneGuestPuzzle(), [], { maxModels: 1 });

    expect(result.satisfiable).toBe(true);
    expect(result.models.map((model) => guestCells(model.cells))).toEqual([['B2']]);
    expect(result.modelCount).toBe(2);
    expect(result.truncated).toBe(true);
  });

  it('caps visited assignment nodes', () => {
    const result = enumerateModels(oneGuestPuzzle(), [], { maxNodes: 1 });

    expect(result.satisfiable).toBe(false);
    expect(result.models).toEqual([]);
    expect(result.modelCount).toBe(0);
    expect(result.nodeCount).toBe(1);
    expect(result.truncated).toBe(true);
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
    id: 'oracle-enumeration-test',
    title: 'Oracle Enumeration Test',
    board: { width: input.width, height: input.height },
    allowedKinds: input.allowedKinds,
    rules: input.rules,
    initialReveals: [],
    target: makeEmptyTarget(input.width, input.height),
    metadata,
  };
}

function makeEmptyTarget(width: number, height: number): CellAssignment {
  const cells: Record<string, CellKind> = {};

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      cells[`${String.fromCharCode(65 + x)}${y + 1}`] = 'empty';
    }
  }

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

function guestCells(cells: CellAssignment): readonly string[] {
  return Object.entries(cells)
    .filter(([, kind]) => kind === 'guest')
    .map(([cellId]) => cellId);
}
