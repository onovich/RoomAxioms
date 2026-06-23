import { allCells, sortCellIds } from '@room-axioms/domain'
import {
  buildProofGraph,
  deriveHumanDeductions,
  findExplanationGaps,
  renderProofText,
  verifyNoGuess,
} from '@room-axioms/proof'
import {
  countGuestLayouts,
  findForcedCells,
  isGuestLayoutUnique,
  isSatisfiable,
} from '@room-axioms/solver'
import type { CellId, CellKind, Observation, PuzzleDefinition } from '@room-axioms/domain'
import type { Deduction, VerificationIssue } from '@room-axioms/proof'
import type { SolverOptions, SolverStats } from '@room-axioms/solver'

import type {
  RuntimeAnalysis,
  RuntimeAnalysisRequest,
  RuntimeAnalysisStats,
  RuntimeAnalysisWarning,
  RuntimeHint,
} from './contracts'

export interface RuntimeAnalyzerDependencies {
  readonly now?: () => number
}

const DEFAULT_CANDIDATE_LAYOUT_CAP = 20
const DEFAULT_SOLVER_OPTIONS = {
  maxNodes: 200_000,
  maxModels: 200_000,
  maxGuestLayouts: 200_000,
} as const

export function analyzeRuntimeState(
  request: RuntimeAnalysisRequest,
  dependencies: RuntimeAnalyzerDependencies = {},
): RuntimeAnalysis {
  const now = dependencies.now ?? defaultNow
  const start = now()
  const solverOptions = request.options?.solver ?? DEFAULT_SOLVER_OPTIONS
  const candidateLayoutCap = request.options?.candidateLayoutCap ?? DEFAULT_CANDIDATE_LAYOUT_CAP
  const input = {
    puzzle: request.puzzle,
    observations: request.observations,
  }
  const warnings: RuntimeAnalysisWarning[] = []
  const includeDeveloperDiagnostics =
    request.mode === 'developer' || request.kind === 'VERIFY_CASE'

  const satisfiable = isSatisfiable(input, [], solverOptions)
  const candidateLayouts = countGuestLayouts(input, candidateLayoutCap, solverOptions)
  const forced = includeDeveloperDiagnostics
    ? findForcedCells(input, solverOptions)
    : emptyForcedCells()
  const unique = includeDeveloperDiagnostics
    ? isGuestLayoutUnique(input, solverOptions)
    : emptyUniqueLayout()
  const binCandidates = includeDeveloperDiagnostics
    ? findKindCandidates(request.puzzle, input.observations, 'bin', solverOptions)
    : emptyCandidateCells()
  const deductions = deriveHumanDeductions(input)
  const proofGraph = buildProofGraph(input, deductions)
  const proofLines = renderProofText(proofGraph)
  const gapReport = includeDeveloperDiagnostics
    ? findExplanationGaps(input, deductions, solverOptions)
    : emptyGapReport()
  const hint = selectRuntimeHint(request.observations, deductions, proofLines)
  const noGuess = request.options?.includeNoGuessReport === true
    ? verifyNoGuess(request.puzzle, { solver: solverOptions })
    : null

  collectSolverWarnings(warnings, [
    satisfiable.stats,
    candidateLayouts.stats,
    forced.stats,
    unique.stats,
    binCandidates.stats,
    gapReport.stats,
  ])

  if (!satisfiable.stats.truncated && !satisfiable.satisfiable) {
    warnings.push({
      code: 'STATE_UNSAT',
      message: 'Current observations are not satisfiable.',
    })
  }

  if (candidateLayouts.greaterThan !== undefined) {
    warnings.push({
      code: 'CANDIDATE_CAP_REACHED',
      message: `Candidate guest-layout count exceeded cap ${candidateLayouts.greaterThan}.`,
    })
  }

  warnings.push(...warningsFromIssues(gapReport.issues))
  if (noGuess !== null) warnings.push(...warningsFromIssues(noGuess.issues))

  return {
    requestId: request.requestId,
    status: warnings.some((warning) => warning.code === 'STATE_UNSAT') ? 'error' : 'ready',
    satisfiable: satisfiable.satisfiable && !satisfiable.stats.truncated,
    candidateGuestLayouts: candidateLayouts.count,
    ...(candidateLayouts.greaterThan === undefined
      ? {}
      : { candidateGuestLayoutsGreaterThan: candidateLayouts.greaterThan }),
    guestLayoutUnique: unique.unique,
    uniqueGuestCells: unique.guestCells,
    binCandidates: binCandidates.candidates,
    forcedSafe: forced.safe,
    forcedGuests: forced.guests,
    hint,
    proofLines,
    ...(noGuess === null
      ? {}
      : {
          noGuess: {
            noGuess: noGuess.noGuess,
            humanExplainable: noGuess.humanExplainable,
            guestLayoutUniqueAtEnd: noGuess.guestLayoutUniqueAtEnd,
            finalGuestCells: noGuess.finalGuestCells,
            issues: noGuess.issues,
            metrics: noGuess.metrics,
          },
        }),
    stats: runtimeStats({
      elapsedMs: now() - start,
      solverStats: [
        satisfiable.stats,
        candidateLayouts.stats,
        forced.stats,
        unique.stats,
        binCandidates.stats,
        gapReport.stats,
        ...(noGuess === null ? [] : noGuess.waves.map((wave) => wave.solverStats)),
      ],
      deductionCount: deductions.length,
      proofLineCount: proofLines.length,
      issueCount: gapReport.issues.length + (noGuess?.issues.length ?? 0),
    }),
    warnings,
  }
}

