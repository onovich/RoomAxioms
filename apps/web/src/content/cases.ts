import type { PuzzleDefinition } from '@room-axioms/domain'

import case001Fixture from '../../../../content/cases/case-001.json' with { type: 'json' }
import case002Fixture from '../../../../content/cases/case-002.json' with { type: 'json' }
import case003Fixture from '../../../../content/cases/case-003.json' with { type: 'json' }
import case004Fixture from '../../../../content/cases/case-004.json' with { type: 'json' }
import case005Fixture from '../../../../content/cases/case-005.json' with { type: 'json' }
import case006Fixture from '../../../../content/cases/case-006.json' with { type: 'json' }
import case007Fixture from '../../../../content/cases/case-007.json' with { type: 'json' }
import case008Fixture from '../../../../content/cases/case-008.json' with { type: 'json' }
import case009Fixture from '../../../../content/cases/case-009.json' with { type: 'json' }
import case010Fixture from '../../../../content/cases/case-010.json' with { type: 'json' }

export const DEFAULT_CASE_ID = 'case-004'

export interface CaseSummary {
  readonly id: string
  readonly title: string
  readonly caseName: string
  readonly difficulty: PuzzleDefinition['metadata']['difficulty']
  readonly tags: readonly string[]
  readonly board: PuzzleDefinition['board']
}

const caseFixtures = [
  case001Fixture,
  case002Fixture,
  case003Fixture,
  case004Fixture,
  case005Fixture,
  case006Fixture,
  case007Fixture,
  case008Fixture,
  case009Fixture,
  case010Fixture,
] as const

export const contentCases: readonly PuzzleDefinition[] = caseFixtures.map((fixture) =>
  fixture as PuzzleDefinition,
)

export const caseSummaries: readonly CaseSummary[] = contentCases.map((puzzle) => ({
  id: puzzle.id,
  title: puzzle.title,
  caseName: puzzle.caseName ?? puzzle.title,
  difficulty: puzzle.metadata.difficulty,
  tags: puzzle.metadata.tags,
  board: puzzle.board,
}))

export function getCaseById(caseId: string): PuzzleDefinition {
  const puzzle = contentCases.find((item) => item.id === caseId)
  if (puzzle === undefined) throw new Error(`Unknown case id: ${caseId}`)

  return puzzle
}

export function getDefaultCase(): PuzzleDefinition {
  return getCaseById(DEFAULT_CASE_ID)
}
