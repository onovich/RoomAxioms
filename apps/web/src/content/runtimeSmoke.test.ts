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

const SHIPPED_CASE_RUNTIME_SMOKE_TIMEOUT_MS = 30_000

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
  }, SHIPPED_CASE_RUNTIME_SMOKE_TIMEOUT_MS)

  it('keeps rule reading copy plain and free of abstract scope terms', () => {
    const ruleTexts = contentCases.flatMap((puzzle) => puzzle.rules.map((rule) => ruleSemantics(rule)))

    expect(ruleTexts.length).toBeGreaterThan(0)
    expect(ruleTexts.every((text) => !/[A-Za-z]/.test(text))).toBe(true)
    expect(ruleTexts.some((text) => text.includes('上下左右邻格'))).toBe(true)
    expect(ruleTexts.some((text) => text.includes('周围一圈'))).toBe(true)
    expect(ruleTexts.every((text) => !text.includes('正交'))).toBe(true)
    expect(ruleTexts.every((text) => !text.includes('邻接'))).toBe(true)
  })

  it('keeps shipped case and rule presentation copy Chinese and plain', () => {
    const copyFields = contentCases.flatMap((puzzle) => [
      puzzle.title,
      puzzle.caseName ?? puzzle.title,
      ...puzzle.rules.flatMap((rule) => [
        rule.presentation?.title ?? '',
        rule.presentation?.flavor ?? '',
      ]),
    ])

    expect(copyFields.every((text) => !/[A-Za-z]/.test(text))).toBe(true)
    expect(copyFields.every((text) => !text.includes('正交'))).toBe(true)
    expect(copyFields.every((text) => !text.includes('邻接域'))).toBe(true)
    expect(copyFields.some((text) => text.includes('上下左右邻格'))).toBe(true)
    expect(copyFields.some((text) => text.includes('周围一圈'))).toBe(true)
  })

  it.each(contentCases)('does not reveal target cells for wrong or incomplete submissions in $id', (puzzle) => {
    const targetGuests = guestCells(puzzle)
    const wrongMarkedGuests = nonGuestCells(puzzle).slice(0, targetGuests.length)
    const incomplete = evaluateGuestConclusion(targetGuests, [])
    const incorrect = evaluateGuestConclusion(targetGuests, wrongMarkedGuests)

    expect(incomplete).toEqual({ kind: 'incomplete', required: targetGuests.length, marked: 0 })
    expect(incorrect).toEqual({ kind: 'incorrect' })
    for (const targetGuest of targetGuests) {
      expect(JSON.stringify(incomplete)).not.toContain(targetGuest)
      expect(JSON.stringify(incorrect)).not.toContain(targetGuest)
    }
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

function nonGuestCells(puzzle: PuzzleDefinition): readonly CellId[] {
  return Object.entries(puzzle.target)
    .filter(([, kind]) => kind !== 'guest')
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
