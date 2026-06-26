import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

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
