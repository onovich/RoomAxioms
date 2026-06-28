import type { PuzzleDefinition, RuleDefinition } from '@room-axioms/domain'

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
