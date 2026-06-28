import { describe, expect, it } from 'vitest'

import type { PuzzleDefinition, RuleDefinition } from '@room-axioms/domain'
import { generateRuleText, forbiddenRuleTextTerms } from './ruleText.js'

describe('rule text generation', () => {
  it('generates plain Chinese text for global counts', () => {
    expect(generateRuleText({
      id: 'R1',
      type: 'globalCount',
      target: 'guest',
      count: { op: 'eq', value: 3 },
      presentation: { title: 'old' },
    }).flavor).toBe('全场恰好有 3 个访客。')
  })

  it('renders local guest exclusion without deprecated safe-area language', () => {
    const text = generateRuleText({
      id: 'R2',
      type: 'forEachCount',
      subject: 'bin',
      scope: { kind: 'orthogonal' },
      target: 'guest',
      count: { op: 'eq', value: 0 },
      presentation: { title: 'old' },
    })

    expect(text.flavor).toBe('每个垃圾桶的上下左右邻格，没有访客。')
    expect(text.warnings).toEqual([])
    for (const term of forbiddenRuleTextTerms()) {
      expect(text.flavor).not.toContain(term)
    }
  })

  it('includes explicit region cells so highlights do not carry hidden meaning', () => {
    const text = generateRuleText({
      id: 'R3',
      type: 'regionCount',
      regionId: 'north-ledger',
      target: 'guest',
      count: { op: 'eq', value: 1 },
      presentation: { title: 'old' },
    }, { puzzle: puzzleWithScopes() })

    expect(text.flavor).toBe('北侧记录（A1、B1、C1），恰好有 1 个访客。')
  })

  it('generates overlap, comparative, and conditional text from structured scopes', () => {
    const overlap = generateRuleText({
      id: 'R4',
      type: 'scopeOverlapCount',
      left: { kind: 'region', regionId: 'north-ledger' },
      right: { kind: 'region', regionId: 'east-ledger' },
      mode: 'intersection',
      target: 'guest',
      count: { op: 'eq', value: 1 },
      presentation: { title: 'old' },
    }, { puzzle: puzzleWithScopes() })
    const comparative = generateRuleText({
      id: 'R5',
      type: 'comparativeCount',
      left: { kind: 'region', regionId: 'north-ledger' },
      right: { kind: 'region', regionId: 'east-ledger' },
      target: 'guest',
      comparison: { op: 'gt', offset: 1 },
      presentation: { title: 'old' },
    }, { puzzle: puzzleWithScopes() })
    const conditional = generateRuleText({
      id: 'R6',
      type: 'conditionalCount',
      condition: {
        scope: { kind: 'region', regionId: 'north-ledger' },
        target: 'guest',
        count: { op: 'eq', value: 1 },
      },
      then: {
        scope: { kind: 'region', regionId: 'east-ledger' },
        target: 'guest',
        count: { op: 'eq', value: 0 },
      },
      presentation: { title: 'old' },
    }, { puzzle: puzzleWithScopes() })

    expect(overlap.flavor).toBe('北侧记录（A1、B1、C1）与东侧记录（B1、C1、C2）的交集，恰好有 1 个访客。')
    expect(comparative.flavor).toBe('北侧记录（A1、B1、C1）里的访客数量，比东侧记录（B1、C1、C2）更多，差值多 1。')
    expect(conditional.flavor).toBe('如果北侧记录（A1、B1、C1）恰好有 1 个访客，那么东侧记录（B1、C1、C2）没有访客。')
  })

  it('flags generated text that would contain deprecated visible terms', () => {
    const text = generateRuleText({
      id: 'R7',
      type: 'regionCount',
      regionId: 'bad-region',
      target: 'guest',
      count: { op: 'eq', value: 0 },
      presentation: { title: 'old' },
    }, {
      puzzle: {
        ...puzzleWithScopes(),
        regions: [{ id: 'bad-region', title: '侧翼空区', cells: ['A1', 'B1'] }],
      },
    })

    expect(text.warnings).toEqual(expect.arrayContaining([
      'Generated rule text contains forbidden visible term: 空区',
      'Generated rule text contains forbidden visible term: 侧翼',
    ]))
  })
})

function puzzleWithScopes(): PuzzleDefinition {
  return {
    schemaVersion: 1,
    id: 'phase-31-rule-text-test',
    title: 'Phase 31 rule text test',
    board: { width: 3, height: 3 },
    allowedKinds: ['empty', 'bin', 'guest'],
    regions: [
      { id: 'north-ledger', title: '北侧记录', cells: ['A1', 'B1', 'C1'] },
      { id: 'east-ledger', title: '东侧记录', cells: ['B1', 'C1', 'C2'] },
    ],
    rules: [globalGuestRule()],
    initialReveals: ['A1'],
    target: {
      A1: 'empty',
      B1: 'guest',
      C1: 'empty',
      A2: 'bin',
      B2: 'empty',
      C2: 'empty',
      A3: 'empty',
      B3: 'empty',
      C3: 'empty',
    },
    metadata: { difficulty: 1, tags: ['phase-31'], status: 'draft' },
  }
}

function globalGuestRule(): RuleDefinition {
  return {
    id: 'R0',
    type: 'globalCount',
    target: 'guest',
    count: { op: 'eq', value: 1 },
    presentation: { title: 'old' },
  }
}
