import {
  allCells,
  formatCellId,
  parseCellId,
  sortCellIds,
  type BoardSize,
  type CellId,
  type CellKind,
  type Observation,
  type PuzzleDefinition,
} from '@room-axioms/domain'
import { verifyNoGuess } from '@room-axioms/proof'
import {
  isSatisfiable,
  type SolverOptions,
  type SolverStats,
} from '@room-axioms/solver'

export type EffectiveCellReason =
  | 'candidate-guest-layout'
  | 'proof-premise'
  | 'proof-conclusion'
  | 'proof-revealed'
  | 'proof-confirmed-guest'
  | 'final-guest'

export interface EffectiveBoardBounds {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
}

export interface EffectiveCell {
  cellId: CellId
  normalizedCellId: CellId
  targetKind: CellKind
  reasons: readonly EffectiveCellReason[]
}

export interface EffectiveBoardReduction {
  puzzleId: string
  originalBoard: BoardSize
  effectiveBoard: BoardSize
  bounds: EffectiveBoardBounds
  cells: readonly EffectiveCell[]
  effectiveCells: readonly CellId[]
  irrelevantCells: readonly CellId[]
  solverStats: SolverStats
}

export interface EffectiveBoardReductionOptions {
  solver?: SolverOptions
}

const emptyStats = (): SolverStats => ({
  nodeCount: 0,
  propagationCount: 0,
  truncated: false,
})

const addStats = (left: SolverStats, right: SolverStats): SolverStats => ({
  nodeCount: left.nodeCount + right.nodeCount,
  propagationCount: left.propagationCount + right.propagationCount,
  truncated: left.truncated || right.truncated,
})

const findTargetKind = (puzzle: PuzzleDefinition, cellId: CellId): CellKind => {
  const target = puzzle.target[cellId]
  if (target === undefined) {
    throw new Error(`Target does not contain ${cellId}`)
  }
  return target
}

const normalizeCellId = (
  cellId: CellId,
  bounds: EffectiveBoardBounds,
  effectiveBoard: BoardSize,
): CellId => {
  const coord = parseCellId(cellId, {
    width: bounds.xMax + 1,
    height: bounds.yMax + 1,
  })

  return formatCellId(
    { x: coord.x - bounds.xMin, y: coord.y - bounds.yMin },
    effectiveBoard,
  )
}

const computeBounds = (
  board: BoardSize,
  effectiveCells: readonly CellId[],
): EffectiveBoardBounds => {
  if (effectiveCells.length === 0) {
    return {
      xMin: 0,
      xMax: board.width - 1,
      yMin: 0,
      yMax: board.height - 1,
    }
  }

  const coords = effectiveCells.map((cellId) => parseCellId(cellId, board))
  return {
    xMin: Math.min(...coords.map((coord) => coord.x)),
    xMax: Math.max(...coords.map((coord) => coord.x)),
    yMin: Math.min(...coords.map((coord) => coord.y)),
    yMax: Math.max(...coords.map((coord) => coord.y)),
  }
}

const addReason = (
  reasonsByCell: Map<CellId, Set<EffectiveCellReason>>,
  cellId: CellId,
  reason: EffectiveCellReason,
) => {
  const reasons = reasonsByCell.get(cellId) ?? new Set<EffectiveCellReason>()
  reasons.add(reason)
  reasonsByCell.set(cellId, reasons)
}

const markProofCells = (
  puzzle: PuzzleDefinition,
  reasonsByCell: Map<CellId, Set<EffectiveCellReason>>,
  options: EffectiveBoardReductionOptions,
) => {
  const report = verifyNoGuess(puzzle, { solver: options.solver })

  for (const cellId of report.finalGuestCells ?? []) {
    addReason(reasonsByCell, cellId, 'final-guest')
  }

  for (const wave of report.waves) {
    for (const observation of wave.revealed) {
      addReason(reasonsByCell, observation.cellId, 'proof-revealed')
    }

    for (const cellId of wave.confirmedGuests) {
      addReason(reasonsByCell, cellId, 'proof-confirmed-guest')
    }

    for (const deduction of wave.deductions) {
      addReason(reasonsByCell, deduction.conclusion.cellId, 'proof-conclusion')

      for (const premise of deduction.premises) {
        if (premise.kind === 'count') {
          continue
        }

        for (const cellId of premise.cellIds ?? []) {
          addReason(reasonsByCell, cellId, 'proof-premise')
        }
      }
    }
  }
}

const markCandidateGuestCells = (
  puzzle: PuzzleDefinition,
  reasonsByCell: Map<CellId, Set<EffectiveCellReason>>,
  options: EffectiveBoardReductionOptions,
): SolverStats => {
  const observedCells = new Set(puzzle.initialReveals)
  const initialObservations = targetObservationsForCells(puzzle, puzzle.initialReveals)
  let stats = emptyStats()

  for (const cellId of allCells(puzzle.board)) {
    if (observedCells.has(cellId)) {
      continue
    }

    const result = isSatisfiable(
      { puzzle, observations: initialObservations },
      [{ kind: 'cellIs', cellId, value: 'guest' }],
      options.solver,
    )
    stats = addStats(stats, result.stats)

    if (result.satisfiable) {
      addReason(reasonsByCell, cellId, 'candidate-guest-layout')
    }
  }

  return stats
}

const targetObservationsForCells = (
  puzzle: PuzzleDefinition,
  cellIds: readonly CellId[],
): readonly Observation[] => cellIds.map((cellId) => ({
  cellId,
  kind: findTargetKind(puzzle, cellId),
}))

export const reduceEffectiveBoard = (
  puzzle: PuzzleDefinition,
  options: EffectiveBoardReductionOptions = {},
): EffectiveBoardReduction => {
  const reasonsByCell = new Map<CellId, Set<EffectiveCellReason>>()

  markProofCells(puzzle, reasonsByCell, options)
  const solverStats = markCandidateGuestCells(puzzle, reasonsByCell, options)

  const effectiveCells = sortCellIds(reasonsByCell.keys(), puzzle.board)
  const irrelevantCells = allCells(puzzle.board).filter(
    (cellId) => !reasonsByCell.has(cellId),
  )
  const bounds = computeBounds(puzzle.board, effectiveCells)
  const effectiveBoard = {
    width: bounds.xMax - bounds.xMin + 1,
    height: bounds.yMax - bounds.yMin + 1,
  }

  const cells = effectiveCells.map((cellId) => ({
    cellId,
    normalizedCellId: normalizeCellId(cellId, bounds, effectiveBoard),
    targetKind: findTargetKind(puzzle, cellId),
    reasons: [...(reasonsByCell.get(cellId) ?? [])].sort(),
  }))

  return {
    puzzleId: puzzle.id,
    originalBoard: puzzle.board,
    effectiveBoard,
    bounds,
    cells,
    effectiveCells,
    irrelevantCells,
    solverStats,
  }
}
