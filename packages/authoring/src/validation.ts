import type { PuzzleDefinition } from '@room-axioms/domain'
import { readFileSync } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'

import {
  AUTHORING_CLI_VERSION,
  type AuthoringCaseValidationReport,
  type AuthoringCliDiagnostic,
  type AuthoringCliReport,
  type AuthoringRecommendation,
  type CasePathCommand,
} from './contracts.js'
import {
  emptyValidation,
  evaluateDraftDiagnostics,
} from './diagnostics.js'

export interface ValidateCaseCommandOptions {
  readonly cwd?: string
}

export interface LoadedAuthoringCase {
  readonly ok: boolean
  readonly sourcePath: string
  readonly resolvedPath: string
  readonly diagnostics: readonly AuthoringCliDiagnostic[]
  readonly validation: AuthoringCaseValidationReport
  readonly puzzle?: PuzzleDefinition
}

export function validateCaseCommand(
  command: CasePathCommand,
  options: ValidateCaseCommandOptions = {},
): AuthoringCliReport {
  const loaded = loadAuthoringCase(command.casePath, options.cwd ?? process.cwd())
  const baseReport = caseCommandBaseReport(command, loaded.resolvedPath)

  return {
    ...baseReport,
    ok: loaded.validation.recommendation === 'ready-for-experimental-review',
    diagnostics: loaded.diagnostics,
    validation: loaded.validation,
  }
}

export function loadAuthoringCase(casePath: string, cwd: string): LoadedAuthoringCase {
  const resolvedPath = resolveInputPath(casePath, cwd)
  const loaded = readJsonFile(resolvedPath)
  if (!loaded.ok) {
    const validation = emptyValidation(casePath, resolvedPath, loaded.recommendation)
    return {
      ok: false,
      sourcePath: casePath,
      resolvedPath,
      diagnostics: [loaded.diagnostic],
      validation,
    }
  }

  const validationResult = evaluateDraftDiagnostics({
    draft: loaded.value,
    sourcePath: casePath,
    resolvedPath,
  })
  return {
    ok: validationResult.puzzle !== undefined && validationResult.validation.schema.ok,
    sourcePath: casePath,
    resolvedPath,
    diagnostics: diagnosticsForValidation(validationResult.validation),
    validation: validationResult.validation,
    ...(validationResult.puzzle === undefined ? {} : { puzzle: validationResult.puzzle }),
  }
}

function caseCommandBaseReport(
  command: CasePathCommand,
  resolvedPath: string,
): Omit<AuthoringCliReport, 'ok' | 'diagnostics' | 'validation'> {
  return {
    version: AUTHORING_CLI_VERSION,
    command: command.name,
    inputPath: command.casePath,
    resolvedInputPath: resolvedPath,
    ...(command.options.outputPath === undefined ? {} : { outputPath: command.options.outputPath }),
    status: command.name === 'report' ? 'reported' : 'validated',
  }
}

type JsonLoadResult =
  | { readonly ok: true; readonly value: unknown }
  | {
      readonly ok: false
      readonly diagnostic: AuthoringCliDiagnostic
      readonly recommendation: AuthoringRecommendation
    }

function readJsonFile(resolvedPath: string): JsonLoadResult {
  let text: string
  try {
    text = readFileSync(resolvedPath, 'utf8')
  } catch (error) {
    return {
      ok: false,
      diagnostic: {
        code: 'FILE_READ_FAILED',
        severity: 'error',
        message: error instanceof Error ? error.message : `Unable to read ${resolvedPath}.`,
      },
      recommendation: 'repair-schema',
    }
  }

  try {
    return { ok: true, value: JSON.parse(text) as unknown }
  } catch (error) {
    return {
      ok: false,
      diagnostic: {
        code: 'JSON_PARSE_FAILED',
        severity: 'error',
        message: error instanceof Error ? error.message : `Unable to parse ${resolvedPath} as JSON.`,
      },
      recommendation: 'repair-schema',
    }
  }
}

function diagnosticsForValidation(validation: AuthoringCaseValidationReport): readonly AuthoringCliDiagnostic[] {
  if (validation.recommendation === 'ready-for-experimental-review') {
    return [{
      code: 'VALIDATION_PASS',
      severity: 'info',
      message: `${validation.puzzleId ?? validation.sourcePath} is ready for experimental planner review.`,
    }]
  }

  return [{
    code: 'VALIDATION_NEEDS_REPAIR',
    severity: 'warning',
    message: `${validation.sourcePath} recommendation: ${validation.recommendation}.`,
  }]
}

function resolveInputPath(inputPath: string, cwd: string): string {
  return isAbsolute(inputPath) ? inputPath : resolve(cwd, inputPath)
}
