import { allCells, type CellId, type Observation, type PuzzleDefinition } from '@room-axioms/domain'
import { verifyNoGuess, type VerificationReport } from '@room-axioms/proof'
import { parsePuzzleDefinition, type SchemaIssue } from '@room-axioms/schema'
import {
  countGuestLayouts,
  findPossibleRecordSets,
  isSatisfiable,
  type SolverStats,
} from '@room-axioms/solver'

import { reduceEffectiveBoard, type EffectiveBoardReduction } from './antiClone.js'
import { evaluateAntiCloneReport, type AntiCloneReport } from './antiCloneReport.js'
import type {
  AuthoringCaseValidationReport,
  AuthoringDifficultyReviewBucket,
  AuthoringDifficultyReviewReport,
  AuthoringDifficultyThresholdReport,
  AuthoringRecommendation,
  AuthoringSchemaIssueReport,
  AuthoringSolverCapsReport,
  AuthoringSolverStatsReport,
} from './contracts.js'
import type { NoveltyClaimManifest } from './noveltyClaims.js'
import {
  evaluateDegeneracyGates,
  evaluateRuleContribution,
  evaluateRuleFamilyDiversityGate,
  type DegeneracyGateReport,
  type RuleContributionReport,
  type RuleFamilyDiversityReport,
} from './qualityGates.js'

export const DEFAULT_CAPS = {
  maxNodes: 20_000,
  maxModels: 20_000,
  maxGuestLayouts: 100,
  candidateLayoutCap: 100,
} as const satisfies AuthoringSolverCapsReport

export type AuthoringDraftDiagnosticsStatus =
  | 'invalid-draft'
  | 'valid-unsatisfiable'
  | 'valid-not-unique'
  | 'valid-not-human-explainable'
  | 'valid-degenerate'
  | 'valid-review-needed'
  | 'valid-ready-for-private-review'

export interface AuthoringCopyWarning {
  readonly code:
    | 'COPY_INTERNAL_TERM'
    | 'COPY_SCOPE_NEEDS_EXPLICIT_TEXT'
    | 'COPY_DIRECT_SAFE_GIVEAWAY'
  readonly severity: 'warning'
  readonly location: string
  readonly message: string
  readonly text: string
}

export interface AuthoringDraftDiagnosticsInput {
  readonly draft: unknown
  readonly sourcePath?: string
  readonly resolvedPath?: string
  readonly comparisonPuzzles?: readonly PuzzleDefinition[]
  readonly noveltyManifest?: NoveltyClaimManifest
  readonly caps?: Partial<AuthoringSolverCapsReport>
}

export interface AuthoringDraftDiagnosticsReport {
  readonly ok: boolean
  readonly status: AuthoringDraftDiagnosticsStatus
  readonly puzzle?: PuzzleDefinition
  readonly puzzleId?: string
  readonly validation: AuthoringCaseValidationReport
  readonly quality?: AuthoringDraftQualityReport
  readonly cloneRisk?: AntiCloneReport
  readonly copyWarnings: readonly AuthoringCopyWarning[]
  readonly performance: {
    readonly truncated: boolean
    readonly capWarnings: readonly string[]
  }
}

export interface AuthoringDraftQualityReport {
  readonly effectiveBoard: EffectiveBoardReduction
  readonly degeneracy: DegeneracyGateReport
  readonly ruleContribution: RuleContributionReport
  readonly ruleFamilyDiversity: RuleFamilyDiversityReport
  readonly difficulty: {
    readonly calibratedWithRealPlaytest: false
    readonly warning: string
  }
}

export function evaluateDraftDiagnostics(
  input: AuthoringDraftDiagnosticsInput,
): AuthoringDraftDiagnosticsReport {
  const sourcePath = input.sourcePath ?? '<draft>'
  const resolvedPath = input.resolvedPath ?? sourcePath
  const caps = normalizeCaps(input.caps)
  const result = validatePuzzleInput(input.draft, sourcePath, resolvedPath, caps)
  const puzzle = result.puzzle
  const quality = puzzle === undefined ? undefined : evaluateDraftQuality(puzzle, caps)
  const copyWarnings = puzzle === undefined ? [] : evaluateCopyWarnings(puzzle)
  const cloneRisk = puzzle !== undefined && (input.comparisonPuzzles?.length ?? 0) > 0
    ? evaluateAntiCloneReport([puzzle, ...(input.comparisonPuzzles ?? [])], {
        noveltyManifest: input.noveltyManifest,
        includeDegeneracy: true,
      })
    : undefined
  const capWarnings = capWarningsFor(result.validation)
  const status = diagnosticsStatus(result.validation, quality, copyWarnings, cloneRisk)

  return {
    ok: status === 'valid-ready-for-private-review',
    status,
    ...(puzzle === undefined ? {} : { puzzle }),
    ...(result.validation.puzzleId === undefined ? {} : { puzzleId: result.validation.puzzleId }),
    validation: result.validation,
    ...(quality === undefined ? {} : { quality }),
    ...(cloneRisk === undefined ? {} : { cloneRisk }),
    copyWarnings,
    performance: {
      truncated: capWarnings.length > 0,
      capWarnings,
    },
  }
}

