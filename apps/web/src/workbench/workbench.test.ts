import { describe, expect, it } from 'vitest'

import { contentCases, DEFAULT_CASE_ID, getCaseById } from '../content/cases'
import { createWorkbenchDraftFromPuzzle, createWorkbenchShellModel } from './model'
import { AUTHORING_WORKBENCH_HASH, shouldShowAuthoringWorkbench } from './route'

describe('authoring workbench private route', () => {
  it('stays out of the normal player path unless explicitly requested', () => {
    expect(shouldShowAuthoringWorkbench({ hash: '', search: '' })).toBe(false)
    expect(shouldShowAuthoringWorkbench({ hash: '#play', search: '?case=case-004' })).toBe(false)
    expect(shouldShowAuthoringWorkbench({ hash: AUTHORING_WORKBENCH_HASH, search: '' })).toBe(true)
    expect(shouldShowAuthoringWorkbench({ hash: '', search: '?authoring=workbench' })).toBe(true)
    expect(shouldShowAuthoringWorkbench({ hash: '', search: '?authoring=public-editor' })).toBe(false)
  })
})

describe('authoring workbench shell model', () => {
  it('imports a shipped case as an editable draft without changing shipped selector data', () => {
    const defaultCase = getCaseById(DEFAULT_CASE_ID)
    const draft = createWorkbenchDraftFromPuzzle(defaultCase)
    const model = createWorkbenchShellModel(contentCases, DEFAULT_CASE_ID, draft)

    expect(model.selectedCaseId).toBe(DEFAULT_CASE_ID)
    expect(model.parse).toMatchObject({
      ok: true,
      puzzle: {
        id: DEFAULT_CASE_ID,
      },
    })
    expect(model.exported).toMatchObject({
      ok: true,
      puzzle: {
        id: DEFAULT_CASE_ID,
      },
    })
    expect(model.boardCells).toHaveLength(defaultCase.board.width * defaultCase.board.height)
    expect(model.ruleSummaries.map((rule) => rule.id)).toEqual(defaultCase.rules.map((rule) => rule.id))
    expect(model.caseOptions.map((option) => option.id)).toEqual(contentCases.map((puzzle) => puzzle.id))
  })
})
