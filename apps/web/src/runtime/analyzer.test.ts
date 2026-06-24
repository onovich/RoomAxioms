import { assertPuzzleDefinition } from '@room-axioms/schema'
import { describe, expect, it } from 'vitest'
import type { CellId, Observation, PuzzleDefinition } from '@room-axioms/domain'
import case004Fixture from '../../../../content/cases/case-004.json' with { type: 'json' }
import case011Fixture from '../../../../content/cases/case-011.json' with { type: 'json' }
import case012Fixture from '../../../../content/cases/case-012.json' with { type: 'json' }

import { analyzeRuntimeState } from './analyzer'

const CASE004_BUDGET = { maxNodes: 200_000, maxModels: 200_000, maxGuestLayouts: 200_000 } as const

describe('runtime analyzer', () => {
  it('returns solver/proof-backed case-004 initial analysis', () => {
    const puzzle = loadCase004()
    const analysis = analyzeRuntimeState(
      {
        requestId: 1,
        kind: 'ANALYZE_STATE',
        puzzle,
        observations: initialObservations(puzzle),
        mode: 'player',
        options: {
          solver: CASE004_BUDGET,
        },
      },
      { now: constantClock(10) },
    )

    expect(analysis).toMatchObject({
      requestId: 1,
      status: 'ready',
      satisfiable: true,
      candidateGuestLayouts: 15,
      guestLayoutUnique: false,
      uniqueGuestCells: null,
      binCandidates: [],
      forcedSafe: [],
      forcedGuests: [],
      warnings: [],
    })
    expect(analysis.hint).toMatchObject({
      conclusion: { kind: 'safe', cellId: 'A1' },
      highlight: 'A1',
    })
    expect(analysis.hint?.proofLines.length).toBeGreaterThan(0)
    expect(analysis.proofLines.length).toBeGreaterThan(analysis.hint?.proofLines.length ?? 0)
    expect(analysis.stats.elapsedMs).toBe(10)
    expect(analysis.stats.proof.deductionCount).toBeGreaterThan(0)
    expect(analysis.noGuess).toBeUndefined()
  })

  it('can include an explicit developer no-guess verification summary', () => {
    const puzzle = loadCase004()
    const analysis = analyzeRuntimeState(
      {
        requestId: 2,
        kind: 'VERIFY_CASE',
        puzzle,
        observations: initialObservations(puzzle),
        mode: 'developer',
        options: {
          solver: CASE004_BUDGET,
          includeNoGuessReport: true,
        },
      },
      { now: constantClock(0) },
    )

    expect(analysis.noGuess).toMatchObject({
      noGuess: true,
      humanExplainable: true,
      guestLayoutUniqueAtEnd: true,
      finalGuestCells: ['D1', 'B4'],
    })
    expect(analysis.binCandidates).toEqual(['B2'])
    expect(analysis.forcedSafe).toEqual(['A1', 'C1', 'B2', 'D2', 'A3', 'B3', 'C3'])
    expect(analysis.forcedGuests).toEqual([])
    expect(analysis.warnings).toEqual([])
  })

  it('keeps promoted case-011 hints proof-backed without player developer leakage', () => {
    const puzzle = loadCase011()
    const player = analyzeRuntimeState(
      {
        requestId: 4,
        kind: 'GET_HINT',
        puzzle,
        observations: initialObservations(puzzle),
        mode: 'player',
        options: {
          solver: CASE004_BUDGET,
        },
      },
      { now: constantClock(0) },
    )

    expect(player).toMatchObject({
      requestId: 4,
      status: 'ready',
      satisfiable: true,
      candidateGuestLayouts: 2,
      guestLayoutUnique: false,
      uniqueGuestCells: null,
      binCandidates: [],
      forcedSafe: [],
      forcedGuests: [],
      warnings: [],
    })
    expect(player.hint).toMatchObject({
      technique: 'LOCAL_SCOPE_INTERSECTION',
      conclusion: { kind: 'safe', cellId: 'A2' },
      highlight: 'A2',
    })
    expect(player.hint?.proofLines.length).toBeGreaterThan(0)
    expect(player.noGuess).toBeUndefined()
  })

  it('keeps promoted case-011 no-guess summary explicit and developer-only', () => {
    const puzzle = loadCase011()
    const developer = analyzeRuntimeState(
      {
        requestId: 5,
        kind: 'VERIFY_CASE',
        puzzle,
        observations: initialObservations(puzzle),
        mode: 'developer',
        options: {
          solver: CASE004_BUDGET,
          includeNoGuessReport: true,
        },
      },
      { now: constantClock(0) },
    )

    expect(developer.noGuess).toMatchObject({
      noGuess: true,
      humanExplainable: true,
      guestLayoutUniqueAtEnd: true,
      finalGuestCells: ['A1'],
      metrics: {
        techniqueIds: ['LOCAL_SCOPE_INTERSECTION'],
      },
    })
    expect(developer.warnings).toEqual([])
  })

  it('keeps promoted case-012 retained-difference analysis developer-gated', () => {
    const puzzle = loadCase012()
    const player = analyzeRuntimeState(
      {
        requestId: 6,
        kind: 'GET_HINT',
        puzzle,
        observations: initialObservations(puzzle),
        mode: 'player',
        options: {
          solver: CASE004_BUDGET,
        },
      },
      { now: constantClock(0) },
    )
    const developer = analyzeRuntimeState(
      {
        requestId: 7,
        kind: 'VERIFY_CASE',
        puzzle,
        observations: initialObservations(puzzle),
        mode: 'developer',
        options: {
          solver: CASE004_BUDGET,
          includeNoGuessReport: true,
        },
      },
      { now: constantClock(0) },
    )

    expect(player).toMatchObject({
      requestId: 6,
      status: 'ready',
      satisfiable: true,
      candidateGuestLayouts: 2,
      guestLayoutUnique: false,
      uniqueGuestCells: null,
      binCandidates: [],
      forcedSafe: [],
      forcedGuests: [],
      warnings: [],
    })
    expect(player.hint).toMatchObject({
      technique: 'LOCAL_COUNT_SATURATED',
      conclusion: { kind: 'safe', cellId: 'D1' },
      highlight: 'D1',
    })
    expect(player.noGuess).toBeUndefined()
    expect(developer.noGuess).toMatchObject({
      noGuess: true,
      humanExplainable: true,
      guestLayoutUniqueAtEnd: true,
      finalGuestCells: ['B3', 'C3'],
      metrics: {
        techniqueIds: ['LOCAL_COUNT_SATURATED', 'LOCAL_SCOPE_DIFFERENCE'],
      },
    })
    expect(developer.warnings).toEqual([])
  })

  it('reports truncation without treating the result as complete', () => {
    const puzzle = loadCase004()
    const analysis = analyzeRuntimeState(
      {
        requestId: 3,
        kind: 'ANALYZE_STATE',
        puzzle,
        observations: initialObservations(puzzle),
        mode: 'developer',
        options: {
          solver: { maxNodes: 0, maxModels: 0, maxGuestLayouts: 1 },
          candidateLayoutCap: 1,
        },
      },
      { now: constantClock(0) },
    )

    expect(analysis.satisfiable).toBe(false)
    expect(analysis.stats.solver.truncated).toBe(true)
    expect(analysis.warnings.map((warning) => warning.code)).toContain('SOLVER_TRUNCATED')
  })
})

function loadCase004(): PuzzleDefinition {
  return assertPuzzleDefinition(case004Fixture)
}

function loadCase011(): PuzzleDefinition {
  return assertPuzzleDefinition(case011Fixture)
}

function loadCase012(): PuzzleDefinition {
  return assertPuzzleDefinition(case012Fixture)
}

function initialObservations(puzzle: PuzzleDefinition): readonly Observation[] {
  return puzzle.initialReveals.map((cellId) => observationFromTarget(puzzle, cellId))
}

function observationFromTarget(puzzle: PuzzleDefinition, cellId: CellId): Observation {
  return {
    cellId,
    kind: puzzle.target[cellId],
  }
}

function constantClock(step: number): () => number {
  let value = 0
  return () => {
    const current = value
    value += step
    return current
  }
}
