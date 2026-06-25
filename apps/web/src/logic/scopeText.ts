import type { RuleDefinition } from '@room-axioms/domain'

export function ruleChip(rule: RuleDefinition): string {
  if (rule.type === 'globalCount') {
    return countTargetPhrase(rule.target, rule.count.op, rule.count.value)
  }

  if (rule.type === 'regionCount') {
    return `${rule.regionId}：${countTargetPhrase(rule.target, rule.count.op, rule.count.value)}`
  }

  return `${scopeLabel(rule.scope.kind)}：${countTargetPhrase(rule.target, rule.count.op, rule.count.value)}`
}

export function rulePlainText(rule: RuleDefinition): string {
  if (rule.type === 'globalCount') {
    return `房间里${countTargetPhrase(rule.target, rule.count.op, rule.count.value)}。`
  }

  if (rule.type === 'regionCount') {
    return `${rule.regionId}区域，${countTargetPhrase(rule.target, rule.count.op, rule.count.value)}。`
  }

  if (rule.count.op === 'eq' && rule.count.value === 0) {
    return `${kindLabel(rule.target)}不在${kindLabel(rule.subject)}的${scopeLabel(rule.scope.kind)}。`
  }

  return `${kindLabel(rule.subject)}的${scopeLabel(rule.scope.kind)}，${countTargetPhrase(rule.target, rule.count.op, rule.count.value)}。`
}

export function ruleSemantics(rule: RuleDefinition): string {
  return rulePlainText(rule)
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
  return scope === 'orthogonal' ? '上下左右邻格' : '周围一圈'
}

function countTargetPhrase(kind: string, op: 'eq' | 'gte' | 'lte', value: number): string {
  const target = kindLabel(kind)
  if (op === 'eq' && value === 0) return `没有${target}`

  const quantity = `${value} ${kindUnit(kind)}`
  if (op === 'eq') return `有 ${quantity}${target}`
  if (op === 'gte') return `至少有 ${quantity}${target}`
  return `最多有 ${quantity}${target}`
}

function kindUnit(kind: string): string {
  if (kind === 'guest') return '名'
  if (kind === 'mirror') return '面'
  return '个'
}
