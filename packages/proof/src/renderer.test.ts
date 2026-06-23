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
