import type {
  BoardSize,
  CellId,
  CellKind,
  Comparator,
  ConditionalCountClause,
  CountComparison,
  Direction,
  LineCountRule,
  LocalScope,
  PuzzleDefinition,
  RegionDefinition,
  RuleDefinition,
  ScopeOverlapMode,
} from '@room-axioms/domain'
import { allCells } from '@room-axioms/domain'

import { generateRuleText, type GeneratedRuleText } from './ruleText.js'

export type RuleBuilderSupport = 'editable' | 'read-only-unsupported'

export interface RuleBuilderDraft {
  readonly id: string
  readonly family: RuleDefinition['type']
  readonly support: RuleBuilderSupport
  readonly rule: RuleDefinition
  readonly generatedText: GeneratedRuleText
  readonly maintainerLabel?: string
  readonly unsupportedReason?: string
}

const EDITABLE_RULE_TYPES = new Set<RuleDefinition['type']>([
  'globalCount',
  'forEachCount',
  'regionCount',
  'lineCount',
  'scopeOverlapCount',
  'comparativeCount',
  'conditionalCount',
])

export type RuleBuilderCreateForm =
  | 'globalCount'
  | 'forEachCount'
  | 'regionCount'
  | 'rowCount'
  | 'columnCount'
  | 'cornersCount'
  | 'edgeCount'
  | 'interiorCount'
  | 'lineOfSightExists'
  | 'lineOfSightNone'

export interface RuleBuilderCreateInput {
  readonly form: RuleBuilderCreateForm
  readonly id?: string
  readonly target?: CellKind
  readonly subject?: CellKind
  readonly count?: Comparator
  readonly regionId?: string
  readonly lineIndex?: number
  readonly origin?: CellId
  readonly direction?: Direction
}

export interface RuleBuilderCreateResult {
  readonly rule: RuleDefinition
  readonly regions: readonly RegionDefinition[]
}

export function editableRuleTypes(): readonly RuleDefinition['type'][] {
  return [...EDITABLE_RULE_TYPES]
}

export function createRuleBuilderDrafts(puzzle: PuzzleDefinition): readonly RuleBuilderDraft[] {
  return puzzle.rules.map((rule) => createRuleBuilderDraft(rule, puzzle))
}

export function createRuleBuilderDraft(
  rule: RuleDefinition,
  puzzle: PuzzleDefinition,
): RuleBuilderDraft {
  const generatedText = generateRuleText(rule, { puzzle })
  if (EDITABLE_RULE_TYPES.has(rule.type)) {
    return {
      id: rule.id,
      family: rule.type,
      support: 'editable',
      rule: withGeneratedPresentation(rule, generatedText),
      generatedText,
    }
  }

  return {
    id: rule.id,
    family: rule.type,
    support: 'read-only-unsupported',
    rule: cloneRule(rule),
    generatedText,
    unsupportedReason: unsupportedReason(rule),
  }
}

