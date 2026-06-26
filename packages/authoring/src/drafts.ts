import {
  allCells,
  type AnchorDefinition,
  type BoardSize,
  type CellId,
  type CellKind,
  type PuzzleDefinition,
  type RecordDefinition,
  type RegionDefinition,
  type RuleDefinition,
} from '@room-axioms/domain'
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

export type WorkbenchDraftPatchResult =
  | {
      readonly ok: true
      readonly state: WorkbenchDraftState
      readonly puzzle: PuzzleDefinition
      readonly issues: readonly []
    }
  | {
      readonly ok: false
      readonly state: WorkbenchDraftState
      readonly issues: readonly SchemaIssue[]
    }

export interface WorkbenchDraftImportOptions {
  readonly label?: string
  readonly dirty?: boolean
  readonly selectedCellId?: CellId
  readonly selectedRuleId?: string
}

export interface PatchDraftMetadataInput {
  readonly title?: string
  readonly caseName?: string
  readonly difficulty?: PuzzleDefinition['metadata']['difficulty']
  readonly tags?: readonly string[]
  readonly author?: string
  readonly status?: PuzzleDefinition['metadata']['status']
  readonly notes?: string
}

export interface PatchDraftRulePresentationInput {
  readonly ruleId: string
  readonly title?: string
  readonly flavor?: string
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

export function patchDraftBoardSize(
  state: WorkbenchDraftState,
  board: BoardSize,
): WorkbenchDraftPatchResult {
  return patchValidPuzzle(state, (puzzle) => resizePuzzleBoard(puzzle, board))
}

export function patchDraftTargetCell(
  state: WorkbenchDraftState,
  cellId: CellId,
  kind: CellKind,
): WorkbenchDraftPatchResult {
  return patchValidPuzzle(state, (puzzle) => ({
    ...puzzle,
    target: {
      ...puzzle.target,
      [cellId]: kind,
    },
  }))
}

export function toggleDraftInitialReveal(
  state: WorkbenchDraftState,
  cellId: CellId,
): WorkbenchDraftPatchResult {
  return patchValidPuzzle(state, (puzzle) => {
    const initialRevealSet = new Set<CellId>(puzzle.initialReveals)
    if (initialRevealSet.has(cellId)) {
      initialRevealSet.delete(cellId)
    } else {
      initialRevealSet.add(cellId)
    }

    return {
      ...puzzle,
      initialReveals: allCells(puzzle.board).filter((candidate) => initialRevealSet.has(candidate)),
    }
  })
}

export function patchDraftMetadata(
  state: WorkbenchDraftState,
  input: PatchDraftMetadataInput,
): WorkbenchDraftPatchResult {
  return patchValidPuzzle(state, (puzzle) => ({
    ...puzzle,
    ...(input.title === undefined ? {} : { title: input.title }),
    ...(input.caseName === undefined ? {} : { caseName: input.caseName }),
    metadata: {
      ...puzzle.metadata,
      ...(input.difficulty === undefined ? {} : { difficulty: input.difficulty }),
      ...(input.tags === undefined ? {} : { tags: [...input.tags] }),
      ...(input.author === undefined ? {} : { author: input.author }),
      ...(input.status === undefined ? {} : { status: input.status }),
      ...(input.notes === undefined ? {} : { notes: input.notes }),
    },
  }))
}

export function patchDraftRulePresentation(
  state: WorkbenchDraftState,
  input: PatchDraftRulePresentationInput,
): WorkbenchDraftPatchResult {
  return patchValidPuzzle(state, (puzzle) => ({
    ...puzzle,
    rules: puzzle.rules.map((rule) => (
      rule.id === input.ruleId
        ? {
            ...rule,
            presentation: {
              ...rule.presentation,
              ...(input.title === undefined ? {} : { title: input.title }),
              ...(input.flavor === undefined ? {} : { flavor: input.flavor }),
            },
          }
        : rule
    )),
  }))
}

export function patchDraftAllowedKinds(
  state: WorkbenchDraftState,
  allowedKinds: readonly CellKind[],
): WorkbenchDraftPatchResult {
  return patchValidPuzzle(state, (puzzle) => ({
    ...puzzle,
    allowedKinds: [...allowedKinds],
  }))
}

export function patchDraftRegions(
  state: WorkbenchDraftState,
  regions: readonly RegionDefinition[],
): WorkbenchDraftPatchResult {
  return patchValidPuzzle(state, (puzzle) => ({
    ...puzzle,
    regions: regions.map((region) => ({
      ...region,
      cells: [...region.cells],
    })),
  }))
}

export function patchDraftAnchors(
  state: WorkbenchDraftState,
  anchors: readonly AnchorDefinition[],
): WorkbenchDraftPatchResult {
  return patchValidPuzzle(state, (puzzle) => ({
    ...puzzle,
    anchors: anchors.map((anchor) => ({ ...anchor })),
  }))
}

export function patchDraftRecords(
  state: WorkbenchDraftState,
  records: readonly RecordDefinition[],
): WorkbenchDraftPatchResult {
  return patchValidPuzzle(state, (puzzle) => ({
    ...puzzle,
    records: records.map((record) => ({
      ...record,
      ruleIds: [...record.ruleIds],
    })),
  }))
}

export function patchDraftRules(
  state: WorkbenchDraftState,
  rules: readonly RuleDefinition[],
): WorkbenchDraftPatchResult {
  return patchValidPuzzle(state, (puzzle) => ({
    ...puzzle,
    rules: rules.map(cloneRuleDefinition),
  }))
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

function patchValidPuzzle(
  state: WorkbenchDraftState,
  patch: (puzzle: PuzzleDefinition) => PuzzleDefinition,
): WorkbenchDraftPatchResult {
  const parse = parseDraftJson(state.jsonText)
  if (!parse.ok) {
    return {
      ok: false,
      state,
      issues: parse.issues,
    }
  }

  const candidate = patch(parse.puzzle)
  const parsedCandidate = parsePuzzleDefinition(candidate)
  if (!parsedCandidate.ok || parsedCandidate.puzzle === undefined) {
    return {
      ok: false,
      state,
      issues: parsedCandidate.issues,
    }
  }

  const nextState = {
    ...state,
    jsonText: formatDraftJson(parsedCandidate.puzzle),
    dirty: true,
    lastValidPuzzle: parsedCandidate.puzzle,
  }

  return {
    ok: true,
    state: nextState,
    puzzle: parsedCandidate.puzzle,
    issues: [],
  }
}

function resizePuzzleBoard(puzzle: PuzzleDefinition, board: BoardSize): PuzzleDefinition {
  const newCells = allCells(board)
  const newCellSet = new Set<CellId>(newCells)
  const target = Object.fromEntries(newCells.map((cellId) => [
    cellId,
    puzzle.target[cellId] ?? 'empty',
  ])) as PuzzleDefinition['target']

  return {
    ...puzzle,
    board,
    regions: puzzle.regions?.map((region) => ({
      ...region,
      cells: region.cells.filter((cellId) => newCellSet.has(cellId)),
    })).filter((region) => region.cells.length > 0),
    initialReveals: puzzle.initialReveals.filter((cellId) => newCellSet.has(cellId)),
    target,
  }
}

function cloneRuleDefinition(rule: RuleDefinition): RuleDefinition {
  return {
    ...rule,
    presentation: { ...rule.presentation },
  }
}

function withoutKey<T extends object, K extends keyof T>(value: T, key: K): Omit<T, K> {
  const copy = { ...value }
  delete copy[key]

  return copy
}
