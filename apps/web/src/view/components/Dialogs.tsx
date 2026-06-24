import { AlertTriangle, Check, X } from 'lucide-react'
import type { RoomAxiomsGame } from '../../hooks/useRoomAxiomsGame'

interface DialogProps {
  readonly game: RoomAxiomsGame
}

export function Dialogs({ game }: DialogProps) {
  return (
    <>
      {game.hint ? <HintDialog game={game} /> : null}
      {game.result ? <ResultDialog game={game} /> : null}
    </>
  )
}

function HintDialog({ game }: { readonly game: RoomAxiomsGame }) {
  const hint = game.hint
  if (!hint) return null

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="dialog-card hint-dialog" role="dialog" aria-modal="true" aria-labelledby="hintTitle">
        <div className="dialog-header">
          <div>
            <span className="eyebrow">可解释提示</span>
            <h2 id="hintTitle">{hint.title}</h2>
          </div>
          <button className="icon-button" type="button" onClick={game.closeHint} aria-label="关闭">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="hint-body">
          <div className="hint-conclusion">{hint.conclusion}</div>
          <section className="hint-section">
            <h3>用到的信息</h3>
            <ul>
              {hint.premises.map((premise) => (
                <li key={premise}>{premise}</li>
              ))}
            </ul>
          </section>
          <section className="hint-section">
            <h3>为什么</h3>
            <p>{hint.reasoning}</p>
          </section>
        </div>
        <div className="dialog-actions">
          <button className="primary-button" type="button" onClick={game.closeHint}>
            返回棋盘
          </button>
        </div>
      </section>
    </div>
  )
}

function ResultDialog({ game }: { readonly game: RoomAxiomsGame }) {
  const result = game.result
  if (!result) return null
  const Icon = result.kind === 'success' ? Check : AlertTriangle

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="dialog-card result-dialog" role="dialog" aria-modal="true" aria-labelledby="resultTitle">
        <div className={`result-mark ${result.kind === 'failure' ? 'fail' : ''}`}>
          <Icon size={34} aria-hidden="true" />
        </div>
        <span className="eyebrow">{result.eyebrow}</span>
        <h2 id="resultTitle">{result.title}</h2>
        <p>{result.body}</p>
        <div className="result-stats">
          {result.stats.map((stat) => (
            <div key={stat.label}>
              <b>{stat.value}</b>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
        <div className="dialog-actions two-actions">
          <button className="ghost-button" type="button" onClick={game.closeResult}>
            关闭
          </button>
          <button className="primary-button" type="button" onClick={game.reset}>
            重新调查
          </button>
        </div>
      </section>
    </div>
  )
}