export function createRuleBuilderRule(
  puzzle: Pick<PuzzleDefinition, 'board' | 'allowedKinds' | 'regions' | 'rules'>,
  input: RuleBuilderCreateInput,
): RuleBuilderCreateResult {
  const target = input.target ?? firstAllowedKind(puzzle.allowedKinds, 'guest')
  const subject = input.subject ?? firstAllowedKind(puzzle.allowedKinds.filter((kind) => kind !== 'empty'), 'bin')
  const count = input.count ?? defaultCountForForm(input.form)
  const id = input.id ?? nextRuleId(puzzle.rules)

  switch (input.form) {
    case 'globalCount':
      return { rule: { id, type: 'globalCount', target, count, presentation: emptyPresentation(id) }, regions: [] }
    case 'forEachCount':
      return {
        rule: {
          id,
          type: 'forEachCount',
          subject,
          scope: { kind: 'orthogonal' },
          target,
          count,
          presentation: emptyPresentation(id),
        },
        regions: [],
      }
    case 'regionCount': {
      const regionId = input.regionId ?? puzzle.regions?.[0]?.id ?? materializedRegion('edge', puzzle.board).id
      const generated = puzzle.regions?.some((region) => region.id === regionId)
        ? []
        : [materializedRegion('edge', puzzle.board, regionId)]
      return {
        rule: { id, type: 'regionCount', regionId, target, count, presentation: emptyPresentation(id) },
        regions: generated,
      }
    }
    case 'rowCount':
      return {
        rule: {
          id,
          type: 'lineCount',
          scope: { kind: 'row', index: boundedLineIndex(input.lineIndex, puzzle.board.height) },
          target,
          count,
          presentation: emptyPresentation(id),
        },
        regions: [],
      }
    case 'columnCount':
      return {
        rule: {
          id,
          type: 'lineCount',
          scope: { kind: 'column', index: boundedLineIndex(input.lineIndex, puzzle.board.width) },
          target,
          count,
          presentation: emptyPresentation(id),
        },
        regions: [],
      }
    case 'cornersCount':
    case 'edgeCount':
    case 'interiorCount': {
      const kind = input.form === 'cornersCount'
        ? 'corners'
        : input.form === 'edgeCount'
          ? 'edge'
          : 'interior'
      const region = materializedRegion(kind, puzzle.board)
      return {
        rule: { id, type: 'regionCount', regionId: region.id, target, count, presentation: emptyPresentation(id) },
        regions: [region],
      }
    }
    case 'lineOfSightExists':
    case 'lineOfSightNone':
      return {
        rule: {
          id,
          type: 'lineCount',
          origin: input.origin ?? allCells(puzzle.board)[0] ?? 'A1',
          scope: { kind: 'ray', direction: input.direction ?? 'east' },
          target,
          count,
          presentation: emptyPresentation(id),
        },
        regions: [],
      }
  }
}

export function exportRuleBuilderDrafts(
  drafts: readonly RuleBuilderDraft[],
): readonly RuleDefinition[] {
  return drafts.map((draft) => {
    if (draft.support === 'editable') return withGeneratedPresentation(draft.rule, draft.generatedText)
    return cloneRule(draft.rule)
  })
}

export function duplicateRuleBuilderDraft(
  draft: RuleBuilderDraft,
  nextId: string,
): RuleBuilderDraft {
  const rule = {
    ...draft.rule,
    id: nextId,
    presentation: { ...draft.rule.presentation },
  } as RuleDefinition

  return {
    ...draft,
    id: nextId,
    rule,
  }
}

export function moveRuleBuilderDraft(
  drafts: readonly RuleBuilderDraft[],
  fromIndex: number,
  toIndex: number,
): readonly RuleBuilderDraft[] {
  if (fromIndex < 0 || fromIndex >= drafts.length) return drafts
  if (toIndex < 0 || toIndex >= drafts.length) return drafts
  const next = [...drafts]
  const [draft] = next.splice(fromIndex, 1)
  if (draft === undefined) return drafts
  next.splice(toIndex, 0, draft)
  return next
}

export function updateRuleBuilderDirectTarget(
  draft: RuleBuilderDraft,
  target: CellKind,
  puzzle?: PuzzleDefinition,
): RuleBuilderDraft {
  if (draft.support !== 'editable') return draft

  switch (draft.rule.type) {
    case 'globalCount':
    case 'forEachCount':
    case 'regionCount':
    case 'lineCount':
    case 'scopeOverlapCount':
    case 'comparativeCount':
      return refreshEditableDraft(draft, { ...draft.rule, target }, puzzle)
    case 'conditionalCount':
    case 'anchorCount':
    case 'recordSet':
      return draft
  }
}

export function updateRuleBuilderDirectCount(
  draft: RuleBuilderDraft,
  count: Comparator,
  puzzle?: PuzzleDefinition,
): RuleBuilderDraft {
  if (draft.support !== 'editable') return draft

  switch (draft.rule.type) {
    case 'globalCount':
    case 'forEachCount':
    case 'regionCount':
    case 'lineCount':
    case 'scopeOverlapCount':
      return refreshEditableDraft(draft, { ...draft.rule, count }, puzzle)
    case 'comparativeCount':
    case 'conditionalCount':
    case 'anchorCount':
    case 'recordSet':
      return draft
  }
}

