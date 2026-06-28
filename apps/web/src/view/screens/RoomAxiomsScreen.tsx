import { useState } from 'react'
import { caseSummaries, DEFAULT_CASE_ID, getCaseById } from '../../content/cases'
import { useRoomAxiomsGame } from '../../hooks/useRoomAxiomsGame'
import { BoardPanel } from '../components/BoardPanel'
import { Dialogs } from '../components/Dialogs'
import { EvidencePanel } from '../components/EvidencePanel'
import { MobileTabs } from '../components/MobileTabs'
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

  return (
    <div className="room-axioms-app scene-shell" data-mobile-panel={game.mobilePanel}>
      <TopBar
        game={game}
        cases={caseSummaries}
        selectedCaseId={selectedCaseId}
        onSelectCase={onSelectCase}
      />
      <main className="app-shell scene-workstation">
        <RulePanel game={game} />
        <BoardPanel game={game} />
        <EvidencePanel game={game} />
      </main>
      <MobileTabs game={game} />
      <Dialogs game={game} />
    </div>
  )
}
