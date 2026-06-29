import type {
  CellKind,
  Comparator,
  CountComparison,
  CountScopeRef,
  LocalScopeKind,
  PuzzleDefinition,
  RuleDefinition,
} from '@room-axioms/domain'

export type RuleTextLocale = 'zh-CN'

export interface RuleTextContext {
  readonly puzzle?: PuzzleDefinition
  readonly locale?: RuleTextLocale
}

export interface GeneratedRuleText {
  readonly title: string
  readonly flavor: string
  readonly warnings: readonly string[]
}

const FORBIDDEN_VISIBLE_TERMS = [
  '安全区',
  '空区',
  '空房',
  '侧翼',
  '锚点',
  '清扫点',
  '已确认清扫点',
] as const

export function generateRuleText(
  rule: RuleDefinition,
  context: RuleTextContext = {},
): GeneratedRuleText {
  const generated = generatedRuleText(rule, context)
  return {
    ...generated,
    warnings: forbiddenTermWarnings([generated.title, generated.flavor]),
  }
}

export function forbiddenRuleTextTerms(): readonly string[] {
  return FORBIDDEN_VISIBLE_TERMS
}

function generatedRuleText(rule: RuleDefinition, context: RuleTextContext): GeneratedRuleText {
  switch (rule.type) {
    case 'globalCount':
      return {
        title: `全场${countPhrase(rule.target, rule.count)}`,
        flavor: `全场${countPhrase(rule.target, rule.count)}。`,
        warnings: [],
      }
    case 'forEachCount':
      return forEachText(rule)
    case 'regionCount':
      return {
        title: `${regionPhrase(rule.regionId, context)}${countPhrase(rule.target, rule.count)}`,
        flavor: `${regionPhrase(rule.regionId, context)}，${countPhrase(rule.target, rule.count)}。`,
        warnings: [],
      }
    case 'scopeOverlapCount': {
      const left = countScopePhrase(rule.left, context)
      const right = countScopePhrase(rule.right, context)
      const scope = `${left}与${right}的${overlapModePhrase(rule.mode)}`
      return {
        title: `${scope}${countPhrase(rule.target, rule.count)}`,
        flavor: `${scope}，${countPhrase(rule.target, rule.count)}。`,
        warnings: [],
      }
    }
    case 'comparativeCount': {
      const left = countScopePhrase(rule.left, context)
      const right = countScopePhrase(rule.right, context)
      return {
        title: `${left}与${right}的${kindLabel(rule.target)}数量${comparisonPhrase(rule.comparison)}`,
        flavor: `${left}里的${kindLabel(rule.target)}数量，${comparisonPhrase(rule.comparison, right)}。`,
        warnings: [],
      }
    }
    case 'conditionalCount': {
      const condition = clausePhrase(rule.condition.scope, rule.condition.target, rule.condition.count, context)
      const then = clausePhrase(rule.then.scope, rule.then.target, rule.then.count, context)
      return {
        title: `如果${condition}，则${then}`,
        flavor: `如果${condition}，那么${then}。`,
        warnings: [],
      }
    }
    case 'lineCount':
      return {
        title: `${lineScopePhrase(rule.scope, rule.origin)}${countPhrase(rule.target, rule.count)}`,
        flavor: `${lineScopePhrase(rule.scope, rule.origin)}，${countPhrase(rule.target, rule.count)}。`,
        warnings: [],
      }
    case 'anchorCount':
      return {
        title: `${anchorPhrase(rule.anchorId, context)}的${anchorScopePhrase(rule.scope)}${countPhrase(rule.target, rule.count)}`,
        flavor: `${anchorPhrase(rule.anchorId, context)}的${anchorScopePhrase(rule.scope)}，${countPhrase(rule.target, rule.count)}。`,
        warnings: [],
      }
    case 'recordSet':
      return {
        title: `记录组中${falseRecordPhrase(rule.falseRecords)}`,
        flavor: `这些记录中${falseRecordPhrase(rule.falseRecords)}。`,
        warnings: [],
      }
  }
}

function forEachText(rule: Extract<RuleDefinition, { readonly type: 'forEachCount' }>): GeneratedRuleText {
  const subject = kindLabel(rule.subject)
  const scope = localScopePhraseForRule(rule.scope.kind)
  if (rule.target === 'guest' && rule.count.op === 'eq' && rule.count.value === 0) {
    return {
      title: `${subject}${scope}没有访客`,
      flavor: `每个${subject}的${scope}，没有访客。`,
      warnings: [],
    }
  }

  return {
    title: `${subject}${scope}${countPhrase(rule.target, rule.count)}`,
    flavor: `每个${subject}的${scope}，${countPhrase(rule.target, rule.count)}。`,
    warnings: [],
  }
}

function clausePhrase(
  scope: CountScopeRef,
  target: CellKind,
  count: Comparator,
  context: RuleTextContext,
): string {
  return `${countScopePhrase(scope, context)}${countPhrase(target, count)}`
}

function kindLabel(kind: CellKind): string {
  switch (kind) {
    case 'guest':
      return '访客'
    case 'empty':
      return '没有访客的格子'
    case 'bottle':
      return '酒瓶'
    case 'bin':
      return '垃圾桶'
    case 'mirror':
      return '镜子'
  }
}

function kindCountUnit(kind: CellKind): string {
  return kind === 'guest' ? '个' : '个'
}

