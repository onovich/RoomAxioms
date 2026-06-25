import { describe, expect, it } from 'vitest'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { parseAuthoringArgs, runAuthoringCli } from './index.js'

const fixturePath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../content/experimental/phase-10/phase-10-local-scope-intersection-001.json',
)
const phase13DifferencePath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../content/experimental/phase-13/phase-13-local-scope-difference-001.json',
)
const sampleTemplatePath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../content/experimental/phase-10/phase-10-sample-template.json',
)
const case004Path = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../content/cases/case-004.json',
)
const case015Path = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../content/cases/case-015.json',
)
const paddedCase004Path = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../content/experimental/phase-20/padded-case004-right-edge.json',
)
const contaminatedRecordFixturePath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../content/experimental/phase-22/fixtures/contaminated-record-cross-check.json',
)

describe('authoring CLI parser', () => {
  it('parses case-path commands with structured JSON output options', () => {
    expect(parseAuthoringArgs([
      'validate',
      'content/experimental/phase-10/example.json',
      '--output',
      'tmp/report.json',
    ])).toEqual({
      ok: true,
      command: {
        name: 'validate',
        casePath: 'content/experimental/phase-10/example.json',
        options: {
          format: 'json',
          outputPath: 'tmp/report.json',
        },
      },
    })
  })

  it('accepts a leading pnpm argument separator', () => {
    expect(parseAuthoringArgs([
      '--',
      'report',
      'content/experimental/phase-10/example.json',
    ])).toMatchObject({
      ok: true,
      command: {
        name: 'report',
        casePath: 'content/experimental/phase-10/example.json',
      },
    })
  })

  it('parses deterministic sample command flags', () => {
    expect(parseAuthoringArgs([
      'sample',
      '--seed',
      '42',
      '--template',
      'content/experimental/phase-10/template.json',
    ])).toEqual({
      ok: true,
      command: {
        name: 'sample',
        seed: 42,
        templatePath: 'content/experimental/phase-10/template.json',
        options: {
          format: 'json',
        },
      },
    })
  })

  it('parses required proof technique retention flags', () => {
    expect(parseAuthoringArgs([
      'minimize',
      'content/experimental/phase-13/example.json',
      '--require-technique',
      'LOCAL_SCOPE_DIFFERENCE',
      '--require-technique',
      'LOCAL_SCOPE_INTERSECTION',
    ])).toEqual({
      ok: true,
      command: {
        name: 'minimize',
        casePath: 'content/experimental/phase-13/example.json',
        options: {
          format: 'json',
          requiredTechniqueIds: ['LOCAL_SCOPE_DIFFERENCE', 'LOCAL_SCOPE_INTERSECTION'],
        },
      },
    })
  })

  it('parses anti-clone command inputs and novelty manifest flag', () => {
    expect(parseAuthoringArgs([
      'anti-clone',
      'content/cases/case-004.json',
      'content/experimental/phase-20/padded-case004-right-edge.json',
      '--novelty-manifest',
      'content/novelty-claims.json',
    ])).toEqual({
      ok: true,
      command: {
        name: 'anti-clone',
        casePaths: [
          'content/cases/case-004.json',
          'content/experimental/phase-20/padded-case004-right-edge.json',
        ],
        noveltyManifestPath: 'content/novelty-claims.json',
        options: {
          format: 'json',
        },
      },
    })
  })

  it('parses anti-clone degeneracy gate opt-in', () => {
    expect(parseAuthoringArgs([
      'anti-clone',
      'content/cases/case-015.json',
      'content/cases/case-004.json',
      '--include-degeneracy',
    ])).toEqual({
      ok: true,
      command: {
        name: 'anti-clone',
        casePaths: [
          'content/cases/case-015.json',
          'content/cases/case-004.json',
        ],
        includeDegeneracy: true,
        options: {
          format: 'json',
        },
      },
    })
  })

  it('returns structured parse errors without throwing', () => {
    expect(parseAuthoringArgs(['sample', '--seed', 'nope', '--template', 'template.json'])).toEqual({
      ok: false,
      error: {
        code: 'INVALID_SEED',
        message: 'sample seed must be an integer: nope.',
        argument: 'nope',
      },
    })
    expect(parseAuthoringArgs(['validate'])).toMatchObject({
      ok: false,
      error: {
        code: 'MISSING_CASE_PATH',
      },
    })
    expect(parseAuthoringArgs([
      'minimize',
      'content/experimental/phase-13/example.json',
      '--require-technique',
      'NOT_A_TECHNIQUE',
    ])).toMatchObject({
      ok: false,
      error: {
        code: 'INVALID_TECHNIQUE',
      },
    })
  })

  it('samples deterministic candidates from a private template without writing files', () => {
    const report = runAuthoringCli(['sample', '--seed', '7', '--template', sampleTemplatePath])

    expect(report.ok).toBe(true)
    expect(report.status).toBe('sampled')
    expect(report.sample).toMatchObject({
      artifactPolicy: 'report-only',
      attempts: 2,
      input: {
        seed: {
          seed: 7,
          deterministic: true,
        },
      },
    })
    expect(report.sample?.accepted.length).toBe(1)
    expect(report.sample?.accepted[0]?.puzzle.id).toBe('phase-10-sample-001')
    expect(report.diagnostics[0]?.message).toContain('no files were written')
  })

  it('builds a stable not-implemented report foundation for later rounds', () => {
    expect(runAuthoringCli(['sample', '--seed', '7', '--template', 'missing-template.json'])).toMatchObject({
      version: 'phase-10-authoring-v1',
      ok: false,
      command: 'sample',
      inputPath: 'missing-template.json',
      seed: 7,
      templatePath: 'missing-template.json',
      status: 'sampled',
      diagnostics: [
        {
          code: 'TEMPLATE_READ_FAILED',
          severity: 'error',
        },
      ],
    })
  })

  it('validates an experimental case through schema, solver, proof, and caps', () => {
    const report = runAuthoringCli(['validate', fixturePath])

    expect(report).toMatchObject({
      ok: true,
      command: 'validate',
      status: 'validated',
      validation: {
        puzzleId: 'phase-10-local-scope-intersection-001',
        schema: {
          ok: true,
          issueCount: 0,
        },
        targetRules: {
          satisfiesRules: true,
        },
        initialSatisfiability: {
          satisfiable: true,
        },
        proof: {
          noGuess: true,
          humanExplainable: true,
          targetSatisfiesRules: true,
          guestLayoutUniqueAtEnd: true,
        },
        recommendation: 'ready-for-experimental-review',
      },
    })
    expect(report.validation?.initialGuestLayouts?.count).toBeGreaterThan(1)
    expect(report.validation?.proof?.techniqueIds).toContain('LOCAL_SCOPE_INTERSECTION')
    expect(report.validation?.caps).toEqual({
      maxNodes: 20000,
      maxModels: 20000,
      maxGuestLayouts: 100,
      candidateLayoutCap: 100,
    })
  })

  it('uses the same validation core for report command output', () => {
    const report = runAuthoringCli(['report', fixturePath])

    expect(report.ok).toBe(true)
    expect(report.status).toBe('reported')
    expect(report.validation?.recommendation).toBe('ready-for-experimental-review')
  })

  it('reports possible false-record assignments for contaminated fixtures', () => {
    const report = runAuthoringCli(['report', contaminatedRecordFixturePath])

    expect(report.ok).toBe(true)
    expect(report.validation?.recordSets).toMatchObject({
      possibleAssignments: [
        {
          assignmentId: 'card-two',
          falseRecordIds: ['card-two'],
          activeRuleIds: ['R1'],
        },
      ],
      stats: { truncated: false },
    })
    expect(report.validation?.proof?.guestLayoutUniqueAtEnd).toBe(true)
  })

  it('scores cases with uncalibrated authoring metrics', () => {
    const report = runAuthoringCli(['score', fixturePath])

    expect(report.ok).toBe(true)
    expect(report.status).toBe('scored')
    expect(report.score).toMatchObject({
      puzzleId: 'phase-10-local-scope-intersection-001',
      calibratedWithRealPlaytest: false,
    })
    expect(report.score?.metrics.techniqueIds).toContain('LOCAL_SCOPE_INTERSECTION')
    expect(report.validation?.recommendation).toBe('ready-for-experimental-review')
  })

  it('reports reveal minimization without mutating source content', () => {
    const report = runAuthoringCli(['minimize', fixturePath])

    expect(report.ok).toBe(true)
    expect(report.status).toBe('minimized')
    expect(report.minimization).toMatchObject({
      puzzleId: 'phase-10-local-scope-intersection-001',
      beforeCount: 2,
      afterCount: 2,
    })
    expect(report.minimization?.steps.every((step) => step.removed === false)).toBe(true)
    expect(report.diagnostics[0]?.message).toContain('source file was not modified')
  })

  it('reports retained required techniques after minimization', () => {
    const report = runAuthoringCli([
      'minimize',
      fixturePath,
      '--require-technique',
      'LOCAL_SCOPE_INTERSECTION',
    ])

    expect(report.ok).toBe(true)
    expect(report.techniqueRetention).toMatchObject({
      requiredTechniqueIds: ['LOCAL_SCOPE_INTERSECTION'],
      missingRequiredTechniqueIds: [],
      requiredTechniquesRetained: true,
    })
    expect(report.techniqueRetention?.afterTechniqueIds).toContain('LOCAL_SCOPE_INTERSECTION')
    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toContain('TECHNIQUE_RETENTION_PASS')
  })

  it('reports dropped required techniques after minimization', () => {
    const report = runAuthoringCli([
      'minimize',
      phase13DifferencePath,
      '--require-technique',
      'LOCAL_SCOPE_DIFFERENCE',
    ])

    expect(report.ok).toBe(false)
    expect(report.techniqueRetention).toMatchObject({
      beforeTechniqueIds: ['LOCAL_COUNT_SATURATED', 'LOCAL_SCOPE_DIFFERENCE'],
      afterTechniqueIds: ['LOCAL_COUNT_SATURATED'],
      requiredTechniqueIds: ['LOCAL_SCOPE_DIFFERENCE'],
      missingRequiredTechniqueIds: ['LOCAL_SCOPE_DIFFERENCE'],
      requiredTechniquesRetained: false,
    })
    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toContain('TECHNIQUE_RETENTION_FAILED')
  })

  it('reports anti-clone hard failures from the CLI', () => {
    const report = runAuthoringCli(['anti-clone', case004Path, paddedCase004Path])

    expect(report.ok).toBe(false)
    expect(report.status).toBe('anti-clone-reported')
    expect(report.antiClone).toMatchObject({
      status: 'fail',
      puzzleIds: ['case-004', 'phase-20-padded-case004-right-edge'],
    })
    expect(report.antiClone?.hardFailureCount).toBeGreaterThan(0)
    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toContain('ANTI_CLONE_BLOCKED')
  }, 60_000)

  it('reports opt-in degeneracy failures from the anti-clone CLI', () => {
    const report = runAuthoringCli(['anti-clone', case015Path, case004Path, '--include-degeneracy'])

    expect(report.ok).toBe(false)
    expect(report.status).toBe('anti-clone-reported')
    expect(report.antiClone?.degeneracy?.find((entry) => entry.puzzleId === 'case-015')).toMatchObject({
      status: 'fail',
    })
    expect(report.antiClone?.evidenceGroups).toContainEqual(expect.objectContaining({
      kind: 'degeneracy',
      status: 'hard-fail',
      puzzleIds: ['case-015'],
    }))
    expect(report.antiClone?.ruleFamilyDiversity).toBeDefined()
  }, 60_000)
})
