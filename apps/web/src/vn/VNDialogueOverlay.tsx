import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

import {
  DEFAULT_THEME_ASSET_MANIFEST,
  resolveThemeAsset,
  type ThemeAssetManifest,
} from '../theme/assetManifest'
import type { DialogueLine, DialogueScene } from './dialogue'
import { activeDialogueLine, nextDialogueLineIndex } from './dialogueNavigation'
import {
  DEFAULT_VN_PREFERENCES,
  vnTextRevealDelayMs,
  type VNPreferences,
} from './preferences'

export interface VNDialogueOverlayProps {
  readonly scene: DialogueScene
  readonly lineIndex: number
  readonly manifest?: ThemeAssetManifest
  readonly preferences?: VNPreferences
  readonly onAdvance: () => void
  readonly onClose: () => void
  readonly onSkip?: () => void
}

export function VNDialogueOverlay({
  scene,
  lineIndex,
  manifest = DEFAULT_THEME_ASSET_MANIFEST,
  preferences = DEFAULT_VN_PREFERENCES,
  onAdvance,
  onClose,
  onSkip,
}: VNDialogueOverlayProps) {
  const dialogRef = useRef<HTMLElement | null>(null)
  const line = activeDialogueLine(scene, lineIndex)
  const lineText = line?.text ?? ''
  const revealDelayMs = vnTextRevealDelayMs(preferences)
  const [visibleLength, setVisibleLength] = useState(() =>
    typeof window === 'undefined' || revealDelayMs === 0 ? lineText.length : 0,
  )
  const visibleText = lineText.slice(0, visibleLength)
  const textFullyVisible = visibleLength >= lineText.length
  const background = resolveThemeAsset(manifest, 'background', line?.backgroundId)
  const portrait = line?.portraitId === undefined
    ? null
    : resolveThemeAsset(manifest, 'portrait', line.portraitId)
  const expression = line?.expressionId === undefined
    ? null
    : resolveThemeAsset(manifest, 'expression', line.expressionId)
  const frame = resolveThemeAsset(manifest, 'dialogueFrame', 'dialogue-default')
  const nextIndex = nextDialogueLineIndex(scene, lineIndex)
  const isLastLine = nextIndex === null

  useEffect(() => {
    dialogRef.current?.focus()
  }, [lineIndex, scene.id])

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
    <section
      className="vn-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vnDialogueTitle"
      tabIndex={-1}
      ref={dialogRef}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          onClose()
        }
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          advance()
        }
      }}
    >
      <div
        className="vn-stage"
        data-background-status={background.status}
        data-frame-status={frame.status}
      >
        <div className="vn-background" aria-hidden="true">
          {background.src === undefined ? (
            <span>{background.label}</span>
          ) : (
            <img src={background.src} alt="" />
          )}
        </div>

        {portrait === null ? null : (
          <PortraitSlot
            line={line}
            portraitLabel={portrait.alt ?? portrait.label}
            portraitSrc={portrait.src}
            expressionLabel={expression?.label}
          />
        )}

        <article className="vn-dialogue-box" data-frame-placeholder={frame.placeholder}>
          <div className="vn-dialogue-header">
            <div>
              <span className="eyebrow">{scene.title}</span>
              <h2 id="vnDialogueTitle">{line.speaker}</h2>
            </div>
            <button className="icon-button" type="button" onClick={onClose} aria-label="关闭对话">
              <X size={19} aria-hidden="true" />
            </button>
          </div>
          <button
            className="vn-dialogue-text"
            type="button"
            onClick={advance}
            aria-label={isLastLine ? '关闭对话' : '继续对话'}
          >
            {visibleText}
          </button>
          <div className="vn-dialogue-actions">
            <span aria-live="polite">
              {lineIndex + 1} / {scene.lines.length}
            </span>
            <div>
              <button className="ghost-button" type="button" onClick={closeOrSkip}>
                跳过
              </button>
              <button className="primary-button" type="button" onClick={advance}>
                {isLastLine ? '关闭' : '继续'}
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}

function PortraitSlot({
  line,
  portraitLabel,
  portraitSrc,
  expressionLabel,
}: {
  readonly line: DialogueLine
  readonly portraitLabel: string
  readonly portraitSrc?: string
  readonly expressionLabel?: string
}) {
  const slot = line.portraitSlot ?? 'left'

  return (
    <div className={`vn-portrait ${slot}`} data-expression={expressionLabel ?? 'none'} aria-hidden="true">
      {portraitSrc === undefined ? (
        <span>{portraitLabel}</span>
      ) : (
        <img src={portraitSrc} alt="" />
      )}
    </div>
  )
}
