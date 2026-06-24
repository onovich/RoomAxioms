import { describe, expect, it } from 'vitest';
import type { BoardSize, CellKind, Comparator, Observation, RuleDefinition } from '@room-axioms/domain';

import {
  createDeduction,
  deriveHumanDeductions,
  findExplanationGaps,
  verifyDeduction,
} from './index.js';
import type { Deduction, KnowledgeState } from './index.js';

describe('solver-backed deduction validation', () => {
  it('confirms a valid safe deduction with the public solver API', () => {
    const state = makeState({
      allowedKinds: ['empty', 'guest'],
      rules: [globalCountRule('R1', 'guest', { op: 'eq', value: 1 })],
      observations: [{ cellId: 'A1', kind: 'guest' }],
    });
    const deduction = requiredDeduction(deriveHumanDeductions(state), 'B1', 'safe');
    const result = verifyDeduction(state, deduction);

    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
    expect(result.stats.truncated).toBe(false);
  });

  it('confirms a valid object deduction by ruling out every alternative kind', () => {
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
    const deduction = deriveHumanDeductions(state).find(
      (candidate) => candidate.technique === 'UNIQUE_TARGET_NEIGHBOR_INTERSECTION',
    );

    expect(deduction).toBeDefined();
    const result = verifyDeduction(state, deduction as Deduction);

    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
    expect(result.stats.truncated).toBe(false);
  });

  it('confirms a local scope intersection safe deduction with the public solver API', () => {
    const state = localScopeIntersectionState();
    const deduction = requiredTechniqueDeduction(
      deriveHumanDeductions(state),
      'LOCAL_SCOPE_INTERSECTION',
      'B3',
    );
    const result = verifyDeduction(state, deduction);
    const gapReport = findExplanationGaps(state, deriveHumanDeductions(state));

    expect(deduction.conclusion).toEqual({ kind: 'safe', cellId: 'B3' });
    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
    expect(result.stats.truncated).toBe(false);
    expect(gapReport.forcedSafe).toContain('B3');
    expect(gapReport.explainedSafe).toContain('B3');
    expect(gapReport.issues.filter((issue) => issue.cellIds?.includes('B3'))).toEqual([]);
  });

  it('rejects a human deduction that the solver cannot confirm', () => {
    const state = makeState({
      allowedKinds: ['empty', 'guest'],
      rules: [globalCountRule('R1', 'guest', { op: 'eq', value: 1 })],
      observations: [],
    });
    const deduction = createDeduction({
      technique: 'GLOBAL_COUNT_SATURATED',
      conclusion: { kind: 'safe', cellId: 'B1' },
      ruleIds: ['R1'],
    });
    const result = verifyDeduction(state, deduction);

    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual(['INVALID_DEDUCTION']);
    expect(result.issues[0]?.deductionIds).toEqual([deduction.id]);
  });

  it('does not accept a proof when solver validation truncates', () => {
    const state = makeState({
      allowedKinds: ['empty', 'guest'],
      rules: [globalCountRule('R1', 'guest', { op: 'eq', value: 1 })],
      observations: [{ cellId: 'A1', kind: 'guest' }],
    });
    const deduction = requiredDeduction(deriveHumanDeductions(state), 'B1', 'safe');
    const result = verifyDeduction(state, deduction, { maxNodes: 0 });

    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual(['SOLVER_TRUNCATED']);
    expect(result.stats.truncated).toBe(true);
  });

  it('rejects a fabricated local scope intersection from reverse implication', () => {
    const state = reverseImplicationState();
    const deduction = createDeduction({
      technique: 'LOCAL_SCOPE_INTERSECTION',
      conclusion: { kind: 'safe', cellId: 'B1' },
      ruleIds: ['R1'],
    });
    const result = verifyDeduction(state, deduction);

    expect(deriveHumanDeductions(state).filter((item) => item.technique === 'LOCAL_SCOPE_INTERSECTION')).toEqual([]);
    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual(['INVALID_DEDUCTION']);
  });

  it('rejects a fabricated local scope intersection for unsupported overlap', () => {
    const state = suggestiveButUnforcedOverlapState();
    const deduction = createDeduction({
      technique: 'LOCAL_SCOPE_INTERSECTION',
      conclusion: { kind: 'safe', cellId: 'B3' },
      ruleIds: ['R1', 'R2'],
    });
    const result = verifyDeduction(state, deduction);

    expect(deriveHumanDeductions(state).filter((item) => item.technique === 'LOCAL_SCOPE_INTERSECTION')).toEqual([]);
    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual(['INVALID_DEDUCTION']);
  });
});

describe('explanation gap detection', () => {
  it('reports solver-forced cells that have no valid human deduction', () => {
    const state = makeState({
      allowedKinds: ['empty', 'guest'],
      rules: [globalCountRule('R1', 'guest', { op: 'eq', value: 1 })],
      observations: [{ cellId: 'A1', kind: 'guest' }],
    });
    const report = findExplanationGaps(state, []);

    expect(report.forcedSafe).toEqual(['B1', 'A2', 'B2']);
    expect(report.explainedSafe).toEqual([]);
    expect(report.issues.map((issue) => issue.code)).toEqual([
      'EXPLANATION_GAP',
      'EXPLANATION_GAP',
      'EXPLANATION_GAP',
    ]);
  });

  it('passes when valid human deductions cover every forced safe and guest cell', () => {
    const state = makeState({
      allowedKinds: ['empty', 'guest'],
      rules: [globalCountRule('R1', 'guest', { op: 'eq', value: 1 })],
      observations: [{ cellId: 'A1', kind: 'guest' }],
    });
    const deductions = deriveHumanDeductions(state);
    const report = findExplanationGaps(state, deductions);

    expect(report.forcedSafe).toEqual(['B1', 'A2', 'B2']);
    expect(report.explainedSafe).toEqual(['B1', 'A2', 'B2']);
    expect(report.issues).toEqual([]);
    expect(report.validationResults.every((result) => result.valid)).toBe(true);
  });
});

function requiredDeduction(
  deductions: readonly Deduction[],
  cellId: string,
  kind: Deduction['conclusion']['kind'],
): Deduction {
  const deduction = deductions.find((candidate) => (
    candidate.conclusion.cellId === cellId && candidate.conclusion.kind === kind
  ));
  if (deduction === undefined) throw new Error(`Missing ${kind} deduction for ${cellId}.`);
  return deduction;
}

function requiredTechniqueDeduction(
  deductions: readonly Deduction[],
  technique: Deduction['technique'],
  cellId: string,
): Deduction {
  const deduction = deductions.find((candidate) => (
    candidate.technique === technique && candidate.conclusion.cellId === cellId
  ));
  if (deduction === undefined) throw new Error(`Missing ${technique} deduction for ${cellId}.`);
  return deduction;
}

function localScopeIntersectionState(): KnowledgeState {
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

function makeState(input: {
  readonly board?: BoardSize;
  readonly allowedKinds: readonly CellKind[];
  readonly rules: readonly RuleDefinition[];
  readonly observations: readonly Observation[];
}): KnowledgeState {
  return {
    puzzle: {
      schemaVersion: 1,
      id: 'proof-validation-test',
      title: 'Proof Validation Test',
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
