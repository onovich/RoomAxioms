import { describe, expect, it } from 'vitest';
import type { Observation, PuzzleDefinition } from '@room-axioms/domain';

import {
  buildDeductionId,
  buildProofGraph,
  createDeduction,
  factNodeId,
  normalizeProofPremises,
  ruleNodeId,
} from './index.js';

describe('proof ids', () => {
  it('builds stable deduction ids from technique, conclusion, and sorted rules', () => {
    const id = buildDeductionId(
      'GLOBAL_COUNT_SATURATED',
      { kind: 'safe', cellId: 'B1' },
      ['R2', 'R1', 'R2'],
    );

    expect(id).toBe('deduction:GLOBAL_COUNT_SATURATED:safe:B1:R1+R2');
  });
});

describe('proof premise normalization', () => {
  it('deduplicates premises and normalizes cell and rule lists', () => {
    const premises = normalizeProofPremises([
      {
        kind: 'observation',
        label: 'known facts',
        cellIds: ['B1', 'A1', 'B1'],
      },
      {
        kind: 'observation',
        label: 'known facts',
        cellIds: ['A1', 'B1'],
      },
      {
        kind: 'rule',
        label: 'rules',
        ruleIds: ['R2', 'R1', 'R1'],
      },
    ]);

    expect(premises).toEqual([
      {
        kind: 'observation',
        label: 'known facts',
        cellIds: ['A1', 'B1'],
      },
      {
        kind: 'rule',
        label: 'rules',
        ruleIds: ['R1', 'R2'],
      },
    ]);
  });
});

describe('proof graph', () => {
  it('returns an empty graph for empty knowledge and deductions', () => {
    expect(buildProofGraph({ puzzle: makePuzzle(), observations: [] }, [])).toEqual({
      nodes: [],
      rootIds: [],
    });
  });

  it('links derived nodes to fact and rule parents', () => {
    const puzzle = makePuzzle();
    const deduction = createDeduction({
      technique: 'GLOBAL_COUNT_SATURATED',
      conclusion: { kind: 'safe', cellId: 'B1' },
      ruleIds: ['R1'],
      premises: [
        {
          kind: 'observation',
          label: 'A1 is known',
          cellIds: ['A1'],
        },
        {
          kind: 'rule',
          label: 'guest count rule',
          ruleIds: ['R1'],
        },
      ],
    });
    const graph = buildProofGraph(
      { puzzle, observations: [{ cellId: 'A1', kind: 'guest' }] },
      [deduction],
    );

    expect(graph.rootIds).toEqual([factNodeId('A1', 'guest'), ruleNodeId('R1')]);
    expect(graph.nodes).toMatchObject([
      {
        id: factNodeId('A1', 'guest'),
        kind: 'fact',
        parents: [],
      },
      {
        id: ruleNodeId('R1'),
        kind: 'rule',
        parents: [],
      },
      {
        id: deduction.proofNodeIds[0],
        kind: 'derived',
        parents: [factNodeId('A1', 'guest'), ruleNodeId('R1')],
      },
    ]);
  });

  it('builds the same graph for repeated calls and different deduction order', () => {
    const puzzle = makePuzzle();
    const first = createDeduction({
      technique: 'GLOBAL_COUNT_SATURATED',
      conclusion: { kind: 'safe', cellId: 'A2' },
      ruleIds: ['R1'],
      premises: [{ kind: 'rule', label: 'guest count rule', ruleIds: ['R1'] }],
    });
    const second = createDeduction({
      technique: 'KNOWN_SAFE_FROM_NON_GUEST_OBJECT',
      conclusion: { kind: 'safe', cellId: 'B1' },
      premises: [{ kind: 'observation', label: 'B1 is empty', cellIds: ['B1'] }],
    });
    const state = {
      puzzle,
      observations: [{ cellId: 'B1', kind: 'empty' }],
    } satisfies { readonly puzzle: PuzzleDefinition; readonly observations: readonly Observation[] };

    expect(buildProofGraph(state, [first, second])).toEqual(buildProofGraph(state, [second, first]));
    expect(buildProofGraph(state, [first, second])).toEqual(buildProofGraph(state, [first, second]));
  });
});

function makePuzzle(): PuzzleDefinition {
  return {
    schemaVersion: 1,
    id: 'proof-graph-test',
    title: 'Proof Graph Test',
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
