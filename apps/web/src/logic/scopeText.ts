import type { RuleDefinition } from '@room-axioms/domain'

export function ruleChip(rule: RuleDefinition): string {
  if (rule.type === 'globalCount') {
    return `全局 · ${comparatorText(rule.count.op, rule.count.value)} ${kindLabel(rule.target)}`
  }

  const subject = kindLabel(rule.subject)
  const target = kindLabel(rule.target)
  const scope = scopeLabel(rule.scope.kind)
  return `${subject} -> ${scope} · ${comparatorText(rule.count.op, rule.count.value)} ${target}`
}

export function ruleSemantics(rule: RuleDefinition): string {
  if (rule.type === 'globalCount') {
    return `全局统计：棋盘内 ${kindLabel(rule.target)} 的数量 ${comparatorText(rule.count.op, rule.count.value)}。`
  }

  return [
    `单向约束：对每个 ${kindLabel(rule.subject)}，`,
    `${scopeLabel(rule.scope.kind)}内 ${kindLabel(rule.target)} 的数量 ${comparatorText(rule.count.op, rule.count.value)}。`,
    `${kindLabel(rule.target)} 不会反向要求附近必须有 ${kindLabel(rule.subject)}。`,
  ].join('')
}

export function comparatorText(op: 'eq' | 'gte' | 'lte', value: number): string {
  if (op === 'eq') return `= ${value}`
  if (op === 'gte') return `>= ${value}`
  return `<= ${value}`
}

function kindLabel(kind: string): string {
  if (kind === 'bottle') return '酒瓶'
  if (kind === 'bin') return '垃圾桶'
  if (kind === 'mirror') return '镜子'
  if (kind === 'guest') return '访客'
  return '空地'
}

function scopeLabel(scope: 'orthogonal' | 'adjacent'): string {
  return scope === 'orthogonal' ? '正交邻域' : '邻接域'
}
