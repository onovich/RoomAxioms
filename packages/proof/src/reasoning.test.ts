import { describe, expect, it } from 'vitest';
import type { ForEachCountRule, GlobalCountRule, PuzzleDefinition } from '@room-axioms/domain';

import {
  comparatorBounds,
  countPremise,
  createKnowledgeIndex,
  scopeCellsForRule,
  scopePremise,
  summarizeForEachScope,
  summarizeGlobalCount,
} from './index.js';
import type { KnowledgeState } from './index.js';

describe('knowledge state summaries', () => {
  it('indexes known and unknown cells in row-major order', () => {
    const state = makeState({
      observations: [
        { cellId: 'C1', kind: 'empty' },
        { cellId: 'A1', kind: 'guest' },
      ],
    });

    expect(createKnowledgeIndex(state)).toMatchObject({
      knownCellIds: ['A1', 'C1'],
      unknownCellIds: ['B1', 'A2', 'B2', 'C2', 'A3', 'B3', 'C3'],
    });
  });

  it('summarizes global count knowledge without reading target values', () => {
    const state = makeState({
      observations: [
        { cellId: 'A1', kind: 'guest' },
        { cellId: 'B1', kind: 'empty' },
      ],
    });
    const summary = summarizeGlobalCount(state, globalGuestRule({ op: 'eq', value: 1 }));

    expect(summary).toEqual({
      ruleId: 'R1',
      target: 'guest',
      bounds: { lowerBound: 1, upperBound: 1 },
      scopeCellIds: ['A1', 'B1', 'C1', 'A2', 'B2', 'C2', 'A3', 'B3', 'C3'],
      knownTargetCellIds: ['A1'],
      knownOtherCellIds: ['B1'],
      unknownCellIds: ['C1', 'A2', 'B2', 'C2', 'A3', 'B3', 'C3'],
      derivedPremises: [],
    });
    expect(countPremise(summary)).toEqual({
      kind: 'count',
      label: 'R1 guest count = 1; known target 1; known other 1; unknown 7',
      cellIds: ['A1', 'B1', 'C1', 'A2', 'B2', 'C2', 'A3', 'B3', 'C3'],
      ruleIds: ['R1'],
    });
  });
});

describe('rule scope summaries', () => {
  it('summarizes adjacent corner, edge, and interior scopes from domain neighbors', () => {
    const puzzle = makePuzzle();
    const rule = adjacentMirrorRule();

    expect(scopeCellsForRule(puzzle, rule, 'A1')).toEqual(['B1', 'A2', 'B2']);
    expect(scopeCellsForRule(puzzle, rule, 'B1')).toEqual(['A1', 'C1', 'A2', 'B2', 'C2']);
    expect(scopeCellsForRule(puzzle, rule, 'B2')).toEqual([
      'A1',
      'B1',
      'C1',
      'A2',
      'C2',
      'A3',
      'B3',
      'C3',
    ]);
    expect(scopePremise(rule, 'A1', scopeCellsForRule(puzzle, rule, 'A1'))).toEqual({
      kind: 'scope',
      label: 'R2 adjacent scope for A1: B1, A2, B2',
      cellIds: ['B1', 'A2', 'B2'],
      ruleIds: ['R2'],
    });
  });

  it('summarizes local target counts within orthogonal scopes', () => {
    const state = makeState({
      observations: [
        { cellId: 'B1', kind: 'bin' },
        { cellId: 'A2', kind: 'empty' },
      ],
    });
    const rule = orthogonalBottleRule();

    expect(summarizeForEachScope(state, rule, 'B2')).toEqual({
      ruleId: 'R3',
      target: 'bin',
      bounds: { lowerBound: 1, upperBound: 1 },
      scopeCellIds: ['B1', 'A2', 'C2', 'B3'],
      knownTargetCellIds: ['B1'],
      knownOtherCellIds: ['A2'],
      unknownCellIds: ['C2', 'B3'],
      derivedPremises: [],
    });
  });

  it('supports comparator bounds for all count operators', () => {
    expect(comparatorBounds({ op: 'eq', value: 2 })).toEqual({ lowerBound: 2, upperBound: 2 });
    expect(comparatorBounds({ op: 'neq', value: 2 })).toEqual({ lowerBound: 0, upperBound: null });
    expect(comparatorBounds({ op: 'gt', value: 2 })).toEqual({ lowerBound: 3, upperBound: null });
    expect(comparatorBounds({ op: 'gte', value: 2 })).toEqual({ lowerBound: 2, upperBound: null });
    expect(comparatorBounds({ op: 'lt', value: 2 })).toEqual({ lowerBound: 0, upperBound: 1 });
    expect(comparatorBounds({ op: 'lte', value: 2 })).toEqual({ lowerBound: 0, upperBound: 2 });
  });
});

function makeState(input: { readonly observations: KnowledgeState['observations'] }): KnowledgeState {
  return {
    puzzle: makePuzzle(),
    observations: input.observations,
  };
}

function makePuzzle(): PuzzleDefinition {
  return {
    schemaVersion: 1,
    id: 'proof-reasoning-test',
    title: 'Proof Reasoning Test',
    board: { width: 3, height: 3 },
    allowedKinds: ['empty', 'bottle', 'bin', 'mirror', 'guest'],
    rules: [globalGuestRule({ op: 'eq', value: 1 }), adjacentMirrorRule(), orthogonalBottleRule()],
    initialReveals: [],
    target: {},
    metadata: {
      difficulty: 1,
      tags: ['proof-test'],
      status: 'draft',
    },
  };
}

function globalGuestRule(count: GlobalCountRule['count']): GlobalCountRule {
  return {
    id: 'R1',
    type: 'globalCount',
    target: 'guest',
    count,
    presentation: { title: 'guest count' },
  };
}

function adjacentMirrorRule(): ForEachCountRule {
  return {
    id: 'R2',
    type: 'forEachCount',
    subject: 'mirror',
    scope: { kind: 'adjacent' },
    target: 'guest',
    count: { op: 'eq', value: 1 },
    presentation: { title: 'mirror guest count' },
  };
}

function orthogonalBottleRule(): ForEachCountRule {
  return {
    id: 'R3',
    type: 'forEachCount',
    subject: 'bottle',
    scope: { kind: 'orthogonal' },
    target: 'bin',
    count: { op: 'eq', value: 1 },
    presentation: { title: 'bottle bin count' },
  };
}
