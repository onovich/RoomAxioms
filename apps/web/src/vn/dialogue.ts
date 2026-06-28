import type { Hint } from '../logic/hints'
import type { ThemeAssetKind } from '../theme/assetManifest'

export type DialogueSceneCategory =
  | 'caseIntro'
  | 'firstRuleSelect'
  | 'firstSafeInspect'
  | 'firstAnomalyMark'
  | 'hint'
  | 'failure'
  | 'success'

export type DialoguePortraitSlot = 'left' | 'center' | 'right'

export interface DialogueAssetRef {
  readonly kind: ThemeAssetKind
  readonly id: string
}

export interface DialogueLine {
  readonly id: string
  readonly speaker: string
  readonly text: string
  readonly portraitId?: string
  readonly portraitSlot?: DialoguePortraitSlot
  readonly expressionId?: string
  readonly backgroundId?: string
}

export interface DialogueScene {
  readonly id: string
  readonly category: DialogueSceneCategory
  readonly title: string
  readonly lines: readonly DialogueLine[]
  readonly dismissible: boolean
  readonly assetRefs: readonly DialogueAssetRef[]
}

export interface DialogueLeak {
  readonly sceneId: string
  readonly lineId?: string
  readonly field: 'id' | 'title' | 'speaker' | 'text' | 'asset'
  readonly term: string
}

export const REQUIRED_DIALOGUE_CATEGORIES = [
  'caseIntro',
  'firstRuleSelect',
  'firstSafeInspect',
  'firstAnomalyMark',
  'hint',
  'failure',
  'success',
] as const satisfies readonly DialogueSceneCategory[]

export const STATIC_DIALOGUE_SCENES = [
  {
    id: 'case-intro',
    category: 'caseIntro',
    title: 'Case file opened',
    dismissible: true,
    assetRefs: [
      { kind: 'portrait', id: 'dispatcher' },
      { kind: 'background', id: 'field-office' },
    ],
    lines: [
      {
        id: 'case-intro-1',
        speaker: '调度员',
        text: '档案已打开。先读公开规则，再决定从哪里调查。',
        portraitId: 'dispatcher',
        portraitSlot: 'right',
        expressionId: 'neutral',
        backgroundId: 'field-office',
      },
      {
        id: 'case-intro-2',
        speaker: '调查员',
        text: '我会只按公开信息行动；没有把握的格子先做笔记。',
        portraitId: 'investigator',
        portraitSlot: 'left',
        expressionId: 'neutral',
        backgroundId: 'field-office',
      },
    ],
  },
  {
    id: 'first-rule-select',
    category: 'firstRuleSelect',
    title: 'Rule focus tutorial',
    dismissible: true,
    assetRefs: [{ kind: 'portrait', id: 'dispatcher' }],
    lines: [
      {
        id: 'first-rule-select-1',
        speaker: '调度员',
        text: '选中规则会亮出相关范围；文字本身才是准确信息，亮光只是辅助。',
        portraitId: 'dispatcher',
        portraitSlot: 'right',
        expressionId: 'neutral',
      },
    ],
  },
  {
    id: 'first-safe-inspect',
    category: 'firstSafeInspect',
    title: 'Inspection tutorial',
    dismissible: true,
    assetRefs: [{ kind: 'portrait', id: 'investigator' }],
    lines: [
      {
        id: 'first-safe-inspect-1',
        speaker: '调查员',
        text: '这次调查没有触发访客。把新看到的物件和规则重新对照。',
        portraitId: 'investigator',
        portraitSlot: 'left',
        expressionId: 'neutral',
      },
    ],
  },
  {
    id: 'first-anomaly-mark',
    category: 'firstAnomalyMark',
    title: 'Mark tutorial',
    dismissible: true,
    assetRefs: [{ kind: 'portrait', id: 'dispatcher' }],
    lines: [
      {
        id: 'first-anomaly-mark-1',
        speaker: '调度员',
        text: '标记只是你的判断，最后提交前仍可修改。',
        portraitId: 'dispatcher',
        portraitSlot: 'right',
        expressionId: 'neutral',
      },
    ],
  },
  {
    id: 'failure-wrap',
    category: 'failure',
    title: 'Failure wrapper',
    dismissible: true,
    assetRefs: [{ kind: 'portrait', id: 'dispatcher' }],
    lines: [
      {
        id: 'failure-wrap-1',
        speaker: '调度员',
        text: '这次调查触发了访客记录。复盘公开规则后可以重新开始。',
        portraitId: 'dispatcher',
        portraitSlot: 'right',
        expressionId: 'neutral',
      },
    ],
  },
  {
    id: 'success-wrap',
    category: 'success',
    title: 'Success wrapper',
    dismissible: true,
    assetRefs: [{ kind: 'portrait', id: 'investigator' }],
    lines: [
      {
        id: 'success-wrap-1',
        speaker: '调查员',
        text: '所有访客记录已经归档。公开规则和现场记录互相吻合。',
        portraitId: 'investigator',
        portraitSlot: 'left',
        expressionId: 'neutral',
      },
    ],
  },
] as const satisfies readonly DialogueScene[]

