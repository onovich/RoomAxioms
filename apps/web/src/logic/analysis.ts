import { allCells, sortCellIds } from '@room-axioms/domain'
import {
  countGuestLayouts,
  findForcedCells,
  isGuestLayoutUnique,
  isSatisfiable,
} from '@room-axioms/solver'
import type { CellId, CellKind, Observation, PuzzleDefinition } from '@room-axioms/domain'
import type { SolverOptions, SolverStats } from '@room-axioms/solver'

const DEFAULT_LAYOUT_CAP = 20
const DEFAULT_SOLVER_OPTIONS = {
  maxNodes: 200_000,
  maxModels: 200_000,
  maxGuestLayouts: 200_000,
} as const

export interface AnalysisOptions {
  readonly layoutCap?: number
  readonly solver?: SolverOptions
}

export interface AnalysisResult {
  readonly layouts: readonly (readonly CellId[])[]
  readonly layoutCount: number
  readonly layoutCountGreaterThan?: number
  readonly binCandidates: readonly CellId[]
  readonly forcedSafe: readonly CellId[]
  readonly forcedGuests: readonly CellId[]
  readonly unique: boolean
  readonly satisfiable: boolean
  readonly truncated: boolean
  readonly stats: SolverStats
  readonly elapsed: number
}

export function analyzePuzzle(
  puzzle: PuzzleDefinition,
  observations: ReadonlyMap<CellId, CellKind>,
  now: () => number = () => performance.now(),
  options: AnalysisOptions = {},
): AnalysisResult {
  const start = now()
  const solverOptions = options.solver ?? DEFAULT_SOLVER_OPTIONS
  const layoutCap = options.layoutCap ?? DEFAULT_LAYOUT_CAP
  const input = {
    puzzle,
    observations: mapToObservations(observations),
  }

  const satisfiable = isSatisfiable(input, [], solverOptions)
  const layoutCount = countGuestLayouts(input, layoutCap, solverOptions)
  const forced = findForcedCells(input, solverOptions)
  const unique = isGuestLayoutUnique(input, solverOptions)
  const binCandidates = findKindCandidates(puzzle, input.observations, 'bin', solverOptions)
  const stats = [
    satisfiable.stats,
    layoutCount.stats,
    forced.stats,
    unique.stats,
    binCandidates.stats,
  ].reduce(combineStats, zeroStats())

  return {
    layouts: legacyLayoutSummary(layoutCount.count, unique.guestCells),
    layoutCount: layoutCount.count,
    ...(layoutCount.greaterThan === undefined
      ? {}
      : { layoutCountGreaterThan: layoutCount.greaterThan }),
    binCandidates: binCandidates.candidates,
    forcedSafe: sortCellIds(forced.safe, puzzle.board),
    forcedGuests: sortCellIds(forced.guests, puzzle.board),
    unique: unique.unique,
    satisfiable: satisfiable.satisfiable && !satisfiable.stats.truncated,
    truncated: stats.truncated,
    stats,
    elapsed: now() - start,
  }
}

function mapToObservations(observations: ReadonlyMap<CellId, CellKind>): readonly Observation[] {
  return [...observations.entries()].map(([cellId, kind]) => ({ cellId, kind }))
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

function legacyLayoutSummary(
  count: number,
  uniqueGuestCells: readonly CellId[] | null,
): readonly (readonly CellId[])[] {
  if (count === 1 && uniqueGuestCells !== null) return [uniqueGuestCells]
  return Array.from({ length: count }, () => [])
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
