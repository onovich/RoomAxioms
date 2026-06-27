import { describe, expect, it } from 'vitest'

import type { PuzzleDefinition } from '@room-axioms/domain'

import { contentCases } from '../content/cases'
import {
  experimentalWorkbenchCases,
  getWorkbenchCaseImportById,
} from './caseLibrary'
import {
  createWorkbenchDraftFromPuzzle,
  defaultWorkbenchDiagnosticsCaps,
  evaluateWorkbenchDiagnostics,
} from './model'

describe('authoring workbench real-case QA', () => {
  it('loads representative rejected and experimental QA cases privately', () => {
    const experimentalIds = experimentalWorkbenchCases.map((item) => item.puzzle.id)
    const playerCaseIds = contentCases.map((puzzle) => puzzle.id)

    expect(experimentalIds).toContain('phase-23-probe-022')
    expect(playerCaseIds).not.toContain('phase-23-probe-022')
    expect(getWorkbenchCaseImportById('phase-23-probe-022')).toMatchObject({
      source: 'experimental',
      sourcePath: 'content/experimental/phase-23/rejected/phase-23-probe-022-double-row-anchor-chain.json',
    })
  })

  it('runs workbench diagnostics across shipped baseline QA cases', () => {
    const summaries = [
      summarizeCase('case-004'),
      summarizeCase('case-011'),
      summarizeCase('case-012'),
      summarizeCase('case-021'),
    ]

    expect(summaries).toEqual([
      expect.objectContaining({
        id: 'case-004',
        metadataDifficulty: 2,
        status: 'valid-review-needed',
        recommendation: 'ready-for-experimental-review',
        correctness: 'pass',
        humanProof: 'pass',
        quality: 'warning',
        difficultyBucket: 'tutorial-or-baseline',
        targetFour: false,
        proofWaves: 1,
        proofDeductions: 13,
        copyWarnings: expect.arrayContaining(['COPY_INTERNAL_TERM']),
      }),
      expect.objectContaining({
        id: 'case-011',
        metadataDifficulty: 3,
        status: 'valid-review-needed',
        correctness: 'pass',
        humanProof: 'pass',
        quality: 'fail',
        materialFamilyCount: 1,
        difficultyBucket: 'tutorial-or-baseline',
        targetFour: false,
        proofWaves: 1,
        proofDeductions: 5,
      }),
      expect.objectContaining({
        id: 'case-012',
        metadataDifficulty: 3,
        status: 'valid-review-needed',
        correctness: 'pass',
        humanProof: 'pass',
        quality: 'pass',
        difficultyBucket: 'tutorial-or-baseline',
        targetFour: false,
        proofWaves: 1,
        proofDeductions: 7,
      }),
      expect.objectContaining({
        id: 'case-021',
        metadataDifficulty: 3,
        status: 'valid-review-needed',
        correctness: 'pass',
        humanProof: 'pass',
        quality: 'warning',
        difficultyBucket: 'target-4',
        targetFour: true,
        proofWaves: 4,
        proofDeductions: 13,
        copyWarnings: expect.arrayContaining(['COPY_DIRECT_SAFE_GIVEAWAY']),
      }),
    ])

    for (const summary of summaries) {
      expect(summary.performance).toBe('pass')
      expect(summary.noGuess).toBe(true)
      expect(summary.uniqueFinalGuests).toBe(true)
    }
  }, 90_000)

  it('rejects representative failed and bad-case QA cases with the intended signals', () => {
    const rejectedProbe = summarizeCase('phase-23-probe-022')
    const singleton = summarizeCase('phase-25-singleton-region-giveaway')
    const oneRule = summarizeCase('phase-25-one-rule-solution')
    const padded = summarizeCase('phase-25-one-rule-solution-padded', [
      getWorkbenchCaseImportById('phase-25-one-rule-solution').puzzle,
    ])

    expect(rejectedProbe).toMatchObject({
      status: 'valid-not-unique',
      recommendation: 'repair-proof',
      humanProof: 'fail',
      noGuess: false,
      uniqueFinalGuests: false,
      copyWarnings: expect.arrayContaining(['COPY_INTERNAL_TERM', 'COPY_DIRECT_SAFE_GIVEAWAY']),
    })
    expect(singleton).toMatchObject({
      status: 'valid-degenerate',
      quality: 'fail',
      targetFour: false,
      materialFamilyCount: 1,
      copyWarnings: expect.arrayContaining([
        'COPY_INTERNAL_TERM',
        'COPY_SCOPE_NEEDS_EXPLICIT_TEXT',
        'COPY_DIRECT_SAFE_GIVEAWAY',
      ]),
    })
    expect(oneRule).toMatchObject({
      status: 'valid-review-needed',
      quality: 'fail',
      proofWaves: 0,
      proofDeductions: 0,
      materialFamilyCount: 1,
      targetFour: false,
    })
    expect(padded).toMatchObject({
      status: 'valid-review-needed',
      cloneRisk: 'fail',
      cloneHardFailures: expect.any(Number),
      quality: 'fail',
      targetFour: false,
    })
    expect(padded.cloneHardFailures).toBeGreaterThan(0)
  }, 90_000)
})

