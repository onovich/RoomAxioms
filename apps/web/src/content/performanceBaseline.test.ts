import { allCells, type BoardSize, type CellId, type CellKind, type PuzzleDefinition } from '@room-axioms/domain'
import { countGuestLayouts } from '@room-axioms/solver'
import { describe, expect, it } from 'vitest'

import { analyzeRuntimeState } from '../runtime/analyzer'
import { contentCases, getCaseById } from './cases'
import { verifyCase } from './caseVerification'

const BASELINE_RUNS = 9
const BASELINE_WARMUP_RUNS = 2
const RUNTIME_ANALYSIS_PRODUCT_TARGET_MS = 100
const RUNTIME_ANALYSIS_P95_CEILING_MS = 500
const CANDIDATE_CAP_P95_MS = 200
const FULL_VERIFICATION_P95_MS = 10_000
const FULL_VERIFICATION_TIMEOUT_MS = 30_000

const BASELINE_SOLVER_BUDGET = {
  maxNodes: 200_000,
  maxModels: 200_000,
  maxGuestLayouts: 200_000,
} as const

describe('MVP performance baseline', () => {
  it('keeps representative 4x4 runtime analysis under the MVP P95 target', () => {
    const puzzle = getCaseById('case-004')
    const observations = puzzle.initialReveals.map((cellId) => ({
      cellId,
      kind: puzzle.target[cellId],
    }))
    const summary = measureRepeated(() =>
      analyzeRuntimeState({
        requestId: 1,
        kind: 'ANALYZE_STATE',
        puzzle,
        observations,
        mode: 'player',
        options: {
          solver: BASELINE_SOLVER_BUDGET,
        },
      }),
    )

    expect(summary.last.status).toBe('ready')
    expect(summary.last.stats.solver.truncated).toBe(false)
    recordPerformanceEvidence('case-004 player runtime', {
      p95Ms: roundMs(summary.p95Ms),
      worstMs: roundMs(summary.worstMs),
      ceilingMs: RUNTIME_ANALYSIS_P95_CEILING_MS,
      productTargetMs: RUNTIME_ANALYSIS_PRODUCT_TARGET_MS,
      meetsProductTarget: summary.p95Ms <= RUNTIME_ANALYSIS_PRODUCT_TARGET_MS,
      truncated: summary.last.stats.solver.truncated,
    })
    expect(summary.p95Ms).toBeLessThanOrEqual(RUNTIME_ANALYSIS_P95_CEILING_MS)
  })

  it('records 5x5 candidate cap behavior without solver truncation', () => {
    const cap = 20
    const summary = measureRepeated(() =>
      countGuestLayouts(
        {
          puzzle: FIVE_BY_FIVE_CAP_PUZZLE,
          observations: [],
        },
        cap,
        BASELINE_SOLVER_BUDGET,
      ),
    )

    expect(summary.last.count).toBe(cap)
    expect(summary.last.greaterThan).toBe(cap)
    expect(summary.last.stats.truncated).toBe(false)
    recordPerformanceEvidence('5x5 candidate cap', {
      p95Ms: roundMs(summary.p95Ms),
      worstMs: roundMs(summary.worstMs),
      ceilingMs: CANDIDATE_CAP_P95_MS,
      truncated: summary.last.stats.truncated,
    })
    expect(summary.p95Ms).toBeLessThanOrEqual(CANDIDATE_CAP_P95_MS)
  })

  it('keeps full verification for shipped MVP cases under the Node P95 target', () => {
    const summary = measureBatch((puzzle) => verifyCase(puzzle), contentCases)

    expect(summary.results.every((report) => report.passed)).toBe(true)
    recordPerformanceEvidence('shipped-case verification batch', {
      p95Ms: roundMs(summary.p95Ms),
      worstMs: roundMs(summary.worstMs),
      ceilingMs: FULL_VERIFICATION_P95_MS,
      passedCases: summary.results.length,
    })
    expect(summary.p95Ms).toBeLessThanOrEqual(FULL_VERIFICATION_P95_MS)
  }, FULL_VERIFICATION_TIMEOUT_MS)
})

interface Measurement<T> {
  readonly last: T
  readonly samplesMs: readonly number[]
  readonly p95Ms: number
  readonly worstMs: number
}

interface BatchMeasurement<T> {
  readonly results: readonly T[]
  readonly samplesMs: readonly number[]
  readonly p95Ms: number
  readonly worstMs: number
}

function measureRepeated<T>(operation: () => T): Measurement<T> {
  let last: T | undefined
  for (let index = 0; index < BASELINE_WARMUP_RUNS; index += 1) last = operation()

  const samples = Array.from({ length: BASELINE_RUNS }, () => {
    const startedAt = performance.now()
    last = operation()
    return performance.now() - startedAt
  })

  if (last === undefined) throw new Error('Performance baseline did not run.')

  return {
    last,
    samplesMs: samples,
    p95Ms: percentile(samples, 0.95),
    worstMs: Math.max(...samples),
  }
}

function measureBatch<TInput, TOutput>(
  operation: (input: TInput) => TOutput,
  inputs: readonly TInput[],
): BatchMeasurement<TOutput> {
  const results: TOutput[] = []
  const samples = inputs.map((input) => {
    const startedAt = performance.now()
    results.push(operation(input))
    return performance.now() - startedAt
  })

  return {
    results,
    samplesMs: samples,
    p95Ms: percentile(samples, 0.95),
    worstMs: Math.max(...samples),
  }
}

function recordPerformanceEvidence(
  label: string,
  fields: Readonly<Record<string, boolean | number | string>>,
): void {
  console.info(JSON.stringify({ type: 'room-axioms-performance', label, ...fields }))
}

function roundMs(value: number): number {
  return Math.round(value * 100) / 100
}

function percentile(values: readonly number[], percentileValue: number): number {
  if (values.length === 0) return 0

  const sorted = [...values].sort((left, right) => left - right)
  const index = Math.min(sorted.length - 1, Math.ceil(sorted.length * percentileValue) - 1)
  return sorted[index] ?? 0
}

const FIVE_BY_FIVE_BOARD = {
  width: 5,
  height: 5,
} as const satisfies BoardSize

const FIVE_BY_FIVE_CAP_PUZZLE: PuzzleDefinition = {
  schemaVersion: 1,
  id: 'baseline-5x5-cap',
  title: 'Baseline 5x5 Candidate Cap',
  caseName: 'Baseline 5x5 Candidate Cap',
  board: FIVE_BY_FIVE_BOARD,
  allowedKinds: ['empty', 'guest'],
  rules: [
    {
      id: 'R1',
      type: 'globalCount',
      target: 'guest',
      count: {
        op: 'eq',
        value: 3,
      },
      presentation: {
        title: 'Three guests',
        flavor: 'Exactly three cells contain guests.',
      },
    },
  ],
  initialReveals: [],
  target: targetFor(FIVE_BY_FIVE_BOARD, ['A1', 'C3', 'E5']),
  metadata: {
    difficulty: 3,
    tags: ['performance-baseline'],
    status: 'draft',
  },
}

function targetFor(
  board: BoardSize,
  guestCells: readonly CellId[],
): Readonly<Record<CellId, CellKind>> {
  const guests = new Set(guestCells)

  return Object.fromEntries(
    allCells(board).map((cellId) => [cellId, guests.has(cellId) ? 'guest' : 'empty']),
  )
}
