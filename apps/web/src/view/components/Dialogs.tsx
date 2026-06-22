import { AlertTriangle, Check, X } from 'lucide-react'
import type { RoomAxiomsGame } from '../../hooks/useRoomAxiomsGame'

interface DialogProps {
  readonly game: RoomAxiomsGame
  readonly neighborhoodOpen: boolean
  readonly onCloseNeighborhood: () => void
}

export function Dialogs({ game, neighborhoodOpen, onCloseNeighborhood }: DialogProps) {
  return (
    <>
      {neighborhoodOpen ? <NeighborhoodDialog onClose={onCloseNeighborhood} /> : null}
      {game.hint ? <HintDialog game={game} /> : null}
      {game.result ? <ResultDialog game={game} /> : null}
    </>
  )
}

function NeighborhoodDialog({ onClose }: { readonly onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="dialog-card" role="dialog" aria-modal="true" aria-labelledby="neighborhoodTitle">
        <div className="dialog-header">
          <div>
            <span className="eyebrow">机械定义</span>
            <h2 id="neighborhoodTitle">邻域只包含棋盘内格子</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="关闭">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <p>棋盘外不是格子，不参与计数，也不会被补成“虚拟空位”。</p>
        <div className="neighborhood-columns">
          <NeighborhoodDemo title="正交邻域" copy="共享一条边。角落 2、边缘 3、内部 4。" active={[1, 3, 5, 7]} />
          <NeighborhoodDemo title="邻接域" copy="共享边或角。角落 3、边缘 5、内部 8。" active={[0, 1, 2, 3, 5, 6, 7, 8]} />
        </div>
        <div className="dialog-actions">
          <button className="primary-button" type="button" onClick={onClose}>
            我明白了
          </button>
        </div>
      </section>
    </div>
  )
}

function NeighborhoodDemo({
  title,
  copy,
  active,
}: {
  readonly title: string
  readonly copy: string
  readonly active: readonly number[]
}) {
  return (
    <section>
      <h3>{title}</h3>
      <p>{copy}</p>
      <div className="mini-grid" aria-label={`${title}示意`}>
        {Array.from({ length: 9 }, (_, index) => {
          const center = index === 4
          const counted = active.includes(index)
          return (
            <span className={`mini-cell${center ? ' center' : ''}${counted ? ' active' : ''}`} key={index}>
              {center ? '主体' : counted ? '计入' : ''}
            </span>
          )
        })}
      </div>
    </section>
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
            <h3>前提</h3>
            <ul>
              {hint.premises.map((premise) => (
                <li key={premise}>{premise}</li>
              ))}
            </ul>
          </section>
          <section className="hint-section">
            <h3>推理</h3>
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

