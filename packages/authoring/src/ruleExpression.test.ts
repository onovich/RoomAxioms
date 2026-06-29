import { describe, expect, it } from 'vitest'

import { parsePuzzleDefinition } from '@room-axioms/schema'
import { compileRuleExpression, generateRuleExpressionText } from './ruleExpression.js'
import type { RuleExpression } from './ruleExpression.js'

describe('rule expression model', () => {
  it('generates readable Chinese text from logic', () => {
    const expression: RuleExpression = {
      id: 'E1',
      subject: { kind: 'object', objectTypeId: 'bin' },
      scope: { kind: 'local', relation: 'orthogonal' },
      target: { kind: 'target' },
      predicate: { kind: 'none' },
    }

    expect(generateRuleExpressionText(expression).flavor).toBe(
      '每个垃圾桶的上下左右邻格，没有异常区域。',
    )
  })

  it('compiles global target counts to the existing DSL', () => {
    const result = compileRuleExpression({
      id: 'G1',
      scope: { kind: 'global' },
      target: { kind: 'target' },
      predicate: { kind: 'exactly', value: 2 },
    })

    expect(result).toMatchObject({
      status: 'compiled',
      rule: {
        id: 'G1',
        type: 'globalCount',
        target: 'guest',
        count: { op: 'eq', value: 2 },
      },
    })
  })

  it('compiles orthogonal and surrounding local object rules to for-each counts', () => {
    const result = compileRuleExpression({
      id: 'L1',
      subject: { kind: 'object', objectTypeId: 'mirror' },
      scope: { kind: 'local', relation: 'surrounding' },
      target: { kind: 'target' },
      predicate: { kind: 'atMost', value: 1 },
    })

    expect(result).toMatchObject({
      status: 'compiled',
      rule: {
        type: 'forEachCount',
        subject: 'mirror',
        scope: { kind: 'adjacent' },
        target: 'guest',
        count: { op: 'lte', value: 1 },
      },
    })
  })

  it('compiles row and column expressions to line counts', () => {
    const row = compileRuleExpression({
      id: 'R1',
      scope: { kind: 'row', index: 1 },
      target: { kind: 'target' },
      predicate: { kind: 'exists' },
    })
    const column = compileRuleExpression({
      id: 'C1',
      scope: { kind: 'column', index: 2 },
      target: { kind: 'object', objectTypeId: 'bin' },
      predicate: { kind: 'exactly', value: 1 },
    })

    expect(row).toMatchObject({
      status: 'compiled',
      rule: { type: 'lineCount', scope: { kind: 'row', index: 1 }, count: { op: 'gte', value: 1 } },
    })
    expect(column).toMatchObject({
      status: 'compiled',
      rule: { type: 'lineCount', scope: { kind: 'column', index: 2 }, target: 'bin' },
    })
  })

  it('compiles line-of-sight expressions only when an origin is explicit', () => {
    const visible = compileRuleExpression({
      id: 'S1',
      scope: { kind: 'lineOfSight', origin: 'A2', direction: 'east', stopAtKinds: ['mirror'] },
      target: { kind: 'target' },
      predicate: { kind: 'none' },
    })
    const missingOrigin = compileRuleExpression({
      id: 'S2',
      scope: { kind: 'lineOfSight', direction: 'west' },
      target: { kind: 'object', objectTypeId: 'mirror' },
      predicate: { kind: 'exists' },
    })

    expect(visible).toMatchObject({
      status: 'compiled',
      rule: {
        type: 'lineCount',
        origin: 'A2',
        scope: { kind: 'ray', direction: 'east', stopAtKinds: ['mirror'] },
        target: 'guest',
        count: { op: 'eq', value: 0 },
      },
    })
    expect(missingOrigin).toMatchObject({
      status: 'blocked',
      code: 'line-of-sight-origin-required',
    })
  })

  it('blocks positional scopes until the workbench materializes an explicit region', () => {
    const result = compileRuleExpression({
      id: 'K1',
      scope: { kind: 'corners' },
      target: { kind: 'target' },
      predicate: { kind: 'atMost', value: 1 },
    }, { board: { width: 3, height: 3 } })

    expect(result).toMatchObject({
      status: 'blocked',
      code: 'generated-region-required',
      syntheticRegion: { id: 'generated-corners', cells: ['A1', 'C1', 'A3', 'C3'] },
    })
  })

  it('compiles materialized positional scopes to region counts', () => {
    const result = compileRuleExpression({
      id: 'K2',
      scope: { kind: 'corners', regionId: 'generated-corners' },
      target: { kind: 'target' },
      predicate: { kind: 'atMost', value: 1 },
    }, { board: { width: 3, height: 3 } })

    expect(result).toMatchObject({
      status: 'compiled',
      rule: {
        type: 'regionCount',
        regionId: 'generated-corners',
        target: 'guest',
        count: { op: 'lte', value: 1 },
      },
    })
  })

  it('compiles directional local scopes to for-each counts', () => {
    const directional = compileRuleExpression({
      id: 'D1',
      subject: { kind: 'object', objectTypeId: 'bin' },
      scope: { kind: 'local', relation: 'east' },
      target: { kind: 'target' },
      predicate: { kind: 'none' },
    })

    expect(directional).toMatchObject({
      status: 'compiled',
      rule: {
        type: 'forEachCount',
        subject: 'bin',
        scope: { kind: 'east' },
        target: 'guest',
        count: { op: 'eq', value: 0 },
      },
    })
  })

  it('blocks selector and predicate forms that do not have a safe DSL bridge yet', () => {
    const anyObject = compileRuleExpression({
      id: 'A1',
      scope: { kind: 'global' },
      target: { kind: 'anyObject' },
      predicate: { kind: 'exists' },
    })
    const all = compileRuleExpression({
      id: 'ALL1',
      scope: { kind: 'global' },
      target: { kind: 'target' },
      predicate: { kind: 'all' },
    })

    expect(anyObject).toMatchObject({
      status: 'blocked',
      code: 'selector-not-legacy-compatible',
    })
    expect(all).toMatchObject({
      status: 'blocked',
      code: 'all-predicate-needs-fixed-scope',
    })
  })

  it('compiled expressions produce schema-valid rule definitions', () => {
    const result = compileRuleExpression({
      id: 'SCHEMA1',
      subject: { kind: 'object', objectTypeId: 'bin' },
      scope: { kind: 'local', relation: 'orthogonal' },
      target: { kind: 'target' },
      predicate: { kind: 'none' },
    })
    if (result.status !== 'compiled') throw new Error('expected compiled expression')

    expect(parsePuzzleDefinition({
      schemaVersion: 1,
      id: 'rule-expression-schema-test',
      title: 'Rule expression schema test',
      board: { width: 3, height: 3 },
      allowedKinds: ['empty', 'bin', 'guest'],
      rules: [result.rule],
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
      metadata: { difficulty: 1, tags: ['rule-expression'], status: 'draft' },
    }).ok).toBe(true)
  })
})
