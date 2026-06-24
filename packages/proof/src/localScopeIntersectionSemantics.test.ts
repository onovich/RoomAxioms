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

describe('LOCAL_SCOPE_INTERSECTION semantic fixtures', () => {
  it('defines a positive overlap where shared cells consume another scope capacity', () => {
    const state = positiveIntersectionState();
    const forced = findForcedCells({ puzzle: state.puzzle, observations: state.observations });
    const b3CanBeGuest = isSatisfiable(
      { puzzle: state.puzzle, observations: state.observations },
      [{ kind: 'cellIs', cellId: 'B3', value: 'guest' }],
    );
    const existingSafeWithoutIntersection = deriveHumanDeductions(state)
      .filter((deduction) => deduction.technique !== 'LOCAL_SCOPE_INTERSECTION')
      .filter((deduction) => deduction.conclusion.kind === 'safe')
      .map((deduction) => deduction.conclusion.cellId);

    expect(forced.safe).toContain('B3');
    expect(b3CanBeGuest.satisfiable).toBe(false);
    expect(b3CanBeGuest.stats.truncated).toBe(false);
    expect(existingSafeWithoutIntersection).not.toContain('B3');
  });

  it('does not force a consumer-only cell when the provider need can avoid the intersection', () => {
    const state = suggestiveButUnforcedOverlapState();
    const forced = findForcedCells({ puzzle: state.puzzle, observations: state.observations });
    const b3CanBeGuest = isSatisfiable(
      { puzzle: state.puzzle, observations: state.observations },
      [{ kind: 'cellIs', cellId: 'B3', value: 'guest' }],
    );

    expect(forced.safe).not.toContain('B3');
    expect(b3CanBeGuest.satisfiable).toBe(true);
    expect(b3CanBeGuest.stats.truncated).toBe(false);
  });

  it('does not infer local subjects from reverse implication', () => {
    const state = reverseImplicationState();
    const deductions = deriveHumanDeductions(state);
    const a1CanRemainEmpty = isSatisfiable(
      { puzzle: state.puzzle, observations: state.observations },
      [{ kind: 'cellIs', cellId: 'A1', value: 'empty' }],
    );

    expect(deductionsForTechnique(deductions, 'LOCAL_SCOPE_INTERSECTION')).toEqual([]);
    expect(a1CanRemainEmpty.satisfiable).toBe(true);
    expect(a1CanRemainEmpty.stats.truncated).toBe(false);
  });
});

function positiveIntersectionState(): KnowledgeState {
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

function suggestiveButUnforcedOverlapState(): KnowledgeState {
  return makeState({
    board: { width: 3, height: 3 },
    allowedKinds: ['empty', 'bottle', 'mirror', 'guest'],
    rules: [
      forEachCountRule('R1', 'bottle', 'orthogonal', 'guest', { op: 'eq', value: 1 }),
      forEachCountRule('R2', 'mirror', 'adjacent', 'guest', { op: 'eq', value: 1 }),
    ],
    observations: [
      { cellId: 'B1', kind: 'mirror' },
      { cellId: 'A1', kind: 'empty' },
      { cellId: 'B2', kind: 'bottle' },
    ],
  });
}

function reverseImplicationState(): KnowledgeState {
  return makeState({
    board: { width: 3, height: 3 },
    allowedKinds: ['empty', 'mirror', 'guest'],
    rules: [
      forEachCountRule('R1', 'mirror', 'adjacent', 'guest', { op: 'eq', value: 1 }),
    ],
    observations: [{ cellId: 'B2', kind: 'guest' }],
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
}): KnowledgeState {
  return {
    puzzle: {
      schemaVersion: 1,
      id: 'local-scope-intersection-semantics-test',
      title: 'Local Scope Intersection Semantics Test',
      board: input.board ?? { width: 3, height: 3 },
      allowedKinds: input.allowedKinds,
      rules: input.rules,
      initialReveals: [],
      target: {},
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
