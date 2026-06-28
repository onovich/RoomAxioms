import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

import {
  DEFAULT_THEME_ASSET_MANIFEST,
  resolveThemeAsset,
  type ThemeAssetManifest,
} from '../theme/assetManifest'
import { activeDialogueLine, nextDialogueLineIndex } from './dialogueNavigation'
import {
  DEFAULT_VN_PREFERENCES,
  vnTextRevealDelayMs,
  type VNPreferences,
} from './preferences'
import type { DialogueScene } from './dialogue'

export interface VNDialogueDockProps {
  readonly scene: DialogueScene
  readonly lineIndex: number
  readonly manifest?: ThemeAssetManifest
  readonly preferences?: VNPreferences
  readonly onAdvance: () => void
  readonly onClose: () => void
  readonly onSkip?: () => void
}

export function VNDialogueDock({
  scene,
  lineIndex,
  manifest = DEFAULT_THEME_ASSET_MANIFEST,
  preferences = DEFAULT_VN_PREFERENCES,
  onAdvance,
  onClose,
  onSkip,
}: VNDialogueDockProps) {
  const line = activeDialogueLine(scene, lineIndex)
  const lineText = line?.text ?? ''
  const revealDelayMs = vnTextRevealDelayMs(preferences)
  const [visibleLength, setVisibleLength] = useState(() =>
    typeof window === 'undefined' || revealDelayMs === 0 ? lineText.length : 0,
  )
  const visibleText = lineText.slice(0, visibleLength)
  const textFullyVisible = visibleLength >= lineText.length
  const nextIndex = nextDialogueLineIndex(scene, lineIndex)
  const isLastLine = nextIndex === null
  const portrait = line?.portraitId === undefined
    ? null
    : resolveThemeAsset(manifest, 'portrait', line.portraitId)
  const frame = resolveThemeAsset(manifest, 'dialogueFrame', 'dialogue-default')

  useEffect(() => {
    let resetTimeoutId: number | undefined
    if (revealDelayMs === 0) {
      resetTimeoutId = window.setTimeout(() => setVisibleLength(lineText.length), 0)
      return () => {
        if (resetTimeoutId !== undefined) window.clearTimeout(resetTimeoutId)
      }
    }

    resetTimeoutId = window.setTimeout(() => setVisibleLength(0), 0)
    if (lineText.length === 0) {
      return () => {
        if (resetTimeoutId !== undefined) window.clearTimeout(resetTimeoutId)
      }
    }

    const intervalId = window.setInterval(() => {
      setVisibleLength((current) => {
        if (current >= lineText.length) {
          window.clearInterval(intervalId)
          return current
        }
        return current + 1
      })
    }, revealDelayMs)

    return () => {
      if (resetTimeoutId !== undefined) window.clearTimeout(resetTimeoutId)
      window.clearInterval(intervalId)
    }
  }, [lineText, revealDelayMs])

  if (line === null) return null

  const closeOrSkip = onSkip ?? onClose
  const advance = () => {
    if (!textFullyVisible) {
      setVisibleLength(lineText.length)
      return
    }
    if (isLastLine) onClose()
    else onAdvance()
  }

  return (
    <aside
      className="vn-dock"
      aria-labelledby="vnDockTitle"
      data-frame-status={frame.status}
      data-frame-placeholder={frame.placeholder}
    >
      <div className="vn-dock-portrait" aria-hidden="true">
        {portrait?.src === undefined ? <span>{portrait?.alt ?? portrait?.label ?? line.speaker}</span> : <img src={portrait.src} alt="" />}
      </div>
      <div className="vn-dock-body">
        <div className="vn-dock-header">
          <div>
            <span className="eyebrow">{scene.title}</span>
            <h2 id="vnDockTitle">{line.speaker}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="关闭搭档复核">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <button
          className="vn-dock-text"
          type="button"
          onClick={advance}
          aria-label={isLastLine ? '关闭搭档复核' : '继续搭档复核'}
        >
          {visibleText}
        </button>
        <div className="vn-dock-actions">
          <span aria-live="polite">{lineIndex + 1} / {scene.lines.length}</span>
          <div>
            <button className="ghost-button" type="button" onClick={closeOrSkip}>
              跳过
            </button>
            <button className="primary-button" type="button" onClick={advance}>
              {isLastLine ? '关闭' : '继续'}
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
