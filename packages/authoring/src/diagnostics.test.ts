import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import type { PuzzleDefinition } from '@room-axioms/domain'
import { evaluateDraftDiagnostics, runAuthoringCli } from './index.js'

const fixturePath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../content/experimental/phase-10/phase-10-local-scope-intersection-001.json',
)
const scopeOverlapFixturePath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../content/experimental/phase-24/phase-24-overlap-cross-001.json',
)
const phase26C06Path = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../content/experimental/phase-26/candidates/p26-c06-two-wave-frontier.json',
)
const phase29OverlapTrialPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../content/experimental/phase-29/p29-overlap-frontier-ledger-trial.json',
)
const case004Path = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../content/cases/case-004.json',
)

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8')) as unknown
}

describe('in-memory authoring diagnostics', () => {
  it('matches the CLI validation core for a valid draft', () => {
    const draft = readJson(fixturePath)
    const memoryReport = evaluateDraftDiagnostics({
      draft,
      sourcePath: 'memory-fixture',
      resolvedPath: 'memory-fixture',
    })
    const cliReport = runAuthoringCli(['report', fixturePath])

    expect(memoryReport.validation).toMatchObject({
      puzzleId: cliReport.validation?.puzzleId,
      schema: cliReport.validation?.schema,
      targetRules: cliReport.validation?.targetRules,
      initialSatisfiability: cliReport.validation?.initialSatisfiability,
      proof: {
        noGuess: cliReport.validation?.proof?.noGuess,
        humanExplainable: cliReport.validation?.proof?.humanExplainable,
        guestLayoutUniqueAtEnd: cliReport.validation?.proof?.guestLayoutUniqueAtEnd,
        techniqueIds: cliReport.validation?.proof?.techniqueIds,
      },
      recommendation: cliReport.validation?.recommendation,
    })
    expect(memoryReport.status).toBe('valid-ready-for-private-review')
    expect(memoryReport.quality).toMatchObject({
      effectiveBoard: {
        puzzleId: 'phase-10-local-scope-intersection-001',
      },
      degeneracy: {
        status: expect.any(String),
      },
      ruleContribution: {
        status: 'pass',
      },
      difficulty: {
        calibratedWithRealPlaytest: false,
      },
    })
    expect(memoryReport.groups.map((group) => group.id)).toEqual([
      'blocking-errors',
      'correctness',
      'human-proof',
      'quality',
      'clone-risk',
      'difficulty',
      'copy',
      'performance',
    ])
    expect(groupStatus(memoryReport, 'blocking-errors')).toBe('pass')
    expect(groupStatus(memoryReport, 'correctness')).toBe('pass')
    expect(groupStatus(memoryReport, 'human-proof')).toBe('pass')
    expect(memoryReport.performance.truncated).toBe(false)
  })

  it('returns structured invalid-draft diagnostics without filesystem access', () => {
    const report = evaluateDraftDiagnostics({
      draft: { id: 'broken-draft' },
    })

    expect(report).toMatchObject({
      ok: false,
      status: 'invalid-draft',
      validation: {
        sourcePath: '<draft>',
        resolvedPath: '<draft>',
        schema: {
          ok: false,
          issueCount: expect.any(Number),
        },
        recommendation: 'repair-schema',
      },
    })
    expect(report.validation.schema.issueCount).toBeGreaterThan(0)
    expect(groupStatus(report, 'blocking-errors')).toBe('fail')
    expect(groupStatus(report, 'correctness')).toBe('skipped')
    expect(groupStatus(report, 'human-proof')).toBe('skipped')
  })

  it('runs copy-only diagnostics without solver-backed groups', () => {
    const report = evaluateDraftDiagnostics({
      draft: readJson(scopeOverlapFixturePath),
      checks: ['copy'],
    })

    expect(report.groups.map((group) => group.id)).toEqual([
      'blocking-errors',
      'copy',
    ])
    expect(report.validation).toMatchObject({
      schema: {
        ok: true,
      },
    })
    expect(report.validation.targetRules).toBeUndefined()
    expect(report.validation.initialSatisfiability).toBeUndefined()
    expect(report.validation.initialGuestLayouts).toBeUndefined()
    expect(report.validation.proof).toBeUndefined()
    expect(report.quality).toBeUndefined()
    expect(report.cloneRisk).toBeUndefined()
  })

  it('includes capped answer examples for non-unique opening layouts', () => {
    const report = evaluateDraftDiagnostics({
      draft: readJson(case004Path),
      checks: ['can-solve'],
    })

    expect(report.validation.initialGuestLayouts?.count).toBeGreaterThan(1)
    expect(report.validation.initialGuestLayoutExamples).toMatchObject({
      shown: 4,
      hasMore: true,
      stats: { truncated: false },
    })
    expect(report.validation.initialGuestLayoutExamples?.layouts).toHaveLength(4)
    expect(report.validation.initialGuestLayoutExamples?.layouts[0]).toMatchObject({
      guestCells: expect.any(Array),
      cells: expect.any(Object),
      changedCells: expect.any(Array),
    })
    expect(Object.keys(report.validation.initialGuestLayoutExamples?.layouts[0]?.cells ?? {})).toHaveLength(16)
  })

  it('runs degeneracy-only diagnostics without rule-contribution or proof work', () => {
    const report = evaluateDraftDiagnostics({
      draft: singletonRegionGiveawayCase(),
      checks: ['degeneracy'],
    })
    const qualityItems = groupItems(report, 'quality').map((item) => item.code)

    expect(report.groups.map((group) => group.id)).toEqual([
      'blocking-errors',
      'quality',
    ])
    expect(qualityItems).toEqual(['DEGENERACY'])
    expect(report.validation.proof).toBeUndefined()
    expect(report.quality).toBeUndefined()
  })

  it('reports copy warnings for internal labels and highlight-dependent scope text', () => {
    const draft = JSON.parse(JSON.stringify(readJson(scopeOverlapFixturePath))) as {
      rules: Array<{ type: string; presentation: { title: string; flavor?: string } }>
    }
    const scopedRule = draft.rules.find((rule) => rule.type === 'scopeOverlapCount')
    expect(scopedRule).toBeDefined()
    scopedRule!.presentation.title = 'scopeOverlapCount target-4 anchor safe area'
    delete scopedRule!.presentation.flavor

    const report = evaluateDraftDiagnostics({ draft })

    expect(report.copyWarnings.map((warning) => warning.code)).toEqual(expect.arrayContaining([
      'COPY_INTERNAL_TERM',
      'COPY_SCOPE_NEEDS_EXPLICIT_TEXT',
    ]))
    expect(groupStatus(report, 'copy')).toBe('warning')
    expect(report.status).toBe('valid-review-needed')
  })

  it('classifies explanation gaps separately from final uniqueness blockers', () => {
    const report = evaluateDraftDiagnostics({
      draft: readJson(phase26C06Path),
    })
    const proofItemCodes = groupItems(report, 'human-proof').map((item) => item.code)

    expect(report.validation.proof?.issueCodes).toContain('EXPLANATION_GAP')
    expect(report.validation.proof?.guestLayoutUniqueAtEnd).toBe(false)
    expect(proofItemCodes).toEqual(expect.arrayContaining([
      'PROOF_ISSUE_CODES',
      'PROOF_EXPLANATION_GAP',
      'PROOF_FINAL_UNIQUENESS_BLOCKER',
    ]))
    expect(groupStatus(report, 'human-proof')).toBe('fail')
  })

  it('classifies guess points separately from final uniqueness blockers', () => {
    const report = evaluateDraftDiagnostics({
      draft: ambiguousNoProgressCase(),
    })
    const proofItemCodes = groupItems(report, 'human-proof').map((item) => item.code)

    expect(report.validation.proof?.issueCodes).toContain('GUESS_POINT')
    expect(report.validation.proof?.guestLayoutUniqueAtEnd).toBe(false)
    expect(proofItemCodes).toEqual(expect.arrayContaining([
      'PROOF_ISSUE_CODES',
      'PROOF_GUESS_POINT',
      'PROOF_FINAL_UNIQUENESS_BLOCKER',
    ]))
    expect(groupStatus(report, 'human-proof')).toBe('fail')
  })

  it('reports a partial non-singleton overlap bridge separately from later proof stalls', () => {
    const report = evaluateDraftDiagnostics({
      draft: readJson(phase29OverlapTrialPath),
    })
    const proofItems = groupItems(report, 'human-proof')

    expect(report.validation.proof?.techniqueIds).toContain('SCOPE_OVERLAP_SCOPE_DIFFERENCE')
    expect(report.validation.proof?.issueCodes).toContain('GUESS_POINT')
    expect(proofItems).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'PROOF_SCOPE_OVERLAP_BRIDGE_PARTIAL',
        refs: expect.arrayContaining(['SCOPE_OVERLAP_SCOPE_DIFFERENCE']),
      }),
    ]))
    expect(groupStatus(report, 'human-proof')).toBe('fail')
  }, 60_000)

  it('reports overlap-count drafts that have no supported overlap proof technique', () => {
    const report = evaluateDraftDiagnostics({
      draft: unsupportedOverlapProofCase(),
    })
    const proofItems = groupItems(report, 'human-proof')

    expect(report.validation.proof?.techniqueIds.some((techniqueId) => (
      techniqueId.startsWith('SCOPE_OVERLAP')
    ))).toBe(false)
    expect(report.validation.proof?.issueCodes).toContain('GUESS_POINT')
    expect(proofItems).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'PROOF_SCOPE_OVERLAP_UNSUPPORTED',
        refs: ['scopeOverlapCount'],
      }),
    ]))
    expect(groupStatus(report, 'human-proof')).toBe('fail')
  })

  it('reports small padding clones against comparison puzzles without touching shipped content', () => {
    const report = evaluateDraftDiagnostics({
      draft: paddedOneRuleSolutionCase(),
      comparisonPuzzles: [oneRuleSolutionCase()],
    })

    expect(report.cloneRisk).toMatchObject({
      status: 'fail',
      hardFailureCount: expect.any(Number),
    })
    expect(report.cloneRisk?.hardFailureCount).toBeGreaterThan(0)
    expect(groupStatus(report, 'clone-risk')).toBe('fail')
    expect(report.status).toBe('valid-review-needed')
  }, 60_000)

  it('surfaces singleton and direct safe-cell giveaway drafts as degenerate', () => {
    const report = evaluateDraftDiagnostics({
      draft: singletonRegionGiveawayCase(),
    })

    expect(report.status).not.toBe('valid-ready-for-private-review')
    expect(report.quality?.degeneracy).toMatchObject({
      status: 'fail',
      results: expect.arrayContaining([
        expect.objectContaining({
          ruleId: 'ZR1',
          reasons: expect.arrayContaining(['singleton-effective-scope']),
        }),
      ]),
    })
    expect(report.copyWarnings.map((warning) => warning.code)).toContain('COPY_DIRECT_SAFE_GIVEAWAY')
    expect(groupStatus(report, 'quality')).toBe('fail')
    expect(groupStatus(report, 'copy')).toBe('warning')
  })

  it('reports one-rule solutions as weak authoring candidates even when valid', () => {
    const report = evaluateDraftDiagnostics({
      draft: oneRuleSolutionCase(),
    })

    expect(report.validation.schema.ok).toBe(true)
    expect(report.quality?.ruleFamilyDiversity.reasons).toEqual(expect.arrayContaining([
      'single-material-family',
    ]))
    expect(report.validation.difficultyReview?.targetFour.pass).toBe(false)
    expect(report.quality?.difficulty.calibratedWithRealPlaytest).toBe(false)
    expect(groupStatus(report, 'difficulty')).toBe('warning')
  })

  it('marks duplicated rules as reviewer-needed contribution warnings', () => {
    const draftBase = JSON.parse(JSON.stringify(readJson(fixturePath))) as PuzzleDefinition
    const draft: PuzzleDefinition = {
      ...draftBase,
      rules: [
        {
          ...draftBase.rules[0],
          id: 'R1_DUPLICATE',
        },
        ...draftBase.rules,
      ],
    }

    const report = evaluateDraftDiagnostics({ draft })

    expect(report.status).toBe('valid-review-needed')
    expect(report.quality?.ruleContribution).toMatchObject({
      status: 'warning',
      results: expect.arrayContaining([
        expect.objectContaining({
          ruleId: 'R1_DUPLICATE',
          status: 'redundant',
        }),
      ]),
    })
    expect(['warning', 'fail']).toContain(groupStatus(report, 'quality'))
  })

  it('surfaces candidate layout caps as performance warnings', () => {
    const report = evaluateDraftDiagnostics({
      draft: readJson(fixturePath),
      caps: {
        candidateLayoutCap: 1,
      },
    })

    expect(report.validation.initialGuestLayouts?.greaterThan).toBe(1)
    expect(report.performance).toMatchObject({
      truncated: true,
      capWarnings: expect.arrayContaining(['initial-layout-count-capped']),
    })
    expect(report.validation.recommendation).toBe('raise-caps-or-simplify')
    expect(groupStatus(report, 'performance')).toBe('warning')
  })
})

