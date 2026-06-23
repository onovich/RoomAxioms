import { Lightbulb, RotateCcw } from 'lucide-react'
import type { CaseSummary } from '../../content/cases'
import type { RoomAxiomsGame } from '../../hooks/useRoomAxiomsGame'

interface TopBarProps {
  readonly game: RoomAxiomsGame
  readonly cases: readonly CaseSummary[]
  readonly selectedCaseId: string
  readonly onSelectCase: (caseId: string) => void
}

export function TopBar({ game, cases, selectedCaseId, onSelectCase }: TopBarProps) {
  const guestMarks = [...game.marks.values()].filter((mark) => mark === 'guest').length

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
          <div className="case-meta">
            <div className="case-name">{game.puzzle.caseName}</div>
            <label className="case-picker">
              <span>Case</span>
              <select
                value={selectedCaseId}
                onChange={(event) => onSelectCase(event.target.value)}
                aria-label="Select case"
              >
                {cases.map((caseItem) => (
                  <option value={caseItem.id} key={caseItem.id}>
                    {caseItem.caseName}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="top-stats" aria-label="关卡进度">
        <ProgressStat label="访客标记" value={`${guestMarks} / ${game.targetGuestCount}`} />
        <ProgressStat label="已调查" value={`${game.revealed.size} / ${game.cells.length}`} />
        {game.devMode ? <ProgressStat label="候选布局" value={game.analysisLayoutCountText} /> : null}
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
