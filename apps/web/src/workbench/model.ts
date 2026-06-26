import {
  exportDraftJson,
  formatDraftJson,
  importPuzzleToDraftState,
  patchDraftAnchors,
  patchDraftBoardSize,
  patchDraftRegions,
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
import {
  allCells,
  type AnchorDefinition,
  type BoardSize,
  type CellId,
  type CellKind,
  type PuzzleDefinition,
  type RegionDefinition,
} from '@room-axioms/domain'
import type { SchemaIssue } from '@room-axioms/schema'

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

export interface WorkbenchScopeCollectionsDraft {
  readonly regions: readonly RegionDefinition[]
  readonly anchors: readonly AnchorDefinition[]
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

export function createWorkbenchScopeCollectionsJson(
  puzzle: PuzzleDefinition | undefined,
): string {
  return formatDraftJson({
    regions: puzzle?.regions ?? [],
    anchors: puzzle?.anchors ?? [],
  })
}

export function patchWorkbenchScopeCollectionsJson(
  draft: WorkbenchDraftState,
  jsonText: string,
): WorkbenchDraftPatchResult {
  const parsed = parseScopeCollectionsJson(jsonText)
  if (!parsed.ok) {
    return {
      ok: false,
      state: draft,
      issues: parsed.issues,
    }
  }

  const regionsPatch = patchDraftRegions(draft, parsed.value.regions)
  if (!regionsPatch.ok) return regionsPatch

  const anchorsPatch = patchDraftAnchors(regionsPatch.state, parsed.value.anchors)
  if (!anchorsPatch.ok) {
    return {
      ok: false,
      state: draft,
      issues: anchorsPatch.issues,
    }
  }

  return anchorsPatch
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

function parseScopeCollectionsJson(jsonText: string): {
  readonly ok: true
  readonly value: WorkbenchScopeCollectionsDraft
} | {
  readonly ok: false
  readonly issues: readonly SchemaIssue[]
} {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText) as unknown
  } catch (error) {
    return {
      ok: false,
      issues: [scopeIssue(
        'SCOPE_COLLECTIONS_JSON_PARSE_FAILED',
        [],
        error instanceof Error ? error.message : 'Unable to parse scope collections JSON.',
      )],
    }
  }

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      ok: false,
      issues: [scopeIssue('SCOPE_COLLECTIONS_JSON_INVALID', [], 'Scope collections JSON must be an object.')],
    }
  }

  const collections = parsed as Partial<WorkbenchScopeCollectionsDraft>
  const issues: SchemaIssue[] = []
  if (!Array.isArray(collections.regions)) {
    issues.push(scopeIssue('SCOPE_COLLECTIONS_REGIONS_INVALID', ['regions'], 'regions must be an array.'))
  }
  if (!Array.isArray(collections.anchors)) {
    issues.push(scopeIssue('SCOPE_COLLECTIONS_ANCHORS_INVALID', ['anchors'], 'anchors must be an array.'))
  }
  if (issues.length > 0) return { ok: false, issues }

  return {
    ok: true,
    value: {
      regions: collections.regions as readonly RegionDefinition[],
      anchors: collections.anchors as readonly AnchorDefinition[],
    },
  }
}

function scopeIssue(
  code: string,
  path: readonly (string | number)[],
  message: string,
): SchemaIssue {
  return { code, path, message }
}
