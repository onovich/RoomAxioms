import { findForcedCells, isSatisfiable } from '@room-axioms/solver';
import { describe, expect, it } from 'vitest';
import type {
  BoardSize,
  CellKind,
  Comparator,
  Observation,
  RuleDefinition,
} from '@room-axioms/domain';

import { deriveHumanDeductions } from './index.js';
import type { Deduction, KnowledgeState } from './index.js';

describe('LOCAL_SCOPE_DIFFERENCE semantic fixtures', () => {
  it('defines a positive nested-scope difference where the extra cell is solver-forced', () => {
    const state = positiveDifferenceState();
    const forced = findForcedCells({ puzzle: state.puzzle, observations: state.observations });
    const b3CanBeNonGuest = isSatisfiable(
      { puzzle: state.puzzle, observations: state.observations },
      [{ kind: 'cellIsNot', cellId: 'B3', value: 'guest' }],
    );
    const existingGuestDeductions = deriveHumanDeductions(state)
      .filter((deduction) => deduction.technique !== 'LOCAL_SCOPE_DIFFERENCE')
      .filter((deduction) => deduction.conclusion.kind === 'guest')
      .map((deduction) => deduction.conclusion.cellId);

    expect(forced.guests).toContain('B3');
    expect(b3CanBeNonGuest.satisfiable).toBe(false);
    expect(b3CanBeNonGuest.stats.truncated).toBe(false);
    expect(existingGuestDeductions).not.toContain('B3');
  });

  it.todo('emits LOCAL_SCOPE_DIFFERENCE for B3 after the proof emission round lands');

  it('does not infer a difference from reverse implication', () => {
    const state = reverseImplicationState();
    const deductions = deriveHumanDeductions(state);
    const a1CanRemainEmpty = isSatisfiable(
      { puzzle: state.puzzle, observations: state.observations },
      [{ kind: 'cellIs', cellId: 'A1', value: 'empty' }],
    );

    expect(deductionsForTechnique(deductions, 'LOCAL_SCOPE_DIFFERENCE')).toEqual([]);
    expect(a1CanRemainEmpty.satisfiable).toBe(true);
    expect(a1CanRemainEmpty.stats.truncated).toBe(false);
  });

  it('does not infer a difference when the nested unknown scope is not contained', () => {
    const state = unsupportedOverlapState();
    const deductions = deriveHumanDeductions(state);
    const b3CanBeNonGuest = isSatisfiable(
      { puzzle: state.puzzle, observations: state.observations },
      [{ kind: 'cellIsNot', cellId: 'B3', value: 'guest' }],
    );

    expect(deductionsForTechnique(deductions, 'LOCAL_SCOPE_DIFFERENCE')).toEqual([]);
    expect(b3CanBeNonGuest.satisfiable).toBe(true);
    expect(b3CanBeNonGuest.stats.truncated).toBe(false);
  });

  it('does not read hidden target data to create a difference deduction', () => {
    const state = hiddenTargetOnlyState();
    const deductions = deriveHumanDeductions(state);
    const b3CanBeNonGuest = isSatisfiable(
      { puzzle: state.puzzle, observations: state.observations },
      [{ kind: 'cellIsNot', cellId: 'B3', value: 'guest' }],
    );

    expect(state.puzzle.target.B3).toBe('guest');
    expect(deductionsForTechnique(deductions, 'LOCAL_SCOPE_DIFFERENCE')).toEqual([]);
    expect(b3CanBeNonGuest.satisfiable).toBe(true);
    expect(b3CanBeNonGuest.stats.truncated).toBe(false);
  });

  it('does not misclassify the accepted intersection-only shape as difference', () => {
    const state = intersectionOnlyState();
    const deductions = deriveHumanDeductions(state);

    expect(deductionsForTechnique(deductions, 'LOCAL_SCOPE_INTERSECTION').map((deduction) => deduction.conclusion)).toEqual([
      { kind: 'safe', cellId: 'B3' },
    ]);
    expect(deductionsForTechnique(deductions, 'LOCAL_SCOPE_DIFFERENCE')).toEqual([]);
  });
});

