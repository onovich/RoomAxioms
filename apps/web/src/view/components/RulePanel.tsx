import type { RuleDefinition } from '@room-axioms/domain'
import { rulePlainText } from '../../logic/scopeText'
import type { RoomAxiomsGame } from '../../hooks/useRoomAxiomsGame'
import { scenePanels } from '../../theme/vocabulary'

interface RulePanelProps {
  readonly game: RoomAxiomsGame
}

export function RulePanel({ game }: RulePanelProps) {
  return (
    <aside className="panel rules-panel scene-rules-panel" data-panel="rules" aria-labelledby="rulesHeading">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Scene Rules</span>
          <h1 id="rulesHeading">{scenePanels.rules}</h1>
        </div>
      </div>

      <div className="rule-list">
        {game.puzzle.rules.map((rule, index) => (
          <button
            className={`rule-card scene-rule-card${game.selectedRule === rule.id ? ' active' : ''}`}
            type="button"
            key={rule.id}
            onClick={() => game.selectRule(rule.id)}
          >
            <span className="rule-index">{String(index + 1).padStart(2, '0')}</span>
            <span className="rule-copy">
              <b>{rulePlainText(rule)}</b>
              <em>{rule.presentation.title}</em>
            </span>
            <RuleScopeMiniDiagram rule={rule} />
          </button>
        ))}
      </div>
    </aside>
  )
}

function RuleScopeMiniDiagram({ rule }: { readonly rule: RuleDefinition }) {
  const cells = miniDiagramCells(rule)

  return (
    <span className="rule-mini-diagram" aria-hidden="true">
      {cells.map((cell, index) => (
        <span className={cell} key={index} />
      ))}
    </span>
  )
}

function miniDiagramCells(rule: RuleDefinition): readonly string[] {
  if (rule.type === 'globalCount' || rule.type === 'recordSet') {
    return ['dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot']
  }

  if (
    rule.type === 'forEachCount' ||
    rule.type === 'anchorCount'
  ) {
    const scopeKind = rule.scope.kind
    if (scopeKind === 'orthogonal') {
      return ['empty', 'scope', 'empty', 'scope', 'subject', 'scope', 'empty', 'scope', 'empty']
    }
    if (scopeKind === 'adjacent') {
      return ['scope', 'scope', 'scope', 'scope', 'subject', 'scope', 'scope', 'scope', 'scope']
    }
  }

  if (rule.type === 'regionCount' || rule.type === 'scopeOverlapCount') {
    return ['scope', 'scope', 'empty', 'scope', 'scope', 'empty', 'empty', 'empty', 'empty']
  }

  if (rule.type === 'lineCount') {
    return ['empty', 'scope', 'empty', 'empty', 'scope', 'empty', 'empty', 'scope', 'empty']
  }

  return ['empty', 'scope', 'empty', 'scope', 'subject', 'scope', 'empty', 'scope', 'empty']
}
