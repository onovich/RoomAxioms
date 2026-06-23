import { describe, expect, it } from 'vitest'
import case004Fixture from '../../../content/cases/case-004.json' with { type: 'json' }
import { assertPuzzleDefinition } from './diagnostics.js'

describe('case-004 content fixture', () => {
  it('parses the canonical JSON fixture as a domain puzzle', () => {
    const puzzle = assertPuzzleDefinition(case004Fixture)

    expect(puzzle.id).toBe('case-004')
    expect(puzzle.board).toEqual({ width: 4, height: 4 })
    expect(puzzle.initialReveals).toEqual(['B1', 'A2', 'C2'])
    expect(puzzle.target.D1).toBe('guest')
    expect(puzzle.target.B4).toBe('guest')
  })
})