function positiveDifferenceState(): KnowledgeState {
  return makeState({
    board: { width: 3, height: 3 },
    allowedKinds: ['empty', 'bottle', 'mirror', 'guest'],
    rules: [
      forEachCountRule('R1', 'bottle', 'orthogonal', 'guest', { op: 'eq', value: 2 }),
      forEachCountRule('R2', 'mirror', 'adjacent', 'guest', { op: 'eq', value: 1 }),
    ],
    observations: [
      { cellId: 'A1', kind: 'empty' },
      { cellId: 'B1', kind: 'mirror' },
      { cellId: 'C1', kind: 'empty' },
      { cellId: 'B2', kind: 'bottle' },
    ],
  });
}

function reverseImplicationState(): KnowledgeState {
  return makeState({
    board: { width: 3, height: 3 },
    allowedKinds: ['empty', 'bottle', 'mirror', 'guest'],
    rules: [
      forEachCountRule('R1', 'bottle', 'orthogonal', 'guest', { op: 'eq', value: 1 }),
      forEachCountRule('R2', 'mirror', 'adjacent', 'guest', { op: 'eq', value: 1 }),
    ],
    observations: [
      { cellId: 'A1', kind: 'empty' },
      { cellId: 'C1', kind: 'empty' },
      { cellId: 'B3', kind: 'guest' },
    ],
  });
}

function unsupportedOverlapState(): KnowledgeState {
  return makeState({
    board: { width: 3, height: 3 },
    allowedKinds: ['empty', 'bottle', 'mirror', 'guest'],
    rules: [
      forEachCountRule('R1', 'bottle', 'orthogonal', 'guest', { op: 'eq', value: 1 }),
      forEachCountRule('R2', 'mirror', 'adjacent', 'guest', { op: 'eq', value: 1 }),
    ],
    observations: [
      { cellId: 'B1', kind: 'mirror' },
      { cellId: 'B2', kind: 'bottle' },
    ],
  });
}

function hiddenTargetOnlyState(): KnowledgeState {
  return makeState({
    board: { width: 3, height: 3 },
    allowedKinds: ['empty', 'bottle', 'mirror', 'guest'],
    rules: [
      forEachCountRule('R1', 'bottle', 'orthogonal', 'guest', { op: 'eq', value: 1 }),
      forEachCountRule('R2', 'mirror', 'adjacent', 'guest', { op: 'eq', value: 1 }),
    ],
    observations: [
      { cellId: 'A1', kind: 'empty' },
      { cellId: 'B1', kind: 'mirror' },
      { cellId: 'C1', kind: 'empty' },
      { cellId: 'B2', kind: 'bottle' },
    ],
    target: {
      A1: 'empty',
      B1: 'mirror',
      C1: 'empty',
      A2: 'empty',
      B2: 'bottle',
      C2: 'guest',
      A3: 'empty',
      B3: 'guest',
      C3: 'empty',
    },
  });
}

function intersectionOnlyState(): KnowledgeState {
  return makeState({
    board: { width: 3, height: 3 },
    allowedKinds: ['empty', 'bottle', 'mirror', 'guest'],
    rules: [
      forEachCountRule('R1', 'bottle', 'orthogonal', 'guest', { op: 'eq', value: 1 }),
      forEachCountRule('R2', 'mirror', 'adjacent', 'guest', { op: 'eq', value: 2 }),
    ],
    observations: [
      { cellId: 'B1', kind: 'mirror' },
      { cellId: 'A1', kind: 'empty' },
      { cellId: 'B2', kind: 'bottle' },
    ],
  });
}

function deductionsForTechnique(
  deductions: readonly Deduction[],
  technique: Deduction['technique'],
): readonly Deduction[] {
  return deductions.filter((deduction) => deduction.technique === technique);
}

function makeState(input: {
  readonly board?: BoardSize;
  readonly allowedKinds: readonly CellKind[];
  readonly rules: readonly RuleDefinition[];
  readonly observations: readonly Observation[];
  readonly target?: Record<string, CellKind>;
}): KnowledgeState {
  return {
    puzzle: {
      schemaVersion: 1,
      id: 'local-scope-difference-semantics-test',
      title: 'Local Scope Difference Semantics Test',
      board: input.board ?? { width: 3, height: 3 },
      allowedKinds: input.allowedKinds,
      rules: input.rules,
      initialReveals: [],
      target: input.target ?? {},
      metadata: {
        difficulty: 1,
        tags: ['proof-test'],
        status: 'draft',
      },
    },
    observations: input.observations,
  };
}

function forEachCountRule(
  id: string,
  subject: CellKind,
  scope: 'orthogonal' | 'adjacent',
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
    presentation: { title: `${subject} ${target} count` },
  };
}
