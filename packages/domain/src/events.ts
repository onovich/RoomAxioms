import type { CellId, CellKind, Observation, PlayerMark } from './types.js'

export type GameStatus = 'briefing' | 'playing' | 'failed' | 'completed'

export type GameEvent =
  | {
      readonly type: 'CASE_STARTED'
      readonly at: number
      readonly initialObservations?: readonly Observation[]
    }
  | {
      readonly type: 'CELL_INSPECTED'
      readonly at: number
      readonly cellId: CellId
      readonly result: CellKind
    }
  | {
      readonly type: 'MARK_CHANGED'
      readonly at: number
      readonly cellId: CellId
      readonly mark: PlayerMark | null
    }
  | {
      readonly type: 'HINT_REQUESTED'
      readonly at: number
      readonly proofId?: string
    }
  | {
      readonly type: 'CONCLUSION_SUBMITTED'
      readonly at: number
      readonly correct: boolean
    }
  | {
      readonly type: 'CASE_FAILED'
      readonly at: number
      readonly cellId: CellId
    }
  | {
      readonly type: 'CASE_COMPLETED'
      readonly at: number
    }
  | {
      readonly type: 'CASE_RESET'
      readonly at: number
      readonly initialObservations?: readonly Observation[]
    }

export interface GameState {
  readonly puzzleId: string
  readonly observations: ReadonlyMap<CellId, CellKind>
  readonly marks: ReadonlyMap<CellId, PlayerMark>
  readonly status: GameStatus
  readonly failedCell?: CellId
  readonly hintCount: number
  readonly inspectCount: number
  readonly lastConclusionCorrect?: boolean
  readonly eventLog: readonly GameEvent[]
}

export interface InitialGameStateInput {
  readonly puzzleId: string
  readonly initialObservations?: readonly Observation[]
}

export function createInitialGameState(input: InitialGameStateInput): GameState {
  return {
    puzzleId: input.puzzleId,
    observations: observationsFrom(input.initialObservations),
    marks: new Map(),
    status: 'briefing',
    hintCount: 0,
    inspectCount: 0,
    eventLog: [],
  }
}

export function reduceGameState(state: GameState, event: GameEvent): GameState {
  switch (event.type) {
    case 'CASE_STARTED':
      return {
        ...state,
        observations: event.initialObservations
          ? observationsFrom(event.initialObservations)
          : state.observations,
        marks: new Map(),
        status: 'playing',
        failedCell: undefined,
        lastConclusionCorrect: undefined,
        eventLog: [...state.eventLog, event],
      }
    case 'CELL_INSPECTED': {
      const observations = new Map(state.observations)
      observations.set(event.cellId, event.result)

      const marks = new Map(state.marks)
      marks.delete(event.cellId)

      return {
        ...state,
        observations,
        marks,
        inspectCount: state.inspectCount + 1,
        eventLog: [...state.eventLog, event],
      }
    }
    case 'MARK_CHANGED': {
      const marks = new Map(state.marks)
      if (event.mark === null) marks.delete(event.cellId)
      else marks.set(event.cellId, event.mark)

      return {
        ...state,
        marks,
        eventLog: [...state.eventLog, event],
      }
    }
    case 'HINT_REQUESTED':
      return {
        ...state,
        hintCount: state.hintCount + 1,
        eventLog: [...state.eventLog, event],
      }
    case 'CONCLUSION_SUBMITTED':
      return {
        ...state,
        status: event.correct ? 'completed' : state.status,
        lastConclusionCorrect: event.correct,
        eventLog: [...state.eventLog, event],
      }
    case 'CASE_FAILED':
      return {
        ...state,
        status: 'failed',
        failedCell: event.cellId,
        eventLog: [...state.eventLog, event],
      }
    case 'CASE_COMPLETED':
      return {
        ...state,
        status: 'completed',
        failedCell: undefined,
        lastConclusionCorrect: true,
        eventLog: [...state.eventLog, event],
      }
    case 'CASE_RESET':
      return {
        ...createInitialGameState({
          puzzleId: state.puzzleId,
          initialObservations: event.initialObservations,
        }),
        eventLog: [event],
      }
  }
}

function observationsFrom(
  observations: readonly Observation[] | undefined,
): ReadonlyMap<CellId, CellKind> {
  return new Map(observations?.map((item) => [item.cellId, item.kind] as const))
}
