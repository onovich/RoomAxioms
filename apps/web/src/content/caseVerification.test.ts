import { describe, expect, it } from 'vitest'

import case004Fixture from '../../../../content/cases/case-004.json' with { type: 'json' }
import { verifyCaseFixture } from './caseVerification'

const caseFixtures = [
  { id: 'case-004', fixture: case004Fixture },
] as const

describe('case content verification harness', () => {
  it.each(caseFixtures)('passes all public verification checks for $id', ({ fixture }) => {
    const report = verifyCaseFixture(fixture)

    expect(report.passed).toBe(true)
    expect(report.issues).toEqual([])
    expect(report.schemaIssues).toEqual([])
    expect(report.checks).toEqual({
      schemaOk: true,
      targetComplete: true,
      targetSatisfiesRules: true,
      initialSatisfiable: true,
      finalGuestLayoutUnique: true,
      noGuess: true,
      humanExplainable: true,
      runtimeReady: true,
      runtimeNoGuess: true,
      noTruncation: true,
    })
  })

  it('records the stable case-004 report shape for future MVP cases', () => {
    const report = verifyCaseFixture(case004Fixture)

    expect(report).toMatchObject({
      id: 'case-004',
      title: '客房 04：清扫记录',
      initial: {
        revealedCells: ['B1', 'A2', 'C2'],
        satisfiable: true,
        candidateGuestLayouts: 15,
        forcedSafe: ['A1', 'C1', 'B2', 'D2', 'A3', 'B3', 'C3'],
        forcedGuests: [],
      },
      final: {
        unique: true,
        guestCells: ['D1', 'B4'],
        observations: ['A1', 'B1', 'C1', 'A2', 'B2', 'C2', 'D2', 'A3', 'B3', 'C3'],
      },
      proof: {
        noGuess: true,
        humanExplainable: true,
        guestLayoutUniqueAtEnd: true,
        finalGuestCells: ['D1', 'B4'],
        waveCount: 1,
        revealedSafeCount: 7,
        confirmedGuestCount: 0,
        techniqueIds: [
          'KNOWN_SAFE_FROM_NON_GUEST_OBJECT',
          'LOCAL_COUNT_SATURATED',
          'UNIQUE_TARGET_NEIGHBOR_INTERSECTION',
        ],
        issueCodes: [],
      },
      runtime: {
        status: 'ready',
        candidateGuestLayouts: 15,
        guestLayoutUnique: false,
        forcedSafe: ['A1', 'C1', 'B2', 'D2', 'A3', 'B3', 'C3'],
        forcedGuests: [],
        noGuess: true,
        humanExplainable: true,
        warningCodes: [],
      },
    })
    expect(report.proof.deductionCount).toBeGreaterThan(0)
    expect(report.stats.truncated).toBe(false)
  })
})