function groupStatus(
  report: ReturnType<typeof evaluateDraftDiagnostics>,
  id: string,
): string | undefined {
  return report.groups.find((group) => group.id === id)?.status
}

function groupItems(
  report: ReturnType<typeof evaluateDraftDiagnostics>,
  id: string,
): readonly { readonly code: string }[] {
  return report.groups.find((group) => group.id === id)?.items ?? []
}

function singletonRegionGiveawayCase(): PuzzleDefinition {
  return {
    schemaVersion: 1,
    id: 'phase-25-singleton-region-giveaway',
    title: 'Phase 25 singleton region giveaway',
    board: { width: 3, height: 3 },
    allowedKinds: ['empty', 'bottle', 'guest'],
    regions: [{ id: 'east-room', title: 'East room', cells: ['A1', 'B1'] }],
    rules: [
      {
        id: 'ZR1',
        type: 'regionCount',
        regionId: 'east-room',
        target: 'empty',
        count: { op: 'eq', value: 1 },
        presentation: {
          title: 'East room empty count',
          flavor: 'Exactly one of these two cells is empty.',
        },
      },
      {
        id: 'GR1',
        type: 'globalCount',
        target: 'guest',
        count: { op: 'eq', value: 0 },
        presentation: {
          title: 'No visitors',
          flavor: 'No guests are present.',
        },
      },
    ],
    initialReveals: ['A1'],
    target: {
      ...empty3x3Target(),
      A1: 'bottle',
      B1: 'empty',
    },
    metadata: { difficulty: 4, tags: ['phase-25', 'bad-case'], status: 'draft' },
  }
}

