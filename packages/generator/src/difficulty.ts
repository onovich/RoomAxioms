import { allCells, sortCellIds, type Observation, type PuzzleDefinition } from '@room-axioms/domain'
import { verifyNoGuess } from '@room-axioms/proof'
import { countGuestLayouts, type SolverOptions, type SolverStats } from '@room-axioms/solver'

import type { ProvisionalDifficultyScore } from './contract.js'

export interface DifficultyScoringOptions {
  readonly solver?: SolverOptions
  readonly candidateLayoutCap?: number
}

export function scorePuzzleDifficulty(
  puzzle: PuzzleDefinition,
  options: DifficultyScoringOptions = {},
): ProvisionalDifficultyScore {
  const solver = options.solver ?? {}
  const candidateLayoutCap = options.candidateLayoutCap ?? 1_000
  const proof = verifyNoGuess(puzzle, { solver })
  const initialLayouts = countGuestLayouts(
    { puzzle, observations: observationsForCells(puzzle, puzzle.initialReveals) },
    candidateLayoutCap,
    solver,
  )
  const stats = proof.waves.reduce(
    (current, wave) => combineStats(current, wave.solverStats),
    initialLayouts.stats,
  )
  const boardCells = allCells(puzzle.board).length
  const revealCount = sortCellIds(puzzle.initialReveals, puzzle.board).length
  const unknownCellCount = boardCells - revealCount
  const techniqueIds = [...new Set(proof.metrics.techniqueIds)].sort()
  const candidatePressure = Math.log2((initialLayouts.greaterThan ?? initialLayouts.count) + 1)
  const rawScore =
    boardCells * 0.1 +
    unknownCellCount * 0.4 +
    proof.metrics.waveCount * 1.5 +
    proof.metrics.deductionCount * 0.35 +
    techniqueIds.length * 1.2 +
    candidatePressure * 1.1 +
    Math.min(stats.nodeCount / 1_000, 4)
  const score = roundTo(rawScore, 2)

  return {
    puzzleId: puzzle.id,
    calibratedWithRealPlaytest: false,
    score,
    band: bandForScore(score),
    metrics: {
      boardCells,
      unknownCellCount,
      revealCount,
      candidateGuestLayouts: initialLayouts.count,
      ...(initialLayouts.greaterThan === undefined
        ? {}
        : { candidateGuestLayoutsGreaterThan: initialLayouts.greaterThan }),
      proofWaveCount: proof.metrics.waveCount,
      deductionCount: proof.metrics.deductionCount,
      techniqueCount: techniqueIds.length,
      techniqueIds,
      solverNodeCount: stats.nodeCount,
      solverPropagationCount: stats.propagationCount,
      solverTruncated: stats.truncated,
    },
  }
}

function observationsForCells(
  puzzle: PuzzleDefinition,
  cellIds: readonly string[],
): readonly Observation[] {
  return cellIds.map((cellId) => ({
    cellId,
    kind: puzzle.target[cellId],
  }))
}

function combineStats(left: SolverStats, right: SolverStats): SolverStats {
  return {
    nodeCount: left.nodeCount + right.nodeCount,
    propagationCount: left.propagationCount + right.propagationCount,
    truncated: left.truncated || right.truncated,
  }
}

function bandForScore(score: number): 1 | 2 | 3 | 4 | 5 {
  if (score < 6) return 1
  if (score < 10) return 2
  if (score < 14) return 3
  if (score < 18) return 4
  return 5
}

function roundTo(value: number, digits: number): number {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}
