import { describe, expect, it } from 'vitest'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { AuthoringCaseValidationReport, AuthoringCliReport } from './contracts.js'
import { evaluateCoreQualityGates } from './qualityGates.js'
import { runAuthoringCli } from './runner.js'

const contentRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../content/cases')
const trivialCasePath = resolve(contentRoot, 'case-001.json')
const intersectionCasePath = resolve(contentRoot, 'case-011.json')

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
