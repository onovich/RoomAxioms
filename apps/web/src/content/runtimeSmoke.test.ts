import { describe, expect, it } from 'vitest'

import { ruleSemantics } from '../logic/scopeText'
import { evaluateGuestConclusion } from '../hooks/useRoomAxiomsGame'
import { analyzeRuntimeState } from '../runtime/analyzer'
import { contentCases } from './cases'
import type { CellId, Observation, PuzzleDefinition } from '@room-axioms/domain'

const SMOKE_SOLVER_BUDGET = {
  maxNodes: 200_000,
  maxModels: 200_000,
  maxGuestLayouts: 200_000,
} as const

describe('MVP content runtime smoke', () => {
  it.each(contentCases)('loads and analyzes $id in player and developer modes', (puzzle) => {
    const observations = initialObservations(puzzle)
    const player = analyzeRuntimeState(
      {
        requestId: 1,
        kind: 'ANALYZE_STATE',
        puzzle,
        observations,
        mode: 'player',
        options: {
          solver: SMOKE_SOLVER_BUDGET,
        },
      },
      { now: constantClock(0) },
    )
    const developer = analyzeRuntimeState(
      {
        requestId: 2,
        kind: 'VERIFY_CASE',
        puzzle,
        observations,
        mode: 'developer',
        options: {
          solver: SMOKE_SOLVER_BUDGET,
          includeNoGuessReport: true,
        },
      },
      { now: constantClock(0) },
    )

    expect(player.status).toBe('ready')
    expect(player.satisfiable).toBe(true)
    expect(player.noGuess).toBeUndefined()
    expect(player.warnings).toEqual([])
    expect(developer.noGuess).toMatchObject({
      noGuess: true,
      humanExplainable: true,
      guestLayoutUniqueAtEnd: true,
    })
    expect(developer.warnings).toEqual([])
  })

  it('keeps rule reading copy plain and free of abstract scope terms', () => {
    const localRuleTexts = contentCases.flatMap((puzzle) =>
      puzzle.rules
        .filter((rule) => rule.type === 'forEachCount')
        .map((rule) => ruleSemantics(rule)),
    )

    expect(localRuleTexts.length).toBeGreaterThan(0)
    expect(localRuleTexts.some((text) => text.includes('上下左右邻格'))).toBe(true)
    expect(localRuleTexts.some((text) => text.includes('周围一圈'))).toBe(true)
    expect(localRuleTexts.every((text) => !text.includes('正交'))).toBe(true)
    expect(localRuleTexts.every((text) => !text.includes('邻接'))).toBe(true)
  })

  it('does not reveal target cells for wrong or incomplete submissions', () => {
    const puzzle = contentCases.find((item) => item.id === 'case-004')
    if (puzzle === undefined) throw new Error('case-004 missing from smoke content')

    const targetGuests = guestCells(puzzle)
    const incomplete = evaluateGuestConclusion(targetGuests, [])
    const incorrect = evaluateGuestConclusion(targetGuests, ['A1', 'A2'])

    expect(incomplete).toEqual({ kind: 'incomplete', required: 2, marked: 0 })
    expect(incorrect).toEqual({ kind: 'incorrect' })
    expect(JSON.stringify(incomplete)).not.toContain(targetGuests[0] ?? '')
    expect(JSON.stringify(incorrect)).not.toContain(targetGuests[0] ?? '')
  })
})

function initialObservations(puzzle: PuzzleDefinition): readonly Observation[] {
  return puzzle.initialReveals.map((cellId) => ({
    cellId,
    kind: puzzle.target[cellId],
  }))
}

function guestCells(puzzle: PuzzleDefinition): readonly CellId[] {
  return Object.entries(puzzle.target)
    .filter(([, kind]) => kind === 'guest')
    .map(([cellId]) => cellId)
    .sort()
}

function constantClock(step: number): () => number {
  let value = 0
  return () => {
    const current = value
    value += step
    return current
  }
}
