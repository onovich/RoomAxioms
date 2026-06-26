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
    expect(comparatorCanBeSatisfied(bounds, { op: 'neq', value: 2 })).toBe(true);
    expect(comparatorCanBeSatisfied({ minimum: 2, maximum: 2 }, { op: 'neq', value: 2 })).toBe(false);
    expect(comparatorCanBeSatisfied(bounds, { op: 'gt', value: 2 })).toBe(true);
    expect(comparatorCanBeSatisfied(bounds, { op: 'gt', value: 3 })).toBe(false);
    expect(comparatorCanBeSatisfied(bounds, { op: 'gte', value: 3 })).toBe(true);
    expect(comparatorCanBeSatisfied(bounds, { op: 'gte', value: 4 })).toBe(false);
    expect(comparatorCanBeSatisfied(bounds, { op: 'lt', value: 2 })).toBe(true);
    expect(comparatorCanBeSatisfied(bounds, { op: 'lt', value: 1 })).toBe(false);
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

  it('computes region count bounds from named region cells', () => {
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
      rules: [regionCountRule('north-guest', 'north-wing', 'guest', { op: 'eq', value: 1 })],
    });
    const initial = createInitialDomains(puzzle);
    const guestAtA1 = setCellDomain(initial, 'A1', singletonMask('guest'));
    const domains = setCellDomain(guestAtA1, 'B1', singletonMask('empty'));
    const [constraint] = compileConstraints(puzzle);
    const bounds = evaluateConstraintBounds(constraint, domains);

    expect(bounds).toEqual({
      kind: 'regionCount',
      ruleId: 'north-guest',
      bounds: { minimum: 1, maximum: 2 },
      possible: true,
    });
  });

  it('computes static line count bounds from row cells', () => {
    const puzzle = makePuzzle({
      width: 3,
      height: 3,
      allowedKinds: ['empty', 'guest'],
      rules: [lineCountRule('row-one-guest', { kind: 'row', index: 0 }, 'guest', { op: 'eq', value: 1 })],
    });
    const initial = createInitialDomains(puzzle);
    const guestAtA1 = setCellDomain(initial, 'A1', singletonMask('guest'));
    const domains = setCellDomain(guestAtA1, 'B1', singletonMask('empty'));
    const [constraint] = compileConstraints(puzzle);
    const bounds = evaluateConstraintBounds(constraint, domains);

    expect(bounds).toEqual({
      kind: 'lineCount',
      ruleId: 'row-one-guest',
      bounds: { minimum: 1, maximum: 2 },
      possible: true,
    });
  });

  it('checks blocker-aware ray bounds exactly for complete domains', () => {
    const puzzle = makePuzzle({
      width: 4,
      height: 3,
      allowedKinds: ['empty', 'mirror', 'guest'],
      rules: [
        lineCountRule(
          'east-ray-one-guest',
          { kind: 'ray', direction: 'east', stopAtKinds: ['mirror'] },
          'guest',
          { op: 'eq', value: 1 },
          'A1',
        ),
      ],
    });
    const domains = {
      ...createInitialDomains(puzzle),
      A1: singletonMask('empty'),
      B1: singletonMask('guest'),
      C1: singletonMask('mirror'),
      D1: singletonMask('guest'),
      A2: singletonMask('empty'),
      B2: singletonMask('empty'),
      C2: singletonMask('empty'),
      D2: singletonMask('empty'),
      A3: singletonMask('empty'),
      B3: singletonMask('empty'),
      C3: singletonMask('empty'),
      D3: singletonMask('empty'),
    };
    const [constraint] = compileConstraints(puzzle);
    const bounds = evaluateConstraintBounds(constraint, domains);

    expect(bounds).toEqual({
      kind: 'lineCount',
      ruleId: 'east-ray-one-guest',
      bounds: { minimum: 1, maximum: 1 },
      possible: true,
    });
  });

  it('computes anchor count bounds from declared anchor subjects', () => {
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
    const initial = createInitialDomains(puzzle);
    const bottleAtB2 = setCellDomain(initial, 'B2', singletonMask('bottle'));
    const guestAtB1 = setCellDomain(bottleAtB2, 'B1', singletonMask('guest'));
    const [constraint] = compileConstraints(puzzle);
    const bounds = evaluateConstraintBounds(constraint, guestAtB1);

    if (bounds.kind !== 'anchorCount') throw new Error('Expected anchorCount bounds');
    expect(bounds.entries.find((entry) => entry.cellId === 'B2')).toMatchObject({
      cellId: 'B2',
      subjectPossible: true,
      subjectForced: true,
      targetBounds: { minimum: 1, maximum: 4 },
      possible: false,
    });
    expect(bounds.possible).toBe(false);
  });

  it('computes scope-overlap count bounds from derived public scopes', () => {
    const puzzle = makePuzzle({
      width: 3,
      height: 3,
      allowedKinds: ['empty', 'guest'],
      regions: [
        {
          id: 'top-row',
          title: 'Top row',
          cells: ['A1', 'B1', 'C1'],
        },
      ],
      rules: [
        {
          id: 'top-column-overlap',
          type: 'scopeOverlapCount',
          left: { kind: 'region', regionId: 'top-row' },
          right: { kind: 'line', scope: { kind: 'column', index: 1 } },
          mode: 'intersection',
          target: 'guest',
          count: { op: 'eq', value: 1 },
          presentation: { title: 'Top column overlap' },
        },
      ],
    });
    const domains = setCellDomain(createInitialDomains(puzzle), 'B1', singletonMask('guest'));
    const [constraint] = compileConstraints(puzzle);
    const bounds = evaluateConstraintBounds(constraint, domains);

    expect(bounds).toEqual({
      kind: 'scopeOverlapCount',
      ruleId: 'top-column-overlap',
      cells: ['B1'],
      bounds: { minimum: 1, maximum: 1 },
      possible: true,
    });
  });

  it('evaluates comparative count feasibility between two scopes', () => {
    const puzzle = makePuzzle({
      width: 2,
      height: 2,
      allowedKinds: ['empty', 'guest'],
      regions: [
        {
          id: 'left-side',
          title: 'Left side',
          cells: ['A1', 'A2'],
        },
        {
          id: 'right-side',
          title: 'Right side',
          cells: ['B1', 'B2'],
        },
      ],
      rules: [
        {
          id: 'left-more-than-right',
          type: 'comparativeCount',
          left: { kind: 'region', regionId: 'left-side' },
          right: { kind: 'region', regionId: 'right-side' },
          target: 'guest',
          comparison: { op: 'gt' },
          presentation: { title: 'Left has more guests' },
        },
      ],
    });
    const domains = {
      A1: singletonMask('guest'),
      A2: singletonMask('empty'),
      B1: singletonMask('empty'),
      B2: singletonMask('empty'),
    };
    const [constraint] = compileConstraints(puzzle);
    const bounds = evaluateConstraintBounds(constraint, domains);

    expect(bounds).toEqual({
      kind: 'comparativeCount',
      ruleId: 'left-more-than-right',
      leftBounds: { minimum: 1, maximum: 1 },
      rightBounds: { minimum: 0, maximum: 0 },
      possible: true,
    });
  });

  it('rejects forced-true conditional counts with impossible consequences', () => {
    const puzzle = makePuzzle({
      width: 2,
      height: 1,
      allowedKinds: ['empty', 'guest'],
      regions: [
        {
          id: 'left-cell',
          title: 'Left cell',
          cells: ['A1'],
        },
        {
          id: 'right-cell',
          title: 'Right cell',
          cells: ['B1'],
        },
      ],
      rules: [
        {
          id: 'if-left-guest-right-empty',
          type: 'conditionalCount',
          condition: {
            scope: { kind: 'region', regionId: 'left-cell' },
            target: 'guest',
            count: { op: 'eq', value: 1 },
          },
          then: {
            scope: { kind: 'region', regionId: 'right-cell' },
            target: 'empty',
            count: { op: 'eq', value: 1 },
          },
          presentation: { title: 'If left guest then right empty' },
        },
      ],
    });
    const domains = {
      A1: singletonMask('guest'),
      B1: singletonMask('guest'),
    };
    const [constraint] = compileConstraints(puzzle);
    const bounds = evaluateConstraintBounds(constraint, domains);

    expect(bounds).toEqual({
      kind: 'conditionalCount',
      ruleId: 'if-left-guest-right-empty',
      conditionBounds: { minimum: 1, maximum: 1 },
      thenBounds: { minimum: 0, maximum: 0 },
      conditionCanBeTrue: true,
      conditionMustBeTrue: true,
      thenCanBeSatisfied: false,
      possible: false,
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
  readonly regions?: PuzzleDefinition['regions'];
  readonly anchors?: PuzzleDefinition['anchors'];
  readonly rules: readonly RuleDefinition[];
}): PuzzleDefinition {
  return {
    schemaVersion: 1,
    id: 'solver-constraints-test',
    title: 'Solver Constraints Test',
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
