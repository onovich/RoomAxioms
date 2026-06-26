import { describe, expect, it } from 'vitest'

import { updateDraftJsonText } from '@room-axioms/authoring/drafts'

import { contentCases, DEFAULT_CASE_ID, getCaseById } from '../content/cases'
import {
  experimentalWorkbenchCases,
  getWorkbenchCaseImportById,
  workbenchCaseLibrary,
} from './caseLibrary'
import { createWorkbenchDraftFromPuzzle, createWorkbenchShellModel, evaluateWorkbenchDiagnostics } from './model'
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
    const model = createWorkbenchShellModel(workbenchCaseLibrary, DEFAULT_CASE_ID, draft)

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
    expect(model.caseOptions.map((option) => option.id)).toEqual(workbenchCaseLibrary.map((item) => item.puzzle.id))
    expect(model.caseOptions.find((option) => option.id === DEFAULT_CASE_ID)).toMatchObject({
      source: 'shipped',
      sourcePath: 'content/cases/case-004.json',
    })
    expect(model.exportStatus).toMatchObject({
      ok: true,
      fileName: 'case-004-workbench-draft.json',
      issueCount: 0,
    })
  })

  it('imports selected experimental fixtures privately without changing the player case selector', () => {
    const experimentalCaseIds = experimentalWorkbenchCases.map((item) => item.puzzle.id)
    const playerCaseIds = contentCases.map((puzzle) => puzzle.id)
    const experimentalImport = getWorkbenchCaseImportById('phase-24-comparative-balance-001')
    const draft = createWorkbenchDraftFromPuzzle(experimentalImport.puzzle)
    const model = createWorkbenchShellModel(workbenchCaseLibrary, experimentalImport.puzzle.id, draft)

    expect(experimentalCaseIds).toContain('phase-24-comparative-balance-001')
    expect(playerCaseIds).not.toContain('phase-24-comparative-balance-001')
    expect(model.parse).toMatchObject({
      ok: true,
      puzzle: {
        id: 'phase-24-comparative-balance-001',
      },
    })
    expect(model.caseOptions.find((option) => option.id === 'phase-24-comparative-balance-001')).toMatchObject({
      source: 'experimental',
      sourcePath: 'content/experimental/phase-24/phase-24-comparative-balance-001.json',
    })
    expect(model.exportStatus.fileName).toBe('phase-24-comparative-balance-001-workbench-draft.json')
  })

  it('keeps invalid JSON editable while withholding full diagnostics until parse succeeds', () => {
    const defaultCase = getCaseById(DEFAULT_CASE_ID)
    const draft = updateDraftJsonText(createWorkbenchDraftFromPuzzle(defaultCase), '{ "id": "broken"')
    const model = createWorkbenchShellModel(workbenchCaseLibrary, DEFAULT_CASE_ID, draft)

    expect(model.parse).toMatchObject({
      ok: false,
      issues: [
        expect.objectContaining({
          code: 'JSON_PARSE_FAILED',
        }),
      ],
    })
    expect(evaluateWorkbenchDiagnostics(draft, DEFAULT_CASE_ID)).toBeUndefined()
    expect(model.exportStatus).toMatchObject({
      ok: false,
      fileName: 'case-004-invalid-draft.json',
      issueCount: 1,
    })
    expect(model.boardCells).toEqual([])
    expect(model.ruleSummaries).toEqual([])
  })

  it('runs grouped authoring diagnostics on demand for a valid draft', () => {
    const draft = createWorkbenchDraftFromPuzzle(getCaseById(DEFAULT_CASE_ID))
    const diagnostics = evaluateWorkbenchDiagnostics(draft, DEFAULT_CASE_ID)

    expect(diagnostics).toMatchObject({
      puzzleId: DEFAULT_CASE_ID,
      validation: {
        schema: {
          ok: true,
        },
      },
    })
    expect(diagnostics?.groups.map((group) => group.id)).toEqual([
      'blocking-errors',
      'correctness',
      'human-proof',
      'quality',
      'clone-risk',
      'difficulty',
      'copy',
      'performance',
    ])
  }, 30_000)
})
