import { describe, expect, it } from 'vitest';
import type { CellKind, Comparator, LocalScopeKind, PuzzleDefinition, RuleDefinition } from '@room-axioms/domain';

import { evaluateRule, satisfiesRules } from './rules.js';
import type { CellAssignment } from './types.js';

const metadata: PuzzleDefinition['metadata'] = {
  difficulty: 1,
  tags: ['oracle-test'],
  status: 'draft',
};

describe('rule evaluation', () => {
  it('evaluates global counts with every comparator', () => {
    const cells = makeAssignment([
      ['guest', 'empty'],
      ['guest', 'bottle'],
    ]);
    const puzzle = makePuzzle({
      width: 2,
      height: 2,
      rules: [
        globalCountRule('two-guests', 'guest', { op: 'eq', value: 2 }),
        globalCountRule('not-three-guests', 'guest', { op: 'neq', value: 3 }),
        globalCountRule('more-than-one-guest', 'guest', { op: 'gt', value: 1 }),
        globalCountRule('at-least-one-bottle', 'bottle', { op: 'gte', value: 1 }),
        globalCountRule('less-than-two-bottles', 'bottle', { op: 'lt', value: 2 }),
        globalCountRule('no-more-than-one-bin', 'bin', { op: 'lte', value: 1 }),
      ],
      target: cells,
    });
    const model = { cells };

    expect(evaluateRule(puzzle.rules[0], puzzle, model)).toEqual({
      ruleId: 'two-guests',
      satisfied: true,
      actual: 2,
    });
    expect(evaluateRule(puzzle.rules[1], puzzle, model).satisfied).toBe(true);
    expect(evaluateRule(puzzle.rules[2], puzzle, model).satisfied).toBe(true);
    expect(evaluateRule(puzzle.rules[3], puzzle, model).satisfied).toBe(true);
    expect(evaluateRule(puzzle.rules[4], puzzle, model).satisfied).toBe(true);
    expect(evaluateRule(puzzle.rules[5], puzzle, model).satisfied).toBe(true);
    expect(satisfiesRules(puzzle, model)).toBe(true);
  });

  it('reports failed global counts', () => {
    const cells = makeAssignment([
      ['guest', 'empty'],
      ['guest', 'bottle'],
    ]);
    const puzzle = makePuzzle({
      width: 2,
      height: 2,
      rules: [globalCountRule('one-guest', 'guest', { op: 'eq', value: 1 })],
      target: cells,
    });

    expect(evaluateRule(puzzle.rules[0], puzzle, { cells })).toEqual({
      ruleId: 'one-guest',
      satisfied: false,
      actual: 2,
    });
    expect(satisfiesRules(puzzle, { cells })).toBe(false);
  });

  it('evaluates for-each adjacent counts in stable corner, edge, and interior order', () => {
    const cells = makeAssignment([
      ['bottle', 'bottle', 'guest'],
      ['guest', 'bottle', 'empty'],
      ['empty', 'guest', 'empty'],
    ]);
    const rule = forEachCountRule('bottles-touch-guests', 'bottle', 'adjacent', 'guest', {
      op: 'gte',
      value: 1,
    });
    const puzzle = makePuzzle({
      width: 3,
      height: 3,
      rules: [rule],
      target: cells,
    });

    expect(evaluateRule(rule, puzzle, { cells })).toEqual({
      ruleId: 'bottles-touch-guests',
      satisfied: true,
      actual: [1, 2, 3],
    });
  });

  it('requires every subject cell to satisfy a for-each count', () => {
    const cells = makeAssignment([
      ['bottle', 'bottle', 'guest'],
      ['guest', 'bottle', 'empty'],
      ['empty', 'guest', 'empty'],
    ]);
    const rule = forEachCountRule('all-bottles-see-two-guests', 'bottle', 'adjacent', 'guest', {
      op: 'eq',
      value: 2,
    });
    const puzzle = makePuzzle({
      width: 3,
      height: 3,
      rules: [rule],
      target: cells,
    });

    expect(evaluateRule(rule, puzzle, { cells })).toEqual({
      ruleId: 'all-bottles-see-two-guests',
      satisfied: false,
      actual: [1, 2, 3],
    });
  });

  it('supports orthogonal for-each scopes', () => {
    const cells = makeAssignment([
      ['guest', 'bottle', 'guest'],
      ['empty', 'bottle', 'empty'],
      ['empty', 'guest', 'empty'],
    ]);
    const rule = forEachCountRule('orthogonal-bottle-guests', 'bottle', 'orthogonal', 'guest', {
      op: 'lte',
      value: 2,
    });
    const puzzle = makePuzzle({
      width: 3,
      height: 3,
      rules: [rule],
      target: cells,
    });

    expect(evaluateRule(rule, puzzle, { cells })).toEqual({
      ruleId: 'orthogonal-bottle-guests',
      satisfied: true,
      actual: [2, 1],
    });
  });

  it('supports directional for-each scopes', () => {
    const cells = makeAssignment([
      ['bin', 'guest', 'empty'],
      ['bin', 'empty', 'guest'],
      ['empty', 'empty', 'empty'],
    ]);
    const rule = forEachCountRule('east-of-bin-no-guest', 'bin', 'east', 'guest', {
      op: 'eq',
      value: 0,
    });
    const puzzle = makePuzzle({
      width: 3,
      height: 3,
      rules: [rule],
      target: cells,
    });

    expect(evaluateRule(rule, puzzle, { cells })).toEqual({
      ruleId: 'east-of-bin-no-guest',
      satisfied: false,
      actual: [1, 0],
    });
  });

  it('evaluates Phase 24 count-scope rules exactly', () => {
    const cells = makeAssignment([
      ['empty', 'guest'],
      ['empty', 'empty'],
    ]);
    const puzzle = makePuzzle({
      width: 2,
      height: 2,
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
      target: cells,
    });
    const model = { cells };

    expect(evaluateRule(puzzle.rules[0], puzzle, model)).toEqual({
      ruleId: 'top-right-overlap',
      satisfied: true,
      actual: 1,
    });
    expect(evaluateRule(puzzle.rules[1], puzzle, model)).toEqual({
      ruleId: 'top-more-than-bottom',
      satisfied: true,
      actual: [1, 0],
    });
    expect(evaluateRule(puzzle.rules[2], puzzle, model)).toEqual({
      ruleId: 'if-top-one-bottom-zero',
      satisfied: true,
      actual: [1, 0],
    });
    expect(satisfiesRules(puzzle, model)).toBe(true);
  });
});

function makePuzzle(input: {
  readonly width: number;
  readonly height: number;
  readonly regions?: PuzzleDefinition['regions'];
  readonly rules: readonly RuleDefinition[];
  readonly target: CellAssignment;
}): PuzzleDefinition {
  return {
    schemaVersion: 1,
    id: 'oracle-test-puzzle',
    title: 'Oracle Test Puzzle',
    board: { width: input.width, height: input.height },
    allowedKinds: ['empty', 'bottle', 'bin', 'mirror', 'guest'],
    ...(input.regions === undefined ? {} : { regions: input.regions }),
    rules: input.rules,
    initialReveals: [],
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

function globalCountRule(
  id: string,
  target: CellKind,
  count: Comparator,
): RuleDefinition {
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
  scope: LocalScopeKind,
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
