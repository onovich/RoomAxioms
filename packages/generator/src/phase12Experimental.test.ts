import { allCells, type CellId, type Observation, type PuzzleDefinition } from '@room-axioms/domain'
import { verifyNoGuess } from '@room-axioms/proof'
import { parsePuzzleDefinition } from '@room-axioms/schema'
import { countGuestLayouts, isSatisfiable } from '@room-axioms/solver'
import { describe, expect, it } from 'vitest'

import phase12LocalScopeDifference001 from '../../../content/experimental/phase-12/phase-12-local-scope-difference-001.json' with { type: 'json' }

import { minimizeInitialReveals, scorePuzzleDifficulty } from './index.js'

const SOLVER_CAPS = {
  maxNodes: 20_000,
  maxModels: 20_000,
  maxGuestLayouts: 100,
} as const

describe('Phase 12 experimental fixtures', () => {
  it('keeps local-scope-difference fixtures private and mechanically validated', () => {
    const puzzle = parseFixture(phase12LocalScopeDifference001)
    const targetCheck = isSatisfiable(
      { puzzle, observations: targetObservationsForCells(puzzle, allCells(puzzle.board)) },
      [],
      SOLVER_CAPS,
    )
    const initialCheck = isSatisfiable(
      { puzzle, observations: targetObservationsForCells(puzzle, puzzle.initialReveals) },
      [],
      SOLVER_CAPS,
    )
    const initialLayouts = countGuestLayouts(
      { puzzle, observations: targetObservationsForCells(puzzle, puzzle.initialReveals) },
      20,
      SOLVER_CAPS,
    )
    const proof = verifyNoGuess(puzzle, { solver: SOLVER_CAPS })
    const score = scorePuzzleDifficulty(puzzle, { solver: SOLVER_CAPS, candidateLayoutCap: 20 })
    const minimized = minimizeInitialReveals(puzzle)

    expect(puzzle.id).toBe('phase-12-local-scope-difference-001')
    expect(puzzle.metadata.status).toBe('draft')
    expect(puzzle.metadata.tags).toContain('experimental')
    expect(targetCheck.satisfiable).toBe(true)
    expect(targetCheck.stats.truncated).toBe(false)
    expect(initialCheck.satisfiable).toBe(true)
    expect(initialCheck.stats.truncated).toBe(false)
    expect(initialLayouts.count).toBe(2)
    expect(initialLayouts.stats.truncated).toBe(false)
    expect(proof.noGuess).toBe(true)
    expect(proof.targetSatisfiesRules).toBe(true)
    expect(proof.guestLayoutUniqueAtEnd).toBe(true)
    expect(proof.finalGuestCells).toEqual(['C2', 'B3'])
    expect(proof.metrics.techniqueIds).toContain('LOCAL_SCOPE_DIFFERENCE')
    expect(proof.waves[0]?.deductions.some((deduction) => deduction.technique === 'LOCAL_SCOPE_DIFFERENCE')).toBe(true)
    expect(score.calibratedWithRealPlaytest).toBe(false)
    expect(score.metrics.solverTruncated).toBe(false)
    expect(score.metrics.techniqueIds).toContain('LOCAL_SCOPE_DIFFERENCE')
    expect(score.score).toBeGreaterThan(0)
    expect(minimized.afterCells).toEqual(['A1', 'B2'])
    expect(verifyNoGuess({ ...puzzle, initialReveals: minimized.afterCells }, { solver: SOLVER_CAPS }).metrics.techniqueIds).not.toContain('LOCAL_SCOPE_DIFFERENCE')
  })
})

function parseFixture(input: unknown): PuzzleDefinition {
  const parsed = parsePuzzleDefinition(input)
  if (!parsed.ok || parsed.puzzle === undefined) {
    throw new Error(`Unexpected invalid Phase 12 fixture: ${JSON.stringify(parsed.issues)}`)
  }

  return parsed.puzzle
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