interface PuzzleValidationResult {
  readonly puzzle?: PuzzleDefinition
  readonly validation: AuthoringCaseValidationReport
}

export function validatePuzzleInput(
  input: unknown,
  sourcePath: string,
  resolvedPath: string,
  caps: AuthoringSolverCapsReport = DEFAULT_CAPS,
): PuzzleValidationResult {
  const parsed = parsePuzzleDefinition(input)
  if (!parsed.ok || parsed.puzzle === undefined) {
    return {
      validation: {
        ...emptyValidation(sourcePath, resolvedPath, 'repair-schema', caps),
        schema: {
          ok: false,
          issueCount: parsed.issues.length,
          issues: parsed.issues.map(schemaIssueReport),
        },
      },
    }
  }

  const puzzle = parsed.puzzle
  const solver = solverCaps(caps)
  const targetObservations = targetObservationsForCells(puzzle, allCells(puzzle.board))
  const initialObservations = targetObservationsForCells(puzzle, puzzle.initialReveals)
  const targetRules = isSatisfiable({ puzzle, observations: targetObservations }, [], solver)
  const initialSatisfiability = isSatisfiable({ puzzle, observations: initialObservations }, [], solver)
  const initialGuestLayouts = countGuestLayouts(
    { puzzle, observations: initialObservations },
    caps.candidateLayoutCap,
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
  const difficultyReview = authoringDifficultyReview(puzzle, proof, solver, caps)
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
      caps,
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

export function emptyValidation(
  sourcePath: string,
  resolvedPath: string,
  recommendation: AuthoringRecommendation,
  caps: AuthoringSolverCapsReport = DEFAULT_CAPS,
): AuthoringCaseValidationReport {
  return {
    sourcePath,
    resolvedPath,
    caps,
    schema: {
      ok: false,
      issueCount: 0,
      issues: [],
    },
    recommendation,
  }
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

function normalizeCaps(caps: Partial<AuthoringSolverCapsReport> | undefined): AuthoringSolverCapsReport {
  return {
    ...DEFAULT_CAPS,
    ...caps,
  }
}

function diagnosticsStatus(
  validation: AuthoringCaseValidationReport,
  quality: AuthoringDraftQualityReport | undefined,
  copyWarnings: readonly AuthoringCopyWarning[],
  cloneRisk: AntiCloneReport | undefined,
): AuthoringDraftDiagnosticsStatus {
  if (!validation.schema.ok) return 'invalid-draft'
  if (validation.targetRules?.satisfiesRules === false || validation.initialSatisfiability?.satisfiable === false) {
    return 'valid-unsatisfiable'
  }
  if (validation.proof?.guestLayoutUniqueAtEnd === false) return 'valid-not-unique'
  if (validation.proof?.noGuess === false || validation.proof?.humanExplainable === false) {
    return 'valid-not-human-explainable'
  }
  if (quality?.degeneracy.status === 'fail') return 'valid-degenerate'
  if (
    validation.recommendation !== 'ready-for-experimental-review' ||
    quality?.ruleContribution.status === 'warning' ||
    copyWarnings.length > 0 ||
    cloneRisk?.status === 'fail' ||
    cloneRisk?.status === 'reviewer-blocking'
  ) {
    return 'valid-review-needed'
  }

  return 'valid-ready-for-private-review'
}

function evaluateDraftQuality(
  puzzle: PuzzleDefinition,
  caps: AuthoringSolverCapsReport,
): AuthoringDraftQualityReport {
  const solver = solverCaps(caps)

  return {
    effectiveBoard: reduceEffectiveBoard(puzzle, { solver }),
    degeneracy: evaluateDegeneracyGates(puzzle),
    ruleContribution: evaluateRuleContribution(puzzle, {
      solver,
      candidateLayoutCap: caps.candidateLayoutCap,
    }),
    ruleFamilyDiversity: evaluateRuleFamilyDiversityGate(puzzle, {
      solver,
      candidateLayoutCap: caps.candidateLayoutCap,
    }),
    difficulty: {
      calibratedWithRealPlaytest: false,
      warning: 'Difficulty signals are authoring heuristics only and are not calibrated with real playtest data.',
    },
  }
}

function capWarningsFor(validation: AuthoringCaseValidationReport): readonly string[] {
  const warnings: string[] = []
  if (validation.targetRules?.stats.truncated) warnings.push('target-rules-truncated')
  if (validation.initialSatisfiability?.stats.truncated) warnings.push('initial-satisfiability-truncated')
  if (validation.initialGuestLayouts?.stats.truncated) warnings.push('initial-layout-count-truncated')
  if (validation.initialGuestLayouts?.greaterThan !== undefined) warnings.push('initial-layout-count-capped')
  if (validation.proof?.stats.truncated) warnings.push('proof-truncated')
  if (validation.recordSets?.stats.truncated) warnings.push('record-set-truncated')

  return warnings
}

function evaluateCopyWarnings(puzzle: PuzzleDefinition): readonly AuthoringCopyWarning[] {
  const warnings: AuthoringCopyWarning[] = []
  for (const region of puzzle.regions ?? []) {
    collectTextWarnings(warnings, `region:${region.id}:title`, region.title)
  }
  for (const anchor of puzzle.anchors ?? []) {
    collectTextWarnings(warnings, `anchor:${anchor.id}:title`, anchor.title)
  }
  for (const rule of puzzle.rules) {
    collectTextWarnings(warnings, `rule:${rule.id}:title`, rule.presentation.title)
    if (rule.presentation.flavor === undefined) {
      if (rule.type === 'regionCount' || rule.type === 'scopeOverlapCount') {
        warnings.push({
          code: 'COPY_SCOPE_NEEDS_EXPLICIT_TEXT',
          severity: 'warning',
          location: `rule:${rule.id}:presentation`,
          message: `${rule.id} uses a named scope without explicit player-facing flavor text.`,
          text: rule.presentation.title,
        })
      }
    } else {
      collectTextWarnings(warnings, `rule:${rule.id}:flavor`, rule.presentation.flavor)
    }

    if (isDirectSafeGiveawayRule(rule)) {
      warnings.push({
        code: 'COPY_DIRECT_SAFE_GIVEAWAY',
        severity: 'warning',
        location: `rule:${rule.id}`,
        message: `${rule.id} directly states a no-guest or all-empty scope and needs reviewer confirmation.`,
        text: rule.presentation.flavor ?? rule.presentation.title,
      })
    }
  }

  return warnings
}

function collectTextWarnings(
  warnings: AuthoringCopyWarning[],
  location: string,
  text: string,
): void {
  if (hasInternalTerm(text)) {
    warnings.push({
      code: 'COPY_INTERNAL_TERM',
      severity: 'warning',
      location,
      message: `${location} contains internal or abstract wording.`,
      text,
    })
  }
}

function hasInternalTerm(text: string): boolean {
  const internalTerms = [
    '\u5b89\u5168\u533a',
    '\u7a7a\u533a',
    '\u7a7a\u623f',
    '\u4fa7\u7ffc',
    '\u951a\u70b9',
    '\u6e05\u626b\u70b9',
  ]
  if (internalTerms.some((term) => text.includes(term))) return true

  return [
    /anchor/i,
    /target-?4/i,
    /scopeOverlapCount/,
    /comparativeCount/,
    /conditionalCount/,
    /recordSet/,
    /[A-Z]+_[A-Z_]+/,
    /safe area/i,
    /empty zone/i,
  ].some((pattern) => pattern.test(text))
}

function isDirectSafeGiveawayRule(rule: PuzzleDefinition['rules'][number]): boolean {
  if (
    rule.type === 'globalCount' ||
    rule.type === 'regionCount' ||
    rule.type === 'lineCount' ||
    rule.type === 'anchorCount' ||
    rule.type === 'scopeOverlapCount'
  ) {
    return (rule.target === 'guest' && rule.count.op === 'eq' && rule.count.value === 0) ||
      (rule.target === 'empty' && rule.count.op === 'eq')
  }

  return false
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
  caps: AuthoringSolverCapsReport,
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
    candidateLayoutCap: caps.candidateLayoutCap,
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