export function updateRuleBuilderForEachSubject(
  draft: RuleBuilderDraft,
  subject: CellKind,
  puzzle?: PuzzleDefinition,
): RuleBuilderDraft {
  if (draft.support !== 'editable' || draft.rule.type !== 'forEachCount') return draft
  return refreshEditableDraft(draft, { ...draft.rule, subject }, puzzle)
}

export function updateRuleBuilderForEachScopeKind(
  draft: RuleBuilderDraft,
  scopeKind: LocalScope['kind'],
  puzzle?: PuzzleDefinition,
): RuleBuilderDraft {
  if (draft.support !== 'editable' || draft.rule.type !== 'forEachCount') return draft
  return refreshEditableDraft(draft, { ...draft.rule, scope: { kind: scopeKind } }, puzzle)
}

export function updateRuleBuilderRegionId(
  draft: RuleBuilderDraft,
  regionId: string,
  puzzle?: PuzzleDefinition,
): RuleBuilderDraft {
  if (draft.support !== 'editable' || draft.rule.type !== 'regionCount') return draft
  return refreshEditableDraft(draft, { ...draft.rule, regionId }, puzzle)
}

export function updateRuleBuilderLineScope(
  draft: RuleBuilderDraft,
  scope: LineCountRule['scope'],
  puzzle?: PuzzleDefinition,
): RuleBuilderDraft {
  if (draft.support !== 'editable' || draft.rule.type !== 'lineCount') return draft
  const nextRule = scope.kind === 'ray'
    ? {
        ...draft.rule,
        origin: draft.rule.origin ?? puzzleFirstCell(puzzle),
        scope,
      }
    : withoutOrigin({ ...draft.rule, scope })
  return refreshEditableDraft(draft, nextRule, puzzle)
}

export function updateRuleBuilderLineOrigin(
  draft: RuleBuilderDraft,
  origin: CellId,
  puzzle?: PuzzleDefinition,
): RuleBuilderDraft {
  if (draft.support !== 'editable' || draft.rule.type !== 'lineCount') return draft
  if (draft.rule.scope.kind !== 'ray') return draft
  return refreshEditableDraft(draft, { ...draft.rule, origin }, puzzle)
}

export function updateRuleBuilderOverlapMode(
  draft: RuleBuilderDraft,
  mode: ScopeOverlapMode,
  puzzle?: PuzzleDefinition,
): RuleBuilderDraft {
  if (draft.support !== 'editable' || draft.rule.type !== 'scopeOverlapCount') return draft
  return refreshEditableDraft(draft, { ...draft.rule, mode }, puzzle)
}

export function updateRuleBuilderComparison(
  draft: RuleBuilderDraft,
  comparison: CountComparison,
  puzzle?: PuzzleDefinition,
): RuleBuilderDraft {
  if (draft.support !== 'editable' || draft.rule.type !== 'comparativeCount') return draft
  return refreshEditableDraft(draft, { ...draft.rule, comparison }, puzzle)
}

export function updateRuleBuilderConditionalClause(
  draft: RuleBuilderDraft,
  clause: 'condition' | 'then',
  patch: Partial<ConditionalCountClause>,
  puzzle?: PuzzleDefinition,
): RuleBuilderDraft {
  if (draft.support !== 'editable' || draft.rule.type !== 'conditionalCount') return draft
  return refreshEditableDraft(draft, {
    ...draft.rule,
    [clause]: {
      ...draft.rule[clause],
      ...patch,
    },
  }, puzzle)
}

function withGeneratedPresentation(
  rule: RuleDefinition,
  generatedText: GeneratedRuleText,
): RuleDefinition {
  return {
    ...rule,
    presentation: {
      title: generatedText.title,
      flavor: generatedText.flavor,
    },
  } as RuleDefinition
}

function refreshEditableDraft(
  draft: RuleBuilderDraft,
  rule: RuleDefinition,
  puzzle?: PuzzleDefinition,
): RuleBuilderDraft {
  const generatedText = generateRuleText(rule, { puzzle })
  return {
    ...draft,
    rule: withGeneratedPresentation(rule, generatedText),
    generatedText,
  }
}

