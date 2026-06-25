import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { AuthoringCaseValidationReport, AuthoringCliReport } from './contracts.js'
import {
  canonicalPuzzleIsomorphismSignature,
  evaluateCoreQualityGates,
  evaluateRuleContribution,
  evaluateTechniqueRetentionGate,
  findIsomorphicPuzzleGroups,
} from './qualityGates.js'
import { runAuthoringCli } from './runner.js'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const contentRoot = resolve(repositoryRoot, 'content/cases')
const shippedCasePaths = readdirSync(contentRoot)
  .filter((fileName) => /^case-\d+\.json$/.test(fileName))
  .sort()
  .map((fileName) => resolve(contentRoot, fileName))
const trivialCasePath = resolve(
  repositoryRoot,
  'content/experimental/phase-19/gate-fixtures/opening-trivial-case.json',
)
const canonicalCleaningCasePath = resolve(contentRoot, 'case-004.json')
const replacementCleaningCasePath = resolve(contentRoot, 'case-006.json')
const intersectionCasePath = resolve(contentRoot, 'case-011.json')
const differenceCasePath = resolve(contentRoot, 'case-012.json')

describe('quality gate contracts', () => {
  it('rejects opening states with a unique guest layout', () => {
    const report = evaluateCase(trivialCasePath)

    expect(report.status).toBe('fail')
    expect(report.results).toContainEqual(expect.objectContaining({
      id: 'opening-ambiguity',
      status: 'fail',
      expected: 2,
      actual: 1,
    }))
  })

  it('rejects cases with zero proof waves', () => {
    const report = evaluateCase(trivialCasePath)

    expect(report.results).toContainEqual(expect.objectContaining({
      id: 'proof-wave',
      status: 'fail',
      expected: 1,
      actual: 0,
    }))
  })

  it('rejects cases with zero deductions', () => {
    const report = evaluateCase(trivialCasePath)

    expect(report.results).toContainEqual(expect.objectContaining({
      id: 'deduction-count',
      status: 'fail',
      expected: 1,
      actual: 0,
    }))
  })

  it('rejects non-onboarding cases that close at the opening state', () => {
    const report = evaluateCase(trivialCasePath, 'normal')

    expect(report.results).toContainEqual(expect.objectContaining({
      id: 'non-onboarding-trivial-closure',
      status: 'fail',
      expected: 2,
      actual: 1,
    }))
  })

  it('still rejects onboarding cases when opening ambiguity collapses to one layout', () => {
    const report = evaluateCase(trivialCasePath, 'onboarding')

    expect(report.status).toBe('fail')
    expect(report.results).toContainEqual(expect.objectContaining({
      id: 'non-onboarding-trivial-closure',
      status: 'fail',
      message: 'Onboarding cases still need at least two opening candidate layouts.',
    }))
  })

  it('passes the retained intersection case through the initial gate set', () => {
    const report = evaluateCase(intersectionCasePath)

    expect(report).toMatchObject({
      puzzleId: 'case-011',
      profile: 'normal',
      status: 'pass',
    })
    expect(report.results.every((result) => result.status === 'pass')).toBe(true)
  })

  it('allows opening-closure fixtures only as warnings for internal evidence', () => {
    const report = evaluateCase(trivialCasePath, 'internal-fixture')

    expect(report.status).toBe('fail')
    expect(report.results).toContainEqual(expect.objectContaining({
      id: 'non-onboarding-trivial-closure',
      status: 'warning',
    }))
  })
})

describe('rule contribution gate', () => {
  it('reports useful rules when removing them changes candidate layouts or proof outcomes', () => {
    const puzzle = loadCase(intersectionCasePath)
    const report = evaluateRuleContribution(puzzle, {
      requiredTechniqueIds: ['LOCAL_SCOPE_INTERSECTION'],
    })

    expect(report.puzzleId).toBe('case-011')
    expect(report.results.some((result) => result.status === 'contributes')).toBe(true)
    expect(report.results.find((result) => result.ruleId === 'R1')).toMatchObject({
      status: 'contributes',
    })
  })

  it('reports redundant duplicate rules in report-only mode', () => {
    const puzzle = loadCase(intersectionCasePath)
    const duplicatedRule = {
      ...puzzle.rules[0],
      id: 'R1_DUPLICATE',
    }
    const report = evaluateRuleContribution({
      ...puzzle,
      rules: [duplicatedRule, ...puzzle.rules],
    })

    expect(report.status).toBe('warning')
    expect(report.results.find((result) => result.ruleId === 'R1_DUPLICATE')).toMatchObject({
      status: 'redundant',
      reasons: ['no-material-change'],
    })
  })

  it('reports decorative non-guest rules that do not affect guest reasoning', () => {
    const puzzle = loadCase(intersectionCasePath)
    const report = evaluateRuleContribution({
      ...puzzle,
      rules: [
        ...puzzle.rules,
        {
          id: 'DECORATIVE_BIN_COUNT',
          type: 'globalCount',
          target: 'bin',
          count: {
            op: 'eq',
            value: 4,
          },
          presentation: {
            title: 'Decorative bin count',
            flavor: 'A maintainer-facing fixture rule that should not affect guest reasoning.',
          },
        },
      ],
    })

    expect(report.status).toBe('warning')
    expect(report.results.find((result) => result.ruleId === 'DECORATIVE_BIN_COUNT')).toMatchObject({
      status: 'redundant',
      reasons: ['no-material-change'],
    })
  })
})

