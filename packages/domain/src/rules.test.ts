import { describe, expect, it } from 'vitest'
import { assertNever } from './index.js'
import type { ExpressiveRuleDefinition, RuleDefinition } from './index.js'

function ruleKind(rule: RuleDefinition): string {
  switch (rule.type) {
    case 'globalCount':
      return `global:${rule.target}:${rule.count.op}:${rule.count.value}`
    case 'forEachCount':
      return `for-each:${rule.subject}:${rule.scope.kind}:${rule.target}:${rule.count.op}:${rule.count.value}`
    default:
      return assertNever(rule)
  }
}

function expressiveRuleKind(rule: ExpressiveRuleDefinition): string {
  switch (rule.type) {
    case 'regionCount':
      return `region:${rule.regionId}:${rule.target}:${rule.count.op}:${rule.count.value}`
    case 'lineCount':
      return `line:${rule.scope.kind}:${rule.target}:${rule.count.op}:${rule.count.value}`
    case 'anchorCount':
      return `anchor:${rule.anchorId}:${rule.scope.kind}:${rule.target}:${rule.count.op}:${rule.count.value}`
    case 'recordSet':
      return `records:${rule.falseRecords.op}:${rule.falseRecords.value}:${rule.recordIds.join('+')}`
    default:
      return assertNever(rule)
  }
}

describe('rule definitions', () => {
  it('supports the DSL v1 global count shape', () => {
    const rule = {
      id: 'R1',
      type: 'globalCount',
      target: 'guest',
      count: { op: 'eq', value: 2 },
      presentation: { title: 'Guests' },
    } satisfies RuleDefinition

    expect(ruleKind(rule)).toBe('global:guest:eq:2')
  })

  it('supports the DSL v1 per-subject scoped count shape', () => {
    const rule = {
      id: 'R2',
      type: 'forEachCount',
      subject: 'mirror',
      scope: { kind: 'adjacent' },
      target: 'guest',
      count: { op: 'eq', value: 1 },
      presentation: { title: 'Mirrors see one guest' },
    } satisfies RuleDefinition

    expect(ruleKind(rule)).toBe('for-each:mirror:adjacent:guest:eq:1')
  })

  it('declares additive expressive rule shapes without changing DSL v1 rule definitions', () => {
    const regionRule = {
      id: 'ZR1',
      type: 'regionCount',
      regionId: 'east-wing',
      target: 'guest',
      count: { op: 'eq', value: 2 },
      presentation: { title: 'East wing guests' },
    } satisfies ExpressiveRuleDefinition
    const lineRule = {
      id: 'LR1',
      type: 'lineCount',
      scope: { kind: 'row', index: 1 },
      target: 'guest',
      count: { op: 'lte', value: 1 },
      presentation: { title: 'Row quiet' },
    } satisfies ExpressiveRuleDefinition
    const anchorRule = {
      id: 'AR1',
      type: 'anchorCount',
      anchorId: 'known-bottle',
      scope: { kind: 'ray', direction: 'east', stopAtKinds: ['mirror'] },
      target: 'guest',
      count: { op: 'eq', value: 1 },
      presentation: { title: 'Bottle sightline' },
    } satisfies ExpressiveRuleDefinition
    const recordRule = {
      id: 'CR1',
      type: 'recordSet',
      recordIds: ['card-a', 'card-b'],
      falseRecords: { op: 'eq', value: 1 },
      presentation: { title: 'One record is contaminated' },
    } satisfies ExpressiveRuleDefinition

    expect(expressiveRuleKind(regionRule)).toBe('region:east-wing:guest:eq:2')
    expect(expressiveRuleKind(lineRule)).toBe('line:row:guest:lte:1')
    expect(expressiveRuleKind(anchorRule)).toBe('anchor:known-bottle:ray:guest:eq:1')
    expect(expressiveRuleKind(recordRule)).toBe('records:eq:1:card-a+card-b')
  })
})