function cloneRule(rule: RuleDefinition): RuleDefinition {
  return {
    ...rule,
    presentation: { ...rule.presentation },
  } as RuleDefinition
}

function unsupportedReason(rule: RuleDefinition): string {
  switch (rule.type) {
    case 'lineCount':
      return 'Editable line/ray rule family.'
    case 'anchorCount':
      return 'Anchor rules need dedicated anchor/source controls before safe editing.'
    case 'recordSet':
      return 'Record-set rules are contaminated-record verifier material and stay read-only in the MVP builder.'
    case 'globalCount':
    case 'forEachCount':
    case 'regionCount':
    case 'scopeOverlapCount':
    case 'comparativeCount':
    case 'conditionalCount':
      return 'Editable rule family.'
  }
}

function nextRuleId(rules: readonly RuleDefinition[]): string {
  const used = new Set(rules.map((rule) => rule.id))
  let index = rules.length + 1
  let id = `R${index}`
  while (used.has(id)) {
    index += 1
    id = `R${index}`
  }
  return id
}

function firstAllowedKind(allowedKinds: readonly CellKind[], fallback: CellKind): CellKind {
  return allowedKinds.includes(fallback) ? fallback : allowedKinds[0] ?? fallback
}

function defaultCountForForm(form: RuleBuilderCreateForm): Comparator {
  switch (form) {
    case 'forEachCount':
    case 'lineOfSightNone':
      return { op: 'eq', value: 0 }
    case 'lineOfSightExists':
      return { op: 'gte', value: 1 }
    case 'globalCount':
    case 'regionCount':
    case 'rowCount':
    case 'columnCount':
    case 'cornersCount':
    case 'edgeCount':
    case 'interiorCount':
      return { op: 'eq', value: 1 }
  }
}

function emptyPresentation(id: string): RuleDefinition['presentation'] {
  return { title: id }
}

function boundedLineIndex(index: number | undefined, length: number): number {
  if (index === undefined || !Number.isInteger(index)) return 0
  return Math.min(Math.max(0, index), Math.max(0, length - 1))
}

function materializedRegion(
  kind: 'corners' | 'edge' | 'interior',
  board: BoardSize,
  preferredId?: string,
): RegionDefinition {
  const cells = materializedRegionCells(kind, board)
  const id = preferredId ?? `generated-${kind}`
  return {
    id,
    title: materializedRegionTitle(kind),
    cells,
  }
}

function materializedRegionCells(kind: 'corners' | 'edge' | 'interior', board: BoardSize): readonly CellId[] {
  const cells = allCells(board)
  switch (kind) {
    case 'corners': {
      const cornerSet = new Set<CellId>([
        cells[0] ?? 'A1',
        cells[board.width - 1] ?? 'A1',
        cells[(board.height - 1) * board.width] ?? 'A1',
        cells[(board.height * board.width) - 1] ?? 'A1',
      ])
      return cells.filter((cellId) => cornerSet.has(cellId))
    }
    case 'edge':
      return cells.filter((_, index) => {
        const x = index % board.width
        const y = Math.floor(index / board.width)
        return x === 0 || y === 0 || x === board.width - 1 || y === board.height - 1
      })
    case 'interior':
      return cells.filter((_, index) => {
        const x = index % board.width
        const y = Math.floor(index / board.width)
        return x > 0 && y > 0 && x < board.width - 1 && y < board.height - 1
      })
  }
}

function materializedRegionTitle(kind: 'corners' | 'edge' | 'interior'): string {
  switch (kind) {
    case 'corners':
      return '四个角落'
    case 'edge':
      return '外圈边缘'
    case 'interior':
      return '内侧区域'
  }
}

function puzzleFirstCell(puzzle: PuzzleDefinition | undefined): CellId {
  return puzzle === undefined ? 'A1' : allCells(puzzle.board)[0] ?? 'A1'
}

function withoutOrigin(rule: LineCountRule): LineCountRule {
  const { origin: _origin, ...rest } = rule
  return rest
}
