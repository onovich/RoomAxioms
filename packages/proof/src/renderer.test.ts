import { describe, expect, it } from 'vitest';
import type { Observation, PuzzleDefinition } from '@room-axioms/domain';

import {
  buildProofGraph,
  createDeduction,
  factNodeId,
  renderProofText,
  ruleNodeId,
} from './index.js';

describe('proof text rendering', () => {
  it('renders graph nodes in stable fact, rule, derived order', () => {
    const state = {
      puzzle: makePuzzle(),
      observations: [{ cellId: 'A1', kind: 'guest' }],
    } satisfies { readonly puzzle: PuzzleDefinition; readonly observations: readonly Observation[] };
    const deduction = createDeduction({
      technique: 'GLOBAL_COUNT_SATURATED',
      conclusion: { kind: 'safe', cellId: 'B1' },
      ruleIds: ['R1'],
      premises: [
        { kind: 'rule', label: 'guest count rule', ruleIds: ['R1'] },
        { kind: 'observation', label: 'A1 is known', cellIds: ['A1'] },
      ],
    });
    const graph = buildProofGraph(state, [deduction]);
    const shuffledGraph = {
      ...graph,
      nodes: [...graph.nodes].reverse(),
    };

    expect(renderProofText(shuffledGraph)).toEqual([
      `[FACT] ${factNodeId('A1', 'guest')}: A1 is guest`,
      `[RULE] ${ruleNodeId('R1')}: R1: one guest`,
      `[DERIVED] ${deduction.proofNodeIds[0]}: GLOBAL_COUNT_SATURATED: B1 is safe <- ${factNodeId('A1', 'guest')}, ${ruleNodeId('R1')}`,
    ]);
    expect(renderProofText(shuffledGraph)).toEqual(renderProofText(graph));
  });

  it('renders local scope intersection deductions with stable public parents', () => {
    const state = {
      puzzle: makeLocalScopePuzzle(),
      observations: [
        { cellId: 'B1', kind: 'mirror' },
        { cellId: 'B2', kind: 'bottle' },
      ],
    } satisfies { readonly puzzle: PuzzleDefinition; readonly observations: readonly Observation[] };
    const deduction = createDeduction({
      technique: 'LOCAL_SCOPE_INTERSECTION',
      conclusion: { kind: 'safe', cellId: 'B3' },
      ruleIds: ['R2', 'R1'],
      premises: [
        { kind: 'rule', label: 'mirror local guest count', ruleIds: ['R1'] },
        { kind: 'rule', label: 'bottle local guest count', ruleIds: ['R2'] },
        { kind: 'observation', label: 'B1 is known', cellIds: ['B1'] },
        { kind: 'observation', label: 'B2 is known', cellIds: ['B2'] },
        { kind: 'scope', label: 'shared public scope overlap', cellIds: ['A2', 'C1'], ruleIds: ['R1', 'R2'] },
      ],
    });
    const graph = buildProofGraph(state, [deduction]);

    expect(renderProofText(graph)).toEqual([
      `[FACT] ${factNodeId('B1', 'mirror')}: B1 is mirror`,
      `[FACT] ${factNodeId('B2', 'bottle')}: B2 is bottle`,
      `[RULE] ${ruleNodeId('R1')}: R1: mirror sees two guests`,
      `[RULE] ${ruleNodeId('R2')}: R2: bottle sees one guest`,
      `[DERIVED] ${deduction.proofNodeIds[0]}: LOCAL_SCOPE_INTERSECTION: B3 is safe <- ${factNodeId('B1', 'mirror')}, ${factNodeId('B2', 'bottle')}, ${ruleNodeId('R1')}, ${ruleNodeId('R2')}`,
    ]);
  });

  it('renders local scope difference deductions with stable public parents', () => {
    const state = {
      puzzle: makeLocalScopePuzzle(),
      observations: [
        { cellId: 'B1', kind: 'mirror' },
        { cellId: 'B2', kind: 'bottle' },
      ],
    } satisfies { readonly puzzle: PuzzleDefinition; readonly observations: readonly Observation[] };
    const deduction = createDeduction({
      technique: 'LOCAL_SCOPE_DIFFERENCE',
      conclusion: { kind: 'guest', cellId: 'B3' },
      ruleIds: ['R2', 'R1'],
      premises: [
        { kind: 'rule', label: 'mirror local guest count', ruleIds: ['R1'] },
        { kind: 'rule', label: 'bottle local guest count', ruleIds: ['R2'] },
        { kind: 'observation', label: 'B1 is known', cellIds: ['B1'] },
        { kind: 'observation', label: 'B2 is known', cellIds: ['B2'] },
        { kind: 'scope', label: 'difference public scope cells', cellIds: ['B3'], ruleIds: ['R1', 'R2'] },
      ],
    });
    const graph = buildProofGraph(state, [deduction]);

    expect(renderProofText(graph)).toEqual([
      `[FACT] ${factNodeId('B1', 'mirror')}: B1 is mirror`,
      `[FACT] ${factNodeId('B2', 'bottle')}: B2 is bottle`,
      `[RULE] ${ruleNodeId('R1')}: R1: mirror sees two guests`,
      `[RULE] ${ruleNodeId('R2')}: R2: bottle sees one guest`,
      `[DERIVED] ${deduction.proofNodeIds[0]}: LOCAL_SCOPE_DIFFERENCE: B3 is guest <- ${factNodeId('B1', 'mirror')}, ${factNodeId('B2', 'bottle')}, ${ruleNodeId('R1')}, ${ruleNodeId('R2')}`,
    ]);
  });
});

function makePuzzle(): PuzzleDefinition {
  return {
    schemaVersion: 1,
    id: 'proof-renderer-test',
    title: 'Proof Renderer Test',
    board: { width: 2, height: 2 },
    allowedKinds: ['empty', 'guest'],
    rules: [
      {
        id: 'R1',
        type: 'globalCount',
        target: 'guest',
        count: { op: 'eq', value: 1 },
        presentation: { title: 'one guest' },
      },
    ],
    initialReveals: [],
    target: {},
    metadata: {
      difficulty: 1,
      tags: ['proof-test'],
      status: 'draft',
    },
  };
}

function makeLocalScopePuzzle(): PuzzleDefinition {
  return {
    schemaVersion: 1,
    id: 'proof-renderer-local-scope-test',
    title: 'Proof Renderer Local Scope Test',
    board: { width: 3, height: 3 },
    allowedKinds: ['empty', 'bottle', 'mirror', 'guest'],
    rules: [
      {
        id: 'R1',
        type: 'forEachCount',
        subject: 'mirror',
        scope: { kind: 'adjacent' },
        target: 'guest',
        count: { op: 'eq', value: 2 },
        presentation: { title: 'mirror sees two guests' },
      },
      {
        id: 'R2',
        type: 'forEachCount',
        subject: 'bottle',
        scope: { kind: 'orthogonal' },
        target: 'guest',
        count: { op: 'eq', value: 1 },
        presentation: { title: 'bottle sees one guest' },
      },
    ],
    initialReveals: [],
    target: {},
    metadata: {
      difficulty: 1,
      tags: ['proof-test'],
      status: 'draft',
    },
  };
}
