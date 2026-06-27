import { describe, expect, it } from 'vitest'

import {
  evaluateSkeletonReview,
  type SkeletonReviewClaims,
  type SkeletonReviewInput,
  type SkeletonReviewMetrics,
} from './skeletonReview.js'

describe('Phase 29 skeleton review helper', () => {
  it('recommends translation only when every target-4 pre-JSON gate passes', () => {
    const report = evaluateSkeletonReview(reviewInput())

    expect(report).toMatchObject({
      skeletonId: 'phase-29-overlap-frontier',
      status: 'pass',
      missingClaimIds: [],
      translationRecommended: true,
    })
    expect(report.gates.every((gate) => gate.status === 'pass')).toBe(true)
  })

  it('warns when opening ambiguity is valid but thin', () => {
    const report = evaluateSkeletonReview(reviewInput({
      metrics: {
        ...passingMetrics(),
        initialGuestLayouts: 3,
      },
    }))

    expect(report.status).toBe('warning')
    expect(report.translationRecommended).toBe(false)
    expect(report.gates).toContainEqual(expect.objectContaining({
      id: 'opening-ambiguity',
      status: 'warning',
    }))
  })

  it('fails hard-stop target-4 blockers before JSON translation', () => {
    const report = evaluateSkeletonReview(reviewInput({
      metrics: {
        ...passingMetrics(),
        effectiveUnknownCells: 7,
        initialGuestLayouts: 1,
        redundantRuleCount: 1,
        hardDegeneracyRiskCount: 1,
      },
      claims: {
        ...passingClaims(),
        antiDegeneracy: '',
      },
    }))

    expect(report.status).toBe('fail')
    expect(report.translationRecommended).toBe(false)
    expect(report.missingClaimIds).toEqual(['antiDegeneracy'])
    expect(report.gates).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'effective-unknown-space', status: 'fail' }),
      expect.objectContaining({ id: 'opening-ambiguity', status: 'fail' }),
      expect.objectContaining({ id: 'redundant-rules', status: 'fail' }),
      expect.objectContaining({ id: 'hard-degeneracy-risks', status: 'fail' }),
      expect.objectContaining({ id: 'required-claims', status: 'fail' }),
    ]))
  })
})

function reviewInput(overrides: Partial<SkeletonReviewInput> = {}): SkeletonReviewInput {
  return {
    skeletonId: 'phase-29-overlap-frontier',
    title: 'Overlap frontier with late shared-variable pressure',
    metrics: passingMetrics(),
    claims: passingClaims(),
    ...overrides,
  }
}

function passingMetrics(): SkeletonReviewMetrics {
  return {
    effectiveUnknownCells: 14,
    initialGuestLayouts: 12,
    proofWaveCount: 4,
    deductionCount: 9,
    materialRuleFamilyCount: 4,
    sharedVariableGroupCount: 2,
    lateFrontierUnlockCount: 1,
    redundantRuleCount: 0,
    hardDegeneracyRiskCount: 0,
  }
}

function passingClaims(): SkeletonReviewClaims {
  return {
    openingAmbiguity: 'Opening has many guest layouts and no singleton scope.',
    waveChain: 'Each wave depends on at least one prior public deduction.',
    sharedVariable: 'Two rules compete for the same uncertain middle frontier cells.',
    antiDegeneracy: 'No direct count, near-count, sightline, or region giveaway appears.',
    minimizeExpectation: 'The overlap and conditional rules must survive minimization.',
    grammarMapping: 'Maps to region count, scope overlap count, conditional count, and anchor count.',
    expectedDiagnostics: 'Expected diagnostics should show no hard degeneracy findings.',
  }
}
