import type { PuzzleDefinition } from '@room-axioms/domain'
import { describe, expect, it } from 'vitest'
import { puzzleDefinitionSchema } from './puzzleSchema.js'

const validMinimalPuzzle = {
  schemaVersion: 1,
  id: 'case-test',
  title: 'Test case',
  board: { width: 3, height: 3 },
  allowedKinds: ['empty', 'guest'],
  rules: [
    {
      id: 'R1',
      type: 'globalCount',
      target: 'guest',
      count: { op: 'eq', value: 1 },
      presentation: { title: 'One guest' },
    },
  ],
  initialReveals: ['A1'],
  target: {
    A1: 'empty',
    B1: 'empty',
    C1: 'guest',
    A2: 'empty',
    B2: 'empty',
    C2: 'empty',
    A3: 'empty',
    B3: 'empty',
    C3: 'empty',
  },
  metadata: {
    difficulty: 1,
    tags: ['schema'],
    status: 'draft',
  },
} as const satisfies PuzzleDefinition

describe('puzzleDefinitionSchema', () => {
  it('accepts a minimal DSL v1 puzzle', () => {
    const result = puzzleDefinitionSchema.safeParse(validMinimalPuzzle)

    expect(result.success).toBe(true)
  })

  it('rejects unsupported schema versions', () => {
    const result = puzzleDefinitionSchema.safeParse({ ...validMinimalPuzzle, schemaVersion: 2 })

    expect(result.success).toBe(false)
  })

  it('rejects unknown cell kinds', () => {
    const result = puzzleDefinitionSchema.safeParse({
      ...validMinimalPuzzle,
      allowedKinds: ['empty', 'guest', 'plant'],
    })

    expect(result.success).toBe(false)
  })

  it('rejects invalid comparators', () => {
    const result = puzzleDefinitionSchema.safeParse({
      ...validMinimalPuzzle,
      rules: [{ ...validMinimalPuzzle.rules[0], count: { op: 'eq', value: -1 } }],
    })

    expect(result.success).toBe(false)
  })

  it('rejects global scopes on local count rules', () => {
    const result = puzzleDefinitionSchema.safeParse({
      ...validMinimalPuzzle,
      rules: [
        {
          id: 'R2',
          type: 'forEachCount',
          subject: 'guest',
          scope: { kind: 'global' },
          target: 'empty',
          count: { op: 'eq', value: 1 },
          presentation: { title: 'Invalid local scope' },
        },
      ],
    })

    expect(result.success).toBe(false)
  })
})
