import { assertPuzzleDefinition } from '@room-axioms/schema';
import { describe, expect, it } from 'vitest';
import type { BoardSize, CellKind, Comparator, PuzzleDefinition, RuleDefinition } from '@room-axioms/domain';
import case004Fixture from '../../../content/cases/case-004.json' with { type: 'json' };

import { verifyNoGuess } from './index.js';

const CASE004_BUDGET = { maxNodes: 200_000, maxModels: 200_000 } as const;

describe('no-guess verifier', () => {
  it('verifies the schema-loaded case-004 human chain through the final unique layout', () => {
    const report = verifyNoGuess(loadCase004(), {
      solver: CASE004_BUDGET,
      maxWaves: 5,
    });

    expect(report.satisfiable).toBe(true);
    expect(report.targetSatisfiesRules).toBe(true);
    expect(report.noGuess).toBe(true);
    expect(report.humanExplainable).toBe(true);
    expect(report.guestLayoutUniqueAtEnd).toBe(true);
    expect(report.finalGuestCells).toEqual(['D1', 'B4']);
    expect(report.issues).toEqual([]);
    expect(report.waves).toHaveLength(1);
    expect(report.waves[0]?.revealed.map((observation) => observation.cellId)).toEqual([
      'A1',
      'C1',
      'B2',
      'D2',
      'A3',
      'B3',
      'C3',
    ]);
    expect(report.metrics).toMatchObject({
      waveCount: 1,
      revealedSafeCount: 7,
      confirmedGuestCount: 0,
    });
    expect(report.metrics.techniqueIds).toEqual([
      'KNOWN_SAFE_FROM_NON_GUEST_OBJECT',
      'LOCAL_COUNT_SATURATED',
      'UNIQUE_TARGET_NEIGHBOR_INTERSECTION',
    ]);
  });

  it('uses local scope intersection to cover one forced cell while preserving another explanation gap', () => {
    const report = verifyNoGuess(localScopeIntersectionPuzzle(), { maxWaves: 3 });
    const firstWave = report.waves[0];

    expect(report.satisfiable).toBe(true);
    expect(report.targetSatisfiesRules).toBe(true);
    expect(report.noGuess).toBe(false);
    expect(report.guestLayoutUniqueAtEnd).toBe(false);
    expect(report.issues.map((issue) => issue.code)).toEqual(['EXPLANATION_GAP']);
    expect(report.issues.flatMap((issue) => issue.cellIds ?? [])).toEqual(['C1']);
    expect(report.issues.flatMap((issue) => issue.cellIds ?? [])).not.toContain('B3');
    expect(firstWave?.issues.map((issue) => issue.code)).toEqual(['EXPLANATION_GAP']);
    expect(firstWave?.deductions.some((deduction) => deduction.technique === 'LOCAL_SCOPE_INTERSECTION')).toBe(true);
    expect(firstWave?.deductions.some((deduction) => (
      deduction.technique === 'LOCAL_SCOPE_INTERSECTION' &&
      deduction.conclusion.kind === 'safe' &&
      deduction.conclusion.cellId === 'B3'
    ))).toBe(true);
    expect(firstWave?.revealed).toEqual([]);
    expect(report.metrics.techniqueIds).toContain('LOCAL_SCOPE_INTERSECTION');
  });

  it('reports a guess point when no human deduction can advance a non-unique layout', () => {
    const report = verifyNoGuess(makePuzzle({
      allowedKinds: ['empty', 'guest'],
      rules: [globalCountRule('R1', 'guest', { op: 'eq', value: 1 })],
      initialReveals: [],
      target: {
        A1: 'guest',
        B1: 'empty',
        A2: 'empty',
        B2: 'empty',
      },
    }));

    expect(report.noGuess).toBe(false);
    expect(report.guestLayoutUniqueAtEnd).toBe(false);
    expect(report.issues.map((issue) => issue.code)).toEqual(['GUESS_POINT']);
    expect(report.waves).toHaveLength(1);
    expect(report.waves[0]?.deductions).toEqual([]);
  });
});

function loadCase004(): PuzzleDefinition {
  return assertPuzzleDefinition(case004Fixture);
}

function makePuzzle(input: {
  readonly board?: BoardSize;
  readonly allowedKinds: readonly CellKind[];
  readonly rules: readonly RuleDefinition[];
  readonly initialReveals: readonly string[];
  readonly target: Readonly<Record<string, CellKind>>;
}): PuzzleDefinition {
  return {
    schemaVersion: 1,
    id: 'proof-verifier-test',
    title: 'Proof Verifier Test',
    board: input.board ?? { width: 2, height: 2 },
    allowedKinds: input.allowedKinds,
    rules: input.rules,
    initialReveals: input.initialReveals,
    target: input.target,
    metadata: {
      difficulty: 1,
      tags: ['proof-test'],
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
    presentation: { title: `${target} count` },
  };
}

function localScopeIntersectionPuzzle(): PuzzleDefinition {
  return makePuzzle({
    board: { width: 3, height: 3 },
    allowedKinds: ['empty', 'bottle', 'mirror', 'guest'],
    rules: [
      forEachCountRule('R1', 'bottle', 'orthogonal', 'guest', { op: 'eq', value: 1 }),
      forEachCountRule('R2', 'mirror', 'adjacent', 'guest', { op: 'eq', value: 2 }),
    ],
    initialReveals: ['A1', 'B1', 'B2'],
    target: {
      A1: 'empty',
      B1: 'mirror',
      C1: 'guest',
      A2: 'guest',
      B2: 'bottle',
      C2: 'empty',
      A3: 'empty',
      B3: 'empty',
      C3: 'empty',
    },
  });
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
