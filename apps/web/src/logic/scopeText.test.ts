import { describe, expect, it } from 'vitest'
import type { RuleDefinition } from '@room-axioms/domain'

import { comparatorText, ruleChip, rulePlainText, ruleSemantics } from './scopeText'

describe('rule text helpers', () => {
  it('renders compact global count chips', () => {
    expect(ruleChip(globalRule())).toBe('有 2 名访客')
    expect(rulePlainText(globalRule())).toBe('房间里有 2 名访客。')
    expect(comparatorText('gte', 1)).toBe('>= 1')
    expect(comparatorText('lte', 0)).toBe('<= 0')
  })

  it('renders one-way local rule semantics', () => {
    const rule = localRule()

    expect(ruleChip(rule)).toBe('周围一圈：有 1 名访客')
    expect(rulePlainText(rule)).toBe('镜子的周围一圈，有 1 名访客。')
    expect(ruleSemantics(rule)).toBe('镜子的周围一圈，有 1 名访客。')
  })

  it('renders zero-count local rules as natural exclusion sentences', () => {
    const rule: RuleDefinition = {
      id: 'R3',
      type: 'forEachCount',
      subject: 'bottle',
      scope: { kind: 'orthogonal' },
      target: 'guest',
      count: { op: 'eq', value: 0 },
      presentation: { title: 'Bottle' },
    }

    expect(ruleChip(rule)).toBe('上下左右邻格：没有访客')
    expect(rulePlainText(rule)).toBe('访客不在酒瓶的上下左右邻格。')
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
