import { allCells, type CellId, type Observation, type PuzzleDefinition } from '@room-axioms/domain'
import { verifyNoGuess, type VerificationReport } from '@room-axioms/proof'
import { parsePuzzleDefinition, type SchemaIssue } from '@room-axioms/schema'
import {
  countGuestLayouts,
  findPossibleRecordSets,
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
  type AuthoringDifficultyReviewBucket,
  type AuthoringDifficultyReviewReport,
  type AuthoringDifficultyThresholdReport,
  type AuthoringRecommendation,
  type AuthoringSchemaIssueReport,
  type AuthoringSolverCapsReport,
  type AuthoringSolverStatsReport,
  type CasePathCommand,
} from './contracts.js'
import { reduceEffectiveBoard } from './antiClone.js'
import { evaluateDegeneracyGates, evaluateRuleFamilyDiversityGate } from './qualityGates.js'

export const DEFAULT_CAPS = {
  maxNodes: 20_000,
  maxModels: 20_000,
  maxGuestLayouts: 100,
  candidateLayoutCap: 100,
} as const satisfies AuthoringSolverCapsReport

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

  const validationResult = validatePuzzleInput(loaded.value, casePath, resolvedPath)
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

interface PuzzleValidationResult {
  readonly puzzle?: PuzzleDefinition
  readonly validation: AuthoringCaseValidationReport
}

