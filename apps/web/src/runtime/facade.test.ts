import { assertPuzzleDefinition } from '@room-axioms/schema'
import { describe, expect, it } from 'vitest'

import case004Fixture from '../../../../content/cases/case-004.json' with { type: 'json' }
import { RuntimeAnalysisFacade, type RuntimeAnalyzeHandler } from './facade'
import type {
  RuntimeAnalysis,
  RuntimeAnalysisRequest,
  RuntimeWorkerResponse,
} from './contracts'

describe('RuntimeAnalysisFacade', () => {
  it('discards stale out-of-order analysis responses', async () => {
    const first = deferred<RuntimeAnalysis>()
    const second = deferred<RuntimeAnalysis>()
    const responses: RuntimeWorkerResponse[] = []
    const facade = new RuntimeAnalysisFacade({
      analyze: selectByRequestId({
        1: first.promise,
        2: second.promise,
      }),
      onResponse: (response) => responses.push(response),
    })

    const firstId = facade.submit(baseInput())
    const secondId = facade.submit(baseInput())

    expect(firstId).toBe(1)
    expect(secondId).toBe(2)
    expect(responseStatuses(responses)).toEqual(['loading:1', 'stale:1', 'loading:2'])

    first.resolve(fakeAnalysis(firstId))
    await flushAsyncWork()

    expect(responseStatuses(responses)).toEqual(['loading:1', 'stale:1', 'loading:2'])

    second.resolve(fakeAnalysis(secondId))
    await flushAsyncWork()

    expect(responseStatuses(responses)).toEqual([
      'loading:1',
      'stale:1',
      'loading:2',
      'ready:2',
    ])
    expect(facade.getSnapshot().status).toBe('ready')
    expect(facade.getSnapshot().analysis?.requestId).toBe(secondId)
  })

  it('cancels the active request and suppresses its eventual result', async () => {
    const pending = deferred<RuntimeAnalysis>()
    const responses: RuntimeWorkerResponse[] = []
    const facade = new RuntimeAnalysisFacade({
      analyze: () => pending.promise,
      onResponse: (response) => responses.push(response),
    })

    const requestId = facade.submit(baseInput())
    const cancelled = facade.cancel(requestId)

    pending.resolve(fakeAnalysis(requestId))
    await flushAsyncWork()

    expect(cancelled).toBe(true)
    expect(responseStatuses(responses)).toEqual(['loading:1', 'stale:1'])
    expect(facade.getSnapshot().status).toBe('stale')
  })

  it('normalizes thrown analysis failures into structured errors', async () => {
    const responses: RuntimeWorkerResponse[] = []
    const facade = new RuntimeAnalysisFacade({
      analyze: () => {
        throw new Error('analysis exploded')
      },
      onResponse: (response) => responses.push(response),
    })

    facade.submit(baseInput())
    await flushAsyncWork()

    expect(responseStatuses(responses)).toEqual(['loading:1', 'error:1'])
    expect(facade.getSnapshot().error).toEqual({
      code: 'RUNTIME_ANALYSIS_FAILED',
      message: 'analysis exploded',
      requestId: 1,
    })
  })
})

function baseInput(): Omit<RuntimeAnalysisRequest, 'requestId'> {
  return {
    kind: 'ANALYZE_STATE',
    puzzle: assertPuzzleDefinition(case004Fixture),
    observations: [],
    mode: 'player',
  }
}

function selectByRequestId(
  responses: Record<number, Promise<RuntimeAnalysis>>,
): RuntimeAnalyzeHandler {
  return (request) => {
    const response = responses[request.requestId]
    if (response === undefined) throw new Error(`No response for request ${request.requestId}`)
    return response
  }
}

function responseStatuses(responses: readonly RuntimeWorkerResponse[]): readonly string[] {
  return responses.map((response) => `${response.status}:${response.requestId}`)
}

function fakeAnalysis(requestId: number): RuntimeAnalysis {
  return {
    requestId,
    status: 'ready',
    satisfiable: true,
    candidateGuestLayouts: 0,
    guestLayoutUnique: false,
    uniqueGuestCells: null,
    binCandidates: [],
    forcedSafe: [],
    forcedGuests: [],
    hint: null,
    proofLines: [],
    stats: {
      elapsedMs: 0,
      solver: {
        nodeCount: 0,
        propagationCount: 0,
        truncated: false,
      },
      proof: {
        deductionCount: 0,
        proofLineCount: 0,
        issueCount: 0,
      },
    },
    warnings: [],
  }
}

function deferred<T>(): {
  readonly promise: Promise<T>
  readonly resolve: (value: T) => void
} {
  let resolveValue: (value: T) => void = () => undefined
  const promise = new Promise<T>((resolve) => {
    resolveValue = resolve
  })

  return {
    promise,
    resolve: resolveValue,
  }
}

async function flushAsyncWork(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}
