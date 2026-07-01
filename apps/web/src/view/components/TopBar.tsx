import { MessageSquareText, Play, RotateCcw, Settings } from 'lucide-react'

import type { CaseSummary, CaseTier } from '../../content/cases'
import type { RoomAxiomsGame } from '../../hooks/useRoomAxiomsGame'
import {
  SCENE_DEPARTMENT,
  SCENE_DEPARTMENT_EN,
  SCENE_TITLE,
  SCENE_TITLE_EN,
  scenePanels,
} from '../../theme/vocabulary'
import type { VNTextSpeed } from '../../vn/preferences'

interface TopBarProps {
  readonly game: RoomAxiomsGame
  readonly cases: readonly CaseSummary[]
  readonly selectedCaseId: string
  readonly onSelectCase: (caseId: string) => void
}

export function TopBar({ game, cases, selectedCaseId, onSelectCase }: TopBarProps) {
  const anomalyMarks = [...game.marks.values()].filter((mark) => mark === 'guest').length
  const caseGroups = groupCasesByTier(cases)
  const caseDisplayName = displayCaseName(game.puzzle.caseName ?? game.puzzle.title)
  const caseNumber = caseNumberFor(game.puzzle.id)

  return (
    <header className="topbar scene-topbar scene-file-topbar">
      <div className="brand-block scene-brand scene-title-block">
        <div className="brand-mark" aria-hidden="true">
          US
        </div>
        <div>
          <div className="brand">
            {SCENE_TITLE} <span>{SCENE_TITLE_EN}</span>
          </div>
          <div className="department-line">{SCENE_DEPARTMENT} / {SCENE_DEPARTMENT_EN}</div>
        </div>
      </div>

      <section className="scene-case-dossier" aria-label="案件档案">
        <span className="scene-file-label">案件档案</span>
        <strong className="scene-case-number">{caseNumber}</strong>
        <span className="scene-case-divider" aria-hidden="true" />
        <div className="scene-case-copy">
          <span className="case-name">{caseDisplayName}</span>
          <label className="case-picker scene-case-file">
            <span>案卷</span>
            <select
              value={selectedCaseId}
              onChange={(event) => onSelectCase(event.target.value)}
              aria-label="选择案卷"
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
      </section>

      <div className="top-stats scene-progress" aria-label="现场调查进度">
        <ProgressStat label="已标记异常" value={`${anomalyMarks} / ${game.targetGuestCount}`} />
        <ProgressStat label="已检查" value={`${game.revealed.size} / ${game.cells.length}`} />
      </div>

      <div className="top-actions scene-actions">
        <div className="vn-preferences" aria-label="VN dialogue controls">
          <span className="scene-settings-label">
            <Settings size={16} aria-hidden="true" />
            设置
          </span>
          <button
            className="ghost-button"
            type="button"
            onClick={() => game.setVNEnabled(!game.vnPreferences.enabled)}
            aria-pressed={game.vnPreferences.enabled}
          >
            <MessageSquareText size={17} aria-hidden="true" />
            <span>{game.vnPreferences.enabled ? 'VN 开' : 'VN 关'}</span>
          </button>
          <button
            className="icon-button"
            type="button"
            onClick={game.replayCaseIntro}
            disabled={!game.vnPreferences.enabled}
            aria-label="重播开场对话"
            title="重播开场对话"
          >
            <Play size={17} aria-hidden="true" />
          </button>
          <label className="compact-select">
            <span>速度</span>
            <select
              value={game.vnPreferences.textSpeed}
              onChange={(event) => game.setVNTextSpeed(event.target.value as VNTextSpeed)}
              aria-label="VN 文字速度"
            >
              <option value="instant">即时</option>
              <option value="normal">标准</option>
              <option value="slow">慢速</option>
            </select>
          </label>
          <label className="compact-checkbox">
            <input
              type="checkbox"
              checked={game.vnPreferences.reducedMotion}
              onChange={(event) => game.setVNReducedMotion(event.target.checked)}
            />
            <span>减动画</span>
          </label>
        </div>
        <button className="icon-button" type="button" onClick={game.reset} aria-label={scenePanels.resetSurvey}>
          <RotateCcw size={20} aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}

const CASE_TIER_ORDER: readonly CaseTier[] = ['baseline', 'target-4', 'super-hard']

const CASE_TIER_LABELS = {
  baseline: '基础案卷',
  'target-4': '进阶案卷',
  'super-hard': '高危案卷',
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

function caseNumberFor(caseId: string): string {
  const match = /(\d+)$/.exec(caseId)
  return match === null ? '--' : match[1].padStart(2, '0').slice(-2)
}

function displayCaseName(caseName: string): string {
  return caseName.replace(/^案卷\s*\d+\s*[·.]\s*/, '')
}

function ProgressStat({ label, value }: { readonly label: string; readonly value: string | number }) {
  return (
    <div>
      <span className="stat-label">{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
