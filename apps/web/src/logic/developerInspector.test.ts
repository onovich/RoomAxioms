import { describe, expect, it } from 'vitest'

import { createDeveloperInspectorModel } from './developerInspector'
import type { AnalysisResult } from './analysis'
import type { RuntimeAnalysis } from '../runtime/contracts'

describe('developer inspector model', () => {
  it('does not expose inspector data when developer mode is off', () => {
    expect(
      createDeveloperInspectorModel({
        devMode: false,
        requestId: 1,
        status: 'ready',
        analysis: fakeAnalysis(),
        runtimeAnalysis: fakeRuntimeAnalysis(),
        warnings: [],
        error: null,
      }),
    ).toBeNull()
  })

  it('summarizes runtime verification details when developer mode is on', () => {
    const model = createDeveloperInspectorModel({
      devMode: true,
      requestId: 7,
      status: 'ready',
      analysis: {
        ...fakeAnalysis(),
        layoutCount: 20,
        layoutCountGreaterThan: 20,
        forcedSafe: ['A1'],
        forcedGuests: ['D1'],
      },
      runtimeAnalysis: fakeRuntimeAnalysis(),
      warnings: [{ code: 'SOLVER_TRUNCATED', message: 'budget reached' }],
      error: null,
    })

    expect(model).toMatchObject({
      request: 'ready #7',
      candidateGuestLayouts: '>20',
      forcedSafe: 'A1',
      forcedGuests: 'D1',
      proofStats: '3 deductions / 2 lines / 0 issues',
      noGuess: 'no-guess pass / human pass / unique end',
      warnings: 'SOLVER_TRUNCATED',
      proofLines: ['line 1', 'line 2'],
    })
  })
})

function fakeAnalysis(): AnalysisResult {
  return {
    layouts: [],
    layoutCount: 0,
    binCandidates: [],
    forcedSafe: [],
    forcedGuests: [],
    unique: false,
    satisfiable: true,
    truncated: false,
    stats: {
      nodeCount: 1,
      propagationCount: 2,
      truncated: false,
    },
    elapsed: 0,
  }
}

function fakeRuntimeAnalysis(): RuntimeAnalysis {
  return {
    requestId: 1,
    status: 'ready',
    satisfiable: true,
    candidateGuestLayouts: 1,
    guestLayoutUnique: true,
    uniqueGuestCells: ['D1', 'B4'],
    binCandidates: ['B2'],
    forcedSafe: ['A1'],
    forcedGuests: ['D1'],
    hint: null,
    proofLines: ['line 1', 'line 2'],
    noGuess: {
      noGuess: true,
      humanExplainable: true,
      guestLayoutUniqueAtEnd: true,
      finalGuestCells: ['D1', 'B4'],
      issues: [],
      metrics: {
        waveCount: 1,
        deductionCount: 3,
        revealedSafeCount: 1,
        confirmedGuestCount: 1,
        techniqueIds: ['LOCAL_COUNT_SATURATED'],
      },
    },
    stats: {
      elapsedMs: 5,
      solver: {
        nodeCount: 10,
        propagationCount: 20,
        truncated: false,
      },
      proof: {
        deductionCount: 3,
        proofLineCount: 2,
        issueCount: 0,
      },
    },
    warnings: [],
  }
}
