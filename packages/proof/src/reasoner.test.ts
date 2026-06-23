import { sortCellIds } from '@room-axioms/domain';
import { assertPuzzleDefinition } from '@room-axioms/schema';
import { findForcedCells, isSatisfiable } from '@room-axioms/solver';
import { describe, expect, it } from 'vitest';
import type { BoardSize, CellId, CellKind, Comparator, Observation, PuzzleDefinition, RuleDefinition } from '@room-axioms/domain';
import case004Fixture from '../../../content/cases/case-004.json' with { type: 'json' };

import { buildProofGraph, deriveHumanDeductions } from './index.js';
import type { Deduction, KnowledgeState } from './index.js';

const CASE004_BUDGET = { maxNodes: 200_000, maxModels: 200_000 } as const;

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

    expect(conclusionsFor(deductions, 'GLOBAL_COUNT_ALL_REMAINING')).toEqual([
      { kind: 'object', cellId: 'B2', object: 'bin' },
    ]);
    expect(conclusionsFor(deductions, 'KNOWN_SAFE_FROM_NON_GUEST_OBJECT')).toEqual([
      { kind: 'safe', cellId: 'B2' },
    ]);
    expect(deductions[0]?.premises.map((premise) => premise.kind)).toEqual(['count', 'rule']);
    expect(result.satisfiable).toBe(false);
    expect(result.stats.truncated).toBe(false);
  });
});

describe('local count human techniques', () => {
  it('derives safe cells when a local guest count is saturated', () => {
    const state = makeState({
      board: { width: 3, height: 3 },
      allowedKinds: ['empty', 'bottle', 'guest'],
      rules: [
        forEachCountRule('R1', 'bottle', 'orthogonal', 'guest', { op: 'eq', value: 0 }),
      ],
      observations: [{ cellId: 'B2', kind: 'bottle' }],
    });
    const deductions = deriveHumanDeductions(state);
    const forced = findForcedCells({ puzzle: state.puzzle, observations: state.observations });

    expect(conclusionsFor(deductions, 'LOCAL_COUNT_SATURATED')).toEqual([
      { kind: 'safe', cellId: 'B1' },
      { kind: 'safe', cellId: 'A2' },
      { kind: 'safe', cellId: 'C2' },
      { kind: 'safe', cellId: 'B3' },
    ]);
    expect(forced.safe).toEqual(['B1', 'A2', 'C2', 'B3']);
  });

  it('derives guests when a local rule requires all remaining scoped cells', () => {
    const state = makeState({
      board: { width: 3, height: 3 },
      allowedKinds: ['empty', 'mirror', 'guest'],
      rules: [
        forEachCountRule('R1', 'mirror', 'adjacent', 'guest', { op: 'eq', value: 1 }),
      ],
      observations: [
        { cellId: 'B2', kind: 'mirror' },
        { cellId: 'A1', kind: 'empty' },
        { cellId: 'B1', kind: 'empty' },
        { cellId: 'C1', kind: 'empty' },
        { cellId: 'A2', kind: 'empty' },
        { cellId: 'C2', kind: 'empty' },
        { cellId: 'A3', kind: 'empty' },
        { cellId: 'B3', kind: 'empty' },
      ],
    });
    const deductions = deriveHumanDeductions(state);
    const result = isSatisfiable(
      { puzzle: state.puzzle, observations: state.observations },
      [{ kind: 'cellIsNot', cellId: 'C3', value: 'guest' }],
    );

    expect(conclusionsFor(deductions, 'LOCAL_COUNT_ALL_REMAINING')).toEqual([
      { kind: 'guest', cellId: 'C3' },
    ]);
    expect(result.satisfiable).toBe(false);
    expect(result.stats.truncated).toBe(false);
  });

  it('derives concrete local objects and then safe cells from those objects', () => {
    const state = makeState({
      board: { width: 3, height: 3 },
      allowedKinds: ['empty', 'bottle', 'bin', 'guest'],
      rules: [
        forEachCountRule('R1', 'bottle', 'orthogonal', 'bin', { op: 'eq', value: 1 }),
      ],
      observations: [
        { cellId: 'B2', kind: 'bottle' },
        { cellId: 'B1', kind: 'empty' },
        { cellId: 'A2', kind: 'empty' },
        { cellId: 'C2', kind: 'empty' },
      ],
    });
    const deductions = deriveHumanDeductions(state);
    const objectResult = isSatisfiable(
      { puzzle: state.puzzle, observations: state.observations },
      [{ kind: 'cellIsNot', cellId: 'B3', value: 'bin' }],
    );
    const safeResult = isSatisfiable(
      { puzzle: state.puzzle, observations: state.observations },
      [{ kind: 'cellIs', cellId: 'B3', value: 'guest' }],
    );
    const graph = buildProofGraph(state, deductions);
    const objectDeduction = deductions.find((deduction) => deduction.conclusion.kind === 'object');
    const safeDeduction = deductions.find((deduction) => deduction.technique === 'KNOWN_SAFE_FROM_NON_GUEST_OBJECT');

    expect(conclusionsFor(deductions, 'LOCAL_COUNT_ALL_REMAINING')).toEqual([
      { kind: 'object', cellId: 'B3', object: 'bin' },
    ]);
    expect(conclusionsFor(deductions, 'KNOWN_SAFE_FROM_NON_GUEST_OBJECT')).toEqual([
      { kind: 'safe', cellId: 'B3' },
    ]);
    expect(objectResult.satisfiable).toBe(false);
    expect(safeResult.satisfiable).toBe(false);
    const safeNode = graph.nodes.find((node) => node.id === safeDeduction?.proofNodeIds[0]);
    expect(safeNode?.parents).toContain(objectDeduction?.proofNodeIds[0]);
  });
});

