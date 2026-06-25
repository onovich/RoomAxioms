import { describe, expect, it } from 'vitest'

import {
  evaluateReviewerManifest,
  type ReviewerManifest,
  type ReviewerManifestCase,
} from './reviewerManifest.js'

describe('Phase 23 reviewer manifest', () => {
  it('accepts complete promote and reject decisions', () => {
    const report = evaluateReviewerManifest({
      schemaVersion: 1,
      phase: 'phase-23',
      cases: [
        reviewedCase({ puzzleId: 'phase-23-target-001', decision: 'promote' }),
        reviewedCase({
          puzzleId: 'phase-23-rejected-001',
          intendedBucket: 'tutorial-or-baseline',
          intendedDifficulty: 2,
          decision: 'reject',
          decisionReason: 'Rejected because the first count rule gives away the only guest.',
        }),
      ],
    }, ['phase-23-target-001'])

    expect(report).toMatchObject({
      ok: true,
      requiredPuzzleIds: ['phase-23-target-001'],
      promotedPuzzleIds: ['phase-23-target-001'],
      rejectedPuzzleIds: ['phase-23-rejected-001'],
      deferredPuzzleIds: [],
      issues: [],
    })
  })

  it('reports missing required candidates and duplicate entries', () => {
    const candidate = reviewedCase({ puzzleId: 'phase-23-target-001' })
    const manifest: ReviewerManifest = {
      schemaVersion: 1,
      phase: 'phase-23',
      cases: [candidate, candidate],
    }

    const report = evaluateReviewerManifest(manifest, ['phase-23-target-002'])

    expect(report.ok).toBe(false)
    expect(report.issues).toContainEqual(expect.objectContaining({
      code: 'DUPLICATE_CASE',
      puzzleId: 'phase-23-target-001',
    }))
    expect(report.issues).toContainEqual(expect.objectContaining({
      code: 'MISSING_REQUIRED_CASE',
      puzzleId: 'phase-23-target-002',
    }))
  })

  it('blocks promotion when evidence gates are incomplete', () => {
    const report = evaluateReviewerManifest({
      schemaVersion: 1,
      phase: 'phase-23',
      cases: [
        reviewedCase({
          puzzleId: 'phase-23-target-001',
          gateEvidence: {
            ...passingGateEvidence(),
            degeneracy: {
              status: 'warning',
              summary: 'Near-count giveaway requires reviewer attention.',
            },
          },
        }),
      ],
    })

    expect(report.ok).toBe(false)
    expect(report.issues).toContainEqual(expect.objectContaining({
      code: 'PROMOTION_GATE_INCOMPLETE',
      puzzleId: 'phase-23-target-001',
    }))
  })

  it('requires intended difficulty to match the selected bucket', () => {
    const report = evaluateReviewerManifest({
      schemaVersion: 1,
      phase: 'phase-23',
      cases: [
        reviewedCase({
          puzzleId: 'phase-23-super-hard-001',
          intendedBucket: 'super-hard-6-7',
          intendedDifficulty: 4,
          decision: 'defer',
          decisionReason: 'Deferred because the candidate is not actually super-hard.',
        }),
      ],
    })

    expect(report.ok).toBe(false)
    expect(report.issues).toContainEqual(expect.objectContaining({
      code: 'DIFFICULTY_BUCKET_MISMATCH',
      puzzleId: 'phase-23-super-hard-001',
    }))
  })
})

function reviewedCase(
  overrides: Partial<ReviewerManifestCase> = {},
): ReviewerManifestCase {
  return {
    puzzleId: 'phase-23-target-001',
    path: 'content/experimental/phase-23/phase-23-target-001.json',
    intendedBucket: 'target-4',
    intendedDifficulty: 4,
    intendedPlayerExperience: 'The player must combine two public scopes before the final guest pair becomes forced.',
    noveltyClaim: 'Uses a two-frontier rule interaction not present in the accepted baseline selector.',
    reviewerNote: 'Candidate evidence is private authoring material and not playtest calibration.',
    gateEvidence: passingGateEvidence(),
    decision: 'promote',
    decisionReason: 'All required gates passed and the reviewer note explains the intended hard turn.',
    ...overrides,
  }
}

function passingGateEvidence(): ReviewerManifestCase['gateEvidence'] {
  return {
    authoringReport: { status: 'pass', summary: 'report ok true' },
    authoringScore: { status: 'pass', summary: 'score present, calibratedWithRealPlaytest false' },
    degeneracy: { status: 'pass', summary: 'no singleton or direct giveaway findings' },
    ruleFamily: { status: 'pass', summary: 'three material rule families' },
    antiClone: { status: 'pass', summary: 'no anti-clone evidence groups' },
    copyReview: { status: 'pass', summary: 'player-facing copy reviewed' },
    runtime: { status: 'pass', summary: 'focused web runtime smoke passed' },
  }
}
