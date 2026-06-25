import {
  minimizeInitialReveals,
  scorePuzzleDifficulty,
} from '@room-axioms/generator'
import type { TechniqueId } from '@room-axioms/proof'

import {
  AUTHORING_CLI_VERSION,
  type AuthoringCliDiagnostic,
  type AuthoringCliReport,
  type AuthoringTechniqueRetentionReport,
  type CasePathCommand,
} from './contracts.js'
import { evaluateTechniqueRetentionGate } from './qualityGates.js'
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
  const techniqueRetention = techniqueRetentionReport(
    minimization.proofBefore.metrics.techniqueIds,
    minimization.proofAfter.metrics.techniqueIds,
    command.options.requiredTechniqueIds ?? [],
  )
  const techniqueRetentionGate = evaluateTechniqueRetentionGate({
    puzzleId: loaded.puzzle.id,
    retention: techniqueRetention,
  })
  const ok = minimization.proofAfter.noGuess &&
    minimization.proofAfter.guestLayoutUniqueAtEnd &&
    techniqueRetentionGate.status !== 'fail'

  return {
    ...baseReport,
    ok,
    diagnostics: minimizationDiagnostics(command.casePath, ok, techniqueRetention),
    validation: loaded.validation,
    minimization,
    techniqueRetention,
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
  techniqueRetention: AuthoringTechniqueRetentionReport,
): readonly AuthoringCliDiagnostic[] {
  const diagnostics: AuthoringCliDiagnostic[] = [{
    code: ok ? 'MINIMIZATION_COMPLETE' : 'MINIMIZATION_NEEDS_REPAIR',
    severity: ok ? 'info' : 'warning',
    message: ok
      ? `${sourcePath} minimized in report-only mode; source file was not modified.`
      : `${sourcePath} minimization did not preserve proof and final uniqueness.`,
  }]

  if (techniqueRetention.requiredTechniqueIds.length > 0) {
    diagnostics.push({
      code: techniqueRetention.requiredTechniquesRetained
        ? 'TECHNIQUE_RETENTION_PASS'
        : 'TECHNIQUE_RETENTION_FAILED',
      severity: techniqueRetention.requiredTechniquesRetained ? 'info' : 'warning',
      message: techniqueRetention.requiredTechniquesRetained
        ? `${sourcePath} retained required proof techniques after minimization.`
        : `${sourcePath} lost required proof techniques after minimization: ${techniqueRetention.missingRequiredTechniqueIds.join(', ')}.`,
    })
  }

  return diagnostics
}

function techniqueRetentionReport(
  beforeTechniqueIds: readonly TechniqueId[],
  afterTechniqueIds: readonly TechniqueId[],
  requiredTechniqueIds: readonly TechniqueId[],
): AuthoringTechniqueRetentionReport {
  const before = uniqueTechniques(beforeTechniqueIds)
  const after = uniqueTechniques(afterTechniqueIds)
  const required = uniqueTechniques(requiredTechniqueIds)
  const afterSet = new Set<TechniqueId>(after)

  return {
    beforeTechniqueIds: before,
    afterTechniqueIds: after,
    preservedTechniqueIds: before.filter((techniqueId) => afterSet.has(techniqueId)),
    lostTechniqueIds: before.filter((techniqueId) => !afterSet.has(techniqueId)),
    requiredTechniqueIds: required,
    missingRequiredTechniqueIds: required.filter((techniqueId) => !afterSet.has(techniqueId)),
    requiredTechniquesRetained: required.every((techniqueId) => afterSet.has(techniqueId)),
  }
}

function uniqueTechniques(techniqueIds: readonly TechniqueId[]): readonly TechniqueId[] {
  return Array.from(new Set<TechniqueId>(techniqueIds))
}