function oneRuleSolutionCase(): PuzzleDefinition {
  return {
    schemaVersion: 1,
    id: 'phase-25-one-rule-solution',
    title: 'Phase 25 one-rule solution',
    board: { width: 3, height: 3 },
    allowedKinds: ['empty', 'guest'],
    rules: [{
      id: 'ZR1',
      type: 'globalCount',
      target: 'guest',
      count: { op: 'eq', value: 0 },
      presentation: {
        title: 'No visitors anywhere',
        flavor: 'No cell has a guest.',
      },
    }],
    initialReveals: ['B1'],
    target: empty3x3Target(),
    metadata: { difficulty: 4, tags: ['phase-25', 'bad-case'], status: 'draft' },
  }
}

function paddedOneRuleSolutionCase(): PuzzleDefinition {
  return {
    ...oneRuleSolutionCase(),
    id: 'phase-25-one-rule-solution-padded',
    title: 'Phase 25 one-rule solution padded',
    board: { width: 4, height: 3 },
    target: {
      ...empty3x3Target(),
      D1: 'empty',
      D2: 'empty',
      D3: 'empty',
    },
  }
}

function ambiguousNoProgressCase(): PuzzleDefinition {
  return {
    schemaVersion: 1,
    id: 'phase-27-ambiguous-no-progress',
    title: 'Phase 27 ambiguous no progress',
    board: { width: 3, height: 3 },
    allowedKinds: ['empty', 'guest'],
    rules: [{
      id: 'R1',
      type: 'globalCount',
      target: 'guest',
      count: { op: 'eq', value: 1 },
      presentation: {
        title: 'One visitor',
        flavor: 'Exactly one room has a guest.',
      },
    }],
    initialReveals: [],
    target: {
      A1: 'guest',
      B1: 'empty',
      C1: 'empty',
      A2: 'empty',
      B2: 'empty',
      C2: 'empty',
      A3: 'empty',
      B3: 'empty',
      C3: 'empty',
    },
    metadata: { difficulty: 4, tags: ['phase-27', 'bad-case'], status: 'draft' },
  }
}

