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
        <ProgressStat label="已标访客" value={`${guestMarks} / ${game.targetGuestCount}`} />
      </div>

      <div className="top-actions">
        <button className="ghost-button" type="button" onClick={game.requestHint}>
          <Lightbulb size={17} aria-hidden="true" />
          <span>解释一步</span>
        </button>
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
