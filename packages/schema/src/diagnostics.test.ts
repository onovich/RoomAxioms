import type { CellKind, PuzzleDefinition } from '@room-axioms/domain'
import { describe, expect, it } from 'vitest'
import {
  PuzzleSchemaError,
  assertPuzzleDefinition,
  formatSchemaIssues,
  parsePuzzleDefinition,
} from './diagnostics.js'

const validPuzzle = {
  schemaVersion: 1,
  id: 'case-test',
  title: 'Test case',
  board: { width: 3, height: 3 },
  allowedKinds: ['empty', 'bottle', 'guest'],
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
      type: 'forEachCount',
      subject: 'bottle',
      scope: { kind: 'orthogonal' },
      target: 'guest',
      count: { op: 'eq', value: 0 },
      presentation: { title: 'Bottles avoid guests' },
    },
  ],
  initialReveals: ['A1'],
  target: {
    A1: 'empty',
    B1: 'bottle',
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

describe('parsePuzzleDefinition', () => {
  it('returns a domain puzzle for valid input', () => {
    const result = parsePuzzleDefinition(validPuzzle)

    expect(result.ok).toBe(true)
    expect(result.puzzle?.id).toBe('case-test')
    expect(result.issues).toEqual([])
  })

  it('throws a structured error from assertPuzzleDefinition', () => {
    expect(() => assertPuzzleDefinition({ ...validPuzzle, schemaVersion: 2 })).toThrow(PuzzleSchemaError)
  })

  it('reports unsupported schema versions', () => {
    expect(issueCodes({ ...validPuzzle, schemaVersion: 2 })).toContain('SCHEMA_VERSION_UNSUPPORTED')
  })

  it('reports out-of-board initial reveal coordinates', () => {
    expect(issueCodes({ ...validPuzzle, initialReveals: ['D4'] })).toContain('INITIAL_REVEAL_OUT_OF_BOARD')
  })

  it('reports duplicate rule ids', () => {
    expect(issueCodes({ ...validPuzzle, rules: [{ ...validPuzzle.rules[0] }, { ...validPuzzle.rules[0] }] })).toContain(
      'RULE_ID_DUPLICATE',
    )
  })

  it('reports missing target cells', () => {
    const target = withoutTargetCell('C3')

    expect(issueCodes({ ...validPuzzle, target })).toContain('TARGET_MISSING_CELL')
  })

  it('reports extra target cells', () => {
    expect(issueCodes({ ...validPuzzle, target: { ...validPuzzle.target, D4: 'empty' } })).toContain(
      'TARGET_EXTRA_CELL',
    )
  })

  it('reports unknown cell kinds', () => {
    expect(issueCodes({ ...validPuzzle, allowedKinds: ['empty', 'guest', 'plant'] })).toContain('CELL_KIND_UNKNOWN')
  })

  it('reports rule references outside allowedKinds', () => {
    expect(issueCodes({ ...validPuzzle, allowedKinds: ['empty', 'guest'] })).toContain('RULE_KIND_NOT_ALLOWED')
  })

  it('reports invalid initial guest reveals', () => {
    expect(issueCodes({ ...validPuzzle, initialReveals: ['C1'] })).toContain('INITIAL_REVEAL_GUEST')
  })

  it('reports empty rule presentation titles', () => {
    const rules = [{ ...validPuzzle.rules[0], presentation: { title: '   ' } }]

    expect(issueCodes({ ...validPuzzle, rules })).toContain('PRESENTATION_TITLE_EMPTY')
  })

  it('formats issue paths and stable context for diagnostics consumers', () => {
    const result = parsePuzzleDefinition({ ...validPuzzle, initialReveals: ['C1'] })

    expect(formatSchemaIssues(result.issues)[0]).toContain('INITIAL_REVEAL_GUEST at $.initialReveals[0]')
  })
})

function issueCodes(input: unknown): readonly string[] {
  const result = parsePuzzleDefinition(input)
  return result.issues.map((issue) => issue.code)
}

function withoutTargetCell(cellId: string): Record<string, CellKind> {
  return Object.fromEntries(Object.entries(validPuzzle.target).filter(([id]) => id !== cellId))
}
