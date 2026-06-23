import { describe, expect, it } from 'vitest'
import { case004 } from '../data/case004'
import type { CellKind } from '@room-axioms/domain'
import { analyzePuzzle } from './analysis'

function observations(ids: readonly string[]) {
  const target = case004.target as Readonly<Record<string, CellKind>>
  return new Map(ids.map((id) => [id, target[id]] as const))
}

describe('case-004 analysis', () => {
  it('matches the documented candidate guest layout shrinkage', () => {
    const now = () => 0

    expect(analyzePuzzle(case004, observations(case004.initialReveals), now).layouts).toHaveLength(15)
    expect(analyzePuzzle(case004, observations([...case004.initialReveals, 'B2', 'C1']), now).layouts).toHaveLength(5)
    expect(
      analyzePuzzle(case004, observations([...case004.initialReveals, 'B2', 'C1', 'A3']), now).layouts,
    ).toHaveLength(2)

    const final = analyzePuzzle(
      case004,
      observations([...case004.initialReveals, 'B2', 'C1', 'A3', 'C3']),
      now,
    )

    expect(final.layouts).toEqual([['D1', 'B4']])
    expect(final.forcedGuests).toEqual(['D1', 'B4'])
    expect(final.unique).toBe(true)
  })
})
