import { describe, expect, it } from 'vitest'
import {
  createInitialGameState,
  reduceGameState,
  type GameEvent,
  type Observation,
} from './index.js'

const initialObservations = [
  { cellId: 'B1', kind: 'bottle' },
  { cellId: 'A2', kind: 'bottle' },
] satisfies readonly Observation[]

describe('game state reducer', () => {
  it('starts a case from initial observations without target access', () => {
    const state = createInitialGameState({
      puzzleId: 'case-004',
      initialObservations,
    })
    const started = reduceGameState(state, {
      type: 'CASE_STARTED',
      at: 1,
    })

    expect(started.status).toBe('playing')
    expect(started.observations.get('B1')).toBe('bottle')
    expect(started.marks.size).toBe(0)
    expect(started.eventLog).toHaveLength(1)
  })

  it('records inspected facts and clears player marks for that cell', () => {
    const marked = reduceGameState(createStartedState(), {
      type: 'MARK_CHANGED',
      at: 2,
      cellId: 'C1',
      mark: 'safe',
    })
    const inspected = reduceGameState(marked, {
      type: 'CELL_INSPECTED',
      at: 3,
      cellId: 'C1',
      result: 'mirror',
    })

    expect(inspected.observations.get('C1')).toBe('mirror')
    expect(inspected.marks.has('C1')).toBe(false)
    expect(inspected.inspectCount).toBe(1)
  })

  it('updates and clears player marks as notes, not observations', () => {
    const marked = reduceGameState(createStartedState(), {
      type: 'MARK_CHANGED',
      at: 2,
      cellId: 'D1',
      mark: 'guest',
    })
    const cleared = reduceGameState(marked, {
      type: 'MARK_CHANGED',
      at: 3,
      cellId: 'D1',
      mark: null,
    })

    expect(marked.marks.get('D1')).toBe('guest')
    expect(marked.observations.has('D1')).toBe(false)
    expect(cleared.marks.has('D1')).toBe(false)
  })

  it('tracks hints, failed cells, submitted conclusions, completion, and reset', () => {
    const events = [
      { type: 'HINT_REQUESTED', at: 2, proofId: 'hint-1' },
      { type: 'CONCLUSION_SUBMITTED', at: 3, correct: false },
      { type: 'CASE_FAILED', at: 4, cellId: 'D1' },
      { type: 'CASE_COMPLETED', at: 5 },
      { type: 'CASE_RESET', at: 6, initialObservations },
    ] satisfies readonly GameEvent[]

    const final = events.reduce(reduceGameState, createStartedState())

    expect(final.status).toBe('briefing')
    expect(final.failedCell).toBeUndefined()
    expect(final.hintCount).toBe(0)
    expect(final.inspectCount).toBe(0)
    expect(final.observations.get('A2')).toBe('bottle')
    expect(final.eventLog).toEqual([events[4]])
  })
})

function createStartedState() {
  return reduceGameState(
    createInitialGameState({ puzzleId: 'case-004', initialObservations }),
    { type: 'CASE_STARTED', at: 1 },
  )
}
