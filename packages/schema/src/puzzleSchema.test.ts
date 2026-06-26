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

  it('accepts contaminated record sets with exactly one false record', () => {
    const result = parsePuzzleDefinition({
      ...validMinimalPuzzle,
      records: [
        { id: 'card-a', title: 'Card A', ruleIds: ['R1'] },
        { id: 'card-b', title: 'Card B', ruleIds: ['R2'] },
      ],
      rules: [
        {
          id: 'R1',
          type: 'globalCount',
          target: 'guest',
          count: { op: 'eq', value: 1 },
          presentation: { title: 'One guest' },
        },
        {
          id: 'R2',
          type: 'regionCount',
          regionId: 'north-wing',
          target: 'guest',
          count: { op: 'eq', value: 0 },
          presentation: { title: 'No north guest' },
        },
        {
          id: 'CR1',
          type: 'recordSet',
          recordIds: ['card-a', 'card-b'],
          falseRecords: { op: 'eq', value: 1 },
          presentation: { title: 'One card is polluted' },
        },
      ],
      regions: [
        {
          id: 'north-wing',
          title: 'North wing',
          cells: ['A1', 'B1', 'C1'],
        },
      ],
    })

    expect(result.ok).toBe(true)
  })

  it('rejects contaminated records with invalid rule and record references', () => {
    const result = parsePuzzleDefinition({
      ...validMinimalPuzzle,
      records: [
        { id: 'card-a', title: 'Card A', ruleIds: ['missing-rule'] },
      ],
      rules: [
        ...validMinimalPuzzle.rules,
        {
          id: 'CR1',
          type: 'recordSet',
          recordIds: ['missing-card'],
          falseRecords: { op: 'lte', value: 1 },
          presentation: { title: 'At most one polluted card' },
        },
      ],
    })

    expect(result.ok).toBe(false)
    expect(result.issues.map((issue) => issue.code)).toEqual([
      'RECORD_RULE_UNKNOWN',
      'RULE_RECORD_UNKNOWN',
    ])
  })

  it('accepts Phase 24 count-scope grammar rules', () => {
    const result = parsePuzzleDefinition({
      ...validMinimalPuzzle,
      allowedKinds: ['empty', 'guest', 'mirror'],
      regions: [
        {
          id: 'north-wing',
          title: 'North wing',
          cells: ['A1', 'B1', 'C1'],
        },
      ],
      rules: [
        {
          id: 'O1',
          type: 'scopeOverlapCount',
          left: { kind: 'region', regionId: 'north-wing' },
          right: { kind: 'line', scope: { kind: 'row', index: 0 } },
          mode: 'intersection',
          target: 'guest',
          count: { op: 'neq', value: 2 },
          presentation: { title: 'Overlap count' },
        },
        {
          id: 'C1',
          type: 'comparativeCount',
          left: { kind: 'global' },
          right: { kind: 'line', origin: 'A1', scope: { kind: 'ray', direction: 'east', stopAtKinds: ['mirror'] } },
          target: 'guest',
          comparison: { op: 'gt', offset: 0 },
          presentation: { title: 'Comparative count' },
        },
        {
          id: 'K1',
          type: 'conditionalCount',
          condition: {
            scope: { kind: 'global' },
            target: 'guest',
            count: { op: 'gt', value: 0 },
          },
          then: {
            scope: { kind: 'region', regionId: 'north-wing' },
            target: 'empty',
            count: { op: 'lt', value: 3 },
          },
          presentation: { title: 'Conditional count' },
        },
      ],
    })

    expect(result.ok).toBe(true)
  })

  it('rejects invalid count-scope references', () => {
    const result = parsePuzzleDefinition({
      ...validMinimalPuzzle,
      rules: [
        {
          id: 'O1',
          type: 'scopeOverlapCount',
          left: { kind: 'region', regionId: 'missing-wing' },
          right: { kind: 'line', scope: { kind: 'ray', direction: 'east' } },
          mode: 'intersection',
          target: 'guest',
          count: { op: 'eq', value: 1 },
          presentation: { title: 'Invalid count scopes' },
        },
      ],
    })

    expect(result.ok).toBe(false)
    expect(result.issues.map((issue) => issue.code)).toEqual([
      'RULE_REGION_UNKNOWN',
      'LINE_RAY_ORIGIN_MISSING',
    ])
  })
})
