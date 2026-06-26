import {
  exportDraftJson,
  importPuzzleToDraftState,
  parseDraftJson,
  type WorkbenchDraftExportResult,
  type WorkbenchDraftParseResult,
  type WorkbenchDraftState,
} from '@room-axioms/authoring/drafts'
import { allCells, type CellId, type CellKind, type PuzzleDefinition } from '@room-axioms/domain'

export interface WorkbenchCaseOption {
  readonly id: string
  readonly label: string
  readonly difficulty: PuzzleDefinition['metadata']['difficulty']
}

export interface WorkbenchBoardCell {
  readonly id: CellId
  readonly kind: CellKind
  readonly initiallyRevealed: boolean
  readonly guestTarget: boolean
}

export interface WorkbenchRuleSummary {
  readonly id: string
  readonly type: PuzzleDefinition['rules'][number]['type']
  readonly title: string
  readonly flavor?: string
}

export interface WorkbenchShellModel {
  readonly selectedCaseId: string
  readonly draft: WorkbenchDraftState
  readonly parse: WorkbenchDraftParseResult
  readonly exported: WorkbenchDraftExportResult
  readonly caseOptions: readonly WorkbenchCaseOption[]
  readonly boardCells: readonly WorkbenchBoardCell[]
  readonly ruleSummaries: readonly WorkbenchRuleSummary[]
}

export function createWorkbenchDraftFromPuzzle(puzzle: PuzzleDefinition): WorkbenchDraftState {
  return importPuzzleToDraftState(puzzle, {
    label: puzzle.id,
  })
}

export function createWorkbenchShellModel(
  cases: readonly PuzzleDefinition[],
  selectedCaseId: string,
  draft: WorkbenchDraftState,
): WorkbenchShellModel {
  const parse = parseDraftJson(draft.jsonText)
  const exported = exportDraftJson(draft)

  return {
    selectedCaseId,
    draft,
    parse,
    exported,
    caseOptions: cases.map(caseOption),
    boardCells: parse.ok ? boardCells(parse.puzzle) : [],
    ruleSummaries: parse.ok ? parse.puzzle.rules.map(ruleSummary) : [],
  }
}

function caseOption(puzzle: PuzzleDefinition): WorkbenchCaseOption {
  return {
    id: puzzle.id,
    label: puzzle.caseName ?? puzzle.title,
    difficulty: puzzle.metadata.difficulty,
  }
}

function boardCells(puzzle: PuzzleDefinition): readonly WorkbenchBoardCell[] {
  const revealed = new Set<CellId>(puzzle.initialReveals)

  return allCells(puzzle.board).map((id) => ({
    id,
    kind: puzzle.target[id],
    initiallyRevealed: revealed.has(id),
    guestTarget: puzzle.target[id] === 'guest',
  }))
}

function ruleSummary(rule: PuzzleDefinition['rules'][number]): WorkbenchRuleSummary {
  return {
    id: rule.id,
    type: rule.type,
    title: rule.presentation.title,
    ...(rule.presentation.flavor === undefined ? {} : { flavor: rule.presentation.flavor }),
  }
}
