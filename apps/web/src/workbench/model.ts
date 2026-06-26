import {
  exportDraftJson,
  importPuzzleToDraftState,
  patchDraftBoardSize,
  patchDraftRulePresentation,
  patchDraftTargetCell,
  parseDraftJson,
  toggleDraftInitialReveal,
  type PatchDraftRulePresentationInput,
  type WorkbenchDraftExportResult,
  type WorkbenchDraftPatchResult,
  type WorkbenchDraftParseResult,
  type WorkbenchDraftState,
} from '@room-axioms/authoring/drafts'
import {
  evaluateDraftDiagnostics,
  type AuthoringDraftDiagnosticsReport,
} from '@room-axioms/authoring/diagnostics'
import { allCells, type BoardSize, type CellId, type CellKind, type PuzzleDefinition } from '@room-axioms/domain'

import type { WorkbenchCaseImport, WorkbenchCaseSource } from './caseLibrary'

export const WORKBENCH_CELL_KIND_OPTIONS: readonly CellKind[] = ['empty', 'bottle', 'bin', 'mirror', 'guest']

export interface WorkbenchCaseOption {
  readonly id: string
  readonly label: string
  readonly difficulty: PuzzleDefinition['metadata']['difficulty']
  readonly source: WorkbenchCaseSource
  readonly sourcePath: string
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

export interface WorkbenchExportStatus {
  readonly ok: boolean
  readonly fileName: string
  readonly message: string
  readonly issueCount: number
}

export interface WorkbenchShellModel {
  readonly selectedCaseId: string
  readonly draft: WorkbenchDraftState
  readonly parse: WorkbenchDraftParseResult
  readonly exported: WorkbenchDraftExportResult
  readonly exportStatus: WorkbenchExportStatus
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
  cases: readonly WorkbenchCaseImport[],
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
    exportStatus: exportStatus(exported, selectedCaseId),
    caseOptions: cases.map(caseOption),
    boardCells: parse.ok ? boardCells(parse.puzzle) : [],
    ruleSummaries: parse.ok ? parse.puzzle.rules.map(ruleSummary) : [],
  }
}

export function evaluateWorkbenchDiagnostics(
  draft: WorkbenchDraftState,
  selectedCaseId: string,
): AuthoringDraftDiagnosticsReport | undefined {
  const parse = parseDraftJson(draft.jsonText)
  if (!parse.ok) return undefined

  return evaluateDraftDiagnostics({
    draft: parse.puzzle,
    sourcePath: `<workbench:${selectedCaseId}>`,
  })
}

export function patchWorkbenchTargetCell(
  draft: WorkbenchDraftState,
  cellId: CellId,
  kind: CellKind,
): WorkbenchDraftPatchResult {
  return patchDraftTargetCell(draft, cellId, kind)
}

export function patchWorkbenchBoardSize(
  draft: WorkbenchDraftState,
  board: BoardSize,
): WorkbenchDraftPatchResult {
  return patchDraftBoardSize(draft, board)
}

export function toggleWorkbenchInitialReveal(
  draft: WorkbenchDraftState,
  cellId: CellId,
): WorkbenchDraftPatchResult {
  return toggleDraftInitialReveal(draft, cellId)
}

export function patchWorkbenchRulePresentation(
  draft: WorkbenchDraftState,
  input: PatchDraftRulePresentationInput,
): WorkbenchDraftPatchResult {
  return patchDraftRulePresentation(draft, input)
}

export function workbenchCellKindOptions(
  puzzle: PuzzleDefinition | undefined,
  currentKind: CellKind | undefined,
): readonly CellKind[] {
  const available = new Set<CellKind>(puzzle?.allowedKinds ?? WORKBENCH_CELL_KIND_OPTIONS)
  if (currentKind !== undefined) available.add(currentKind)

  return WORKBENCH_CELL_KIND_OPTIONS.filter((kind) => available.has(kind))
}

function caseOption(item: WorkbenchCaseImport): WorkbenchCaseOption {
  const puzzle = item.puzzle

  return {
    id: puzzle.id,
    label: puzzle.caseName ?? puzzle.title,
    difficulty: puzzle.metadata.difficulty,
    source: item.source,
    sourcePath: item.sourcePath,
  }
}

function exportStatus(exported: WorkbenchDraftExportResult, selectedCaseId: string): WorkbenchExportStatus {
  if (!exported.ok) {
    return {
      ok: false,
      fileName: `${selectedCaseId}-invalid-draft.json`,
      message: 'JSON 当前无效，修复解析或 schema 问题后才能导出。',
      issueCount: exported.issues.length,
    }
  }

  return {
    ok: true,
    fileName: `${exported.puzzle?.id ?? selectedCaseId}-workbench-draft.json`,
    message: '导出只生成本地 JSON，不会写入 content/cases 或玩家选择器。',
    issueCount: 0,
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
