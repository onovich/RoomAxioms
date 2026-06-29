import { describe, expect, it } from 'vitest'

import type { PuzzleDefinition, RuleDefinition } from '@room-axioms/domain'
import { parsePuzzleDefinition } from '@room-axioms/schema'
import {
  createRuleBuilderDrafts,
  createRuleBuilderRule,
  duplicateRuleBuilderDraft,
  editableRuleTypes,
  exportRuleBuilderDrafts,
  moveRuleBuilderDraft,
  updateRuleBuilderComparison,
  updateRuleBuilderConditionalClause,
  updateRuleBuilderDirectCount,
  updateRuleBuilderDirectTarget,
  updateRuleBuilderForEachScopeKind,
  updateRuleBuilderForEachSubject,
  updateRuleBuilderLineOrigin,
  updateRuleBuilderLineScope,
  updateRuleBuilderOverlapMode,
  updateRuleBuilderRegionId,
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
      'lineCount',
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

  it('updates direct target and count fields while regenerating schema-valid presentation', () => {
    const puzzle = builderPuzzle([globalRule(), regionRule()])
    const drafts = createRuleBuilderDrafts(puzzle)
    const puzzleWithSouthRegion = {
      ...puzzle,
      regions: [
        ...puzzle.regions!,
        { id: 'south-ledger', title: '鍗椾晶璁板綍', cells: ['A3', 'B3', 'C3'] },
      ],
    } satisfies PuzzleDefinition
    const updatedGlobal = updateRuleBuilderDirectCount(
      updateRuleBuilderDirectTarget(drafts[0]!, 'bin', puzzle),
      { op: 'gte', value: 1 },
      puzzle,
    )
    const updatedRegion = updateRuleBuilderRegionId(drafts[1]!, 'south-ledger', puzzleWithSouthRegion)
    const rules = exportRuleBuilderDrafts([updatedGlobal, updatedRegion])
    const parsed = parsePuzzleDefinition({ ...puzzleWithSouthRegion, rules })

    expect(parsed.ok).toBe(true)
    expect(rules[0]).toMatchObject({
      target: 'bin',
      count: { op: 'gte', value: 1 },
    })
    expect(rules[0]?.presentation.title).toBe(updatedGlobal.generatedText.title)
    expect(rules[1]).toMatchObject({
      regionId: 'south-ledger',
    })
  })

  it('updates for-each subject and local scope controls', () => {
    const puzzle = builderPuzzle([localRule()])
    const [draft] = createRuleBuilderDrafts(puzzle)
    const updated = updateRuleBuilderForEachScopeKind(
      updateRuleBuilderForEachSubject(draft!, 'guest', puzzle),
      'adjacent',
      puzzle,
    )
    const [rule] = exportRuleBuilderDrafts([updated])

    expect(rule).toMatchObject({
      type: 'forEachCount',
      subject: 'guest',
      scope: { kind: 'adjacent' },
    })
    expect(parsePuzzleDefinition({ ...puzzle, rules: [rule!] }).ok).toBe(true)
  })

  it('updates expressive count controls without changing scope references', () => {
    const puzzle = builderPuzzle([overlapRule(), comparativeRule(), conditionalRule()])
    const drafts = createRuleBuilderDrafts(puzzle)
    const updatedOverlap = updateRuleBuilderOverlapMode(
      updateRuleBuilderDirectCount(drafts[0]!, { op: 'lte', value: 2 }, puzzle),
      'union',
      puzzle,
    )
    const updatedComparative = updateRuleBuilderComparison(drafts[1]!, { op: 'gte', offset: 1 }, puzzle)
    const updatedConditional = updateRuleBuilderConditionalClause(
      drafts[2]!,
      'then',
      { target: 'bin', count: { op: 'eq', value: 1 } },
      puzzle,
    )
    const rules = exportRuleBuilderDrafts([updatedOverlap, updatedComparative, updatedConditional])
    const parsed = parsePuzzleDefinition({ ...puzzle, rules })

    expect(parsed.ok).toBe(true)
    expect(rules[0]).toMatchObject({ type: 'scopeOverlapCount', mode: 'union', count: { op: 'lte', value: 2 } })
    expect(rules[1]).toMatchObject({ type: 'comparativeCount', comparison: { op: 'gte', offset: 1 } })
    expect(rules[2]).toMatchObject({
      type: 'conditionalCount',
      then: { target: 'bin', count: { op: 'eq', value: 1 } },
    })
  })

  it('edits row, column, and ray line-count rules through structured helpers', () => {
    const rule: RuleDefinition = {
      id: 'L1',
      type: 'lineCount',
      scope: { kind: 'row', index: 0 },
      target: 'guest',
      count: { op: 'eq', value: 1 },
      presentation: { title: 'Line original' },
    }
    const [draft] = createRuleBuilderDrafts(builderPuzzle([rule]))
    const asRay = updateRuleBuilderLineOrigin(
      updateRuleBuilderLineScope(draft!, { kind: 'ray', direction: 'south' }),
      'A1',
    )
    const updated = updateRuleBuilderDirectCount(
      updateRuleBuilderDirectTarget(asRay, 'bin'),
      { op: 'gte', value: 1 },
    )
    const [exported] = exportRuleBuilderDrafts([updated])

    expect(updated.support).toBe('editable')
    expect(exported).toMatchObject({
      id: 'L1',
      type: 'lineCount',
      origin: 'A1',
      scope: { kind: 'ray', direction: 'south' },
      target: 'bin',
      count: { op: 'gte', value: 1 },
    })
    const parsed = parsePuzzleDefinition({ ...builderPuzzle([rule]), rules: [globalRule(), exported!] })
    if (!parsed.ok) throw new Error(JSON.stringify(parsed.issues, null, 2))
    expect(parsed.ok).toBe(true)
  })

  it('creates requested authoring forms and materializes safe positional regions', () => {
    const puzzle = builderPuzzle([globalRule()])
    const corners = createRuleBuilderRule(puzzle, { form: 'cornersCount', id: 'CORNERS' })
    const rayNone = createRuleBuilderRule(puzzle, { form: 'lineOfSightNone', id: 'RAY_NONE', origin: 'A1' })
    const row = createRuleBuilderRule(puzzle, { form: 'rowCount', id: 'ROW' })

    expect(corners.regions).toEqual([
      expect.objectContaining({
        id: 'generated-corners',
        cells: ['A1', 'C1', 'A3', 'C3'],
      }),
    ])
    expect(corners.rule).toMatchObject({ type: 'regionCount', regionId: 'generated-corners' })
    expect(rayNone.rule).toMatchObject({
      type: 'lineCount',
      origin: 'A1',
      scope: { kind: 'ray', direction: 'east' },
      count: { op: 'eq', value: 0 },
    })
    expect(row.rule).toMatchObject({ type: 'lineCount', scope: { kind: 'row', index: 0 } })
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

function overlapRule(): RuleDefinition {
  return {
    id: 'R4',
    type: 'scopeOverlapCount',
    left: { kind: 'global' },
    right: { kind: 'region', regionId: 'north-ledger' },
    mode: 'intersection',
    target: 'guest',
    count: { op: 'eq', value: 1 },
    presentation: { title: 'Old overlap' },
  }
}

function comparativeRule(): RuleDefinition {
  return {
    id: 'R5',
    type: 'comparativeCount',
    left: { kind: 'region', regionId: 'north-ledger' },
    right: { kind: 'global' },
    target: 'guest',
    comparison: { op: 'gt' },
    presentation: { title: 'Old comparative' },
  }
}

function conditionalRule(): RuleDefinition {
  return {
    id: 'R6',
    type: 'conditionalCount',
    condition: {
      scope: { kind: 'region', regionId: 'north-ledger' },
      target: 'guest',
      count: { op: 'eq', value: 1 },
    },
    then: {
      scope: { kind: 'global' },
      target: 'guest',
      count: { op: 'gte', value: 1 },
    },
    presentation: { title: 'Old conditional' },
  }
}
