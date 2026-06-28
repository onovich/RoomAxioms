import { describe, expect, it } from 'vitest'

import type { PuzzleDefinition, RuleDefinition } from '@room-axioms/domain'
import { parsePuzzleDefinition } from '@room-axioms/schema'
import {
  createRuleBuilderDrafts,
  duplicateRuleBuilderDraft,
  editableRuleTypes,
  exportRuleBuilderDrafts,
  moveRuleBuilderDraft,
} from './ruleBuilder.js'

describe('rule builder model', () => {
  it('imports editable rule families with generated presentation text', () => {
    const puzzle = builderPuzzle([globalRule(), localRule(), regionRule()])
    const drafts = createRuleBuilderDrafts(puzzle)

    expect(drafts.map((draft) => draft.support)).toEqual(['editable', 'editable', 'editable'])
    expect(drafts[0]?.generatedText.flavor).toBe('全场恰好有 1 个访客。')
    expect(drafts[1]?.generatedText.flavor).toBe('每个垃圾桶的上下左右邻格，没有访客。')
    expect(drafts[2]?.generatedText.flavor).toBe('北侧记录（A1、B1、C1），恰好有 1 个访客。')
    expect(editableRuleTypes()).toEqual(expect.arrayContaining([
      'globalCount',
      'forEachCount',
      'regionCount',
      'scopeOverlapCount',
      'comparativeCount',
      'conditionalCount',
    ]))
  })

  it('exports editable drafts as schema-valid rules with generated text as presentation', () => {
    const puzzle = builderPuzzle([globalRule(), localRule(), regionRule()])
    const rules = exportRuleBuilderDrafts(createRuleBuilderDrafts(puzzle))
    const parsed = parsePuzzleDefinition({
      ...puzzle,
      rules,
    })

    expect(parsed.ok).toBe(true)
    expect(rules[0]?.presentation).toEqual({
      title: '全场恰好有 1 个访客',
      flavor: '全场恰好有 1 个访客。',
    })
    expect(rules[1]?.presentation).toEqual({
      title: '垃圾桶上下左右邻格没有访客',
      flavor: '每个垃圾桶的上下左右邻格，没有访客。',
    })
  })

  it('keeps non-MVP families read-only and non-lossy', () => {
    const recordRule: RuleDefinition = {
      id: 'REC',
      type: 'recordSet',
      recordIds: ['card-a', 'card-b'],
      falseRecords: { op: 'eq', value: 1 },
      presentation: { title: 'Original record title', flavor: 'Original record flavor.' },
    }
    const puzzle = {
      ...builderPuzzle([recordRule]),
      records: [
        { id: 'card-a', title: 'Card A', ruleIds: ['R0'] },
        { id: 'card-b', title: 'Card B', ruleIds: ['R0'] },
      ],
    } satisfies PuzzleDefinition
    const [draft] = createRuleBuilderDrafts(puzzle)
    const [exported] = exportRuleBuilderDrafts([draft!])

    expect(draft).toMatchObject({
      support: 'read-only-unsupported',
      unsupportedReason: expect.stringContaining('Record-set'),
    })
    expect(exported).toEqual(recordRule)
  })

  it('duplicates and reorders builder drafts without mutating the original list', () => {
    const drafts = createRuleBuilderDrafts(builderPuzzle([globalRule(), localRule(), regionRule()]))
    const duplicate = duplicateRuleBuilderDraft(drafts[0]!, 'R1_COPY')
    const moved = moveRuleBuilderDraft([...drafts, duplicate], 3, 1)

    expect(duplicate.id).toBe('R1_COPY')
    expect(duplicate.rule.id).toBe('R1_COPY')
    expect(drafts.map((draft) => draft.id)).toEqual(['R1', 'R2', 'R3'])
    expect(moved.map((draft) => draft.id)).toEqual(['R1', 'R1_COPY', 'R2', 'R3'])
  })
})

function builderPuzzle(rules: readonly RuleDefinition[]): PuzzleDefinition {
  return {
    schemaVersion: 1,
    id: 'phase-31-rule-builder-test',
    title: 'Phase 31 rule builder test',
    board: { width: 3, height: 3 },
    allowedKinds: ['empty', 'bin', 'guest'],
    regions: [{ id: 'north-ledger', title: '北侧记录', cells: ['A1', 'B1', 'C1'] }],
    rules,
    initialReveals: ['A1'],
    target: {
      A1: 'empty',
      B1: 'guest',
      C1: 'empty',
      A2: 'bin',
      B2: 'empty',
      C2: 'empty',
      A3: 'empty',
      B3: 'empty',
      C3: 'empty',
    },
    metadata: { difficulty: 1, tags: ['phase-31'], status: 'draft' },
  }
}

function globalRule(): RuleDefinition {
  return {
    id: 'R1',
    type: 'globalCount',
    target: 'guest',
    count: { op: 'eq', value: 1 },
    presentation: { title: 'Old global' },
  }
}

function localRule(): RuleDefinition {
  return {
    id: 'R2',
    type: 'forEachCount',
    subject: 'bin',
    scope: { kind: 'orthogonal' },
    target: 'guest',
    count: { op: 'eq', value: 0 },
    presentation: { title: 'Old local' },
  }
}

function regionRule(): RuleDefinition {
  return {
    id: 'R3',
    type: 'regionCount',
    regionId: 'north-ledger',
    target: 'guest',
    count: { op: 'eq', value: 1 },
    presentation: { title: 'Old region' },
  }
}
