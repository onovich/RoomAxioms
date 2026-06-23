import { allCells, sortCellIds } from '@room-axioms/domain'
import { parsePuzzleDefinition, type SchemaIssue } from '@room-axioms/schema'
import { verifyNoGuess, type TechniqueId } from '@room-axioms/proof'
import {
  countGuestLayouts,
  findForcedCells,
  isGuestLayoutUnique,
  isSatisfiable,
  type SolverOptions,
  type SolverStats,
} from '@room-axioms/solver'
import type { CellId, Observation, PuzzleDefinition } from '@room-axioms/domain'

import { analyzeRuntimeState } from '../runtime/analyzer'
import type { AnalysisStatus, RuntimeAnalysisWarning } from '../runtime/contracts'

export const CASE_VERIFICATION_SOLVER_OPTIONS = {
  maxNodes: 200_000,
  maxModels: 200_000,
  maxGuestLayouts: 200_000,
} as const satisfies SolverOptions

export const CASE_VERIFICATION_LAYOUT_CAP = 1_000

export interface CaseVerificationOptions {
  readonly solver?: SolverOptions
  readonly candidateLayoutCap?: number
  readonly maxWaves?: number
}

export interface CaseVerificationChecks {
  readonly schemaOk: boolean
  readonly targetComplete: boolean
  readonly targetSatisfiesRules: boolean
  readonly initialSatisfiable: boolean
  readonly finalGuestLayoutUnique: boolean
  readonly noGuess: boolean
  readonly humanExplainable: boolean
  readonly runtimeReady: boolean
  readonly runtimeNoGuess: boolean
  readonly noTruncation: boolean
}

export interface CaseVerificationInitialReport {
  readonly revealedCells: readonly CellId[]
  readonly satisfiable: boolean
  readonly candidateGuestLayouts: number
  readonly candidateGuestLayoutsGreaterThan?: number
  readonly forcedSafe: readonly CellId[]
  readonly forcedGuests: readonly CellId[]
}

export interface CaseVerificationFinalReport {
  readonly unique: boolean
  readonly guestCells: readonly CellId[] | null
  readonly observations: readonly CellId[]
}

export interface CaseVerificationProofReport {
  readonly noGuess: boolean
  readonly humanExplainable: boolean
  readonly guestLayoutUniqueAtEnd: boolean
  readonly finalGuestCells: readonly CellId[] | null
  readonly waveCount: number
  readonly deductionCount: number
  readonly revealedSafeCount: number
  readonly confirmedGuestCount: number
  readonly techniqueIds: readonly TechniqueId[]
  readonly issueCodes: readonly string[]
}

export interface CaseVerificationRuntimeReport {
  readonly status: Extract<AnalysisStatus, 'ready' | 'error'>
  readonly candidateGuestLayouts: number
  readonly guestLayoutUnique: boolean
  readonly forcedSafe: readonly CellId[]
  readonly forcedGuests: readonly CellId[]
  readonly noGuess: boolean | null
  readonly humanExplainable: boolean | null
  readonly warningCodes: readonly string[]
}

export interface CaseVerificationReport {
  readonly id: string
  readonly title: string
  readonly passed: boolean
  readonly checks: CaseVerificationChecks
  readonly schemaIssues: readonly SchemaIssue[]
  readonly initial: CaseVerificationInitialReport
  readonly final: CaseVerificationFinalReport
  readonly proof: CaseVerificationProofReport
  readonly runtime: CaseVerificationRuntimeReport
  readonly stats: SolverStats
  readonly issues: readonly string[]
}

export function verifyCaseFixture(
  input: unknown,
  options: CaseVerificationOptions = {},
): CaseVerificationReport {
  const parsed = parsePuzzleDefinition(input)
  if (!parsed.ok || parsed.puzzle === undefined) return invalidSchemaReport(input, parsed.issues)

  return verifyCase(parsed.puzzle, options)
}