function countPhrase(kind: CellKind, count: Comparator): string {
  if (kind === 'guest' && count.op === 'eq' && count.value === 0) return '没有访客'

  const target = kindLabel(kind)
  const quantity = `${count.value} ${kindCountUnit(kind)}${target}`
  switch (count.op) {
    case 'eq':
      return `恰好有 ${quantity}`
    case 'neq':
      return `不是 ${quantity}`
    case 'gt':
      return `多于 ${quantity}`
    case 'gte':
      return `至少有 ${quantity}`
    case 'lt':
      return `少于 ${quantity}`
    case 'lte':
      return `至多有 ${quantity}`
  }
}

function localScopePhrase(kind: 'orthogonal' | 'adjacent'): string {
  return kind === 'orthogonal' ? '上下左右邻格' : '周围一圈'
}

function localScopePhraseForRule(kind: LocalScopeKind): string {
  switch (kind) {
    case 'orthogonal':
    case 'adjacent':
      return localScopePhrase(kind)
    case 'north':
      return 'north cell'
    case 'south':
      return 'south cell'
    case 'east':
      return 'east cell'
    case 'west':
      return 'west cell'
  }
}

function anchorScopePhrase(scope: Extract<RuleDefinition, { readonly type: 'anchorCount' }>['scope']): string {
  switch (scope.kind) {
    case 'orthogonal':
    case 'adjacent':
    case 'north':
    case 'south':
    case 'east':
    case 'west':
      return localScopePhraseForRule(scope.kind)
    case 'row':
      return `第 ${scope.index + 1} 行`
    case 'column':
      return `第 ${scope.index + 1} 列`
    case 'ray':
      return `向${directionPhrase(scope.direction)}的视线${blockerPhrase(scope.stopAtKinds)}`
    case 'region':
      return `区域 ${scope.regionId}`
  }
}

function regionPhrase(regionId: string, context: RuleTextContext): string {
  const region = context.puzzle?.regions?.find((candidate) => candidate.id === regionId)
  if (region === undefined) return `区域 ${regionId}`
  const cells = region.cells.join('、')
  return `${region.title}（${cells}）`
}

function anchorPhrase(anchorId: string, context: RuleTextContext): string {
  const anchor = context.puzzle?.anchors?.find((candidate) => candidate.id === anchorId)
  if (anchor === undefined) return `参照物 ${anchorId}`
  return anchor.title
}

function countScopePhrase(scope: CountScopeRef, context: RuleTextContext): string {
  switch (scope.kind) {
    case 'global':
      return '全场'
    case 'region':
      return regionPhrase(scope.regionId, context)
    case 'line':
      return lineScopePhrase(scope.scope, scope.origin)
  }
}

function lineScopePhrase(
  scope: Extract<CountScopeRef, { readonly kind: 'line' }>['scope'],
  origin?: string,
): string {
  switch (scope.kind) {
    case 'row':
      return `第 ${scope.index + 1} 行`
    case 'column':
      return `第 ${scope.index + 1} 列`
    case 'ray':
      return `${origin ?? '指定格'}向${directionPhrase(scope.direction)}的视线${blockerPhrase(scope.stopAtKinds)}`
  }
}

function directionPhrase(direction: 'north' | 'south' | 'east' | 'west'): string {
  switch (direction) {
    case 'north':
      return '上'
    case 'south':
      return '下'
    case 'east':
      return '右'
    case 'west':
      return '左'
  }
}

function blockerPhrase(kinds: readonly CellKind[] | undefined): string {
  if (kinds === undefined || kinds.length === 0) return ''
  return `，遇到${kinds.map(kindLabel).join('或')}停止`
}

function overlapModePhrase(mode: 'intersection' | 'union' | 'leftOnly' | 'rightOnly'): string {
  switch (mode) {
    case 'intersection':
      return '交集'
    case 'union':
      return '并集'
    case 'leftOnly':
      return '左侧独有范围'
    case 'rightOnly':
      return '右侧独有范围'
  }
}

function comparisonPhrase(comparison: CountComparison, rightLabel?: string): string {
  const offset = comparison.offset ?? 0
  const right = rightLabel === undefined ? '右侧' : rightLabel
  const offsetText = offset === 0
    ? ''
    : offset > 0
      ? `多 ${offset}`
      : `少 ${Math.abs(offset)}`
  switch (comparison.op) {
    case 'eq':
      return offset === 0 ? `与${right}相同` : `比${right}${offsetText}`
    case 'neq':
      return `与${right}不同${offset === 0 ? '' : `，且不是${offsetText}`}`
    case 'gt':
      return `比${right}更多${offset === 0 ? '' : `，差值${offsetText}`}`
    case 'gte':
      return `不少于${right}${offset === 0 ? '' : `，至少${offsetText}`}`
    case 'lt':
      return `比${right}更少${offset === 0 ? '' : `，差值${offsetText}`}`
    case 'lte':
      return `不多于${right}${offset === 0 ? '' : `，至多${offsetText}`}`
  }
}

function falseRecordPhrase(falseRecords: Extract<RuleDefinition, { readonly type: 'recordSet' }>['falseRecords']): string {
  return falseRecords.op === 'eq'
    ? `恰好 ${falseRecords.value} 条记录为假`
    : `至多 ${falseRecords.value} 条记录为假`
}

function forbiddenTermWarnings(texts: readonly string[]): readonly string[] {
  const combined = texts.join('\n')
  return FORBIDDEN_VISIBLE_TERMS
    .filter((term) => combined.includes(term))
    .map((term) => `Generated rule text contains forbidden visible term: ${term}`)
}
