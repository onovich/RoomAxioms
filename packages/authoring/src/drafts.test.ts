import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import {
  createEmptyWorkbenchDraftState,
  exportDraftJson,
  importJsonTextToDraftState,
  importPuzzleToDraftState,
  patchDraftBoardSize,
  patchDraftMetadata,
  patchDraftRulePresentation,
  patchDraftTargetCell,
  parseDraftJson,
  selectDraftCell,
  selectDraftRule,
  toggleDraftInitialReveal,
  updateDraftJsonText,
} from '@room-axioms/authoring/drafts'

const fixturePath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../content/experimental/phase-10/phase-10-local-scope-intersection-001.json',
)

const fixtureText = readFileSync(fixturePath, 'utf8')

describe('workbench draft state', () => {
  it('creates an empty serializable draft state', () => {
    expect(createEmptyWorkbenchDraftState()).toEqual({
      jsonText: '',
      dirty: false,
      source: { kind: 'empty' },
    })
  })

  it('imports existing JSON text into formatted draft state without marking it dirty', () => {
    const state = importJsonTextToDraftState(fixtureText, {
      label: 'phase-10 fixture',
      selectedCellId: 'A1',
      selectedRuleId: 'R1',
    })

    expect(state).toMatchObject({
      dirty: false,
      source: {
        kind: 'json-text',
        label: 'phase-10 fixture',
      },
      selectedCellId: 'A1',
      selectedRuleId: 'R1',
      lastValidPuzzle: {
        id: 'phase-10-local-scope-intersection-001',
      },
    })
    expect(state.jsonText.endsWith('\n')).toBe(true)
    expect(exportDraftJson(state)).toMatchObject({
      ok: true,
      puzzle: {
        id: 'phase-10-local-scope-intersection-001',
      },
      issues: [],
    })
  })

  it('imports a parsed puzzle and exports deterministic JSON text', () => {
    const parsed = parseDraftJson(fixtureText)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) throw new Error('Fixture did not parse.')

    const state = importPuzzleToDraftState(parsed.puzzle, {
      label: 'parsed fixture',
    })
    const exported = exportDraftJson(state)

    expect(state).toMatchObject({
      dirty: false,
      source: {
        kind: 'puzzle',
        label: 'parsed fixture',
      },
    })
    expect(exported.ok).toBe(true)
    expect(exported.jsonText).toBe(state.jsonText)
    expect(JSON.parse(exported.jsonText)).toMatchObject({
      id: 'phase-10-local-scope-intersection-001',
    })
  })

  it('keeps invalid raw JSON editable while preserving the last valid puzzle', () => {
    const validState = importJsonTextToDraftState(fixtureText)
    const edited = updateDraftJsonText(validState, '{ "id": "still editing"')
    const exported = exportDraftJson(edited)

    expect(edited).toMatchObject({
      dirty: true,
      lastValidPuzzle: {
        id: 'phase-10-local-scope-intersection-001',
      },
    })
    expect(exported).toMatchObject({
      ok: false,
      jsonText: '{ "id": "still editing"',
      issues: [
        expect.objectContaining({
          code: 'JSON_PARSE_FAILED',
        }),
      ],
    })
  })

  it('updates and clears selected cell and rule ids immutably', () => {
    const state = importJsonTextToDraftState(fixtureText)
    const selected = selectDraftRule(selectDraftCell(state, 'B2'), 'R2')

    expect(selected).toMatchObject({
      selectedCellId: 'B2',
      selectedRuleId: 'R2',
    })
    expect(state).not.toHaveProperty('selectedCellId')
    expect(state).not.toHaveProperty('selectedRuleId')

    const cleared = selectDraftRule(selectDraftCell(selected, undefined), undefined)
    expect(cleared).not.toHaveProperty('selectedCellId')
    expect(cleared).not.toHaveProperty('selectedRuleId')
  })

  it('imports invalid JSON text without inventing a puzzle', () => {
    const state = importJsonTextToDraftState('{ "id": "broken"')
    const parsed = parseDraftJson(state.jsonText)

    expect(state).toMatchObject({
      jsonText: '{ "id": "broken"',
      dirty: false,
      source: { kind: 'json-text' },
    })
    expect(state).not.toHaveProperty('lastValidPuzzle')
    expect(parsed).toMatchObject({
      ok: false,
      issues: [
        expect.objectContaining({
          code: 'JSON_PARSE_FAILED',
        }),
      ],
    })
  })

  it('patches metadata and rule presentation through schema-validated draft JSON', () => {
    const state = importJsonTextToDraftState(fixtureText)
    const metadataPatch = patchDraftMetadata(state, {
      title: 'Workbench Draft Title',
      caseName: 'Workbench Case Name',
      difficulty: 3,
      tags: ['phase-25', 'workbench'],
      author: 'room-axioms-maintainers',
      status: 'draft',
      notes: 'Private workbench edit.',
    })
    expect(metadataPatch.ok).toBe(true)
    if (!metadataPatch.ok) throw new Error('Metadata patch failed.')

    const rulePatch = patchDraftRulePresentation(metadataPatch.state, {
      ruleId: 'R1',
      title: 'Plain rule title',
      flavor: 'Plain player-facing rule copy.',
    })
    expect(rulePatch.ok).toBe(true)
    if (!rulePatch.ok) throw new Error('Rule presentation patch failed.')

    expect(rulePatch.puzzle).toMatchObject({
      title: 'Workbench Draft Title',
      caseName: 'Workbench Case Name',
      metadata: {
        difficulty: 3,
        tags: ['phase-25', 'workbench'],
        author: 'room-axioms-maintainers',
        status: 'draft',
        notes: 'Private workbench edit.',
      },
    })
    expect(rulePatch.puzzle.rules.find((rule) => rule.id === 'R1')?.presentation).toEqual({
      title: 'Plain rule title',
      flavor: 'Plain player-facing rule copy.',
    })
    expect(rulePatch.state.dirty).toBe(true)
  })

  it('patches target cells and initial reveals while rejecting invalid guest reveals', () => {
    const state = importJsonTextToDraftState(fixtureText)
    const targetPatch = patchDraftTargetCell(state, 'A1', 'guest')
    expect(targetPatch.ok).toBe(true)
    if (!targetPatch.ok) throw new Error('Target patch failed.')

    const invalidReveal = toggleDraftInitialReveal(targetPatch.state, 'A1')
    expect(invalidReveal).toMatchObject({
      ok: false,
      state: targetPatch.state,
      issues: [
        expect.objectContaining({
          code: 'INITIAL_REVEAL_GUEST',
        }),
      ],
    })
    expect(invalidReveal.state).toBe(targetPatch.state)
  })

  it('patches board size by adding empty target cells without writing content files', () => {
    const state = importJsonTextToDraftState(fixtureText)
    const patch = patchDraftBoardSize(state, { width: 5, height: 4 })

    expect(patch.ok).toBe(true)
    if (!patch.ok) throw new Error('Board patch failed.')
    expect(patch.puzzle.board).toEqual({ width: 5, height: 4 })
    expect(patch.puzzle.target.E4).toBe('empty')
    expect(exportDraftJson(patch.state)).toMatchObject({
      ok: true,
      puzzle: {
        board: { width: 5, height: 4 },
      },
    })
  })

  it('returns parse issues and preserves state when patching invalid raw JSON', () => {
    const state = importJsonTextToDraftState('{ "id": "broken"')
    const patch = patchDraftMetadata(state, {
      title: 'Ignored',
    })

    expect(patch).toMatchObject({
      ok: false,
      state,
      issues: [
        expect.objectContaining({
          code: 'JSON_PARSE_FAILED',
        }),
      ],
    })
    expect(patch.state).toBe(state)
  })
})