const FORBIDDEN_DIALOGUE_TERMS = [
  'answer',
  'candidate',
  'forced',
  'guest-layout',
  'guestLayout',
  'proof',
  'solver',
  'target',
  'targetAnswer',
  'targetGuest',
  '候选',
  '强制',
  '求解器',
  '证明内部',
  '目标答案',
] as const

const CELL_COORDINATE_PATTERN = /\b[A-Z]{1,2}[1-9]\d?\b/u

export function createHintDialogueScene(hint: Hint | null): DialogueScene | null {
  if (hint === null) return null

  return {
    id: 'hint-wrap',
    category: 'hint',
    title: 'Hint wrapper',
    dismissible: true,
    assetRefs: [{ kind: 'portrait', id: 'dispatcher' }],
    lines: [
      {
        id: 'hint-wrap-title',
        speaker: '调度员',
        text: `可以解释的一步：${hint.title}`,
        portraitId: 'dispatcher',
        portraitSlot: 'right',
        expressionId: 'neutral',
      },
      {
        id: 'hint-wrap-conclusion',
        speaker: '调度员',
        text: hint.conclusion,
        portraitId: 'dispatcher',
        portraitSlot: 'right',
        expressionId: 'neutral',
      },
      {
        id: 'hint-wrap-premises',
        speaker: '调度员',
        text: `用到的信息：${hint.premises.join('；')}`,
        portraitId: 'dispatcher',
        portraitSlot: 'right',
        expressionId: 'neutral',
      },
      {
        id: 'hint-wrap-reasoning',
        speaker: '调度员',
        text: hint.reasoning,
        portraitId: 'dispatcher',
        portraitSlot: 'right',
        expressionId: 'neutral',
      },
    ],
  }
}

export function staticDialogueSceneByCategory(
  category: Exclude<DialogueSceneCategory, 'hint'>,
): DialogueScene | null {
  return STATIC_DIALOGUE_SCENES.find((scene) => scene.category === category) ?? null
}

export function dialogueCategoriesPresent(
  scenes: readonly DialogueScene[],
): readonly DialogueSceneCategory[] {
  return [...new Set(scenes.map((scene) => scene.category))].sort()
}

export function missingDialogueCategories(
  scenes: readonly DialogueScene[],
): readonly DialogueSceneCategory[] {
  const present = new Set(dialogueCategoriesPresent(scenes))
  return REQUIRED_DIALOGUE_CATEGORIES.filter((category) => !present.has(category))
}

export function findDialogueSceneLeaks(
  scenes: readonly DialogueScene[],
): readonly DialogueLeak[] {
  const leaks: DialogueLeak[] = []

  for (const scene of scenes) {
    collectTextLeaks(leaks, scene.id, undefined, 'id', scene.id)
    collectTextLeaks(leaks, scene.id, undefined, 'title', scene.title)
    for (const asset of scene.assetRefs) {
      collectTextLeaks(leaks, scene.id, undefined, 'asset', asset.id)
    }
    for (const line of scene.lines) {
      collectTextLeaks(leaks, scene.id, line.id, 'id', line.id)
      collectTextLeaks(leaks, scene.id, line.id, 'speaker', line.speaker)
      collectTextLeaks(leaks, scene.id, line.id, 'text', line.text)
      if (line.portraitId !== undefined) collectTextLeaks(leaks, scene.id, line.id, 'asset', line.portraitId)
      if (line.expressionId !== undefined) collectTextLeaks(leaks, scene.id, line.id, 'asset', line.expressionId)
      if (line.backgroundId !== undefined) collectTextLeaks(leaks, scene.id, line.id, 'asset', line.backgroundId)
    }
  }

  return leaks
}

function collectTextLeaks(
  leaks: DialogueLeak[],
  sceneId: string,
  lineId: string | undefined,
  field: DialogueLeak['field'],
  value: string,
): void {
  const normalized = value.toLowerCase()
  for (const term of FORBIDDEN_DIALOGUE_TERMS) {
    if (normalized.includes(term.toLowerCase())) {
      leaks.push({ sceneId, ...(lineId === undefined ? {} : { lineId }), field, term })
    }
  }
  if (CELL_COORDINATE_PATTERN.test(value)) {
    leaks.push({ sceneId, ...(lineId === undefined ? {} : { lineId }), field, term: 'cell-coordinate' })
  }
}
