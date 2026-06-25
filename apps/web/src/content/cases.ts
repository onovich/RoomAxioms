import type { PuzzleDefinition } from '@room-axioms/domain'

import case004Fixture from '../../../../content/cases/case-004.json' with { type: 'json' }
import case011Fixture from '../../../../content/cases/case-011.json' with { type: 'json' }
import case012Fixture from '../../../../content/cases/case-012.json' with { type: 'json' }
import case013Fixture from '../../../../content/cases/case-013.json' with { type: 'json' }
import case014Fixture from '../../../../content/cases/case-014.json' with { type: 'json' }

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
  case011Fixture,
  case013Fixture,
  case012Fixture,
  case014Fixture,
  case004Fixture,
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