function validatePuzzleInput(
  input: unknown,
  sourcePath: string,
  resolvedPath: string,
): PuzzleValidationResult {
  const parsed = parsePuzzleDefinition(input)
  if (!parsed.ok || parsed.puzzle === undefined) {
    return {
      validation: {
        ...emptyValidation(sourcePath, resolvedPath, 'repair-schema'),
        schema: {
          ok: false,
          issueCount: parsed.issues.length,
          issues: parsed.issues.map(schemaIssueReport),
        },
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
  const recordSets = puzzle.rules.some((rule) => rule.type === 'recordSet')
    ? findPossibleRecordSets({ puzzle, observations: initialObservations }, solver)
    : undefined
  const proof = verifyNoGuess(puzzle, { solver })
  const proofStats = proof.waves.reduce(
    (current, wave) => combineStats(current, wave.solverStats),
    zeroStats(),
  )
  const difficultyReview = authoringDifficultyReview(puzzle, proof, solver)
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
    recordSetStats: recordSets?.stats,
    recordSetPossibleAssignmentCount: recordSets?.possibleAssignments.length,
  })

  return {
    puzzle,
    validation: {
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
      ...(recordSets === undefined
        ? {}
        : {
            recordSets: {
              possibleAssignments: recordSets.possibleAssignments,
              stats: statsReport(recordSets.stats),
            },
          }),
      difficultyReview,
      recommendation,
    },
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
  readonly recordSetStats?: SolverStats
  readonly recordSetPossibleAssignmentCount?: number
}

function recommendationFor(input: RecommendationInput): AuthoringRecommendation {
  if (
    input.targetRulesStats.truncated ||
    input.initialStats.truncated ||
    input.initialLayoutStats.truncated ||
    input.initialLayoutsGreaterThan !== undefined ||
    input.proofStats.truncated ||
    input.recordSetStats?.truncated
  ) {
    return 'raise-caps-or-simplify'
  }
  if (input.recordSetPossibleAssignmentCount !== undefined && input.recordSetPossibleAssignmentCount === 0) {
    return 'repair-initial-satisfiability'
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

export function solverCaps(caps: AuthoringSolverCapsReport): {
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

function authoringDifficultyReview(
  puzzle: PuzzleDefinition,
  proof: VerificationReport,
  solver: ReturnType<typeof solverCaps>,
): AuthoringDifficultyReviewReport {
  const initialRevealSet = new Set(puzzle.initialReveals)
  const effectiveBoard = reduceEffectiveBoard(puzzle, { solver })
  const boardUnknownCellCount = allCells(puzzle.board).length - puzzle.initialReveals.length
  const effectiveUnknownCellCount = effectiveBoard.effectiveCells
    .filter((cellId) => !initialRevealSet.has(cellId))
    .length
  const degeneracy = evaluateDegeneracyGates(puzzle)
  const ruleFamily = evaluateRuleFamilyDiversityGate(puzzle, {
    solver,
    candidateLayoutCap: DEFAULT_CAPS.candidateLayoutCap,
  })
  const proofWaveCount = proof.metrics.waveCount
  const deductionCount = proof.metrics.deductionCount
  const frontierUnlockCount = proof.waves
    .filter((wave) => wave.index > 0 && wave.deductions.length > 0)
    .length
  const sharedVariableOverlapCount = proof.waves.reduce((count, wave) => (
    count + wave.deductions.filter(hasSharedVariableOverlap).length
  ), 0)
  const degeneracyFailureCount = degeneracy.results.filter((result) => result.status === 'fail').length
  const degeneracyWarningCount = degeneracy.results.filter((result) => result.status === 'warning').length
  const base = {
    effectiveUnknownCellCount,
    proofWaveCount,
    deductionCount,
    materialRuleFamilyCount: ruleFamily.materialFamilyCount,
    redundantRuleCount: ruleFamily.redundantRuleIds.length,
    degeneracyStatus: degeneracy.status,
    frontierUnlockCount,
    sharedVariableOverlapCount,
  }
  const targetFour = thresholdReport(base, {
    effectiveUnknownCellCount: 10,
    proofWaveCount: 4,
    deductionCount: 8,
    materialRuleFamilyCount: 3,
    frontierUnlockCount: 1,
    sharedVariableOverlapCount: 1,
  })
  const superHard = thresholdReport(base, {
    effectiveUnknownCellCount: 14,
    proofWaveCount: 6,
    deductionCount: 12,
    materialRuleFamilyCount: 4,
    frontierUnlockCount: 2,
    sharedVariableOverlapCount: 1,
  })

  return {
    puzzleId: puzzle.id,
    recommendedBucket: recommendedDifficultyBucket(targetFour, superHard),
    boardUnknownCellCount,
    effectiveUnknownCellCount,
    effectiveCellCount: effectiveBoard.effectiveCells.length,
    irrelevantCellCount: effectiveBoard.irrelevantCells.length,
    openingRevealCount: puzzle.initialReveals.length,
    proofWaveCount,
    deductionCount,
    frontierUnlockCount,
    sharedVariableOverlapCount,
    techniqueIds: proof.metrics.techniqueIds,
    materialRuleFamilyCount: ruleFamily.materialFamilyCount,
    materialRuleFamilies: ruleFamily.materialFamilies,
    materialRuleIds: ruleFamily.materialRuleIds,
    redundantRuleIds: ruleFamily.redundantRuleIds,
    degeneracy: {
      status: degeneracy.status,
      failureCount: degeneracyFailureCount,
      warningCount: degeneracyWarningCount,
    },
    targetFour,
    superHard,
  }
}

function hasSharedVariableOverlap(deduction: VerificationReport['waves'][number]['deductions'][number]): boolean {
  return new Set(deduction.ruleIds).size >= 2 ||
    deduction.premises.some((premise) => (
      (premise.ruleIds?.length ?? 0) >= 2 && (premise.cellIds?.length ?? 0) > 0
    ))
}

interface DifficultyThresholdBase {
  readonly effectiveUnknownCellCount: number
  readonly proofWaveCount: number
  readonly deductionCount: number
  readonly materialRuleFamilyCount: number
  readonly redundantRuleCount: number
  readonly degeneracyStatus: 'pass' | 'warning' | 'fail'
  readonly frontierUnlockCount: number
  readonly sharedVariableOverlapCount: number
}

interface DifficultyThresholdPolicy {
  readonly effectiveUnknownCellCount: number
  readonly proofWaveCount: number
  readonly deductionCount: number
  readonly materialRuleFamilyCount: number
  readonly frontierUnlockCount: number
  readonly sharedVariableOverlapCount: number
}

function thresholdReport(
  base: DifficultyThresholdBase,
  policy: DifficultyThresholdPolicy,
): AuthoringDifficultyThresholdReport {
  const missing: string[] = []

  if (base.effectiveUnknownCellCount < policy.effectiveUnknownCellCount) missing.push('effective-unknown-cell-count')
  if (base.proofWaveCount < policy.proofWaveCount) missing.push('proof-wave-count')
  if (base.deductionCount < policy.deductionCount) missing.push('deduction-count')
  if (base.materialRuleFamilyCount < policy.materialRuleFamilyCount) missing.push('material-rule-family-count')
  if (base.frontierUnlockCount < policy.frontierUnlockCount) missing.push('frontier-unlock-count')
  if (base.sharedVariableOverlapCount < policy.sharedVariableOverlapCount) missing.push('shared-variable-overlap-count')
  if (base.redundantRuleCount > 0) missing.push('redundant-rule-count')
  if (base.degeneracyStatus !== 'pass') missing.push('degeneracy-status')

  return {
    pass: missing.length === 0,
    missing,
  }
}

function recommendedDifficultyBucket(
  targetFour: AuthoringDifficultyThresholdReport,
  superHard: AuthoringDifficultyThresholdReport,
): AuthoringDifficultyReviewBucket {
  if (superHard.pass) return 'super-hard-6-7'
  if (targetFour.pass) return 'target-4'

  return 'tutorial-or-baseline'
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
