import { Circle, Flag } from 'lucide-react'
import {
  createDeveloperInspectorModel,
  type DeveloperInspectorModel,
} from '../../logic/developerInspector'
import type { RoomAxiomsGame } from '../../hooks/useRoomAxiomsGame'
import { sceneCellLabels, sceneMarkLabels, scenePanels } from '../../theme/vocabulary'

interface EvidencePanelProps {
  readonly game: RoomAxiomsGame
}

export function EvidencePanel({ game }: EvidencePanelProps) {
  const anomalyMarks = [...game.marks.entries()]
    .filter(([, value]) => value === 'guest')
    .map(([id]) => id)
    .sort()
  const safeMarks = [...game.marks.entries()]
    .filter(([, value]) => value === 'safe')
    .map(([id]) => id)
    .sort()

  return (
    <aside className="panel evidence-panel scene-record-panel" data-panel="evidence" aria-labelledby="evidenceHeading">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Record Log</span>
          <h2 id="evidenceHeading">{scenePanels.record}</h2>
        </div>
      </div>

      <section className="evidence-section record-log-section">
        <h3>已登记区域 ({game.actionLog.length})</h3>
        <ol className="evidence-log">
          {[...game.actionLog].reverse().map((entry) => (
            <li className="evidence-item" key={`${entry.id}-${entry.order}`}>
              <span className="evidence-coord">{entry.id}</span>
              <span>
                <b>{sceneCellLabels[entry.kind]}</b>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="evidence-section notes-section">
        <h3>{scenePanels.marks}</h3>
        <div className="note-group">
          <span className="note-symbol guest-note">
            <Flag size={16} aria-hidden="true" />
          </span>
          <div>
            <b>{sceneMarkLabels.guest} ({anomalyMarks.length} / {game.targetGuestCount})</b>
            <p>{anomalyMarks.length > 0 ? anomalyMarks.join('、') : '尚未标注'}</p>
          </div>
        </div>
        <div className="note-group">
          <span className="note-symbol safe-note">
            <Circle size={16} aria-hidden="true" />
          </span>
          <div>
            <b>{sceneMarkLabels.safe} ({safeMarks.length})</b>
            <p>{safeMarks.length > 0 ? safeMarks.join('、') : '尚未标注'}</p>
          </div>
        </div>
      </section>

      {game.devMode ? <DeveloperPanel game={game} /> : null}

      <button className="primary-button submit-button scene-submit-button" type="button" onClick={game.submitConclusion}>
        {scenePanels.submitSurvey}
      </button>
    </aside>
  )
}

function DeveloperPanel({ game }: EvidencePanelProps) {
  const inspector = createDeveloperInspectorModel({
    devMode: game.devMode,
    requestId: game.analysisRequestId,
    status: game.analysisStatus,
    analysis: game.analysis,
    runtimeAnalysis: game.runtimeAnalysis,
    warnings: game.analysisWarnings,
    error: game.analysisError,
  })

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
        <DevStat label="候选危险布局" value={game.analysisLayoutCountText} />
        <DevStat label="垃圾桶候选" value={game.analysis.binCandidates.join('、') || '无'} />
        <DevStat label="强制安全" value={game.analysis.forcedSafe.join('、') || '-'} />
        <DevStat label="强制异常" value={game.analysis.forcedGuests.join('、') || '-'} />
        <DevStat label="危险布局唯一" value={game.analysis.unique ? '是' : '否'} />
        <DevStat label="查询耗时" value={`${game.analysis.elapsed.toFixed(2)} ms`} />
      </dl>
      <label className="target-toggle">
        <input
          type="checkbox"
          checked={game.showTarget}
          onChange={(event) => game.setShowTarget(event.target.checked)}
        />
        <span>显示目标现场图（维护者剧透）</span>
      </label>
      <div className="dev-legend">
        <span>
          <i className="legend-safe">S</i> 强制安全
        </span>
        <span>
          <i className="legend-guest">A</i> 强制异常
        </span>
      </div>
      {inspector ? <DeveloperInspector model={inspector} /> : null}
    </section>
  )
}

function DeveloperInspector({ model }: { readonly model: DeveloperInspectorModel }) {
  return (
    <section className="runtime-inspector" aria-label="Developer runtime inspector">
      <h3>Runtime Inspector</h3>
      <dl className="runtime-grid">
        <DevStat label="Request" value={model.request} />
        <DevStat label="Satisfiable" value={model.satisfiable} />
        <DevStat label="Guest layouts" value={model.candidateGuestLayouts} />
        <DevStat label="Forced safe" value={model.forcedSafe} />
        <DevStat label="Forced anomalies" value={model.forcedGuests} />
        <DevStat label="Solver" value={model.solverStats} />
        <DevStat label="Proof" value={model.proofStats} />
        <DevStat label="No-guess" value={model.noGuess} />
        <DevStat label="Warnings" value={model.warnings} />
        {model.error ? <DevStat label="Error" value={model.error} /> : null}
      </dl>
      {model.proofLines.length > 0 ? (
        <ol className="proof-lines">
          {model.proofLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
      ) : null}
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