export function verifyCase(
  puzzle: PuzzleDefinition,
  options: CaseVerificationOptions = {},
): CaseVerificationReport {
  const solver = options.solver ?? CASE_VERIFICATION_SOLVER_OPTIONS
  const candidateLayoutCap = options.candidateLayoutCap ?? CASE_VERIFICATION_LAYOUT_CAP
  const initial = targetObservationsForCells(puzzle, puzzle.initialReveals)
  const allTargetObservations = targetObservationsForCells(puzzle, allCells(puzzle.board))
  const targetCheck = isSatisfiable({ puzzle, observations: allTargetObservations }, [], solver)
  const initialCheck = isSatisfiable({ puzzle, observations: initial }, [], solver)
  const initialLayouts = countGuestLayouts({ puzzle, observations: initial }, candidateLayoutCap, solver)
  const forced = findForcedCells({ puzzle, observations: initial }, solver)
  const proof = verifyNoGuess(puzzle, {
    solver,
    ...(options.maxWaves === undefined ? {} : { maxWaves: options.maxWaves }),
  })
  const finalObservations = uniqueObservations(
    puzzle,
    [...initial, ...proof.waves.flatMap((wave) => wave.revealed)],
  )
  const finalUnique = isGuestLayoutUnique({ puzzle, observations: finalObservations }, solver)
  const runtime = analyzeRuntimeState(
    {
      requestId: 1,
      kind: 'VERIFY_CASE',
      puzzle,
      observations: initial,
      mode: 'developer',
      options: {
        solver,
        candidateLayoutCap,
        includeNoGuessReport: true,
      },
    },
    { now: constantClock(0) },
  )

  const stats = combineStats([
    targetCheck.stats,
    initialCheck.stats,
    initialLayouts.stats,
    forced.stats,
    finalUnique.stats,
    runtime.stats.solver,
    ...proof.waves.map((wave) => wave.solverStats),
  ])
  const checks = {
    schemaOk: true,
    targetComplete: targetIsComplete(puzzle),
    targetSatisfiesRules:
      targetCheck.satisfiable && !targetCheck.stats.truncated && proof.targetSatisfiesRules,
    initialSatisfiable: initialCheck.satisfiable && !initialCheck.stats.truncated,
    finalGuestLayoutUnique:
      finalUnique.unique && proof.guestLayoutUniqueAtEnd && sameCells(finalUnique.guestCells, proof.finalGuestCells),
    noGuess: proof.noGuess,
    humanExplainable: proof.humanExplainable,
    runtimeReady: runtime.status === 'ready',
    runtimeNoGuess: runtime.noGuess?.noGuess === true && runtime.noGuess.humanExplainable,
    noTruncation: !stats.truncated,
  } satisfies CaseVerificationChecks
  const issues = reportIssues(checks, proof.issues.map((issue) => issue.code), runtime.warnings)

  return {
    id: puzzle.id,
    title: puzzle.title,
    passed: issues.length === 0,
    checks,
    schemaIssues: [],
    initial: {
      revealedCells: sortCellIds(puzzle.initialReveals, puzzle.board),
      satisfiable: initialCheck.satisfiable && !initialCheck.stats.truncated,
      candidateGuestLayouts: initialLayouts.count,
      ...(initialLayouts.greaterThan === undefined
        ? {}
        : { candidateGuestLayoutsGreaterThan: initialLayouts.greaterThan }),
      forcedSafe: forced.safe,
      forcedGuests: forced.guests,
    },
    final: {
      unique: finalUnique.unique,
      guestCells: finalUnique.guestCells,
      observations: finalObservations.map((observation) => observation.cellId),
    },
    proof: {
      noGuess: proof.noGuess,
      humanExplainable: proof.humanExplainable,
      guestLayoutUniqueAtEnd: proof.guestLayoutUniqueAtEnd,
      finalGuestCells: proof.finalGuestCells,
      waveCount: proof.metrics.waveCount,
      deductionCount: proof.metrics.deductionCount,
      revealedSafeCount: proof.metrics.revealedSafeCount,
      confirmedGuestCount: proof.metrics.confirmedGuestCount,
      techniqueIds: proof.metrics.techniqueIds,
      issueCodes: proof.issues.map((issue) => issue.code),
    },
    runtime: {
      status: runtime.status,
      candidateGuestLayouts: runtime.candidateGuestLayouts,
      guestLayoutUnique: runtime.guestLayoutUnique,
      forcedSafe: runtime.forcedSafe,
      forcedGuests: runtime.forcedGuests,
      noGuess: runtime.noGuess?.noGuess ?? null,
      humanExplainable: runtime.noGuess?.humanExplainable ?? null,
      warningCodes: runtime.warnings.map((warning) => warning.code),
    },
    stats,
    issues,
  }
}

