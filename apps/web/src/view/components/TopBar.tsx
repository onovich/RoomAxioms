import { Lightbulb, RotateCcw } from 'lucide-react'
import type { CaseSummary, CaseTier } from '../../content/cases'
import type { RoomAxiomsGame } from '../../hooks/useRoomAxiomsGame'

interface TopBarProps {
  readonly game: RoomAxiomsGame
  readonly cases: readonly CaseSummary[]
  readonly selectedCaseId: string
  readonly onSelectCase: (caseId: string) => void
}

export function TopBar({ game, cases, selectedCaseId, onSelectCase }: TopBarProps) {
  const guestMarks = [...game.marks.values()].filter((mark) => mark === 'guest').length
  const caseGroups = groupCasesByTier(cases)

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
                {caseGroups.map((group) => (
                  <optgroup label={group.label} key={group.tier}>
                    {group.cases.map((caseItem) => (
                      <option value={caseItem.id} key={caseItem.id}>
                        {caseItem.caseName}
                      </option>
                    ))}
                  </optgroup>
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

const CASE_TIER_ORDER: readonly CaseTier[] = ['baseline', 'target-4', 'super-hard']

const CASE_TIER_LABELS = {
  baseline: '基础 / 机制样例',
  'target-4': '4+ 候选',
  'super-hard': '6-7 高难候选',
} as const satisfies Record<CaseTier, string>

function groupCasesByTier(cases: readonly CaseSummary[]): readonly {
  readonly tier: CaseTier
  readonly label: string
  readonly cases: readonly CaseSummary[]
}[] {
  return CASE_TIER_ORDER.map((tier) => ({
    tier,
    label: CASE_TIER_LABELS[tier],
    cases: cases.filter((caseItem) => caseItem.tier === tier),
  })).filter((group) => group.cases.length > 0)
}

function ProgressStat({ label, value }: { readonly label: string; readonly value: string | number }) {
  return (
    <div>
      <span className="stat-label">{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
