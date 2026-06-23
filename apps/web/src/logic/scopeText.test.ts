import { describe, expect, it } from 'vitest'
import type { RuleDefinition } from '@room-axioms/domain'

import { comparatorText, ruleChip, ruleSemantics } from './scopeText'

describe('rule text helpers', () => {
  it('renders compact global count chips', () => {
    expect(ruleChip(globalRule())).toBe('全局 · = 2 访客')
    expect(comparatorText('gte', 1)).toBe('>= 1')
    expect(comparatorText('lte', 0)).toBe('<= 0')
  })

  it('renders one-way local rule semantics', () => {
    const rule = localRule()

    expect(ruleChip(rule)).toBe('镜子 -> 邻接域 · = 1 访客')
    expect(ruleSemantics(rule)).toBe(
      '单向约束：对每个 镜子，邻接域内 访客 的数量 = 1。访客 不会反向要求附近必须有 镜子。',
    )
  })
})

function globalRule(): RuleDefinition {
  return {
    id: 'R1',
    type: 'globalCount',
    target: 'guest',
    count: { op: 'eq', value: 2 },
    presentation: { title: 'Guests' },
  }
}

function localRule(): RuleDefinition {
  return {
    id: 'R2',
    type: 'forEachCount',
    subject: 'mirror',
    scope: { kind: 'adjacent' },
    target: 'guest',
    count: { op: 'eq', value: 1 },
    presentation: { title: 'Mirror' },
  }
}
