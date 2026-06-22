import { Lightbulb, RotateCcw } from 'lucide-react'
import type { RoomAxiomsGame } from '../../hooks/useRoomAxiomsGame'

interface TopBarProps {
  readonly game: RoomAxiomsGame
}

export function TopBar({ game }: TopBarProps) {
  const guestMarks = [...game.marks.values()].filter((mark) => mark === 'guest').length
  const guestTotal = Object.values(game.puzzle.target).filter((kind) => kind === 'guest').length

  return (
    <header className="topbar">
      <div className="brand-block">
        <div className="brand-mark" aria-hidden="true">
          RA
        </div>
        <div>
          <div className="brand">
            房间公理 <span>Room Axioms</span>
          </div>
          <div className="case-name">{game.puzzle.caseName}</div>
        </div>
      </div>

      <div className="top-stats" aria-label="关卡进度">
        <ProgressStat label="访客标记" value={`${guestMarks} / ${guestTotal}`} />
        <ProgressStat label="已调查" value={`${game.revealed.size} / ${game.cells.length}`} />
        {game.devMode ? <ProgressStat label="候选布局" value={game.analysis.layouts.length} /> : null}
      </div>

      <div className="top-actions">
        <button className="ghost-button" type="button" onClick={game.requestHint}>
          <Lightbulb size={17} aria-hidden="true" />
          <span>解释一步</span>
        </button>
        <label className="dev-toggle">
          <input
            type="checkbox"
            checked={game.devMode}
            onChange={(event) => game.setDevMode(event.target.checked)}
          />
          <span>验证层</span>
        </label>
        <button className="icon-button" type="button" onClick={game.reset} aria-label="重置关卡">
          <RotateCcw size={20} aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}

function ProgressStat({ label, value }: { readonly label: string; readonly value: string | number }) {
  return (
    <div>
      <span className="stat-label">{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

