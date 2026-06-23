import { Circle, Flag } from 'lucide-react'
import { cellLabels } from '../../data/case004'
import type { RoomAxiomsGame } from '../../hooks/useRoomAxiomsGame'

interface EvidencePanelProps {
  readonly game: RoomAxiomsGame
}

export function EvidencePanel({ game }: EvidencePanelProps) {
  const guestMarks = [...game.marks.entries()]
    .filter(([, value]) => value === 'guest')
    .map(([id]) => id)
    .sort()
  const safeMarks = [...game.marks.entries()]
    .filter(([, value]) => value === 'safe')
    .map(([id]) => id)
    .sort()

  return (
    <aside className="panel evidence-panel" data-panel="evidence" aria-labelledby="evidenceHeading">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">只记录已知事实</span>
          <h2 id="evidenceHeading">证据与笔记</h2>
        </div>
      </div>

      <section className="evidence-section">
        <h3>已揭示物证</h3>
        <ol className="evidence-log">
          {[...game.actionLog].reverse().map((entry) => (
            <li className="evidence-item" key={`${entry.id}-${entry.order}`}>
              <span className="evidence-coord">{entry.id}</span>
              <span>
                <b>{cellLabels[entry.kind]}</b>
                <small>{entry.initial ? '进入房间时可见' : '调查后揭示的客观事实'}</small>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="evidence-section notes-section">
        <h3>玩家笔记</h3>
        <div className="note-group">
          <span className="note-symbol guest-note">
            <Flag size={16} aria-hidden="true" />
          </span>
          <div>
            <b>访客</b>
            <p>{guestMarks.length > 0 ? guestMarks.join('、') : '尚未标记'}</p>
          </div>
        </div>
        <div className="note-group">
          <span className="note-symbol safe-note">
            <Circle size={16} aria-hidden="true" />
          </span>
          <div>
            <b>安全</b>
            <p>{safeMarks.length > 0 ? safeMarks.join('、') : '尚未标记'}</p>
          </div>
        </div>
      </section>

      {game.devMode ? <DeveloperPanel game={game} /> : null}

      <button className="primary-button submit-button" type="button" onClick={game.submitConclusion}>
        提交访客结论
      </button>
    </aside>
  )
}

function DeveloperPanel({ game }: EvidencePanelProps) {
  return (
    <section className="developer-panel">
      <div className="developer-title">
        <span>DEV</span>
        <b>关卡验证层</b>
      </div>
      <p className="dev-warning">以下信息不属于玩家可见线索。</p>
      <dl className="dev-grid">
        <DevStat label="Runtime" value={runtimeStatusText(game)} />
        <DevStat label="Warnings" value={runtimeWarningsText(game)} />
        {game.analysisError ? <DevStat label="Error" value={game.analysisError.message} /> : null}
        <DevStat label="候选危险布局" value={game.analysis.layouts.length} />
        <DevStat label="垃圾桶候选" value={game.analysis.binCandidates.join('、') || '无'} />
        <DevStat label="强制安全" value={game.analysis.forcedSafe.join('、') || '-'} />
        <DevStat label="强制访客" value={game.analysis.forcedGuests.join('、') || '-'} />
        <DevStat label="危险布局唯一" value={game.analysis.unique ? '是' : '否'} />
        <DevStat label="查询耗时" value={`${game.analysis.elapsed.toFixed(2)} ms`} />
      </dl>
      <label className="target-toggle">
        <input
          type="checkbox"
          checked={game.showTarget}
          onChange={(event) => game.setShowTarget(event.target.checked)}
        />
        <span>显示目标棋盘（剧透）</span>
      </label>
      <div className="dev-legend">
        <span>
          <i className="legend-safe">S</i> 强制安全
        </span>
        <span>
          <i className="legend-guest">G</i> 强制访客
        </span>
      </div>
    </section>
  )
}

function runtimeStatusText(game: RoomAxiomsGame): string {
  const request = game.analysisRequestId === null ? '-' : `#${game.analysisRequestId}`
  const suffix = game.analysis.truncated ? ' / truncated' : ''
  return `${game.analysisStatus} ${request}${suffix}`
}

function runtimeWarningsText(game: RoomAxiomsGame): string {
  if (game.analysisWarnings.length === 0) return '-'
  return game.analysisWarnings.map((warning) => warning.code).join(', ')
}

function DevStat({ label, value }: { readonly label: string; readonly value: string | number }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}
