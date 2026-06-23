import { describe, expect, it } from 'vitest'

import { case004 } from '../data/case004'
import { analyzePuzzle } from './analysis'
import { createHint } from './hints'
import type { CellId, CellKind, PlayerMark } from '@room-axioms/domain'

describe('proof-backed hints', () => {
  it('selects the deterministic next case-004 proof deduction', () => {
    const revealed = new Set<CellId>(case004.initialReveals)
    const analysis = analyzePuzzle(case004, observations(revealed), () => 0)
    const hint = createHint(case004, revealed, new Map(), analysis)

    expect(hint.highlight).toBe('A1')
    expect(hint.conclusion).toBe('A1 is safe to inspect.')
    expect(hint.premises.length).toBeGreaterThan(0)
    expect(hint.reasoning).toContain('proof package deduction graph')
  })

  it('does not treat player marks as proof facts', () => {
    const revealed = new Set<CellId>(case004.initialReveals)
    const analysis = analyzePuzzle(case004, observations(revealed), () => 0)
    const markedGuests = new Map<CellId, PlayerMark>([
      ['A1', 'guest'],
      ['D1', 'guest'],
    ])

    expect(createHint(case004, revealed, markedGuests, analysis)).toEqual(
      createHint(case004, revealed, new Map(), analysis),
    )
  })
})

function observations(revealed: ReadonlySet<CellId>): ReadonlyMap<CellId, CellKind> {
  const target = case004.target as Readonly<Record<CellId, CellKind>>
  return new Map([...revealed].map((cellId) => [cellId, target[cellId]] as const))
}
