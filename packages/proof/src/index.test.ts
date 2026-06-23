import { describe, expect, it } from 'vitest';
import type { KnowledgeState, VerificationReport } from './index.js';

import { PROOF_PACKAGE_NAME } from './index.js';

describe('@room-axioms/proof package boundary', () => {
  it('exports a stable package marker and public proof types', () => {
    const state: KnowledgeState = {
      puzzle: {
        schemaVersion: 1,
        id: 'proof-boundary-test',
        title: 'Proof Boundary Test',
        board: { width: 1, height: 1 },
        allowedKinds: ['empty', 'guest'],
        rules: [],
        initialReveals: [],
        target: {},
        metadata: {
          difficulty: 1,
          tags: ['proof-test'],
          status: 'draft',
        },
      },
      observations: [],
    };
    const report: VerificationReport = {
      satisfiable: true,
      targetSatisfiesRules: true,
      guestLayoutUniqueAtEnd: false,
      noGuess: false,
      humanExplainable: false,
      waves: [],
      issues: [],
      metrics: {
        waveCount: 0,
        deductionCount: 0,
        revealedSafeCount: 0,
        confirmedGuestCount: 0,
        techniqueIds: [],
      },
    };

    expect(PROOF_PACKAGE_NAME).toBe('@room-axioms/proof');
    expect(state.observations).toEqual([]);
    expect(report.metrics.waveCount).toBe(0);
  });
});
