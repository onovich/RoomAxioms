import type { RuleDefinition } from '../domain/types'

export function ruleChip(rule: RuleDefinition): string {
  if (rule.type === 'globalCount') {
    return `全局 · ${comparatorText(rule.count.op, rule.count.value)}`
  }

  const subject = shortKind(rule.subject)
  const target = shortKind(rule.target)
  const scope = rule.scope.kind === 'orthogonal' ? '正交' : '邻接'
  return `${subject} -> ${scope} · ${comparatorText(rule.count.op, rule.count.value)} ${target}`
}

export function comparatorText(op: 'eq' | 'gte' | 'lte', value: number): string {
  if (op === 'eq') return value === 0 ? '=0' : `=${value}`
  if (op === 'gte') return `>=${value}`
  return `<=${value}`
}

function shortKind(kind: string): string {
  if (kind === 'bottle') return '瓶'
  if (kind === 'bin') return '桶'
  if (kind === 'mirror') return '镜'
  if (kind === 'guest') return '客'
  return '空'
}

