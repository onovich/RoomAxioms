import type { PuzzleDefinition } from '@room-axioms/domain'
import { describe, expect, it } from 'vitest'
import { parsePuzzleDefinition } from './diagnostics.js'
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

  it('accepts named regions and region count rules', () => {
    const result = parsePuzzleDefinition({
      ...validMinimalPuzzle,
      regions: [
        {
          id: 'north-wing',
          title: 'North wing',
          cells: ['A1', 'B1', 'C1'],
        },
      ],
      rules: [
        {
          id: 'ZR1',
          type: 'regionCount',
          regionId: 'north-wing',
          target: 'guest',
          count: { op: 'eq', value: 1 },
          presentation: { title: 'North wing has one guest' },
        },
      ],
    })

    expect(result.ok).toBe(true)
  })

  it('rejects region count rules that reference unknown regions', () => {
    const result = parsePuzzleDefinition({
      ...validMinimalPuzzle,
      rules: [
        {
          id: 'ZR1',
          type: 'regionCount',
          regionId: 'missing-wing',
          target: 'guest',
          count: { op: 'eq', value: 1 },
          presentation: { title: 'Missing wing' },
        },
      ],
    })

    expect(result.ok).toBe(false)
    expect(result.issues.map((issue) => issue.code)).toContain('RULE_REGION_UNKNOWN')
  })

  it('accepts row and ray line count rules', () => {
    const result = parsePuzzleDefinition({
      ...validMinimalPuzzle,
      allowedKinds: ['empty', 'mirror', 'guest'],
      rules: [
        {
          id: 'LR1',
          type: 'lineCount',
          scope: { kind: 'row', index: 0 },
          target: 'guest',
          count: { op: 'eq', value: 1 },
          presentation: { title: 'First row has one guest' },
        },
        {
          id: 'LR2',
          type: 'lineCount',
          origin: 'A1',
          scope: { kind: 'ray', direction: 'east', stopAtKinds: ['mirror'] },
          target: 'guest',
          count: { op: 'lte', value: 1 },
          presentation: { title: 'Sightline has at most one guest' },
        },
      ],
    })

    expect(result.ok).toBe(true)
  })

  it('rejects line count rules with invalid board references', () => {
    const result = parsePuzzleDefinition({
      ...validMinimalPuzzle,
      rules: [
        {
          id: 'LR1',
          type: 'lineCount',
          scope: { kind: 'column', index: 3 },
          target: 'guest',
          count: { op: 'eq', value: 1 },
          presentation: { title: 'Missing column' },
        },
        {
          id: 'LR2',
          type: 'lineCount',
          scope: { kind: 'ray', direction: 'east' },
          target: 'guest',
          count: { op: 'eq', value: 1 },
          presentation: { title: 'Ray without origin' },
        },
      ],
    })

    expect(result.ok).toBe(false)
    expect(result.issues.map((issue) => issue.code)).toEqual([
      'LINE_SCOPE_OUT_OF_BOARD',
      'LINE_RAY_ORIGIN_MISSING',
    ])
  })

  it('accepts anchors and anchor count rules', () => {
    const result = parsePuzzleDefinition({
      ...validMinimalPuzzle,
      allowedKinds: ['empty', 'bottle', 'guest'],
      anchors: [
        {
          id: 'known-bottle',
          title: 'Known bottle',
          subject: 'bottle',
        },
      ],
      rules: [
        {
          id: 'AR1',
          type: 'anchorCount',
          anchorId: 'known-bottle',
          scope: { kind: 'orthogonal' },
          target: 'guest',
          count: { op: 'eq', value: 0 },
          presentation: { title: 'Bottle keeps guests away' },
        },
      ],
      target: {
        ...validMinimalPuzzle.target,
        A1: 'bottle',
      },
    })

    expect(result.ok).toBe(true)
  })

  it('rejects anchor count rules that reference unknown anchors', () => {
    const result = parsePuzzleDefinition({
      ...validMinimalPuzzle,
      rules: [
        {
          id: 'AR1',
          type: 'anchorCount',
          anchorId: 'missing-anchor',
          scope: { kind: 'orthogonal' },
          target: 'guest',
          count: { op: 'eq', value: 0 },
          presentation: { title: 'Missing anchor' },
        },
      ],
    })

    expect(result.ok).toBe(false)
    expect(result.issues.map((issue) => issue.code)).toContain('RULE_ANCHOR_UNKNOWN')
  })
})