function unsupportedOverlapProofCase(): PuzzleDefinition {
  return {
    schemaVersion: 1,
    id: 'phase-30-unsupported-overlap-proof',
    title: 'Phase 30 unsupported overlap proof',
    board: { width: 3, height: 3 },
    allowedKinds: ['empty', 'guest'],
    regions: [
      { id: 'left-ledger', title: 'A1, B1, C1', cells: ['A1', 'B1', 'C1'] },
      { id: 'right-ledger', title: 'B1, C1, A2', cells: ['B1', 'C1', 'A2'] },
    ],
    rules: [
      {
        id: 'R1',
        type: 'globalCount',
        target: 'guest',
        count: { op: 'eq', value: 2 },
        presentation: {
          title: 'Two guests',
          flavor: 'Exactly two cells have guests.',
        },
      },
      {
        id: 'R2',
        type: 'scopeOverlapCount',
        left: { kind: 'region', regionId: 'left-ledger' },
        right: { kind: 'region', regionId: 'right-ledger' },
        mode: 'intersection',
        target: 'guest',
        count: { op: 'eq', value: 1 },
        presentation: {
          title: 'Shared ledger',
          flavor: 'B1 and C1 contain exactly one guest.',
        },
      },
    ],
    initialReveals: [],
    target: {
      A1: 'guest',
      B1: 'guest',
      C1: 'empty',
      A2: 'empty',
      B2: 'empty',
      C2: 'empty',
      A3: 'empty',
      B3: 'empty',
      C3: 'empty',
    },
    metadata: { difficulty: 4, tags: ['phase-30', 'bad-case'], status: 'draft' },
  }
}

function empty3x3Target(): PuzzleDefinition['target'] {
  return {
    A1: 'empty',
    B1: 'empty',
    C1: 'empty',
    A2: 'empty',
    B2: 'empty',
    C2: 'empty',
    A3: 'empty',
    B3: 'empty',
    C3: 'empty',
  }
}
