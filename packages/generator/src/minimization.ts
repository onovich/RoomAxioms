import { sortCellIds, type CellId, type PuzzleDefinition } from '@room-axioms/domain'
import { verifyNoGuess } from '@room-axioms/proof'
import { parsePuzzleDefinition } from '@room-axioms/schema'
import type { SolverOptions } from '@room-axioms/solver'

import type {
  RevealMinimizationReport,
  RevealMinimizationStep,
} from './contract.js'

export interface RevealMinimizationOptions {
  readonly solver?: SolverOptions
  readonly order?: readonly CellId[]
}

export function minimizeInitialReveals(
  puzzle: PuzzleDefinition,
  options: RevealMinimizationOptions = {},
): RevealMinimizationReport {
  const beforeCells = sortCellIds(puzzle.initialReveals, puzzle.board)
  const proofBefore = verifyNoGuess(puzzle, { solver: options.solver })
  let currentCells = beforeCells
  let currentProof = proofBefore
  const steps: RevealMinimizationStep[] = []
  const order = options.order === undefined ? beforeCells : sortCellIds(options.order, puzzle.board)

  for (const cellId of order) {
    if (!currentCells.includes(cellId)) continue

    const candidateCells = currentCells.filter((candidate) => candidate !== cellId)
    const candidatePuzzle = withInitialReveals(puzzle, candidateCells)
    const parsed = parsePuzzleDefinition(candidatePuzzle)

    if (!parsed.ok || parsed.puzzle === undefined) {
      steps.push({ cellId, removed: false, reason: 'required-for-schema' })
      continue
    }

    const proof = verifyNoGuess(parsed.puzzle, { solver: options.solver })
    const reason = rejectionReason(proof)
    if (reason === null) {
      currentCells = candidateCells
      currentProof = proof
      steps.push({
        cellId,
        removed: true,
        reason: 'preserved-no-guess-and-uniqueness',
      })
      continue
    }

    steps.push({ cellId, removed: false, reason })
  }

  return {
    puzzleId: puzzle.id,
    beforeCount: beforeCells.length,
    afterCount: currentCells.length,
    beforeCells,
    afterCells: currentCells,
    steps,
    proofBefore,
    proofAfter: currentProof,
  }
}

function withInitialReveals(
  puzzle: PuzzleDefinition,
  initialReveals: readonly CellId[],
): PuzzleDefinition {
  return {
    ...puzzle,
    initialReveals: sortCellIds(initialReveals, puzzle.board),
  }
}

function rejectionReason(
  proof: ReturnType<typeof verifyNoGuess>,
): Exclude<RevealMinimizationStep['reason'], 'preserved-no-guess-and-uniqueness'> | null {
  if (proof.issues.some((issue) => issue.code === 'SOLVER_TRUNCATED')) return 'solver-truncated'
  if (!proof.noGuess || !proof.humanExplainable) return 'required-for-proof'
  if (!proof.guestLayoutUniqueAtEnd) return 'required-for-uniqueness'

  return null
}