function defaultNow(): number {
  return performance.now()
}

function selectRuntimeHint(
  observations: readonly Observation[],
  deductions: readonly Deduction[],
  proofLines: readonly string[],
): RuntimeHint | null {
  const observedCells = new Set(observations.map((observation) => observation.cellId))
  const deduction = deductions.find((candidate) => {
    const cellId = candidate.conclusion.cellId
    if (observedCells.has(cellId)) return false
    return candidate.conclusion.kind === 'safe' || candidate.conclusion.kind === 'guest'
  })

  if (deduction === undefined) return null

  return {
    deductionId: deduction.id,
    technique: deduction.technique,
    conclusion: deduction.conclusion,
    ruleIds: deduction.ruleIds,
    proofLines: proofLinesForDeduction(proofLines, deduction),
    highlight: deduction.conclusion.cellId,
  }
}

function proofLinesForDeduction(
  proofLines: readonly string[],
  deduction: Deduction,
): readonly string[] {
  const selectedIds = new Set(deduction.proofNodeIds)
  const selected = proofLines.filter((line) => [...selectedIds].some((nodeId) => line.includes(nodeId)))
  return selected.length > 0 ? selected : proofLines
}

function collectSolverWarnings(
  warnings: RuntimeAnalysisWarning[],
  stats: readonly SolverStats[],
): void {
  if (stats.some((item) => item.truncated)) {
    warnings.push({
      code: 'SOLVER_TRUNCATED',
      message: 'At least one runtime analysis query reached a solver budget before completion.',
    })
  }
}

function findKindCandidates(
  puzzle: PuzzleDefinition,
  observations: readonly Observation[],
  kind: CellKind,
  options: SolverOptions,
): {
  readonly candidates: readonly CellId[]
  readonly stats: SolverStats
} {
  const observed = new Map(observations.map((observation) => [observation.cellId, observation.kind]))
  const input = { puzzle, observations }
  const candidates: CellId[] = []
  let stats = zeroStats()

  for (const cellId of allCells(puzzle.board)) {
    const observedKind = observed.get(cellId)
    if (observedKind !== undefined && observedKind !== kind) continue

    const result = isSatisfiable(input, [{ kind: 'cellIs', cellId, value: kind }], options)
    stats = combineStats(stats, result.stats)
    if (!result.stats.truncated && result.satisfiable) candidates.push(cellId)
  }

  return {
    candidates: sortCellIds(candidates, puzzle.board),
    stats,
  }
}

function emptyForcedCells(): {
  readonly safe: readonly CellId[]
  readonly guests: readonly CellId[]
  readonly stats: SolverStats
} {
  return {
    safe: [],
    guests: [],
    stats: zeroStats(),
  }
}

function emptyUniqueLayout(): {
  readonly unique: boolean
  readonly guestCells: readonly CellId[] | null
  readonly stats: SolverStats
} {
  return {
    unique: false,
    guestCells: null,
    stats: zeroStats(),
  }
}

function emptyCandidateCells(): {
  readonly candidates: readonly CellId[]
  readonly stats: SolverStats
} {
  return {
    candidates: [],
    stats: zeroStats(),
  }
}

function emptyGapReport(): {
  readonly issues: readonly VerificationIssue[]
  readonly stats: SolverStats
} {
  return {
    issues: [],
    stats: zeroStats(),
  }
}

function warningsFromIssues(issues: readonly VerificationIssue[]): readonly RuntimeAnalysisWarning[] {
  return issues.map((issue) => ({
    code: issueCodeToWarningCode(issue.code),
    message: issue.message,
    ...(issue.cellIds === undefined ? {} : { cellIds: issue.cellIds }),
    ...(issue.deductionIds === undefined ? {} : { deductionIds: issue.deductionIds }),
  }))
}

function issueCodeToWarningCode(issueCode: VerificationIssue['code']): RuntimeAnalysisWarning['code'] {
  switch (issueCode) {
    case 'EXPLANATION_GAP':
      return 'EXPLANATION_GAP'
    case 'INVALID_DEDUCTION':
      return 'INVALID_DEDUCTION'
    case 'SOLVER_TRUNCATED':
      return 'SOLVER_TRUNCATED'
    case 'TARGET_VIOLATES_RULE':
      return 'TARGET_VIOLATES_RULE'
    case 'CONTRADICTION':
      return 'STATE_UNSAT'
    case 'GUESS_POINT':
    case 'NON_PROGRESS':
      return 'VERIFIER_ISSUE'
  }
}

function runtimeStats(input: {
  readonly elapsedMs: number
  readonly solverStats: readonly SolverStats[]
  readonly deductionCount: number
  readonly proofLineCount: number
  readonly issueCount: number
}): RuntimeAnalysisStats {
  return {
    elapsedMs: input.elapsedMs,
    solver: input.solverStats.reduce(combineStats, zeroStats()),
    proof: {
      deductionCount: input.deductionCount,
      proofLineCount: input.proofLineCount,
      issueCount: input.issueCount,
    },
  }
}

function zeroStats(): SolverStats {
  return {
    nodeCount: 0,
    propagationCount: 0,
    truncated: false,
  }
}

function combineStats(left: SolverStats, right: SolverStats): SolverStats {
  return {
    nodeCount: left.nodeCount + right.nodeCount,
    propagationCount: left.propagationCount + right.propagationCount,
    truncated: left.truncated || right.truncated,
  }
}
