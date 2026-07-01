import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import {
  PLAYER_DESIGN_HEIGHT,
  PLAYER_DESIGN_WIDTH,
  calculatePlayerCanvasViewport,
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
  const canvasViewport = usePlayerCanvasViewport()
  const viewportStyle = {
    height: `${canvasViewport.height}px`,
    width: `${canvasViewport.width}px`,
  } as CSSProperties
  const canvasStyle = {
    transform: `scale(${canvasViewport.scale})`,
  } as CSSProperties

  return (
    <div
      className="room-axioms-app scene-shell scene-player-root"
      data-design-height={PLAYER_DESIGN_HEIGHT}
      data-design-width={PLAYER_DESIGN_WIDTH}
      data-mobile-panel={mobilePanel}
      data-player-scale={canvasViewport.scale.toFixed(6)}
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

function usePlayerCanvasViewport() {
  const [canvasViewport, setCanvasViewport] = useState(() => (
    typeof window === 'undefined'
      ? calculatePlayerCanvasViewport(PLAYER_DESIGN_WIDTH, PLAYER_DESIGN_HEIGHT)
      : calculatePlayerCanvasViewport(window.innerWidth, window.innerHeight)
  ))

  useEffect(() => {
    const updateCanvasViewport = () => {
      setCanvasViewport(calculatePlayerCanvasViewport(window.innerWidth, window.innerHeight))
    }

    updateCanvasViewport()
    window.addEventListener('resize', updateCanvasViewport)
    return () => window.removeEventListener('resize', updateCanvasViewport)
  }, [])

  return canvasViewport
}
