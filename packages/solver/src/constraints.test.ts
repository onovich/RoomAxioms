import { describe, expect, it } from 'vitest';
import type { CellKind, Comparator, PuzzleDefinition, RuleDefinition } from '@room-axioms/domain';

import { createInitialDomains, removeKind, setCellDomain, singletonMask } from './bitset.js';
import {
  compileConstraints,
  comparatorCanBeSatisfied,
  evaluateConstraintBounds,
} from './constraints.js';

describe('constraint compilation and count bounds', () => {
  it('computes global count bounds from cell domains', () => {
    const puzzle = makePuzzle({
      width: 2,
      height: 2,
      allowedKinds: ['empty', 'guest'],
      rules: [globalCountRule('one-to-three-guests', 'guest', { op: 'gte', value: 1 })],
    });
    const initial = createInitialDomains(puzzle);
    const withoutGuestAtB1 = setCellDomain(initial, 'B1', removeKind(initial.B1, 'guest'));
    const domains = setCellDomain(withoutGuestAtB1, 'A1', singletonMask('guest'));
    const [constraint] = compileConstraints(puzzle);
    const bounds = evaluateConstraintBounds(constraint, domains);

    expect(bounds).toEqual({
      kind: 'globalCount',
      ruleId: 'one-to-three-guests',
      bounds: { minimum: 1, maximum: 3 },
      possible: true,
    });
  });

  it('evaluates comparator feasibility against count bounds', () => {
    const bounds = { minimum: 1, maximum: 3 };

    expect(comparatorCanBeSatisfied(bounds, { op: 'eq', value: 2 })).toBe(true);
    expect(comparatorCanBeSatisfied(bounds, { op: 'eq', value: 4 })).toBe(false);
    expect(comparatorCanBeSatisfied(bounds, { op: 'gte', value: 3 })).toBe(true);
    expect(comparatorCanBeSatisfied(bounds, { op: 'gte', value: 4 })).toBe(false);
    expect(comparatorCanBeSatisfied(bounds, { op: 'lte', value: 1 })).toBe(true);
    expect(comparatorCanBeSatisfied(bounds, { op: 'lte', value: 0 })).toBe(false);
  });

  it('compiles local adjacent scopes with corner, edge, and interior target bounds', () => {
    const puzzle = makePuzzle({
      width: 3,
      height: 3,
      allowedKinds: ['empty', 'bottle', 'guest'],
      rules: [
        forEachCountRule('bottles-see-guests', 'bottle', 'adjacent', 'guest', {
          op: 'eq',
          value: 1,
        }),
      ],
    });
    const [constraint] = compileConstraints(puzzle);
    const bounds = evaluateConstraintBounds(constraint, createInitialDomains(puzzle));

    if (bounds.kind !== 'forEachCount') {
      throw new Error('Expected forEachCount bounds');
    }

    expect(bounds.entries.find((entry) => entry.cellId === 'A1')?.targetBounds).toEqual({
      minimum: 0,
      maximum: 3,
    });
    expect(bounds.entries.find((entry) => entry.cellId === 'B1')?.targetBounds).toEqual({
      minimum: 0,
      maximum: 5,
    });
    expect(bounds.entries.find((entry) => entry.cellId === 'B2')?.targetBounds).toEqual({
      minimum: 0,
      maximum: 8,
    });
  });

  it('marks forced local subjects impossible when target bounds cannot satisfy the comparator', () => {
    const puzzle = makePuzzle({
      width: 2,
      height: 2,
      allowedKinds: ['empty', 'bottle', 'guest'],
      rules: [
        forEachCountRule('forced-bottle-needs-guest', 'bottle', 'orthogonal', 'guest', {
          op: 'eq',
          value: 1,
        }),
      ],
    });
    const initial = createInitialDomains(puzzle);
    const forcedBottle = setCellDomain(initial, 'A1', singletonMask('bottle'));
    const noGuestAtB1 = setCellDomain(forcedBottle, 'B1', singletonMask('empty'));
    const domains = setCellDomain(noGuestAtB1, 'A2', singletonMask('empty'));
    const [constraint] = compileConstraints(puzzle);
    const bounds = evaluateConstraintBounds(constraint, domains);

    if (bounds.kind !== 'forEachCount') {
      throw new Error('Expected forEachCount bounds');
    }

    expect(bounds.entries[0]).toMatchObject({
      cellId: 'A1',
      subjectPossible: true,
      subjectForced: true,
      targetBounds: { minimum: 0, maximum: 0 },
      possible: false,
    });
    expect(bounds.possible).toBe(false);
  });
});

function makePuzzle(input: {
  readonly width: number;
  readonly height: number;
  readonly allowedKinds: readonly CellKind[];
  readonly rules: readonly RuleDefinition[];
}): PuzzleDefinition {
  return {
    schemaVersion: 1,
    id: 'solver-constraints-test',
    title: 'Solver Constraints Test',
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
