import { describe, expect, it } from 'vitest'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { parseAuthoringArgs, runAuthoringCli } from './index.js'

const fixturePath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../content/experimental/phase-10/phase-10-local-scope-intersection-001.json',
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
  })

  it('builds a stable not-implemented report foundation for later rounds', () => {
    expect(runAuthoringCli(['score', 'case.json'])).toEqual({
      version: 'phase-10-authoring-v1',
      ok: false,
      command: 'score',
      inputPath: 'case.json',
      status: 'not-implemented',
      diagnostics: [
        {
          code: 'COMMAND_NOT_IMPLEMENTED',
          severity: 'warning',
          message: 'score parsed successfully; execution is implemented in later Phase 10 rounds.',
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
})
