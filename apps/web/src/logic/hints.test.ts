import { describe, expect, it } from 'vitest'

import { case004 } from '../data/case004'
import { getCaseById } from '../content/cases'
import { analyzeRuntimeState } from '../runtime/analyzer'
import { createHint } from './hints'
import { observationsForRevealed } from './targetAccess'
import type { CellId } from '@room-axioms/domain'
import type { RuntimeHint } from '../runtime/contracts'

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
    expect(hint.conclusion).toBe('A1 可以继续勘察。')
    expect(hint.premises.length).toBeGreaterThan(0)
    expect(hint.reasoning).toBe('这一步不用猜。')
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

  it('renders local scope difference runtime hints without developer diagnostics', () => {
    const runtimeHint = {
      deductionId: 'deduction:LOCAL_SCOPE_DIFFERENCE:guest:B3:R1+R2',
      technique: 'LOCAL_SCOPE_DIFFERENCE',
      conclusion: { kind: 'guest', cellId: 'B3' },
      ruleIds: ['R1', 'R2'],
      proofLines: [
        '[DERIVED] derived:LOCAL_SCOPE_DIFFERENCE: B3 is guest <- fact:B1:mirror, fact:B2:bottle',
      ],
      highlight: 'B3',
    } satisfies RuntimeHint
    const hint = createHint(case004, runtimeHint)

    expect(hint.highlight).toBe('B3')
    expect(hint.conclusion).toContain('B3')
    expect(hint.premises).toHaveLength(2)
    expect(hint.reasoning.length).toBeGreaterThan(0)
  })

  it('renders the first case-012 hint from public observations only', () => {
    const puzzle = getCaseById('case-012')
    const revealed = new Set<CellId>(puzzle.initialReveals)
    const runtimeAnalysis = analyzeRuntimeState({
      requestId: 3,
      kind: 'GET_HINT',
      puzzle,
      observations: observationsForRevealed(puzzle, revealed),
      mode: 'player',
    })
    const hint = createHint(puzzle, runtimeAnalysis.hint)

    expect(runtimeAnalysis.forcedSafe).toEqual([])
    expect(runtimeAnalysis.forcedGuests).toEqual([])
    expect(runtimeAnalysis.noGuess).toBeUndefined()
    expect(hint.highlight).toBe('D1')
    expect(hint.conclusion).toBe('D1 可以继续勘察。')
    expect(hint.premises.length).toBeGreaterThan(0)
    expect(hint.reasoning).toBe('这一步不用猜。')
  })
})
