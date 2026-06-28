import type { CellKind, PlayerMark } from '@room-axioms/domain'
import type { Tool } from '../view/types'

export const SCENE_TITLE = '未登记现场'
export const SCENE_TITLE_EN = 'UNREGISTERED SCENE'
export const SCENE_DEPARTMENT = '非常规赔案调查部'
export const SCENE_DEPARTMENT_EN = 'Abnormal Claim Survey Division'

export const scenePanels = {
  rules: '现场定则',
  map: '现场平面图',
  record: '现场登记记录',
  marks: '我的标注',
  partnerReview: '搭档复核',
  submitSurvey: '提交现场登记图',
  resetSurvey: '重置调查',
} as const

export const sceneToolLabels: Readonly<Record<Tool, string>> = {
  inspect: '勘察',
  guest: '标注异常',
  safe: '标注可勘察',
}

export const sceneToolDescriptions: Readonly<Record<Tool, string>> = {
  inspect: '对未知区域建立受控勘察',
  guest: '记录疑似异常区域，不会改变现场',
  safe: '记录可安全勘察的工作笔记',
}

export const sceneCellLabels: Readonly<Record<CellKind, string>> = {
  empty: '可勘察区域',
  bottle: '酒瓶',
  bin: '垃圾桶',
  mirror: '镜子',
  guest: '异常区域',
}

export const sceneMarkLabels: Readonly<Record<PlayerMark, string>> = {
  guest: '异常标注',
  safe: '可勘察标注',
}

export function sceneKindLabel(kind: string): string {
  if (isSceneCellKind(kind)) return sceneCellLabels[kind]
  return '可勘察区域'
}

export function sceneKindUnit(kind: string): string {
  if (kind === 'guest') return '处'
  if (kind === 'mirror') return '面'
  return '个'
}

export function sanitizePlayerRuleCopy(copy: string): string {
  return copy
    .replaceAll('名未登记访客', '处异常区域')
    .replaceAll('名住客', '处异常区域')
    .replaceAll('名访客', '处异常区域')
    .replaceAll('未登记访客', '异常区域')
    .replaceAll('住客', '异常区域')
    .replaceAll('访客', '异常区域')
}

function isSceneCellKind(kind: string): kind is CellKind {
  return kind === 'empty' ||
    kind === 'bottle' ||
    kind === 'bin' ||
    kind === 'mirror' ||
    kind === 'guest'
}
