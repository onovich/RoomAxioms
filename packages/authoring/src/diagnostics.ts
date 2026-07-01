import { allCells, type CellId, type Observation, type PuzzleDefinition } from '@room-axioms/domain'
import { verifyNoGuess, type VerificationReport } from '@room-axioms/proof'
import { parsePuzzleDefinition, type SchemaIssue } from '@room-axioms/schema'
import {
  countGuestLayouts,
  findPossibleRecordSets,
  isSatisfiable,
  previewGuestLayouts,
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
  readonly checks?: readonly AuthoringDiagnosticCheckId[]
}

export type AuthoringDiagnosticCheckId =
  | 'can-solve'
  | 'unique-answer'
  | 'no-guess'
  | 'rule-contribution'
  | 'degeneracy'
  | 'clone-risk'
  | 'difficulty'
  | 'copy'
  | 'performance'

export interface AuthoringDraftDiagnosticsReport {
  readonly ok: boolean
  readonly status: AuthoringDraftDiagnosticsStatus
  readonly puzzle?: PuzzleDefinition
  readonly puzzleId?: string
  readonly validation: AuthoringCaseValidationReport
  readonly quality?: AuthoringDraftQualityReport
  readonly cloneRisk?: AntiCloneReport
  readonly copyWarnings: readonly AuthoringCopyWarning[]
  readonly groups: readonly AuthoringDiagnosticsGroup[]
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

export type AuthoringDiagnosticsGroupId =
  | 'blocking-errors'
  | 'correctness'
  | 'human-proof'
  | 'quality'
  | 'clone-risk'
  | 'difficulty'
  | 'copy'
  | 'performance'

export type AuthoringDiagnosticsSeverity = 'pass' | 'info' | 'warning' | 'fail' | 'skipped'

export interface AuthoringDiagnosticsItem {
  readonly code: string
  readonly severity: Exclude<AuthoringDiagnosticsSeverity, 'skipped'>
  readonly message: string
  readonly refs?: readonly string[]
}

export interface AuthoringDiagnosticsGroup {
  readonly id: AuthoringDiagnosticsGroupId
  readonly title: string
  readonly status: AuthoringDiagnosticsSeverity
  readonly items: readonly AuthoringDiagnosticsItem[]
}

export function evaluateDraftDiagnostics(
  input: AuthoringDraftDiagnosticsInput,
): AuthoringDraftDiagnosticsReport {
  const sourcePath = input.sourcePath ?? '<draft>'
  const resolvedPath = input.resolvedPath ?? sourcePath
  const caps = normalizeCaps(input.caps)
  const checks = normalizeChecks(input.checks)
  const result = validatePuzzleInputForChecks(input.draft, sourcePath, resolvedPath, caps, checks)
  const puzzle = result.puzzle
  const quality = shouldRunFullQuality(checks) && puzzle !== undefined ? evaluateDraftQuality(puzzle, caps) : undefined
  const copyWarnings = checks.has('copy') && puzzle !== undefined ? evaluateCopyWarnings(puzzle) : []
  const cloneRisk = checks.has('clone-risk') && puzzle !== undefined && (input.comparisonPuzzles?.length ?? 0) > 0
    ? evaluateAntiCloneReport([puzzle, ...(input.comparisonPuzzles ?? [])], {
        noveltyManifest: input.noveltyManifest,
        includeDegeneracy: true,
      })
    : undefined
  const capWarnings = capWarningsFor(result.validation)
  const status = diagnosticsStatus(result.validation, quality, copyWarnings, cloneRisk)
  const groups = selectedDiagnosticsGroups({
    checks,
    puzzle,
    validation: result.validation,
    quality,
    cloneRisk,
    copyWarnings,
    capWarnings,
  })

  return {
    ok: status === 'valid-ready-for-private-review',
    status,
    ...(puzzle === undefined ? {} : { puzzle }),
    ...(result.validation.puzzleId === undefined ? {} : { puzzleId: result.validation.puzzleId }),
    validation: result.validation,
    ...(quality === undefined ? {} : { quality }),
    ...(cloneRisk === undefined ? {} : { cloneRisk }),
    copyWarnings,
    groups,
    performance: {
      truncated: capWarnings.length > 0,
      capWarnings,
    },
  }
}

const ALL_DIAGNOSTIC_CHECKS: readonly AuthoringDiagnosticCheckId[] = [
  'can-solve',
  'unique-answer',
  'no-guess',
  'rule-contribution',
  'degeneracy',
  'clone-risk',
  'difficulty',
  'copy',
  'performance',
]

function normalizeChecks(checks: readonly AuthoringDiagnosticCheckId[] | undefined): ReadonlySet<AuthoringDiagnosticCheckId> {
  return new Set(checks ?? ALL_DIAGNOSTIC_CHECKS)
}

function shouldRunFullValidation(checks: ReadonlySet<AuthoringDiagnosticCheckId>): boolean {
  return checks.has('unique-answer') ||
    checks.has('no-guess') ||
    checks.has('difficulty') ||
    checks.has('rule-contribution')
}

function shouldRunCorrectnessValidation(checks: ReadonlySet<AuthoringDiagnosticCheckId>): boolean {
  return checks.has('can-solve') || shouldRunFullValidation(checks)
}

function shouldRunFullQuality(checks: ReadonlySet<AuthoringDiagnosticCheckId>): boolean {
  return checks.has('rule-contribution') && checks.has('degeneracy')
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
  return validatePuzzleInputForChecks(input, sourcePath, resolvedPath, caps, normalizeChecks(undefined))
}

function validatePuzzleInputForChecks(
  input: unknown,
  sourcePath: string,
  resolvedPath: string,
  caps: AuthoringSolverCapsReport,
  checks: ReadonlySet<AuthoringDiagnosticCheckId>,
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
  if (!shouldRunCorrectnessValidation(checks)) {
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
        recommendation: 'ready-for-experimental-review',
      },
    }
  }

  if (!shouldRunFullValidation(checks)) {
    return validatePuzzleCorrectnessOnly(puzzle, sourcePath, resolvedPath, caps)
  }

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
  const initialGuestLayoutExamples = previewGuestLayouts(
    { puzzle, observations: initialObservations },
    4,
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
      initialGuestLayoutExamples: {
        layouts: guestLayoutExamplesFor(puzzle, initialGuestLayoutExamples.layouts),
        shown: initialGuestLayoutExamples.layouts.length,
        hasMore: initialGuestLayoutExamples.greaterThan !== undefined,
        stats: statsReport(initialGuestLayoutExamples.stats),
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

function validatePuzzleCorrectnessOnly(
  puzzle: PuzzleDefinition,
  sourcePath: string,
  resolvedPath: string,
  caps: AuthoringSolverCapsReport,
): PuzzleValidationResult {
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
  const initialGuestLayoutExamples = previewGuestLayouts(
    { puzzle, observations: initialObservations },
    4,
    solver,
  )
  const recordSets = puzzle.rules.some((rule) => rule.type === 'recordSet')
    ? findPossibleRecordSets({ puzzle, observations: initialObservations }, solver)
    : undefined
  const recommendation: AuthoringRecommendation = targetRules.stats.truncated ||
    initialSatisfiability.stats.truncated ||
    initialGuestLayouts.stats.truncated ||
    initialGuestLayouts.greaterThan !== undefined ||
    recordSets?.stats.truncated
    ? 'raise-caps-or-simplify'
    : !targetRules.satisfiable
      ? 'repair-target-rules'
      : !initialSatisfiability.satisfiable ||
          (recordSets !== undefined && recordSets.possibleAssignments.length === 0)
        ? 'repair-initial-satisfiability'
        : 'ready-for-experimental-review'

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
      initialGuestLayoutExamples: {
        layouts: guestLayoutExamplesFor(puzzle, initialGuestLayoutExamples.layouts),
        shown: initialGuestLayoutExamples.layouts.length,
        hasMore: initialGuestLayoutExamples.greaterThan !== undefined,
        stats: statsReport(initialGuestLayoutExamples.stats),
      },
      ...(recordSets === undefined
        ? {}
        : {
            recordSets: {
              possibleAssignments: recordSets.possibleAssignments,
              stats: statsReport(recordSets.stats),
            },
          }),
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

function selectedDiagnosticsGroups(input: {
  readonly checks: ReadonlySet<AuthoringDiagnosticCheckId>
  readonly puzzle?: PuzzleDefinition
  readonly validation: AuthoringCaseValidationReport
  readonly quality?: AuthoringDraftQualityReport
  readonly cloneRisk?: AntiCloneReport
  readonly copyWarnings: readonly AuthoringCopyWarning[]
  readonly capWarnings: readonly string[]
}): readonly AuthoringDiagnosticsGroup[] {
  const groups: AuthoringDiagnosticsGroup[] = [blockingGroup(input.validation)]

  if (input.checks.has('can-solve')) groups.push(correctnessGroup(input.validation))
  if (input.checks.has('unique-answer') || input.checks.has('no-guess')) {
    groups.push(humanProofGroup(input.validation, input.puzzle))
  }
  if (input.checks.has('rule-contribution') || input.checks.has('degeneracy')) {
    groups.push(qualityGroupForChecks(input.puzzle, input.quality, input.checks, input.validation.caps))
  }
  if (input.checks.has('clone-risk')) groups.push(cloneRiskGroup(input.cloneRisk))
  if (input.checks.has('difficulty')) groups.push(difficultyGroup(input.validation))
  if (input.checks.has('copy')) groups.push(copyGroup(input.copyWarnings))
  if (input.checks.has('performance')) groups.push(performanceGroup(input.capWarnings))

  return groups
}

function blockingGroup(validation: AuthoringCaseValidationReport): AuthoringDiagnosticsGroup {
  if (!validation.schema.ok) {
    return group('blocking-errors', 'Blocking Errors', validation.schema.issues.map((issue) => ({
      code: issue.code,
      severity: 'fail',
      message: issue.message,
      refs: [formatIssuePath(issue.path)],
    })))
  }

  return group('blocking-errors', 'Blocking Errors', [{
    code: 'SCHEMA_VALID',
    severity: 'pass',
    message: 'Draft parses as Puzzle Schema v1 and passed semantic validation.',
  }])
}

function correctnessGroup(validation: AuthoringCaseValidationReport): AuthoringDiagnosticsGroup {
  if (!validation.schema.ok) return skippedGroup('correctness', 'Correctness', 'Draft must pass schema validation first.')

  const items: AuthoringDiagnosticsItem[] = []
  items.push({
    code: 'TARGET_RULES',
    severity: validation.targetRules?.satisfiesRules ? 'pass' : 'fail',
    message: validation.targetRules?.satisfiesRules
      ? 'Target satisfies the public rules.'
      : 'Target does not satisfy the public rules or the check was truncated.',
  })
  items.push({
    code: 'INITIAL_SATISFIABILITY',
    severity: validation.initialSatisfiability?.satisfiable ? 'pass' : 'fail',
    message: validation.initialSatisfiability?.satisfiable
      ? 'Initial observations are satisfiable.'
      : 'Initial observations are unsatisfiable or the check was truncated.',
  })
  items.push({
    code: 'INITIAL_GUEST_LAYOUTS',
    severity: validation.initialGuestLayouts?.greaterThan === undefined ? 'info' : 'warning',
    message: validation.initialGuestLayouts?.greaterThan === undefined
      ? `Initial guest-layout count: ${validation.initialGuestLayouts?.count ?? 0}.`
      : `Initial guest-layout count exceeded cap ${validation.initialGuestLayouts.greaterThan}.`,
  })
  if (validation.recordSets !== undefined) {
    items.push({
      code: 'RECORD_SETS',
      severity: validation.recordSets.possibleAssignments.length > 0 ? 'pass' : 'fail',
      message: `Record-set possible assignments: ${validation.recordSets.possibleAssignments.length}.`,
    })
  }

  return group('correctness', 'Correctness', items)
}

function humanProofGroup(
  validation: AuthoringCaseValidationReport,
  puzzle: PuzzleDefinition | undefined,
): AuthoringDiagnosticsGroup {
  if (!validation.schema.ok) return skippedGroup('human-proof', 'Human Proof', 'Draft must pass schema validation first.')
  if (validation.proof === undefined) {
    return group('human-proof', 'Human Proof', [{
      code: 'PROOF_MISSING',
      severity: 'fail',
      message: 'No proof report was produced.',
    }])
  }

  return group('human-proof', 'Human Proof', [
    {
      code: 'NO_GUESS',
      severity: validation.proof.noGuess ? 'pass' : 'fail',
      message: validation.proof.noGuess ? 'No-guess verifier passed.' : 'No-guess verifier failed.',
    },
    {
      code: 'HUMAN_EXPLAINABLE',
      severity: validation.proof.humanExplainable ? 'pass' : 'fail',
      message: validation.proof.humanExplainable
        ? 'Proof uses approved human-readable techniques.'
        : 'Proof has explanation gaps or unsupported techniques.',
    },
    {
      code: 'FINAL_UNIQUENESS',
      severity: validation.proof.guestLayoutUniqueAtEnd ? 'pass' : 'fail',
      message: validation.proof.guestLayoutUniqueAtEnd
        ? `Final guest cells: ${validation.proof.finalGuestCells?.join(', ') ?? '(none reported)'}.`
        : 'Final guest layout is not unique.',
    },
    {
      code: 'PROOF_METRICS',
      severity: 'info',
      message: `${validation.proof.waveCount} wave(s), ${validation.proof.deductionCount} deduction(s).`,
      refs: validation.proof.techniqueIds,
    },
    ...proofIssueDiagnosticItems(validation.proof, puzzle),
  ])
}

function proofIssueDiagnosticItems(
  proof: NonNullable<AuthoringCaseValidationReport['proof']>,
  puzzle: PuzzleDefinition | undefined,
): readonly AuthoringDiagnosticsItem[] {
  const issueCodes = uniqueSorted(proof.issueCodes)
  const overlapItems = scopeOverlapProofDiagnosticItems(proof, puzzle)
  if (issueCodes.length === 0) return overlapItems

  const items: AuthoringDiagnosticsItem[] = [{
    code: 'PROOF_ISSUE_CODES',
    severity: 'info',
    message: `Proof verifier issue code(s): ${issueCodes.join(', ')}.`,
    refs: issueCodes,
  }]

  if (!proof.guestLayoutUniqueAtEnd) {
    items.push({
      code: 'PROOF_FINAL_UNIQUENESS_BLOCKER',
      severity: 'fail',
      message: 'Final guest layout remains non-unique after the current human-proof waves.',
      refs: issueCodes,
    })
  }

  if (issueCodes.includes('EXPLANATION_GAP')) {
    items.push({
      code: 'PROOF_EXPLANATION_GAP',
      severity: 'fail',
      message: 'Solver found forced cells that the approved human-proof templates did not explain.',
      refs: ['EXPLANATION_GAP'],
    })
  }

  if (issueCodes.includes('GUESS_POINT')) {
    items.push({
      code: 'PROOF_GUESS_POINT',
      severity: 'fail',
      message: 'The proof reached a state where no valid human deduction can advance the puzzle.',
      refs: ['GUESS_POINT'],
    })
  }

  if (issueCodes.includes('NON_PROGRESS')) {
    items.push({
      code: 'PROOF_NON_PROGRESS',
      severity: 'fail',
      message: 'The proof repeated a state or exhausted proof waves before reaching uniqueness.',
      refs: ['NON_PROGRESS'],
    })
  }

  if (issueCodes.includes('INVALID_DEDUCTION')) {
    items.push({
      code: 'PROOF_INVALID_DEDUCTION',
      severity: 'fail',
      message: 'At least one human deduction was not solver-backed.',
      refs: ['INVALID_DEDUCTION'],
    })
  }

  if (issueCodes.includes('SOLVER_TRUNCATED')) {
    items.push({
      code: 'PROOF_SOLVER_TRUNCATED',
      severity: 'fail',
      message: 'A solver cap truncated proof verification; raise caps or simplify before judging the draft.',
      refs: ['SOLVER_TRUNCATED'],
    })
  }

  items.push(...overlapItems)

  return items
}

function scopeOverlapProofDiagnosticItems(
  proof: NonNullable<AuthoringCaseValidationReport['proof']>,
  puzzle: PuzzleDefinition | undefined,
): readonly AuthoringDiagnosticsItem[] {
  if (!puzzle?.rules.some((rule) => rule.type === 'scopeOverlapCount')) return []

  const overlapTechniqueIds = proof.techniqueIds.filter((techniqueId) => techniqueId.startsWith('SCOPE_OVERLAP'))
  if (overlapTechniqueIds.length === 0 && !proof.noGuess) {
    return [{
      code: 'PROOF_SCOPE_OVERLAP_UNSUPPORTED',
      severity: 'fail',
      message: 'This draft uses scopeOverlapCount, but no approved overlap proof technique fired. Add proof support or redesign the overlap skeleton before patching with singleton or direct-safe reveals.',
      refs: ['scopeOverlapCount'],
    }]
  }

  if (overlapTechniqueIds.includes('SCOPE_OVERLAP_SCOPE_DIFFERENCE') && !proof.noGuess) {
    return [{
      code: 'PROOF_SCOPE_OVERLAP_BRIDGE_PARTIAL',
      severity: 'warning',
      message: 'An overlap scope-difference deduction fired, but the proof still stalls before no-guess final uniqueness. Continue designing late closure instead of mutating the opener.',
      refs: overlapTechniqueIds,
    }]
  }

  return []
}

function qualityGroup(quality: AuthoringDraftQualityReport | undefined): AuthoringDiagnosticsGroup {
  if (quality === undefined) return skippedGroup('quality', 'Quality Gates', 'Draft must pass schema validation first.')

  const irrelevantCellCount = quality.effectiveBoard.irrelevantCells.length
  const redundantRuleIds = quality.ruleFamilyDiversity.redundantRuleIds

  return group('quality', 'Quality Gates', [
    {
      code: 'DEGENERACY',
      severity: gateSeverity(quality.degeneracy.status),
      message: `Degeneracy gate: ${quality.degeneracy.status}.`,
      refs: quality.degeneracy.results
        .filter((result) => result.status !== 'pass')
        .map((result) => result.ruleId),
    },
    {
      code: 'RULE_CONTRIBUTION',
      severity: quality.ruleContribution.status === 'pass' ? 'pass' : 'warning',
      message: quality.ruleContribution.status === 'pass'
        ? 'No redundant rule contribution suspects.'
        : 'One or more rules have no material contribution.',
      refs: quality.ruleContribution.results
        .filter((result) => result.status === 'redundant')
        .map((result) => result.ruleId),
    },
    {
      code: 'RULE_FAMILY_DIVERSITY',
      severity: gateSeverity(quality.ruleFamilyDiversity.status),
      message: `${quality.ruleFamilyDiversity.materialFamilyCount} material rule famil(ies); ${redundantRuleIds.length} redundant rule suspect(s).`,
      refs: [...quality.ruleFamilyDiversity.materialFamilies, ...redundantRuleIds],
    },
    {
      code: 'EFFECTIVE_BOARD',
      severity: irrelevantCellCount === 0 ? 'pass' : 'warning',
      message: `${quality.effectiveBoard.effectiveCells.length} effective cell(s), ${irrelevantCellCount} irrelevant cell(s).`,
      refs: quality.effectiveBoard.irrelevantCells,
    },
  ])
}

function qualityGroupForChecks(
  puzzle: PuzzleDefinition | undefined,
  quality: AuthoringDraftQualityReport | undefined,
  checks: ReadonlySet<AuthoringDiagnosticCheckId>,
  caps: AuthoringSolverCapsReport,
): AuthoringDiagnosticsGroup {
  if (puzzle === undefined) return skippedGroup('quality', 'Quality Gates', 'Draft must pass schema validation first.')
  if (checks.has('rule-contribution') && checks.has('degeneracy') && quality !== undefined) {
    return qualityGroup(quality)
  }

  const items: AuthoringDiagnosticsItem[] = []
  if (checks.has('degeneracy')) {
    const degeneracy = evaluateDegeneracyGates(puzzle)
    items.push({
      code: 'DEGENERACY',
      severity: gateSeverity(degeneracy.status),
      message: `Degeneracy gate: ${degeneracy.status}.`,
      refs: degeneracy.results
        .filter((result) => result.status !== 'pass')
        .map((result) => result.ruleId),
    })
  }

  if (checks.has('rule-contribution')) {
    const ruleContribution = evaluateRuleContribution(puzzle, {
      solver: solverCaps(caps),
      candidateLayoutCap: caps.candidateLayoutCap,
    })
    items.push({
      code: 'RULE_CONTRIBUTION',
      severity: ruleContribution.status === 'pass' ? 'pass' : 'warning',
      message: ruleContribution.status === 'pass'
        ? 'No redundant rule contribution suspects.'
        : 'One or more rules have no material contribution.',
      refs: ruleContribution.results
        .filter((result) => result.status === 'redundant')
        .map((result) => result.ruleId),
    })
  }

  return group('quality', 'Quality Gates', items)
}

function cloneRiskGroup(cloneRisk: AntiCloneReport | undefined): AuthoringDiagnosticsGroup {
  if (cloneRisk === undefined) {
    return group('clone-risk', 'Clone Risk', [{
      code: 'CLONE_RISK_NOT_RUN',
      severity: 'info',
      message: 'Clone-risk comparison was not run because no comparison puzzles were provided.',
    }])
  }

  return group('clone-risk', 'Clone Risk', [{
    code: 'CLONE_RISK',
    severity: cloneRisk.status === 'pass' ? 'pass' : cloneRisk.status === 'fail' ? 'fail' : 'warning',
    message: `Clone-risk status: ${cloneRisk.status}; hard failures ${cloneRisk.hardFailureCount}, reviewer-blocking ${cloneRisk.reviewerBlockingCount}.`,
    refs: cloneRisk.evidenceGroups.map((evidence) => evidence.kind),
  }])
}

function difficultyGroup(validation: AuthoringCaseValidationReport): AuthoringDiagnosticsGroup {
  if (!validation.schema.ok || validation.difficultyReview === undefined) {
    return skippedGroup('difficulty', 'Difficulty', 'Draft must pass schema validation first.')
  }

  return group('difficulty', 'Difficulty', [
    {
      code: 'DIFFICULTY_UNCALIBRATED',
      severity: 'warning',
      message: 'Difficulty is an authoring heuristic and is not calibrated with real playtest data.',
    },
    {
      code: 'DIFFICULTY_BUCKET',
      severity: 'info',
      message: `Recommended bucket: ${validation.difficultyReview.recommendedBucket}.`,
    },
    {
      code: 'TARGET_FOUR_THRESHOLD',
      severity: validation.difficultyReview.targetFour.pass ? 'pass' : 'warning',
      message: validation.difficultyReview.targetFour.pass
        ? 'Target-4 heuristic threshold passed.'
        : `Target-4 heuristic missing: ${validation.difficultyReview.targetFour.missing.join(', ')}.`,
    },
    {
      code: 'SUPER_HARD_THRESHOLD',
      severity: validation.difficultyReview.superHard.pass ? 'pass' : 'info',
      message: validation.difficultyReview.superHard.pass
        ? 'Super-hard heuristic threshold passed.'
        : `Super-hard heuristic missing: ${validation.difficultyReview.superHard.missing.join(', ')}.`,
    },
  ])
}

function copyGroup(copyWarnings: readonly AuthoringCopyWarning[]): AuthoringDiagnosticsGroup {
  if (copyWarnings.length === 0) {
    return group('copy', 'Copy Warnings', [{
      code: 'COPY_CLEAR',
      severity: 'pass',
      message: 'No copy warnings were detected.',
    }])
  }

  return group('copy', 'Copy Warnings', copyWarnings.map((warning) => ({
    code: warning.code,
    severity: warning.severity,
    message: warning.message,
    refs: [warning.location],
  })))
}

function performanceGroup(capWarnings: readonly string[]): AuthoringDiagnosticsGroup {
  if (capWarnings.length === 0) {
    return group('performance', 'Performance And Caps', [{
      code: 'CAPS_CLEAR',
      severity: 'pass',
      message: 'No solver cap or truncation warning was reported.',
    }])
  }

  return group('performance', 'Performance And Caps', capWarnings.map((warning) => ({
    code: warning,
    severity: 'warning',
    message: `Solver cap warning: ${warning}.`,
  })))
}

function skippedGroup(
  id: AuthoringDiagnosticsGroupId,
  title: string,
  message: string,
): AuthoringDiagnosticsGroup {
  return {
    id,
    title,
    status: 'skipped',
    items: [{
      code: 'SKIPPED',
      severity: 'info',
      message,
    }],
  }
}

function group(
  id: AuthoringDiagnosticsGroupId,
  title: string,
  items: readonly AuthoringDiagnosticsItem[],
): AuthoringDiagnosticsGroup {
  return {
    id,
    title,
    status: groupSeverity(items),
    items,
  }
}

function groupSeverity(items: readonly AuthoringDiagnosticsItem[]): AuthoringDiagnosticsSeverity {
  if (items.some((item) => item.severity === 'fail')) return 'fail'
  if (items.some((item) => item.severity === 'warning')) return 'warning'
  if (items.some((item) => item.severity === 'pass')) return 'pass'

  return 'info'
}

function gateSeverity(status: 'pass' | 'warning' | 'fail'): AuthoringDiagnosticsItem['severity'] {
  if (status === 'fail') return 'fail'
  if (status === 'warning') return 'warning'

  return 'pass'
}

function uniqueSorted(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort()
}

function formatIssuePath(path: readonly (string | number)[]): string {
  if (path.length === 0) return '$'

  return path.reduce<string>((output, segment) => (
    typeof segment === 'number' ? `${output}[${segment}]` : `${output}.${segment}`
  ), '$')
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

function guestLayoutExamplesFor(
  puzzle: PuzzleDefinition,
  layouts: readonly {
    readonly guestCells: readonly CellId[]
    readonly cells: Readonly<Record<CellId, string>>
  }[],
): NonNullable<AuthoringCaseValidationReport['initialGuestLayoutExamples']>['layouts'] {
  const boardCells = allCells(puzzle.board)

  return layouts.map((layout) => ({
    guestCells: layout.guestCells,
    changedCells: boardCells
      .filter((cellId) => puzzle.target[cellId] !== layout.cells[cellId])
      .map((cellId) => ({
        cellId,
        current: puzzle.target[cellId],
        alternative: layout.cells[cellId],
      })),
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
