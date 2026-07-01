export const FIGMA_PUZZLE_PROTOTYPE_ASSET_BASE = `${import.meta.env.BASE_URL}figma-puzzle-prototype/`

export type SceneNineSliceFrameId = 'paper' | 'submit'
export type SceneDividerId = 'wide' | 'side' | 'short'
export type SceneRuleIconId = 'exact' | 'exactAlt' | 'orthogonal' | 'adjacent'

export interface SceneNineSliceFrame {
  readonly id: SceneNineSliceFrameId
  readonly label: string
  readonly slice: {
    readonly left: number
    readonly right: number
    readonly top: number
    readonly bottom: number
  }
  readonly parts: {
    readonly topLeft: string
    readonly topStretch: string
    readonly topRight: string
    readonly middleLeft: string
    readonly middleStretch: string
    readonly middleRight: string
    readonly bottomLeft: string
    readonly bottomStretch: string
    readonly bottomRight: string
  }
}

export const SCENE_NINE_SLICE_FRAMES = {
  paper: createNineSliceFrame('paper', 'Temporary Figma paper panel frame', 'box-001'),
  submit: createNineSliceFrame('submit', 'Temporary Figma submit panel frame', 'box-002'),
} as const satisfies Record<SceneNineSliceFrameId, SceneNineSliceFrame>

export const SCENE_DIVIDERS = {
  wide: `${FIGMA_PUZZLE_PROTOTYPE_ASSET_BASE}divider-wide.svg`,
  side: `${FIGMA_PUZZLE_PROTOTYPE_ASSET_BASE}divider-side.svg`,
  short: `${FIGMA_PUZZLE_PROTOTYPE_ASSET_BASE}divider-short.svg`,
} as const satisfies Record<SceneDividerId, string>

export const SCENE_RULE_ICONS = {
  exact: `${FIGMA_PUZZLE_PROTOTYPE_ASSET_BASE}rule-exact-icon.svg`,
  exactAlt: `${FIGMA_PUZZLE_PROTOTYPE_ASSET_BASE}rule-exact-icon-alt.svg`,
  orthogonal: `${FIGMA_PUZZLE_PROTOTYPE_ASSET_BASE}rule-orthogonal-icon.svg`,
  adjacent: `${FIGMA_PUZZLE_PROTOTYPE_ASSET_BASE}rule-adjacent-icon.svg`,
} as const satisfies Record<SceneRuleIconId, string>

export const SCENE_CHARACTER_BUSTS = {
  assistant: `${FIGMA_PUZZLE_PROTOTYPE_ASSET_BASE}assistant-portrait.png`,
  protagonist: `${FIGMA_PUZZLE_PROTOTYPE_ASSET_BASE}protagonist-portrait.png`,
} as const

function createNineSliceFrame(
  id: SceneNineSliceFrameId,
  label: string,
  filePrefix: 'box-001' | 'box-002',
): SceneNineSliceFrame {
  return {
    id,
    label,
    slice: {
      left: 36,
      right: 36,
      top: 24,
      bottom: 24,
    },
    parts: {
      topLeft: `${FIGMA_PUZZLE_PROTOTYPE_ASSET_BASE}${filePrefix}-top-left.png`,
      topStretch: `${FIGMA_PUZZLE_PROTOTYPE_ASSET_BASE}${filePrefix}-top-stretch.png`,
      topRight: `${FIGMA_PUZZLE_PROTOTYPE_ASSET_BASE}${filePrefix}-top-right.png`,
      middleLeft: `${FIGMA_PUZZLE_PROTOTYPE_ASSET_BASE}${filePrefix}-middle-left.png`,
      middleStretch: `${FIGMA_PUZZLE_PROTOTYPE_ASSET_BASE}${filePrefix}-middle-stretch.png`,
      middleRight: `${FIGMA_PUZZLE_PROTOTYPE_ASSET_BASE}${filePrefix}-middle-right.png`,
      bottomLeft: `${FIGMA_PUZZLE_PROTOTYPE_ASSET_BASE}${filePrefix}-bottom-left.png`,
      bottomStretch: `${FIGMA_PUZZLE_PROTOTYPE_ASSET_BASE}${filePrefix}-bottom-stretch.png`,
      bottomRight: `${FIGMA_PUZZLE_PROTOTYPE_ASSET_BASE}${filePrefix}-bottom-right.png`,
    },
  }
}
