import { useState } from 'react'
import { getDefaultCase } from '../../content/cases'
import { useRoomAxiomsGame } from '../../hooks/useRoomAxiomsGame'
import { BoardPanel } from '../components/BoardPanel'
import { Dialogs } from '../components/Dialogs'
import { EvidencePanel } from '../components/EvidencePanel'
import { MobileTabs } from '../components/MobileTabs'
import { RulePanel } from '../components/RulePanel'
import { TopBar } from '../components/TopBar'

export function RoomAxiomsScreen() {
  const game = useRoomAxiomsGame(getDefaultCase())
  const [neighborhoodOpen, setNeighborhoodOpen] = useState(false)

  return (
    <div className="room-axioms-app" data-mobile-panel={game.mobilePanel}>
      <TopBar game={game} />
      <main className="app-shell">
        <RulePanel game={game} onOpenNeighborhood={() => setNeighborhoodOpen(true)} />
        <BoardPanel game={game} />
        <EvidencePanel game={game} />
      </main>
      <MobileTabs game={game} />
      <Dialogs
        game={game}
        neighborhoodOpen={neighborhoodOpen}
        onCloseNeighborhood={() => setNeighborhoodOpen(false)}
      />
    </div>
  )
}
