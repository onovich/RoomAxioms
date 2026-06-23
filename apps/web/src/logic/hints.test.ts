import { describe, expect, it } from 'vitest'

import { case004 } from '../data/case004'
import { analyzeRuntimeState } from '../runtime/analyzer'
import { createHint } from './hints'
import { observationsForRevealed } from './targetAccess'
import type { CellId } from '@room-axioms/domain'

describe('proof-backed hints', () => {
  it('selects the deterministic next case-004 proof deduction', () => {
    const revealed = new Set<CellId>(case004.initialReveals)
    const runtimeAnalysis = analyzeRuntimeState({
      requestId: 1,
      kind: 'GET_HINT',
      puzzle: case004,
      observations: observationsForRevealed(case004, revealed),
      mode: 'player',
    })
    const hint = createHint(case004, runtimeAnalysis.hint)

    expect(hint.highlight).toBe('A1')
    expect(hint.conclusion).toBe('A1 is safe to inspect.')
    expect(hint.premises.length).toBeGreaterThan(0)
    expect(hint.reasoning).toContain('proof package deduction graph')
  })

  it('renders stable hints from the same public observations', () => {
    const revealed = new Set<CellId>(case004.initialReveals)
    const first = analyzeRuntimeState({
      requestId: 1,
      kind: 'GET_HINT',
      puzzle: case004,
      observations: observationsForRevealed(case004, revealed),
      mode: 'player',
    })
    const second = analyzeRuntimeState({
      requestId: 2,
      kind: 'GET_HINT',
      puzzle: case004,
      observations: observationsForRevealed(case004, revealed),
      mode: 'player',
    })

    expect(createHint(case004, first.hint)).toEqual(createHint(case004, second.hint))
  })
})
