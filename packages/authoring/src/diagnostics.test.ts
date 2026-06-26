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
    expect(report.status).toBe('valid-review-needed')
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
  })
})

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
    initialReveals: [],
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
