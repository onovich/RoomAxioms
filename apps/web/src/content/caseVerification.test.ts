import { describe, expect, it } from 'vitest'

import { caseSummaries, contentCases, DEFAULT_CASE_ID, getCaseById } from './cases'
import { verifyCaseFixture } from './caseVerification'

describe('case content verification harness', () => {
  it('loads the shipped cases in stable order', () => {
    expect(contentCases.map((puzzle) => puzzle.id)).toEqual([
      'case-001',
      'case-002',
      'case-003',
      'case-004',
      'case-005',
      'case-006',
      'case-007',
      'case-008',
      'case-009',
      'case-010',
      'case-011',
      'case-012',
    ])
    expect(DEFAULT_CASE_ID).toBe('case-004')
  })

  it('keeps selector summaries stable and free of hidden case data', () => {
    expect(caseSummaries.map((summary) => summary.id)).toEqual(contentCases.map((puzzle) => puzzle.id))
    expect(contentCases).toHaveLength(12)
    expect(contentCases.some((puzzle) => puzzle.id.startsWith('phase-12-'))).toBe(false)
    expect(contentCases.some((puzzle) => puzzle.id.startsWith('phase-13-'))).toBe(false)
    expect(contentCases.some((puzzle) => puzzle.id.startsWith('phase-14-'))).toBe(false)
    expect(contentCases.some((puzzle) => puzzle.id.startsWith('phase-15-'))).toBe(false)
    expect(caseSummaries.some((summary) => summary.id.startsWith('phase-12-'))).toBe(false)
    expect(caseSummaries.some((summary) => summary.id.startsWith('phase-13-'))).toBe(false)
    expect(caseSummaries.some((summary) => summary.id.startsWith('phase-14-'))).toBe(false)
    expect(caseSummaries.some((summary) => summary.id.startsWith('phase-15-'))).toBe(false)
    expect(caseSummaries.find((summary) => summary.id === 'case-011')).toMatchObject({
      title: '客房 11：交汇视线',
      caseName: '案卷 11 · 交汇视线',
      difficulty: 3,
    })
    for (const summary of caseSummaries) {
      expect(Object.keys(summary).sort()).toEqual(['board', 'caseName', 'difficulty', 'id', 'tags', 'title'])
    }
    expect(caseSummaries.some((summary) => summary.id === DEFAULT_CASE_ID)).toBe(true)
  })

  it.each(contentCases)('passes all public verification checks for $id', (puzzle) => {
    const report = verifyCaseFixture(puzzle)

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
    const report = verifyCaseFixture(getCaseById('case-004'))

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

  it('records the promoted case-011 local-scope-intersection evidence', () => {
    const report = verifyCaseFixture(getCaseById('case-011'))

    expect(report.passed).toBe(true)
    expect(report.issues).toEqual([])
    expect(report).toMatchObject({
      id: 'case-011',
      title: '客房 11：交汇视线',
      initial: {
        revealedCells: ['B1', 'B2'],
        satisfiable: true,
        candidateGuestLayouts: 2,
      },
      final: {
        unique: true,
        guestCells: ['A1'],
      },
      proof: {
        noGuess: true,
        humanExplainable: true,
        guestLayoutUniqueAtEnd: true,
        finalGuestCells: ['A1'],
        waveCount: 1,
        deductionCount: 5,
        techniqueIds: ['LOCAL_SCOPE_INTERSECTION'],
        issueCodes: [],
      },
      runtime: {
        status: 'ready',
        candidateGuestLayouts: 2,
        guestLayoutUnique: false,
        noGuess: true,
        humanExplainable: true,
        warningCodes: [],
      },
    })
    expect(report.stats.truncated).toBe(false)
  })

  it('records the promoted case-012 retained local-scope-difference evidence', () => {
    const report = verifyCaseFixture(getCaseById('case-012'))

    expect(report.passed).toBe(true)
    expect(report.issues).toEqual([])
    expect(report).toMatchObject({
      id: 'case-012',
      title: '客房 12：走廊缺口',
      initial: {
        revealedCells: ['A1', 'B1', 'C1', 'B2', 'D2'],
        satisfiable: true,
        candidateGuestLayouts: 2,
      },
      final: {
        unique: true,
        guestCells: ['B3', 'C3'],
      },
      proof: {
        noGuess: true,
        humanExplainable: true,
        guestLayoutUniqueAtEnd: true,
        finalGuestCells: ['B3', 'C3'],
        waveCount: 1,
        deductionCount: 7,
        techniqueIds: ['LOCAL_COUNT_SATURATED', 'LOCAL_SCOPE_DIFFERENCE'],
        issueCodes: [],
      },
      runtime: {
        status: 'ready',
        candidateGuestLayouts: 2,
        guestLayoutUnique: false,
        noGuess: true,
        humanExplainable: true,
        warningCodes: [],
      },
    })
    expect(report.stats.truncated).toBe(false)
  })
})
