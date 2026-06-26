import type { RuntimeHint } from '../runtime/contracts'
import type { CellId, CellKind, PuzzleDefinition } from '@room-axioms/domain'

export interface Hint {
  readonly title: string
  readonly conclusion: string
  readonly premises: readonly string[]
  readonly reasoning: string
  readonly highlight?: CellId
}

export function createHint(
  puzzle: PuzzleDefinition,
  runtimeHint: RuntimeHint | null,
): Hint {
  if (runtimeHint !== null) {
    return hintFromRuntime(runtimeHint)
  }

  return {
    title: '暂时没有提示',
    conclusion: `${puzzle.title} 现在没有可以直接说明的一步。`,
    premises: ['提示只使用已经翻开的格子和公开规则。'],
    reasoning: '系统不会把只有求解器知道、玩家还推不出来的结论当作提示。',
  }
}

export function kindIsInspectable(kind: CellKind): boolean {
  return kind !== 'guest'
}

function hintFromRuntime(runtimeHint: RuntimeHint): Hint {
  return {
    title: techniqueTitle(runtimeHint.technique),
    conclusion: conclusionText(runtimeHint),
    premises: runtimeHint.ruleIds.length > 0
      ? runtimeHint.ruleIds.map((ruleId) => `用到规则 ${ruleId}`)
      : ['只使用已经翻开的格子和公开规则。'],
    reasoning: '这一步不用猜。',
    ...(runtimeHint.highlight === null ? {} : { highlight: runtimeHint.highlight }),
  }
}

function techniqueTitle(technique: RuntimeHint['technique']): string {
  switch (technique) {
    case 'GLOBAL_COUNT_SATURATED':
      return '数量已经够了'
    case 'GLOBAL_COUNT_ALL_REMAINING':
      return '剩下的都必须算上'
    case 'REGION_COUNT_SATURATED':
      return '这个区域已经数够了'
    case 'REGION_COUNT_ALL_REMAINING':
      return '这个区域剩下的都要算'
    case 'LINE_COUNT_SATURATED':
      return '这条线已经数够了'
    case 'LINE_COUNT_ALL_REMAINING':
      return '这条线剩下的都要算'
    case 'SCOPE_OVERLAP_COUNT_SATURATED':
      return '重叠范围已经数够了'
    case 'SCOPE_OVERLAP_COUNT_ALL_REMAINING':
      return '重叠范围剩下的都要算'
    case 'CONDITIONAL_COUNT_SATURATED':
      return '条件成立后已经数够了'
    case 'CONDITIONAL_COUNT_ALL_REMAINING':
      return '条件成立后剩下的都要算'
    case 'ANCHOR_COUNT_SATURATED':
      return '锚点周围已经数够了'
    case 'ANCHOR_COUNT_ALL_REMAINING':
      return '锚点周围剩下的都要算'
    case 'LOCAL_COUNT_SATURATED':
      return '这个范围已经数够了'
    case 'LOCAL_COUNT_ALL_REMAINING':
      return '这个范围剩下的都要算'
    case 'UNIQUE_TARGET_NEIGHBOR_INTERSECTION':
      return '几个范围重叠出了答案'
    case 'LOCAL_SCOPE_INTERSECTION':
      return '几个范围重叠出了答案'
    case 'LOCAL_SCOPE_DIFFERENCE':
      return '两个范围相减出了答案'
    case 'KNOWN_SAFE_FROM_NON_GUEST_OBJECT':
      return '已知物品不是访客'
  }
}

function conclusionText(runtimeHint: RuntimeHint): string {
  const conclusion = runtimeHint.conclusion

  switch (conclusion.kind) {
    case 'safe':
      return `${conclusion.cellId} 可以安全调查。`
    case 'guest':
      return `${conclusion.cellId} 一定是访客。`
    case 'object':
      return `${conclusion.cellId} 一定是 ${objectText(conclusion.object)}。`
  }
}

function objectText(kind: CellKind): string {
  if (kind === 'bottle') return '酒瓶'
  if (kind === 'bin') return '垃圾桶'
  if (kind === 'mirror') return '镜子'
  if (kind === 'guest') return '访客'
  return '空地'
}
