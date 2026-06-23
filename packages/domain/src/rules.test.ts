import { describe, expect, it } from 'vitest'
import { assertNever } from './index.js'
import type { RuleDefinition } from './index.js'

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
})
