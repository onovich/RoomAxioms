import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import {
  PLAYER_DESIGN_HEIGHT,
  PLAYER_DESIGN_WIDTH,
  calculatePlayerCanvasScale,
} from './PlayerShellGeometry'

interface PlayerShellProps {
  readonly board: ReactNode
  readonly dialogs: ReactNode
  readonly evidence: ReactNode
  readonly mobilePanel: string
  readonly mobileTabs: ReactNode
  readonly rules: ReactNode
  readonly topbar: ReactNode
}

export function PlayerShell({
  board,
  dialogs,
  evidence,
  mobilePanel,
  mobileTabs,
  rules,
  topbar,
}: PlayerShellProps) {
  const scale = usePlayerCanvasScale()
  const viewportStyle = {
    height: `${PLAYER_DESIGN_HEIGHT * scale}px`,
    width: `${PLAYER_DESIGN_WIDTH * scale}px`,
  } as CSSProperties
  const canvasStyle = {
    transform: `scale(${scale})`,
  } as CSSProperties

  return (
    <div
      className="room-axioms-app scene-shell scene-player-root"
      data-design-height={PLAYER_DESIGN_HEIGHT}
      data-design-width={PLAYER_DESIGN_WIDTH}
      data-mobile-panel={mobilePanel}
      data-player-shell="fixed-16-9"
    >
      <div className="scene-player-viewport" style={viewportStyle}>
        <div className="scene-player-canvas" style={canvasStyle}>
          <div className="scene-player-topbar-slot">{topbar}</div>
          <main className="scene-player-workstation" aria-label="未登记现场玩家工作台">
            <div className="scene-player-rules-slot">{rules}</div>
            <div className="scene-player-board-slot">{board}</div>
            <div className="scene-player-evidence-slot">{evidence}</div>
          </main>
          <div className="scene-player-vn-slot">{dialogs}</div>
          <div className="scene-player-mobile-tabs-slot">{mobileTabs}</div>
        </div>
      </div>
    </div>
  )
}

function usePlayerCanvasScale(): number {
  const [scale, setScale] = useState(() => (
    typeof window === 'undefined'
      ? 1
      : calculatePlayerCanvasScale(window.innerWidth, window.innerHeight)
  ))

  useEffect(() => {
    const updateScale = () => {
      setScale(calculatePlayerCanvasScale(window.innerWidth, window.innerHeight))
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  return scale
}
