import type { AnalysisResult } from './analysis'
import type { CellId, CellKind, PlayerMark, PuzzleDefinition } from '../domain/types'

export interface Hint {
  readonly title: string
  readonly conclusion: string
  readonly premises: readonly string[]
  readonly reasoning: string
  readonly highlight?: CellId
}

export function createHint(
  puzzle: PuzzleDefinition,
  revealed: ReadonlySet<CellId>,
  marks: ReadonlyMap<CellId, PlayerMark>,
  analysis: AnalysisResult,
): Hint {
  if (!revealed.has('B2')) {
    return {
      title: '一个必然结论',
      conclusion: 'B2 可以安全调查；它必定是垃圾桶。',
      premises: [
        '房间中恰有 1 个垃圾桶（R1）。',
        '每只酒瓶的正交邻域中恰有 1 个垃圾桶（R3）。',
        'B1、A2、C2 已揭示为酒瓶。',
      ],
      reasoning: '三只酒瓶的正交邻域共同包含的格子只有 B2。垃圾桶全局唯一，所以 B2 必为垃圾桶；垃圾桶不是访客。',
      highlight: 'B2',
    }
  }

  if (!revealed.has('C1')) {
    return {
      title: '一个必然结论',
      conclusion: 'C1 可以安全调查。',
      premises: ['B2 已揭示为垃圾桶。', '垃圾桶的邻接域中没有访客（R4）。'],
      reasoning: 'C1 位于 B2 的邻接域内，因此不可能是访客。',
      highlight: 'C1',
    }
  }

  if (marks.get('D1') !== 'guest' && analysis.forcedGuests.includes('D1')) {
    return {
      title: '一个必为访客的格子',
      conclusion: 'D1 必定是访客，可以标记。',
      premises: ['C1 已揭示为镜子。', '每面镜子的邻接域中恰好有 1 名访客（R5）。', 'C1 邻接域内其他位置已由垃圾桶与酒瓶规则排除。'],
      reasoning: 'C1 的邻接域中只剩 D1 仍可容纳访客，因此“恰好 1”迫使 D1 为访客。',
      highlight: 'D1',
    }
  }

  if (!revealed.has('A3')) {
    return safeFromBinHint('A3')
  }

  if (!revealed.has('C3')) {
    return {
      ...safeFromBinHint('C3'),
      reasoning: 'C3 位于 B2 的邻接域内。揭示它可能为后续局部计数提供新事实。',
    }
  }

  if (analysis.forcedGuests.length > 0) {
    const id = analysis.forcedGuests[0]
    return {
      title: '一个必为访客的格子',
      conclusion: `${id} 在全部剩余候选布局中都是访客。`,
      premises: ['房间总访客数为 2（R2）。', '已揭示镜子的“恰好 1”约束同时成立。'],
      reasoning: '把局部候选集合与全局剩余数量合并后，其他位置均会导致至少一条规则矛盾。',
      highlight: id,
    }
  }

  if (analysis.forcedSafe.length > 0) {
    const id = analysis.forcedSafe[0]
    return {
      title: '一个必然结论',
      conclusion: `${id} 可以安全调查。`,
      premises: ['该格在当前所有符合公开规则与已知事实的候选布局中都不是访客。'],
      reasoning: '这个在线首版保留原型级提示；正式验证器会拒绝只有机器证明而无人类解释的关卡状态。',
      highlight: id,
    }
  }

  return {
    title: '暂无可用提示',
    conclusion: `${puzzle.title} 当前没有可解释动作。`,
    premises: ['这通常意味着关卡出现猜测点，或当前演示状态已偏离设计路径。'],
    reasoning: '正式发布关卡必须由零猜测验证器拒绝这种状态。',
  }
}

function safeFromBinHint(cellId: CellId): Hint {
  return {
    title: '一个必然结论',
    conclusion: `${cellId} 可以安全调查。`,
    premises: ['B2 已揭示为垃圾桶。', '垃圾桶的邻接域中没有访客（R4）。'],
    reasoning: `${cellId} 位于 B2 的邻接域内。`,
    highlight: cellId,
  }
}

export function kindIsInspectable(kind: CellKind): boolean {
  return kind !== 'guest'
}

