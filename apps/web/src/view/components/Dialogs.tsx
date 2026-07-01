import { useState } from 'react'
import { AlertTriangle, Check } from 'lucide-react'

import type { RoomAxiomsGame } from '../../hooks/useRoomAxiomsGame'
import { VNDialogueOverlay } from '../../vn/VNDialogueOverlay'

interface DialogProps {
  readonly game: RoomAxiomsGame
}

export function Dialogs({ game }: DialogProps) {
  const [idleDialogue, setIdleDialogue] = useState<RoomAxiomsGame['dialogue']>(null)
  const activeDialogue = game.dialogue ?? idleDialogue
  const idle = game.dialogue === null && idleDialogue !== null

  return (
    <>
      {activeDialogue ? (
        <VNDialogueOverlay
          scene={activeDialogue.scene}
          lineIndex={activeDialogue.lineIndex}
          idle={idle}
          preferences={game.vnPreferences}
          onAdvance={game.advanceDialogue}
          onClose={() => {
            if (idle) setIdleDialogue(null)
            else {
              setIdleDialogue(activeDialogue)
              game.closeDialogue()
            }
          }}
          onSkip={() => {
            if (idle) setIdleDialogue(null)
            else {
              setIdleDialogue(activeDialogue)
              game.skipDialogue()
            }
          }}
        />
      ) : null}
      {game.dialogue === null && game.result ? <ResultDialog game={game} /> : null}
    </>
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
            重置调查
          </button>
        </div>
      </section>
    </div>
  )
}
