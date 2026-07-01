import { useState } from 'react'
import { caseSummaries, DEFAULT_CASE_ID, getCaseById } from '../../content/cases'
import { useRoomAxiomsGame } from '../../hooks/useRoomAxiomsGame'
import { BoardPanel } from '../components/BoardPanel'
import { Dialogs } from '../components/Dialogs'
import { EvidencePanel } from '../components/EvidencePanel'
import { MobileTabs } from '../components/MobileTabs'
import { PlayerShell } from '../components/PlayerShell'
import { RulePanel } from '../components/RulePanel'
import { TopBar } from '../components/TopBar'
import type { PuzzleDefinition } from '@room-axioms/domain'

export function RoomAxiomsScreen() {
  const [selectedCaseId, setSelectedCaseId] = useState(DEFAULT_CASE_ID)
  const puzzle = getCaseById(selectedCaseId)

  return (
    <RoomAxiomsCaseView
      key={puzzle.id}
      puzzle={puzzle}
      selectedCaseId={selectedCaseId}
      onSelectCase={setSelectedCaseId}
    />
  )
}

function RoomAxiomsCaseView({
  puzzle,
  selectedCaseId,
  onSelectCase,
}: {
  readonly puzzle: PuzzleDefinition
  readonly selectedCaseId: string
  readonly onSelectCase: (caseId: string) => void
}) {
  const game = useRoomAxiomsGame(puzzle)

  const topbar = (
    <TopBar
      game={game}
      cases={caseSummaries}
      selectedCaseId={selectedCaseId}
      onSelectCase={onSelectCase}
    />
  )

  return (
    <PlayerShell
      board={<BoardPanel game={game} />}
      dialogs={<Dialogs game={game} />}
      evidence={<EvidencePanel game={game} />}
      mobilePanel={game.mobilePanel}
      mobileTabs={<MobileTabs game={game} />}
      rules={<RulePanel game={game} />}
      topbar={topbar}
    />
  )
}