function invalidSchemaReport(
  input: unknown,
  schemaIssues: readonly SchemaIssue[],
): CaseVerificationReport {
  const issues = schemaIssues.map((issue) => `schema:${issue.code}`)

  return {
    id: rawStringField(input, 'id') ?? 'unknown-case',
    title: rawStringField(input, 'title') ?? 'Unknown case',
    passed: false,
    checks: {
      schemaOk: false,
      targetComplete: false,
      targetSatisfiesRules: false,
      initialSatisfiable: false,
      finalGuestLayoutUnique: false,
      noGuess: false,
      humanExplainable: false,
      runtimeReady: false,
      runtimeNoGuess: false,
      noTruncation: true,
    },
    schemaIssues,
    initial: {
      revealedCells: [],
      satisfiable: false,
      candidateGuestLayouts: 0,
      forcedSafe: [],
      forcedGuests: [],
    },
    final: {
      unique: false,
      guestCells: null,
      observations: [],
    },
    proof: {
      noGuess: false,
      humanExplainable: false,
      guestLayoutUniqueAtEnd: false,
      finalGuestCells: null,
      waveCount: 0,
      deductionCount: 0,
      revealedSafeCount: 0,
      confirmedGuestCount: 0,
      techniqueIds: [],
      issueCodes: [],
    },
    runtime: {
      status: 'error',
      candidateGuestLayouts: 0,
      guestLayoutUnique: false,
      forcedSafe: [],
      forcedGuests: [],
      noGuess: null,
      humanExplainable: null,
      warningCodes: [],
    },
    stats: zeroStats(),
    issues,
  }
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

function uniqueObservations(
  puzzle: PuzzleDefinition,
  observations: readonly Observation[],
): readonly Observation[] {
  const byCell = new Map<CellId, Observation>()
  for (const observation of observations) byCell.set(observation.cellId, observation)
  return sortCellIds(byCell.keys(), puzzle.board).map((cellId) => byCell.get(cellId)).filter(isDefined)
}

function targetIsComplete(puzzle: PuzzleDefinition): boolean {
  const expected = new Set(allCells(puzzle.board))
  const targetCells = Object.keys(puzzle.target)

  return (
    targetCells.length === expected.size &&
    targetCells.every((cellId) => expected.has(cellId))
  )
}

function sameCells(
  left: readonly CellId[] | null,
  right: readonly CellId[] | null,
): boolean {
  if (left === null || right === null) return left === right
  if (left.length !== right.length) return false

  return left.every((cellId, index) => cellId === right[index])
}

function reportIssues(
  checks: CaseVerificationChecks,
  proofIssueCodes: readonly string[],
  runtimeWarnings: readonly RuntimeAnalysisWarning[],
): readonly string[] {
  const issues: string[] = []

  for (const [check, passed] of Object.entries(checks)) {
    if (!passed) issues.push(`check:${check}`)
  }

  issues.push(...proofIssueCodes.map((code) => `proof:${code}`))
  issues.push(...runtimeWarnings.map((warning) => `runtime:${warning.code}`))

  return [...new Set(issues)].sort()
}

function combineStats(stats: readonly SolverStats[]): SolverStats {
  return stats.reduce(
    (left, right) => ({
      nodeCount: left.nodeCount + right.nodeCount,
      propagationCount: left.propagationCount + right.propagationCount,
      truncated: left.truncated || right.truncated,
    }),
    zeroStats(),
  )
}

function zeroStats(): SolverStats {
  return {
    nodeCount: 0,
    propagationCount: 0,
    truncated: false,
  }
}

function rawStringField(input: unknown, key: string): string | null {
  if (typeof input !== 'object' || input === null) return null

  const value = (input as Record<string, unknown>)[key]
  return typeof value === 'string' ? value : null
}

function constantClock(step: number): () => number {
  let value = 0
  return () => {
    const current = value
    value += step
    return current
  }
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined
}
