export type ThemeAssetKind =
  | 'keyVisual'
  | 'boardSurface'
  | 'objectIcon'
  | 'characterPortrait'
  | 'expressionVariant'
  | 'dialogueFrame'
  | 'caseSelectorReference'
  | 'typographyColorNote'

export type ThemeAssetStatus = 'needed' | 'received' | 'approved' | 'deferred'

export interface ThemeAssetIntakeItem {
  readonly id: string
  readonly kind: ThemeAssetKind
  readonly title: string
  readonly status: ThemeAssetStatus
  readonly sourcePath?: string
  readonly notes?: string
}

export type DialogueHookKind = 'caseIntro' | 'tutorial' | 'hintIntro' | 'result'

export interface ThemeDialogueLine {
  readonly id: string
  readonly speaker: string
  readonly text: string
  readonly portraitId?: string
  readonly expressionId?: string
}

export interface ThemeDialogueHook {
  readonly id: string
  readonly kind: DialogueHookKind
  readonly caseId?: string
  readonly lines: readonly ThemeDialogueLine[]
}

export interface ThemePackageDraft {
  readonly id: string
  readonly title: string
  readonly assets: readonly ThemeAssetIntakeItem[]
  readonly dialogueHooks: readonly ThemeDialogueHook[]
}

export type ThemePackageIssueCode =
  | 'ASSET_KIND_MISSING'
  | 'ASSET_SOURCE_MISSING'
  | 'ASSET_NOT_APPROVED'
  | 'DIALOGUE_EMPTY'
  | 'DIALOGUE_SECRET_TERM'

export interface ThemePackageIssue {
  readonly code: ThemePackageIssueCode
  readonly message: string
  readonly ref: string
}

export interface ThemePackageEvaluation {
  readonly ok: boolean
  readonly assetKinds: Record<ThemeAssetKind, ThemeAssetStatus | 'missing'>
  readonly issues: readonly ThemePackageIssue[]
}

export const REQUIRED_THEME_ASSET_KINDS: readonly ThemeAssetKind[] = [
  'keyVisual',
  'boardSurface',
  'objectIcon',
  'characterPortrait',
  'expressionVariant',
  'dialogueFrame',
  'caseSelectorReference',
  'typographyColorNote',
]

const SECRET_DIALOGUE_TERMS = [
  'target',
  'target cell',
  'target cells',
  'guest layout',
  'solver candidate',
  'proof internals',
  '答案',
  '目标格',
  '隐藏对象',
  '访客布局',
  '求解器候选',
  '证明内部',
] as const

export function createEmptyThemePackageDraft(id = 'unregistered-scene-theme'): ThemePackageDraft {
  return {
    id,
    title: '未登记现场 Theme Package',
    assets: REQUIRED_THEME_ASSET_KINDS.map((kind) => ({
      id: kind,
      kind,
      title: defaultThemeAssetTitle(kind),
      status: 'needed',
    })),
    dialogueHooks: [],
  }
}

export function evaluateThemePackageDraft(draft: ThemePackageDraft): ThemePackageEvaluation {
  const assetKinds = assetKindStatus(draft.assets)
  const issues: ThemePackageIssue[] = []

  for (const kind of REQUIRED_THEME_ASSET_KINDS) {
    const status = assetKinds[kind]
    if (status === 'missing') {
      issues.push({
        code: 'ASSET_KIND_MISSING',
        message: `${kind} asset intake item is missing.`,
        ref: `asset:${kind}`,
      })
      continue
    }

    const item = draft.assets.find((asset) => asset.kind === kind)
    if (item?.sourcePath === undefined && status !== 'deferred') {
      issues.push({
        code: 'ASSET_SOURCE_MISSING',
        message: `${kind} has no source path yet.`,
        ref: `asset:${item?.id ?? kind}`,
      })
    }
    if (status !== 'approved' && status !== 'deferred') {
      issues.push({
        code: 'ASSET_NOT_APPROVED',
        message: `${kind} is not approved for implementation.`,
        ref: `asset:${item?.id ?? kind}`,
      })
    }
  }

  for (const hook of draft.dialogueHooks) {
    if (hook.lines.length === 0) {
      issues.push({
        code: 'DIALOGUE_EMPTY',
        message: `${hook.id} has no dialogue lines.`,
        ref: `dialogue:${hook.id}`,
      })
    }

    for (const line of hook.lines) {
      for (const term of SECRET_DIALOGUE_TERMS) {
        if (line.text.toLocaleLowerCase().includes(term.toLocaleLowerCase())) {
          issues.push({
            code: 'DIALOGUE_SECRET_TERM',
            message: `${line.id} may leak puzzle-answer or solver-only information: ${term}.`,
            ref: `dialogue:${hook.id}:${line.id}`,
          })
        }
      }
    }
  }

  return {
    ok: issues.length === 0,
    assetKinds,
    issues,
  }
}

function assetKindStatus(
  assets: readonly ThemeAssetIntakeItem[],
): Record<ThemeAssetKind, ThemeAssetStatus | 'missing'> {
  const status = Object.fromEntries(
    REQUIRED_THEME_ASSET_KINDS.map((kind) => [kind, 'missing']),
  ) as Record<ThemeAssetKind, ThemeAssetStatus | 'missing'>
  for (const asset of assets) {
    status[asset.kind] = asset.status
  }
  return status
}

function defaultThemeAssetTitle(kind: ThemeAssetKind): string {
  switch (kind) {
    case 'keyVisual':
      return 'Main background or key visual'
    case 'boardSurface':
      return 'Room and board surface treatment'
    case 'objectIcon':
      return 'Object icon or illustrated token set'
    case 'characterPortrait':
      return 'Character half-body portrait'
    case 'expressionVariant':
      return 'Character expression variants'
    case 'dialogueFrame':
      return 'Dialogue box and UI frame reference'
    case 'caseSelectorReference':
      return 'Case selector and evidence-panel visual reference'
    case 'typographyColorNote':
      return 'Typography and color notes'
  }
}
