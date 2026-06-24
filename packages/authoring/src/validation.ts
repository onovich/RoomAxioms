import { allCells, type CellId, type Observation, type PuzzleDefinition } from '@room-axioms/domain'
import { verifyNoGuess } from '@room-axioms/proof'
import { parsePuzzleDefinition, type SchemaIssue } from '@room-axioms/schema'
import {
  countGuestLayouts,
  isSatisfiable,
  type SolverStats,
} from '@room-axioms/solver'
import { readFileSync } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'

import {
  AUTHORING_CLI_VERSION,
  type AuthoringCaseValidationReport,
  type AuthoringCliDiagnostic,
  type AuthoringCliReport,
  type AuthoringRecommendation,
  type AuthoringSchemaIssueReport,
  type AuthoringSolverCapsReport,
  type AuthoringSolverStatsReport,
  type CasePathCommand,
} from './contracts.js'

const DEFAULT_CAPS = {
  maxNodes: 20_000,
  maxModels: 20_000,
  maxGuestLayouts: 100,
  candidateLayoutCap: 100,
} as const satisfies AuthoringSolverCapsReport

export interface ValidateCaseCommandOptions {
  readonly cwd?: string
}

export function validateCaseCommand(
  command: CasePathCommand,
  options: ValidateCaseCommandOptions = {},
): AuthoringCliReport {
  const resolvedPath = resolveInputPath(command.casePath, options.cwd ?? process.cwd())
  const baseReport = {
    version: AUTHORING_CLI_VERSION,
    command: command.name,
    inputPath: command.casePath,
    resolvedInputPath: resolvedPath,
    ...(command.options.outputPath === undefined ? {} : { outputPath: command.options.outputPath }),
    status: command.name === 'report' ? 'reported' : 'validated',
  } as const

  const loaded = readJsonFile(resolvedPath)
  if (!loaded.ok) {
    return {
      ...baseReport,
      ok: false,
      diagnostics: [loaded.diagnostic],
      validation: emptyValidation(command.casePath, resolvedPath, loaded.recommendation),
    }
  }

  const validation = validatePuzzleInput(loaded.value, command.casePath, resolvedPath)
  return {
    ...baseReport,
    ok: validation.recommendation === 'ready-for-experimental-review',
    diagnostics: diagnosticsForValidation(validation),
    validation,
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

function validatePuzzleInput(
  input: unknown,
  sourcePath: string,
  resolvedPath: string,
): AuthoringCaseValidationReport {
  const parsed = parsePuzzleDefinition(input)
  if (!parsed.ok || parsed.puzzle === undefined) {
    return {
      ...emptyValidation(sourcePath, resolvedPath, 'repair-schema'),
      schema: {
        ok: false,
        issueCount: parsed.issues.length,
        issues: parsed.issues.map(schemaIssueReport),
      },
    }
  }

  const puzzle = parsed.puzzle
  const solver = solverCaps(DEFAULT_CAPS)
  const targetObservations = targetObservationsForCells(puzzle, allCells(puzzle.board))
  const initialObservations = targetObservationsForCells(puzzle, puzzle.initialReveals)
  const targetRules = isSatisfiable({ puzzle, observations: targetObservations }, [], solver)
  const initialSatisfiability = isSatisfiable({ puzzle, observations: initialObservations }, [], solver)
  const initialGuestLayouts = countGuestLayouts(
    { puzzle, observations: initialObservations },
    DEFAULT_CAPS.candidateLayoutCap,
    solver,
  )
  const proof = verifyNoGuess(puzzle, { solver })
  const proofStats = proof.waves.reduce(
    (current, wave) => combineStats(current, wave.solverStats),
    zeroStats(),
  )
  const recommendation = recommendationFor({
    targetRulesOk: targetRules.satisfiable,
    targetRulesStats: targetRules.stats,
    initialSatisfiable: initialSatisfiability.satisfiable,
    initialStats: initialSatisfiability.stats,
    initialLayoutStats: initialGuestLayouts.stats,
    initialLayoutsGreaterThan: initialGuestLayouts.greaterThan,
    proofNoGuess: proof.noGuess,
    proofHumanExplainable: proof.humanExplainable,
    proofTargetSatisfiesRules: proof.targetSatisfiesRules,
    proofGuestLayoutUniqueAtEnd: proof.guestLayoutUniqueAtEnd,
    proofStats,
  })

  return {
    puzzleId: puzzle.id,
    sourcePath,
    resolvedPath,
    caps: DEFAULT_CAPS,
    schema: {
      ok: true,
      issueCount: 0,
      issues: [],
    },
    targetRules: {
      satisfiesRules: targetRules.satisfiable && !targetRules.stats.truncated,
      stats: statsReport(targetRules.stats),
    },
    initialSatisfiability: {
      satisfiable: initialSatisfiability.satisfiable && !initialSatisfiability.stats.truncated,
      stats: statsReport(initialSatisfiability.stats),
    },
    initialGuestLayouts: {
      count: initialGuestLayouts.count,
      ...(initialGuestLayouts.greaterThan === undefined ? {} : { greaterThan: initialGuestLayouts.greaterThan }),
      stats: statsReport(initialGuestLayouts.stats),
    },
    proof: {
      noGuess: proof.noGuess,
      humanExplainable: proof.humanExplainable,
      targetSatisfiesRules: proof.targetSatisfiesRules,
      guestLayoutUniqueAtEnd: proof.guestLayoutUniqueAtEnd,
      finalGuestCells: proof.finalGuestCells,
      issueCodes: proof.issues.map((issue) => issue.code),
      waveCount: proof.metrics.waveCount,
      deductionCount: proof.metrics.deductionCount,
      techniqueIds: proof.metrics.techniqueIds,
      stats: statsReport(proofStats),
    },
    recommendation,
  }
}

function emptyValidation(
  sourcePath: string,
  resolvedPath: string,
  recommendation: AuthoringRecommendation,
): AuthoringCaseValidationReport {
  return {
    sourcePath,
    resolvedPath,
    caps: DEFAULT_CAPS,
    schema: {
      ok: false,
      issueCount: 0,
      issues: [],
    },
    recommendation,
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

interface RecommendationInput {
  readonly targetRulesOk: boolean
  readonly targetRulesStats: SolverStats
  readonly initialSatisfiable: boolean
  readonly initialStats: SolverStats
  readonly initialLayoutStats: SolverStats
  readonly initialLayoutsGreaterThan?: number
  readonly proofNoGuess: boolean
  readonly proofHumanExplainable: boolean
  readonly proofTargetSatisfiesRules: boolean
  readonly proofGuestLayoutUniqueAtEnd: boolean
  readonly proofStats: SolverStats
}

function recommendationFor(input: RecommendationInput): AuthoringRecommendation {
  if (
    input.targetRulesStats.truncated ||
    input.initialStats.truncated ||
    input.initialLayoutStats.truncated ||
    input.initialLayoutsGreaterThan !== undefined ||
    input.proofStats.truncated
  ) {
    return 'raise-caps-or-simplify'
  }
  if (!input.targetRulesOk || !input.proofTargetSatisfiesRules) return 'repair-target-rules'
  if (!input.initialSatisfiable) return 'repair-initial-satisfiability'
  if (!input.proofNoGuess || !input.proofHumanExplainable) return 'repair-proof'
  if (!input.proofGuestLayoutUniqueAtEnd) return 'repair-final-uniqueness'

  return 'ready-for-experimental-review'
}

function resolveInputPath(inputPath: string, cwd: string): string {
  return isAbsolute(inputPath) ? inputPath : resolve(cwd, inputPath)
}

function targetObservationsForCells(
  puzzle: PuzzleDefinition,
  cellIds: readonly CellId[],
): readonly Observation[] {
  return cellIds.map((cellId) => ({
    cellId,
    kind: puzzle.target[cellId],
  }))
}

function solverCaps(caps: AuthoringSolverCapsReport): {
  readonly maxNodes: number
  readonly maxModels: number
  readonly maxGuestLayouts: number
} {
  return {
    maxNodes: caps.maxNodes,
    maxModels: caps.maxModels,
    maxGuestLayouts: caps.maxGuestLayouts,
  }
}

function statsReport(stats: SolverStats): AuthoringSolverStatsReport {
  return {
    nodeCount: stats.nodeCount,
    propagationCount: stats.propagationCount,
    truncated: stats.truncated,
  }
}

function combineStats(left: SolverStats, right: SolverStats): SolverStats {
  return {
    nodeCount: left.nodeCount + right.nodeCount,
    propagationCount: left.propagationCount + right.propagationCount,
    truncated: left.truncated || right.truncated,
  }
}

function zeroStats(): SolverStats {
  return {
    nodeCount: 0,
    propagationCount: 0,
    truncated: false,
  }
}

function schemaIssueReport(issue: SchemaIssue): AuthoringSchemaIssueReport {
  return {
    code: issue.code,
    path: issue.path,
    message: issue.message,
    ...(issue.context === undefined ? {} : { context: issue.context }),
  }
}