interface RealCaseQaSummary {
  readonly id: string
  readonly metadataDifficulty: PuzzleDefinition['metadata']['difficulty']
  readonly status: NonNullable<ReturnType<typeof evaluateWorkbenchDiagnostics>>['status']
  readonly recommendation: NonNullable<ReturnType<typeof evaluateWorkbenchDiagnostics>>['validation']['recommendation']
  readonly correctness: string | undefined
  readonly humanProof: string | undefined
  readonly quality: string | undefined
  readonly performance: string | undefined
  readonly cloneRisk?: string
  readonly cloneHardFailures?: number
  readonly noGuess?: boolean
  readonly uniqueFinalGuests?: boolean
  readonly proofWaves?: number
  readonly proofDeductions?: number
  readonly materialFamilyCount?: number
  readonly difficultyBucket?: string
  readonly targetFour?: boolean
  readonly superHard?: boolean
  readonly copyWarnings: readonly string[]
}

function summarizeCase(
  caseId: string,
  comparisonPuzzles: readonly PuzzleDefinition[] = [],
): RealCaseQaSummary {
  const item = getWorkbenchCaseImportById(caseId)
  const report = evaluateWorkbenchDiagnostics(
    createWorkbenchDraftFromPuzzle(item.puzzle),
    caseId,
    defaultWorkbenchDiagnosticsCaps(),
    comparisonPuzzles,
  )
  if (report === undefined) throw new Error(`Expected diagnostics for ${caseId}.`)

  return {
    id: item.puzzle.id,
    metadataDifficulty: item.puzzle.metadata.difficulty,
    status: report.status,
    recommendation: report.validation.recommendation,
    correctness: groupStatus(report, 'correctness'),
    humanProof: groupStatus(report, 'human-proof'),
    quality: groupStatus(report, 'quality'),
    performance: groupStatus(report, 'performance'),
    ...(report.cloneRisk === undefined
      ? {}
      : {
          cloneRisk: report.cloneRisk.status,
          cloneHardFailures: report.cloneRisk.hardFailureCount,
        }),
    noGuess: report.validation.proof?.noGuess,
    uniqueFinalGuests: report.validation.proof?.guestLayoutUniqueAtEnd,
    proofWaves: report.validation.proof?.waveCount,
    proofDeductions: report.validation.proof?.deductionCount,
    materialFamilyCount: report.quality?.ruleFamilyDiversity.materialFamilyCount,
    difficultyBucket: report.validation.difficultyReview?.recommendedBucket,
    targetFour: report.validation.difficultyReview?.targetFour.pass,
    superHard: report.validation.difficultyReview?.superHard.pass,
    copyWarnings: report.copyWarnings.map((warning) => warning.code),
  }
}

function groupStatus(
  report: NonNullable<ReturnType<typeof evaluateWorkbenchDiagnostics>>,
  groupId: string,
): string | undefined {
  return report.groups.find((group) => group.id === groupId)?.status
}
