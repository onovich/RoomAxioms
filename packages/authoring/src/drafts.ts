import type { CellId, PuzzleDefinition } from '@room-axioms/domain'
import { parsePuzzleDefinition, type SchemaIssue } from '@room-axioms/schema'

export type WorkbenchDraftSourceKind = 'empty' | 'json-text' | 'puzzle'

export interface WorkbenchDraftSource {
  readonly kind: WorkbenchDraftSourceKind
  readonly label?: string
}

export interface WorkbenchDraftState {
  readonly jsonText: string
  readonly dirty: boolean
  readonly source: WorkbenchDraftSource
  readonly selectedCellId?: CellId
  readonly selectedRuleId?: string
  readonly lastValidPuzzle?: PuzzleDefinition
}

export type WorkbenchDraftParseResult =
  | {
      readonly ok: true
      readonly puzzle: PuzzleDefinition
      readonly issues: readonly []
    }
  | {
      readonly ok: false
      readonly issues: readonly SchemaIssue[]
    }

export interface WorkbenchDraftExportResult {
  readonly ok: boolean
  readonly jsonText: string
  readonly puzzle?: PuzzleDefinition
  readonly issues: readonly SchemaIssue[]
}

export interface WorkbenchDraftImportOptions {
  readonly label?: string
  readonly dirty?: boolean
  readonly selectedCellId?: CellId
  readonly selectedRuleId?: string
}

export function createEmptyWorkbenchDraftState(): WorkbenchDraftState {
  return {
    jsonText: '',
    dirty: false,
    source: { kind: 'empty' },
  }
}

export function importPuzzleToDraftState(
  puzzle: PuzzleDefinition,
  options: WorkbenchDraftImportOptions = {},
): WorkbenchDraftState {
  return {
    jsonText: formatDraftJson(puzzle),
    dirty: options.dirty ?? false,
    source: {
      kind: 'puzzle',
      ...(options.label === undefined ? {} : { label: options.label }),
    },
    ...(options.selectedCellId === undefined ? {} : { selectedCellId: options.selectedCellId }),
    ...(options.selectedRuleId === undefined ? {} : { selectedRuleId: options.selectedRuleId }),
    lastValidPuzzle: puzzle,
  }
}

export function importJsonTextToDraftState(
  jsonText: string,
  options: WorkbenchDraftImportOptions = {},
): WorkbenchDraftState {
  const parse = parseDraftJson(jsonText)

  return {
    jsonText: parse.ok ? formatDraftJson(parse.puzzle) : jsonText,
    dirty: options.dirty ?? false,
    source: {
      kind: 'json-text',
      ...(options.label === undefined ? {} : { label: options.label }),
    },
    ...(options.selectedCellId === undefined ? {} : { selectedCellId: options.selectedCellId }),
    ...(options.selectedRuleId === undefined ? {} : { selectedRuleId: options.selectedRuleId }),
    ...(parse.ok ? { lastValidPuzzle: parse.puzzle } : {}),
  }
}

export function updateDraftJsonText(
  state: WorkbenchDraftState,
  jsonText: string,
): WorkbenchDraftState {
  const parse = parseDraftJson(jsonText)

  return {
    ...state,
    jsonText,
    dirty: true,
    ...(parse.ok ? { lastValidPuzzle: parse.puzzle } : {}),
  }
}

export function selectDraftCell(
  state: WorkbenchDraftState,
  selectedCellId: CellId | undefined,
): WorkbenchDraftState {
  return selectedCellId === undefined ? withoutKey(state, 'selectedCellId') : { ...state, selectedCellId }
}

export function selectDraftRule(
  state: WorkbenchDraftState,
  selectedRuleId: string | undefined,
): WorkbenchDraftState {
  return selectedRuleId === undefined ? withoutKey(state, 'selectedRuleId') : { ...state, selectedRuleId }
}

export function parseDraftJson(jsonText: string): WorkbenchDraftParseResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText) as unknown
  } catch (error) {
    return {
      ok: false,
      issues: [{
        code: 'JSON_PARSE_FAILED',
        path: [],
        message: error instanceof Error ? error.message : 'Unable to parse draft JSON.',
      }],
    }
  }

  const result = parsePuzzleDefinition(parsed)
  if (result.ok && result.puzzle !== undefined) {
    return {
      ok: true,
      puzzle: result.puzzle,
      issues: [],
    }
  }

  return {
    ok: false,
    issues: result.issues,
  }
}

export function exportDraftJson(state: WorkbenchDraftState): WorkbenchDraftExportResult {
  const parse = parseDraftJson(state.jsonText)
  if (!parse.ok) {
    return {
      ok: false,
      jsonText: state.jsonText,
      issues: parse.issues,
    }
  }

  return {
    ok: true,
    jsonText: formatDraftJson(parse.puzzle),
    puzzle: parse.puzzle,
    issues: [],
  }
}

export function formatDraftJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`
}

function withoutKey<T extends object, K extends keyof T>(value: T, key: K): Omit<T, K> {
  const copy = { ...value }
  delete copy[key]

  return copy
}
