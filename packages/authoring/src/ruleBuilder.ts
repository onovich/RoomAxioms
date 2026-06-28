import type {
  CellKind,
  Comparator,
  ConditionalCountClause,
  CountComparison,
  LocalScope,
  PuzzleDefinition,
  RuleDefinition,
  ScopeOverlapMode,
} from '@room-axioms/domain'

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
  'scopeOverlapCount',
  'comparativeCount',
  'conditionalCount',
])

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
    case 'scopeOverlapCount':
    case 'comparativeCount':
      return refreshEditableDraft(draft, { ...draft.rule, target }, puzzle)
    case 'conditionalCount':
    case 'lineCount':
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
    case 'scopeOverlapCount':
      return refreshEditableDraft(draft, { ...draft.rule, count }, puzzle)
    case 'comparativeCount':
    case 'conditionalCount':
    case 'lineCount':
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
      return 'Line/ray rules need dedicated row, column, ray, origin, and blocker controls before safe editing.'
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
