import { findForcedCells, isSatisfiable } from '@room-axioms/solver';
import { describe, expect, it } from 'vitest';
import type { CellKind, Comparator, Observation, RuleDefinition } from '@room-axioms/domain';

import { buildProofGraph, deriveHumanDeductions } from './index.js';
import type { Deduction, KnowledgeState } from './index.js';

describe('global count human techniques', () => {
  it('derives safe cells when the global guest count is saturated', () => {
    const state = makeState({
      allowedKinds: ['empty', 'guest'],
      rules: [globalCountRule('R1', 'guest', { op: 'eq', value: 1 })],
      observations: [{ cellId: 'A1', kind: 'guest' }],
    });
    const deductions = deriveHumanDeductions(state);
    const forced = findForcedCells({ puzzle: state.puzzle, observations: state.observations });

    expect(deductions.map((deduction) => deduction.conclusion)).toEqual([
      { kind: 'safe', cellId: 'B1' },
      { kind: 'safe', cellId: 'A2' },
      { kind: 'safe', cellId: 'B2' },
    ]);
    expect(deductions.map((deduction) => deduction.technique)).toEqual([
      'GLOBAL_COUNT_SATURATED',
      'GLOBAL_COUNT_SATURATED',
      'GLOBAL_COUNT_SATURATED',
    ]);
    expect(forced.safe).toEqual(['B1', 'A2', 'B2']);
    expect(allDeductionsHavePremises(deductions)).toBe(true);
    expect(buildProofGraph(state, deductions).nodes.at(-1)).toMatchObject({
      kind: 'derived',
      label: 'GLOBAL_COUNT_SATURATED: B2 is safe',
    });
  });

  it('derives guests when all remaining cells are required by a global count', () => {
    const state = makeState({
      allowedKinds: ['empty', 'guest'],
      rules: [globalCountRule('R1', 'guest', { op: 'eq', value: 1 })],
      observations: [
        { cellId: 'A1', kind: 'empty' },
        { cellId: 'B1', kind: 'empty' },
        { cellId: 'A2', kind: 'empty' },
      ],
    });
    const deductions = deriveHumanDeductions(state);
    const result = isSatisfiable(
      { puzzle: state.puzzle, observations: state.observations },
      [{ kind: 'cellIsNot', cellId: 'B2', value: 'guest' }],
    );

    expect(deductions.map((deduction) => deduction.conclusion)).toEqual([
      { kind: 'guest', cellId: 'B2' },
    ]);
    expect(deductions[0]?.technique).toBe('GLOBAL_COUNT_ALL_REMAINING');
    expect(result.satisfiable).toBe(false);
    expect(result.stats.truncated).toBe(false);
  });

  it('derives concrete non-guest objects when all remaining cells are required', () => {
    const state = makeState({
      allowedKinds: ['empty', 'bin', 'guest'],
      rules: [globalCountRule('R1', 'bin', { op: 'eq', value: 1 })],
      observations: [
        { cellId: 'A1', kind: 'empty' },
        { cellId: 'B1', kind: 'guest' },
        { cellId: 'A2', kind: 'empty' },
      ],
    });
    const deductions = deriveHumanDeductions(state);
    const result = isSatisfiable(
      { puzzle: state.puzzle, observations: state.observations },
      [{ kind: 'cellIsNot', cellId: 'B2', value: 'bin' }],
    );

    expect(deductions.map((deduction) => deduction.conclusion)).toEqual([
      { kind: 'object', cellId: 'B2', object: 'bin' },
    ]);
    expect(deductions[0]?.premises.map((premise) => premise.kind)).toEqual(['count', 'rule']);
    expect(result.satisfiable).toBe(false);
    expect(result.stats.truncated).toBe(false);
  });
});

function allDeductionsHavePremises(deductions: readonly Deduction[]): boolean {
  return deductions.every((deduction) => deduction.premises.length > 0 && deduction.proofNodeIds.length > 0);
}

function makeState(input: {
  readonly allowedKinds: readonly CellKind[];
  readonly rules: readonly RuleDefinition[];
  readonly observations: readonly Observation[];
}): KnowledgeState {
  return {
    puzzle: {
      schemaVersion: 1,
      id: 'proof-reasoner-test',
      title: 'Proof Reasoner Test',
      board: { width: 2, height: 2 },
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

function globalCountRule(id: string, target: CellKind, count: Comparator): RuleDefinition {
  return {
    id,
    type: 'globalCount',
    target,
    count,
    presentation: { title: `${target} count` },
  };
}