describe('non-isomorphism gate', () => {
  it('assigns equivalent canonical signatures to exact structural duplicates', () => {
    const source = loadCase(canonicalCleaningCasePath)
    const canonical = canonicalPuzzleIsomorphismSignature(source)
    const duplicate = canonicalPuzzleIsomorphismSignature({
      ...source,
      id: 'case-004-copy',
      title: 'copy',
      caseName: 'copy',
      metadata: {
        ...source.metadata,
        notes: 'fixture copy',
      },
    })

    expect(duplicate.canonicalSignature).toBe(canonical.canonicalSignature)
  })

  it('does not group promoted replacement cases with the retained cleaning case', () => {
    const puzzles = [
      loadCase(canonicalCleaningCasePath),
      loadCase(replacementCleaningCasePath),
      loadCase(intersectionCasePath),
    ]
    const groups = findIsomorphicPuzzleGroups(puzzles)

    expect(groups).toEqual([])
  })

  it('finds no duplicate classes when scanning all shipped ladder cases', () => {
    const groups = findIsomorphicPuzzleGroups(shippedCasePaths.map(loadCase))

    expect(groups).toEqual([])
  })
})

describe('technique retention gate', () => {
  it('passes when an intersection case retains its required technique after minimization', () => {
    const gate = evaluateTechniqueRetentionGate({
      puzzleId: 'case-011',
      retention: requireTechniqueRetention(runAuthoringCli([
        'minimize',
        intersectionCasePath,
        '--require-technique',
        'LOCAL_SCOPE_INTERSECTION',
      ])),
    })

    expect(gate).toMatchObject({
      puzzleId: 'case-011',
      status: 'pass',
      requiredTechniqueIds: ['LOCAL_SCOPE_INTERSECTION'],
      missingRequiredTechniqueIds: [],
    })
  })

  it('passes mixed retention when a difference case keeps all required techniques', () => {
    const gate = evaluateTechniqueRetentionGate({
      puzzleId: 'case-012',
      retention: requireTechniqueRetention(runAuthoringCli([
        'minimize',
        differenceCasePath,
        '--require-technique',
        'LOCAL_COUNT_SATURATED',
        '--require-technique',
        'LOCAL_SCOPE_DIFFERENCE',
      ])),
    })

    expect(gate).toMatchObject({
      puzzleId: 'case-012',
      status: 'pass',
      requiredTechniqueIds: ['LOCAL_COUNT_SATURATED', 'LOCAL_SCOPE_DIFFERENCE'],
      missingRequiredTechniqueIds: [],
    })
  })

  it('fails when minimization drops a required mixed-case technique', () => {
    const report = runAuthoringCli([
      'minimize',
      canonicalCleaningCasePath,
      '--require-technique',
      'LOCAL_COUNT_SATURATED',
      '--require-technique',
      'UNIQUE_TARGET_NEIGHBOR_INTERSECTION',
    ])
    const gate = evaluateTechniqueRetentionGate({
      puzzleId: 'case-004',
      retention: requireTechniqueRetention(report),
    })

    expect(report.ok).toBe(false)
    expect(gate).toMatchObject({
      puzzleId: 'case-004',
      status: 'fail',
      requiredTechniqueIds: ['LOCAL_COUNT_SATURATED', 'UNIQUE_TARGET_NEIGHBOR_INTERSECTION'],
      missingRequiredTechniqueIds: ['UNIQUE_TARGET_NEIGHBOR_INTERSECTION'],
    })
  })
})

function evaluateCase(
  casePath: string,
  profile: Parameters<typeof evaluateCoreQualityGates>[0]['profile'] = 'normal',
): ReturnType<typeof evaluateCoreQualityGates> {
  const report = runAuthoringCli(['report', casePath])
  const score = runAuthoringCli(['score', casePath])
  const validation = requireValidation(report)

  expect(report.ok).toBe(true)
  expect(score.ok).toBe(true)

  return evaluateCoreQualityGates({
    validation,
    ...(score.score === undefined ? {} : { score: score.score }),
    profile,
  })
}

function requireValidation(report: AuthoringCliReport): AuthoringCaseValidationReport {
  if (report.validation === undefined) {
    throw new Error('Expected authoring report validation output.')
  }

  return report.validation
}

function requireTechniqueRetention(
  report: AuthoringCliReport,
): NonNullable<AuthoringCliReport['techniqueRetention']> {
  if (report.techniqueRetention === undefined) {
    throw new Error('Expected technique retention output.')
  }

  return report.techniqueRetention
}

function loadCase(casePath: string): import('@room-axioms/domain').PuzzleDefinition {
  const report = runAuthoringCli(['report', casePath])
  expect(report.ok).toBe(true)

  return JSON.parse(readFileSync(casePath, 'utf8')) as import('@room-axioms/domain').PuzzleDefinition
}
