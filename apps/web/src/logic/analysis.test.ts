import { describe, expect, it } from 'vitest'
import { case004 } from '../data/case004'
import { allCells } from '@room-axioms/domain'
import type { CellId, CellKind } from '@room-axioms/domain'
import { analyzePuzzle } from './analysis'

function observations(ids: readonly CellId[]) {
  const target = case004.target as Readonly<Record<string, CellKind>>
  return new Map(ids.map((id) => [id, target[id]] as const))
}

describe('case-004 analysis', () => {
  it('matches the documented candidate guest layout shrinkage', () => {
    const now = () => 0

    const initial = analyzePuzzle(case004, observations(case004.initialReveals), now)
    const middle = analyzePuzzle(case004, observations([...case004.initialReveals, 'B2', 'C1']), now)
    const late = analyzePuzzle(case004, observations([...case004.initialReveals, 'B2', 'C1', 'A3']), now)

    expect(initial.layoutCount).toBe(15)
    expect(initial.layouts).toHaveLength(15)
    expect(initial.satisfiable).toBe(true)
    expect(initial.truncated).toBe(false)
    expect(middle.layoutCount).toBe(5)
    expect(middle.layouts).toHaveLength(5)
    expect(late.layoutCount).toBe(2)
    expect(late.layouts).toHaveLength(2)

    const final = analyzePuzzle(
      case004,
      observations([...case004.initialReveals, 'B2', 'C1', 'A3', 'C3']),
      now,
    )

    expect(final.layouts).toEqual([['D1', 'B4']])
    expect(final.forcedGuests).toEqual(['D1', 'B4'])
    expect(final.unique).toBe(true)
  })

  it('surfaces greater-than counts when the guest-layout cap is reached', () => {
    const result = analyzePuzzle(
      case004,
      observations(case004.initialReveals),
      () => 0,
      { layoutCap: 1 },
    )

    expect(result.layoutCount).toBe(1)
    expect(result.layouts).toHaveLength(1)
    expect(result.layoutCountGreaterThan).toBe(1)
    expect(result.truncated).toBe(false)
  })

  it('reports unsatisfiable observation sets without forced cells', () => {
    const impossible = new Map<CellId, CellKind>(
      allCells(case004.board).map((cellId) => [cellId, 'empty'] as const),
    )
    const result = analyzePuzzle(case004, impossible, () => 0)

    expect(result.satisfiable).toBe(false)
    expect(result.layoutCount).toBe(0)
    expect(result.layouts).toEqual([])
    expect(result.forcedSafe).toEqual([])
    expect(result.forcedGuests).toEqual([])
    expect(result.unique).toBe(false)
  })

  it('reports solver truncation separately from a complete count', () => {
    const result = analyzePuzzle(
      case004,
      observations(case004.initialReveals),
      () => 0,
      {
        layoutCap: 1,
        solver: { maxNodes: 0, maxModels: 0, maxGuestLayouts: 1 },
      },
    )

    expect(result.satisfiable).toBe(false)
    expect(result.truncated).toBe(true)
    expect(result.stats.truncated).toBe(true)
  })
})
