import type { CSSProperties, ReactNode } from 'react'

import {
  SCENE_DIVIDERS,
  SCENE_NINE_SLICE_FRAMES,
  SCENE_RULE_ICONS,
  type SceneDividerId,
  type SceneNineSliceFrameId,
  type SceneRuleIconId,
} from '../../theme/sceneShellAssets'

interface SceneNineSlicePanelProps {
  readonly children?: ReactNode
  readonly className?: string
  readonly variant?: SceneNineSliceFrameId
}

interface SceneDividerProps {
  readonly className?: string
  readonly id?: SceneDividerId
}

interface SceneRuleIconProps {
  readonly className?: string
  readonly id: SceneRuleIconId
}

const PIECES = [
  ['top-left', 'topLeft'],
  ['top-stretch', 'topStretch'],
  ['top-right', 'topRight'],
  ['middle-left', 'middleLeft'],
  ['middle-stretch', 'middleStretch'],
  ['middle-right', 'middleRight'],
  ['bottom-left', 'bottomLeft'],
  ['bottom-stretch', 'bottomStretch'],
  ['bottom-right', 'bottomRight'],
] as const

export function SceneNineSlicePanel({
  children,
  className = '',
  variant = 'paper',
}: SceneNineSlicePanelProps) {
  const frame = SCENE_NINE_SLICE_FRAMES[variant]
  const style = {
    '--scene-slice-left': `${frame.slice.left}px`,
    '--scene-slice-right': `${frame.slice.right}px`,
    '--scene-slice-top': `${frame.slice.top}px`,
    '--scene-slice-bottom': `${frame.slice.bottom}px`,
  } as CSSProperties

  return (
    <div
      className={`scene-nine-slice-panel ${className}`.trim()}
      data-frame-variant={variant}
      data-frame-label={frame.label}
      style={style}
    >
      {PIECES.map(([classNamePart, partKey]) => (
        <span
          aria-hidden="true"
          className={`scene-nine-slice-piece scene-nine-slice-${classNamePart}`}
          key={classNamePart}
          style={{ backgroundImage: `url(${frame.parts[partKey]})` }}
        />
      ))}
      <div className="scene-nine-slice-content">{children}</div>
    </div>
  )
}

export function SceneDivider({ className = '', id = 'wide' }: SceneDividerProps) {
  return <img alt="" aria-hidden="true" className={`scene-divider ${className}`.trim()} src={SCENE_DIVIDERS[id]} />
}

export function SceneRuleIcon({ className = '', id }: SceneRuleIconProps) {
  return <img alt="" aria-hidden="true" className={`scene-rule-icon ${className}`.trim()} src={SCENE_RULE_ICONS[id]} />
}
