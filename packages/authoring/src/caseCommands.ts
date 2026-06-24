import {
  minimizeInitialReveals,
  scorePuzzleDifficulty,
} from '@room-axioms/generator'

import {
  AUTHORING_CLI_VERSION,
  type AuthoringCliDiagnostic,
  type AuthoringCliReport,
  type CasePathCommand,
} from './contracts.js'
import { loadAuthoringCase, solverCaps } from './validation.js'

export interface AuthoringCaseCommandOptions {
  readonly cwd?: string
}

export function scoreCaseCommand(
  command: CasePathCommand,
  options: AuthoringCaseCommandOptions = {},
): AuthoringCliReport {
  const loaded = loadAuthoringCase(command.casePath, options.cwd ?? process.cwd())
  const baseReport = caseReportBase(command, loaded.resolvedPath, 'scored')
  if (!loaded.ok || loaded.puzzle === undefined) {
    return {
      ...baseReport,
      ok: false,
      diagnostics: loaded.diagnostics,
      validation: loaded.validation,
    }
  }

  const score = scorePuzzleDifficulty(loaded.puzzle, {
    solver: solverCaps(loaded.validation.caps),
    candidateLayoutCap: loaded.validation.caps.candidateLayoutCap,
  })

  return {
    ...baseReport,
    ok: true,
    diagnostics: [{
      code: 'SCORE_COMPLETE',
      severity: 'info',
      message: `${loaded.validation.puzzleId ?? command.casePath} scored with uncalibrated authoring metrics.`,
    }],
    validation: loaded.validation,
    score,
  }
}

export function minimizeCaseCommand(
  command: CasePathCommand,
  options: AuthoringCaseCommandOptions = {},
): AuthoringCliReport {
  const loaded = loadAuthoringCase(command.casePath, options.cwd ?? process.cwd())
  const baseReport = caseReportBase(command, loaded.resolvedPath, 'minimized')
  if (!loaded.ok || loaded.puzzle === undefined) {
    return {
      ...baseReport,
      ok: false,
      diagnostics: loaded.diagnostics,
      validation: loaded.validation,
    }
  }

  const minimization = minimizeInitialReveals(loaded.puzzle, {
    solver: solverCaps(loaded.validation.caps),
  })
  const ok = minimization.proofAfter.noGuess && minimization.proofAfter.guestLayoutUniqueAtEnd

  return {
    ...baseReport,
    ok,
    diagnostics: minimizationDiagnostics(command.casePath, ok),
    validation: loaded.validation,
    minimization,
  }
}

function caseReportBase(
  command: CasePathCommand,
  resolvedPath: string,
  status: 'scored' | 'minimized',
): Omit<AuthoringCliReport, 'ok' | 'diagnostics' | 'validation' | 'score' | 'minimization'> {
  return {
    version: AUTHORING_CLI_VERSION,
    command: command.name,
    inputPath: command.casePath,
    resolvedInputPath: resolvedPath,
    ...(command.options.outputPath === undefined ? {} : { outputPath: command.options.outputPath }),
    status,
  }
}

function minimizationDiagnostics(
  sourcePath: string,
  ok: boolean,
): readonly AuthoringCliDiagnostic[] {
  return [{
    code: ok ? 'MINIMIZATION_COMPLETE' : 'MINIMIZATION_NEEDS_REPAIR',
    severity: ok ? 'info' : 'warning',
    message: ok
      ? `${sourcePath} minimized in report-only mode; source file was not modified.`
      : `${sourcePath} minimization did not preserve proof and final uniqueness.`,
  }]
}
