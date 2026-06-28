import type { Comparator, RuleDefinition } from '@room-axioms/domain'
import { sanitizePlayerRuleCopy, sceneKindLabel, sceneKindUnit } from '../theme/vocabulary'

export function ruleChip(rule: RuleDefinition): string {
  if (rule.type === 'globalCount') {
    return countTargetPhrase(rule.target, rule.count.op, rule.count.value)
  }

  if (rule.type === 'regionCount') {
    return `${rule.presentation.title}：${countTargetPhrase(rule.target, rule.count.op, rule.count.value)}`
  }

  if (rule.type === 'lineCount') {
    return `${lineLabel(rule)}：${countTargetPhrase(rule.target, rule.count.op, rule.count.value)}`
  }

  if (rule.type === 'anchorCount') {
    return `${rule.presentation.title}的${anchorScopeLabel(rule)}：${countTargetPhrase(rule.target, rule.count.op, rule.count.value)}`
  }

  if (rule.type === 'recordSet') {
    return recordSetPhrase(rule)
  }

  if (rule.type === 'scopeOverlapCount') {
    return `${rule.presentation.title}：${countTargetPhrase(rule.target, rule.count.op, rule.count.value)}`
  }

  if (rule.type === 'comparativeCount') {
    return `${rule.presentation.title}：${comparisonText(rule.comparison.op, rule.comparison.offset ?? 0)}`
  }

  if (rule.type === 'conditionalCount') {
    return rule.presentation.title
  }

  return `${scopeLabel(rule.scope.kind)}：${countTargetPhrase(rule.target, rule.count.op, rule.count.value)}`
}

export function rulePlainText(rule: RuleDefinition): string {
  if (rule.presentation.flavor !== undefined) return sanitizePlayerRuleCopy(rule.presentation.flavor)

  if (rule.type === 'globalCount') {
    return `本现场${countTargetPhrase(rule.target, rule.count.op, rule.count.value)}。`
  }

  if (rule.type === 'regionCount') {
    return `${rule.presentation.title}区域：${countTargetPhrase(rule.target, rule.count.op, rule.count.value)}。`
  }

  if (rule.type === 'lineCount') {
    return `${lineLabel(rule)}：${countTargetPhrase(rule.target, rule.count.op, rule.count.value)}。`
  }

  if (rule.type === 'anchorCount') {
    return `${rule.presentation.title}的${anchorScopeLabel(rule)}：${countTargetPhrase(rule.target, rule.count.op, rule.count.value)}。`
  }

  if (rule.type === 'recordSet') {
    return `${recordSetPhrase(rule)}。`
  }

  if (rule.type === 'scopeOverlapCount') {
    return `${rule.presentation.title}：${countTargetPhrase(rule.target, rule.count.op, rule.count.value)}。`
  }

  if (rule.type === 'comparativeCount') {
    return `${rule.presentation.title}：${comparisonText(rule.comparison.op, rule.comparison.offset ?? 0)}。`
  }

  if (rule.type === 'conditionalCount') {
    return sanitizePlayerRuleCopy(rule.presentation.title)
  }

  if (rule.count.op === 'eq' && rule.count.value === 0) {
    return `${kindLabel(rule.target)}不在${kindLabel(rule.subject)}的${scopeLabel(rule.scope.kind)}。`
  }

  return `${kindLabel(rule.subject)}的${scopeLabel(rule.scope.kind)}：${countTargetPhrase(rule.target, rule.count.op, rule.count.value)}。`
}

export function ruleSemantics(rule: RuleDefinition): string {
  return rulePlainText(rule)
}

export function comparatorText(op: Comparator['op'], value: number): string {
  if (op === 'eq') return `= ${value}`
  if (op === 'neq') return `!= ${value}`
  if (op === 'gt') return `> ${value}`
  if (op === 'gte') return `>= ${value}`
  if (op === 'lt') return `< ${value}`
  return `<= ${value}`
}

function kindLabel(kind: string): string {
  return sceneKindLabel(kind)
}

function scopeLabel(scope: 'orthogonal' | 'adjacent'): string {
  return scope === 'orthogonal' ? '上下左右邻格' : '周围一圈'
}

function lineLabel(rule: Extract<RuleDefinition, { readonly type: 'lineCount' }>): string {
  switch (rule.scope.kind) {
    case 'row':
      return `第 ${rule.scope.index + 1} 行`
    case 'column':
      return `第 ${rule.scope.index + 1} 列`
    case 'ray':
      return `${rule.origin ?? '起点'} 向${directionLabel(rule.scope.direction)}的视线`
  }
}

function anchorScopeLabel(rule: Extract<RuleDefinition, { readonly type: 'anchorCount' }>): string {
  if (rule.scope.kind === 'orthogonal' || rule.scope.kind === 'adjacent') return scopeLabel(rule.scope.kind)
  return rule.scope.kind
}

function recordSetPhrase(rule: Extract<RuleDefinition, { readonly type: 'recordSet' }>): string {
  const countText = rule.falseRecords.op === 'eq'
    ? `恰好 ${rule.falseRecords.value} 张`
    : `最多 ${rule.falseRecords.value} 张`
  return `污染记录：${countText}记录可能为假`
}

function directionLabel(direction: 'north' | 'south' | 'east' | 'west'): string {
  if (direction === 'north') return '上'
  if (direction === 'south') return '下'
  if (direction === 'east') return '右'
  return '左'
}

function countTargetPhrase(kind: string, op: Comparator['op'], value: number): string {
  const target = kindLabel(kind)
  if (op === 'eq' && value === 0) return `没有${target}`

  const quantity = `${value} ${kindUnit(kind)}`
  if (op === 'eq') return `有 ${quantity}${target}`
  if (op === 'neq') return `不是 ${quantity}${target}`
  if (op === 'gt') return `多于 ${quantity}${target}`
  if (op === 'gte') return `至少有 ${quantity}${target}`
  if (op === 'lt') return `少于 ${quantity}${target}`
  return `最多有 ${quantity}${target}`
}

function comparisonText(op: Comparator['op'], offset: number): string {
  const suffix = offset === 0 ? '' : offset > 0 ? ` 多 ${offset}` : ` 少 ${Math.abs(offset)}`
  if (op === 'eq') return `两边数量相同${suffix}`
  if (op === 'neq') return `两边数量不同${suffix}`
  if (op === 'gt') return `左侧数量更多${suffix}`
  if (op === 'gte') return `左侧数量不少于右侧${suffix}`
  if (op === 'lt') return `左侧数量更少${suffix}`
  return `左侧数量不多于右侧${suffix}`
}

function kindUnit(kind: string): string {
  return sceneKindUnit(kind)
}
