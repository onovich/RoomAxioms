import { ruleChip, ruleSemantics } from '../../logic/scopeText'
import type { RoomAxiomsGame } from '../../hooks/useRoomAxiomsGame'

interface RulePanelProps {
  readonly game: RoomAxiomsGame
  readonly onOpenNeighborhood: () => void
}

export function RulePanel({ game, onOpenNeighborhood }: RulePanelProps) {
  return (
    <aside className="panel rules-panel" data-panel="rules" aria-labelledby="rulesHeading">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">全部规则已公开</span>
          <h1 id="rulesHeading">房间公理</h1>
        </div>
        <button className="small-button" type="button" onClick={onOpenNeighborhood}>
          邻域定义
        </button>
      </div>

      <p className="contract">调查只会揭示房间中早已存在的物件。规则不会新增、修改或追溯生效。</p>

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
              <b>{rule.presentation.title}</b>
              <em>{rule.presentation.flavor}</em>
              <small className="rule-semantics">{ruleSemantics(rule)}</small>
            </span>
            <span className="rule-chip">{ruleChip(rule)}</span>
          </button>
        ))}
      </div>

      <div className="direction-note">
        <span className="direction-arrow">主体 -&gt; 目标</span>
        <p>规则是单向约束。例如“镜子附近恰有一名访客”不代表每名访客附近都有镜子。</p>
      </div>
    </aside>
  )
}