describe('unique target neighbor intersection technique', () => {
  it('derives a single object from intersecting required target scopes', () => {
    const state = makeState({
      board: { width: 3, height: 3 },
      allowedKinds: ['empty', 'bottle', 'bin', 'guest'],
      rules: [
        globalCountRule('R1', 'bin', { op: 'eq', value: 1 }),
        forEachCountRule('R2', 'bottle', 'orthogonal', 'bin', { op: 'eq', value: 1 }),
      ],
      observations: [
        { cellId: 'A2', kind: 'bottle' },
        { cellId: 'C2', kind: 'bottle' },
      ],
    });
    const deductions = deriveHumanDeductions(state);
    const result = isSatisfiable(
      { puzzle: state.puzzle, observations: state.observations },
      [{ kind: 'cellIsNot', cellId: 'B2', value: 'bin' }],
    );

    expect(conclusionsFor(deductions, 'UNIQUE_TARGET_NEIGHBOR_INTERSECTION')).toEqual([
      { kind: 'object', cellId: 'B2', object: 'bin' },
    ]);
    expect(conclusionsFor(deductions, 'KNOWN_SAFE_FROM_NON_GUEST_OBJECT')).toEqual([
      { kind: 'safe', cellId: 'B2' },
    ]);
    expect(result.satisfiable).toBe(false);
    expect(result.stats.truncated).toBe(false);
  });

  it('reproduces the case-004 initial explainable safe chain without extra cells', () => {
    const puzzle = loadCase004();
    const state = {
      puzzle,
      observations: initialObservations(puzzle),
    };
    const deductions = deriveHumanDeductions(state);
    const forced = findForcedCells({ puzzle, observations: state.observations }, CASE004_BUDGET);
    const observedCells = new Set(state.observations.map((observation) => observation.cellId));
    const safeCellIds = sortCellIds(
      new Set(deductions
        .filter((deduction) => deduction.conclusion.kind === 'safe')
        .map((deduction) => deduction.conclusion.cellId)
        .filter((cellId) => !observedCells.has(cellId))),
      puzzle.board,
    );

    expect(conclusionsFor(deductions, 'UNIQUE_TARGET_NEIGHBOR_INTERSECTION')).toEqual([
      { kind: 'object', cellId: 'B2', object: 'bin' },
    ]);
    expect(safeCellIds).toEqual(['A1', 'C1', 'B2', 'D2', 'A3', 'B3', 'C3']);
    expect(safeCellIds).toEqual(forced.safe);
    expect(forced.guests).toEqual([]);
    expect(forced.stats.truncated).toBe(false);
    expect(allDeductionsHavePremises(deductions)).toBe(true);
  });
});

function allDeductionsHavePremises(deductions: readonly Deduction[]): boolean {
  return deductions.every((deduction) => deduction.premises.length > 0 && deduction.proofNodeIds.length > 0);
}

function loadCase004(): PuzzleDefinition {
  return assertPuzzleDefinition(case004Fixture);
}

function initialObservations(puzzle: PuzzleDefinition): readonly Observation[] {
  return puzzle.initialReveals.map((cellId) => observationFromTarget(puzzle, cellId));
}

function observationFromTarget(puzzle: PuzzleDefinition, cellId: CellId): Observation {
  return {
    cellId,
    kind: puzzle.target[cellId],
  };
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
      id: 'proof-reasoner-test',
      title: 'Proof Reasoner Test',
      board: input.board ?? { width: 2, height: 2 },
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

function conclusionsFor(deductions: readonly Deduction[], technique: Deduction['technique']): readonly Deduction['conclusion'][] {
  return deductions
    .filter((deduction) => deduction.technique === technique)
    .map((deduction) => deduction.conclusion);
}
