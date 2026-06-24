import { rulePlainText } from '../../logic/scopeText'
import type { RoomAxiomsGame } from '../../hooks/useRoomAxiomsGame'

interface RulePanelProps {
  readonly game: RoomAxiomsGame
}

export function RulePanel({ game }: RulePanelProps) {
  return (
    <aside className="panel rules-panel" data-panel="rules" aria-labelledby="rulesHeading">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">规则</span>
          <h1 id="rulesHeading">房间公理</h1>
        </div>
      </div>

      <div className="rule-list">
        {game.puzzle.rules.map((rule) => (
          <button
            className={`rule-card${game.selectedRule === rule.id ? ' active' : ''}`}
            type="button"
            key={rule.id}
            onClick={() => game.selectRule(rule.id)}
          >
            <span className="rule-index">{rule.id}</span>
            <span className="rule-copy">
              <b>{rulePlainText(rule)}</b>
              <em>{rule.presentation.title}</em>
            </span>
          </button>
        ))}
      </div>
    </aside>
  )
}
