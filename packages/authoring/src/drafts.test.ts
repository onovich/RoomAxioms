import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import {
  createEmptyWorkbenchDraftState,
  exportDraftJson,
  importJsonTextToDraftState,
  importPuzzleToDraftState,
  parseDraftJson,
  selectDraftCell,
  selectDraftRule,
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
})
