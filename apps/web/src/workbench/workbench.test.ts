import { describe, expect, it } from 'vitest'

import { updateDraftJsonText } from '@room-axioms/authoring/drafts'

import { contentCases, DEFAULT_CASE_ID, getCaseById } from '../content/cases'
import {
  experimentalWorkbenchCases,
  getWorkbenchCaseImportById,
  workbenchCaseLibrary,
} from './caseLibrary'
import {
  beginWorkbenchDiagnostics,
  completeWorkbenchDiagnostics,
  createWorkbenchDraftFromPuzzle,
  createWorkbenchDiagnosticsState,
  createWorkbenchDiagnosticsOverview,
  createWorkbenchRulesJson,
  createWorkbenchScopeCollectionsJson,
  createWorkbenchShellModel,
  diagnosticsReportForState,
  evaluateWorkbenchDiagnostics,
  failWorkbenchDiagnostics,
  markWorkbenchDiagnosticsStale,
  patchWorkbenchBoardSize,
  patchWorkbenchRulePresentation,
  patchWorkbenchRulesJson,
  patchWorkbenchScopeCollectionsJson,
  patchWorkbenchTargetCell,
  toggleWorkbenchInitialReveal,
  workbenchCellKindOptions,
} from './model'
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

  it('patches target cell facts through schema-validated draft state', () => {
    const defaultCase = getCaseById(DEFAULT_CASE_ID)
    const draft = createWorkbenchDraftFromPuzzle(defaultCase)
    const patch = patchWorkbenchTargetCell(draft, 'A1', 'guest')

    expect(patch.ok).toBe(true)
    if (!patch.ok) throw new Error('Target patch failed.')

    const model = createWorkbenchShellModel(workbenchCaseLibrary, DEFAULT_CASE_ID, patch.state)
    expect(model.boardCells.find((cell) => cell.id === 'A1')).toMatchObject({
      id: 'A1',
      kind: 'guest',
      guestTarget: true,
      initiallyRevealed: false,
    })
    expect(model.exportStatus).toMatchObject({
      ok: true,
      issueCount: 0,
    })
    expect(model.exported).toMatchObject({
      ok: true,
      puzzle: {
        target: {
          A1: 'guest',
        },
      },
    })
  })

  it('returns patch issues without mutating the draft when target edits break schema semantics', () => {
    const draft = createWorkbenchDraftFromPuzzle(getCaseById(DEFAULT_CASE_ID))
    const patch = patchWorkbenchTargetCell(draft, 'B1', 'guest')

    expect(patch).toMatchObject({
      ok: false,
      state: draft,
      issues: [
        expect.objectContaining({
          code: 'INITIAL_REVEAL_GUEST',
        }),
      ],
    })
    expect(patch.state).toBe(draft)
  })

  it('offers allowed target object options while preserving the currently selected kind', () => {
    const experimental = getWorkbenchCaseImportById('phase-24-comparative-balance-001').puzzle

    expect(workbenchCellKindOptions(experimental, undefined)).toEqual(['empty', 'guest'])
    expect(workbenchCellKindOptions(experimental, 'mirror')).toEqual(['empty', 'mirror', 'guest'])
    expect(workbenchCellKindOptions(undefined, undefined)).toEqual(['empty', 'bottle', 'bin', 'mirror', 'guest'])
  })

  it('resizes the draft board while keeping the exported draft schema-valid', () => {
    const draft = createWorkbenchDraftFromPuzzle(getCaseById(DEFAULT_CASE_ID))
    const patch = patchWorkbenchBoardSize(draft, { width: 5, height: 4 })

    expect(patch.ok).toBe(true)
    if (!patch.ok) throw new Error('Board size patch failed.')

    const model = createWorkbenchShellModel(workbenchCaseLibrary, DEFAULT_CASE_ID, patch.state)
    expect(model.boardCells).toHaveLength(20)
    expect(model.boardCells.find((cell) => cell.id === 'E4')).toMatchObject({
      id: 'E4',
      kind: 'empty',
      initiallyRevealed: false,
      guestTarget: false,
    })
    expect(model.exported).toMatchObject({
      ok: true,
      puzzle: {
        board: { width: 5, height: 4 },
        target: {
          E4: 'empty',
        },
      },
    })
  })

  it('toggles initial reveals through the same schema-validated draft path', () => {
    const draft = createWorkbenchDraftFromPuzzle(getCaseById(DEFAULT_CASE_ID))
    const addReveal = toggleWorkbenchInitialReveal(draft, 'A1')
    expect(addReveal.ok).toBe(true)
    if (!addReveal.ok) throw new Error('Initial reveal add failed.')
    expect(addReveal.puzzle.initialReveals).toContain('A1')

    const removeReveal = toggleWorkbenchInitialReveal(addReveal.state, 'A1')
    expect(removeReveal.ok).toBe(true)
    if (!removeReveal.ok) throw new Error('Initial reveal removal failed.')
    expect(removeReveal.puzzle.initialReveals).not.toContain('A1')
  })

  it('rejects initial reveals that would expose a guest target', () => {
    const draft = createWorkbenchDraftFromPuzzle(getCaseById(DEFAULT_CASE_ID))
    const patch = toggleWorkbenchInitialReveal(draft, 'D1')

    expect(patch).toMatchObject({
      ok: false,
      state: draft,
      issues: [
        expect.objectContaining({
          code: 'INITIAL_REVEAL_GUEST',
        }),
      ],
    })
  })

  it('patches rule presentation copy through schema-validated draft state', () => {
    const draft = createWorkbenchDraftFromPuzzle(getCaseById(DEFAULT_CASE_ID))
    const patch = patchWorkbenchRulePresentation(draft, {
      ruleId: 'R1',
      title: '这条规则已经改名',
      flavor: '这是一条给作者检查的玩家可见说明。',
    })

    expect(patch.ok).toBe(true)
    if (!patch.ok) throw new Error('Rule presentation patch failed.')

    const model = createWorkbenchShellModel(workbenchCaseLibrary, DEFAULT_CASE_ID, patch.state)
    expect(model.ruleSummaries.find((rule) => rule.id === 'R1')).toMatchObject({
      title: '这条规则已经改名',
      flavor: '这是一条给作者检查的玩家可见说明。',
    })
    expect(model.exported.ok).toBe(true)
    if (!model.exported.ok) throw new Error('Rule presentation export failed.')
    expect(model.exported.puzzle?.rules.find((rule) => rule.id === 'R1')?.presentation).toEqual({
      title: '这条规则已经改名',
      flavor: '这是一条给作者检查的玩家可见说明。',
    })
  })

  it('rejects blank rule presentation titles without mutating the draft', () => {
    const draft = createWorkbenchDraftFromPuzzle(getCaseById(DEFAULT_CASE_ID))
    const patch = patchWorkbenchRulePresentation(draft, {
      ruleId: 'R1',
      title: '   ',
    })

    expect(patch).toMatchObject({
      ok: false,
      state: draft,
      issues: [
        expect.objectContaining({
          code: 'PRESENTATION_TITLE_EMPTY',
        }),
      ],
    })
    expect(patch.state).toBe(draft)
  })

  it('patches full rule definitions through schema-validated draft state', () => {
    const fixture = getWorkbenchCaseImportById('phase-24-comparative-balance-001').puzzle
    const draft = createWorkbenchDraftFromPuzzle(fixture)
    const rulesDraft = JSON.parse(createWorkbenchRulesJson(fixture)) as {
      rules: Array<{
        readonly id: string
        readonly presentation: {
          readonly title: string
          readonly flavor?: string
        }
      } & Record<string, unknown>>
    }
    const patch = patchWorkbenchRulesJson(draft, JSON.stringify({
      rules: rulesDraft.rules.map((rule, index) => (
        index === 0
          ? {
              ...rule,
              presentation: {
                ...rule.presentation,
                title: '结构编辑后的规则标题',
              },
            }
          : rule
      )),
    }, null, 2))

    expect(patch.ok).toBe(true)
    if (!patch.ok) throw new Error('Rules patch failed.')

    expect(patch.puzzle.rules[0]?.presentation.title).toBe('结构编辑后的规则标题')
    expect(createWorkbenchShellModel(workbenchCaseLibrary, fixture.id, patch.state).exported).toMatchObject({
      ok: true,
      puzzle: {
        id: fixture.id,
      },
    })
  })

  it('rejects rule arrays that break schema semantics without mutating the draft', () => {
    const draft = createWorkbenchDraftFromPuzzle(getCaseById(DEFAULT_CASE_ID))
    const patch = patchWorkbenchRulesJson(draft, JSON.stringify({ rules: [] }, null, 2))

    expect(patch).toMatchObject({
      ok: false,
      state: draft,
      issues: [
        expect.objectContaining({
          code: 'SCHEMA_INVALID',
          path: ['rules'],
        }),
      ],
    })
    expect(patch.state).toBe(draft)
  })

  it('returns rules JSON parse issues before touching the draft', () => {
    const draft = createWorkbenchDraftFromPuzzle(getCaseById(DEFAULT_CASE_ID))
    const patch = patchWorkbenchRulesJson(draft, '{ "rules": ')

    expect(patch).toMatchObject({
      ok: false,
      state: draft,
      issues: [
        expect.objectContaining({
          code: 'RULES_JSON_PARSE_FAILED',
        }),
      ],
    })
    expect(patch.state).toBe(draft)
  })

  it('patches region and anchor collections through schema-validated draft state', () => {
    const fixture = getWorkbenchCaseImportById('case-017').puzzle
    const draft = createWorkbenchDraftFromPuzzle(fixture)
    const collections = JSON.parse(createWorkbenchScopeCollectionsJson(fixture)) as {
      regions: Array<{ id: string; title: string; cells: string[] }>
      anchors: Array<{ id: string; title: string; subject: string }>
    }
    const patch = patchWorkbenchScopeCollectionsJson(draft, JSON.stringify({
      regions: collections.regions.map((region, index) => (
        index === 0 ? { ...region, title: '改名后的区域' } : region
      )),
      anchors: collections.anchors.map((anchor, index) => (
        index === 0 ? { ...anchor, title: '改名后的参照物' } : anchor
      )),
    }, null, 2))

    expect(patch.ok).toBe(true)
    if (!patch.ok) throw new Error('Scope collections patch failed.')

    expect(patch.puzzle.regions?.[0]?.title).toBe('改名后的区域')
    expect(patch.puzzle.anchors?.[0]?.title).toBe('改名后的参照物')
    expect(createWorkbenchShellModel(workbenchCaseLibrary, fixture.id, patch.state).exported).toMatchObject({
      ok: true,
      puzzle: {
        id: fixture.id,
      },
    })
  })

  it('rejects scope collections that break rule references without mutating the draft', () => {
    const fixture = getWorkbenchCaseImportById('case-017').puzzle
    const draft = createWorkbenchDraftFromPuzzle(fixture)
    const patch = patchWorkbenchScopeCollectionsJson(draft, JSON.stringify({
      regions: [],
      anchors: fixture.anchors ?? [],
    }, null, 2))

    expect(patch).toMatchObject({
      ok: false,
      state: draft,
      issues: [
        expect.objectContaining({
          code: 'RULE_REGION_UNKNOWN',
        }),
      ],
    })
    expect(patch.state).toBe(draft)
  })

  it('returns scope collection JSON parse issues before touching the draft', () => {
    const draft = createWorkbenchDraftFromPuzzle(getCaseById(DEFAULT_CASE_ID))
    const patch = patchWorkbenchScopeCollectionsJson(draft, '{ "regions": ')

    expect(patch).toMatchObject({
      ok: false,
      state: draft,
      issues: [
        expect.objectContaining({
          code: 'SCOPE_COLLECTIONS_JSON_PARSE_FAILED',
        }),
      ],
    })
    expect(patch.state).toBe(draft)
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

  it('projects diagnostics into overview metrics without rerunning analysis in the view', () => {
    const draft = createWorkbenchDraftFromPuzzle(getCaseById(DEFAULT_CASE_ID))
    const diagnostics = evaluateWorkbenchDiagnostics(draft, DEFAULT_CASE_ID)
    const overview = createWorkbenchDiagnosticsOverview(diagnostics)

    expect(overview?.metrics.map((metric) => metric.id)).toEqual([
      'recommendation',
      'candidate-layouts',
      'proof',
      'quality',
      'clone-risk',
      'difficulty',
      'copy',
      'performance',
    ])
    expect(overview?.metrics.find((metric) => metric.id === 'proof')).toMatchObject({
      label: '人类证明',
    })
    expect(overview?.metrics.find((metric) => metric.id === 'difficulty')).toMatchObject({
      tone: 'warning',
    })
  }, 30_000)

  it('surfaces capped candidate counts and truncation warnings in the diagnostics overview', () => {
    const draft = createWorkbenchDraftFromPuzzle(getCaseById(DEFAULT_CASE_ID))
    const diagnostics = evaluateWorkbenchDiagnostics(draft, DEFAULT_CASE_ID)
    if (diagnostics === undefined) throw new Error('Expected diagnostics report.')
    const cappedDiagnostics = {
      ...diagnostics,
      validation: {
        ...diagnostics.validation,
        initialGuestLayouts: {
          count: 100,
          greaterThan: 100,
          stats: {
            nodeCount: 12,
            propagationCount: 34,
            truncated: true,
          },
        },
      },
      performance: {
        truncated: true,
        capWarnings: ['initial-layout-count-truncated', 'initial-layout-count-capped'],
      },
    }
    const overview = createWorkbenchDiagnosticsOverview(cappedDiagnostics)

    expect(overview?.metrics.find((metric) => metric.id === 'candidate-layouts')).toMatchObject({
      value: '>100',
      tone: 'warning',
    })
    expect(overview?.metrics.find((metric) => metric.id === 'performance')).toMatchObject({
      value: '2 项',
      tone: 'warning',
      detail: 'initial-layout-count-truncated, initial-layout-count-capped',
    })
    expect(overview?.capWarnings).toEqual(['initial-layout-count-truncated', 'initial-layout-count-capped'])
  }, 30_000)

  it('tracks current and stale workbench diagnostics around draft edits', () => {
    const draft = createWorkbenchDraftFromPuzzle(getCaseById(DEFAULT_CASE_ID))
    const report = evaluateWorkbenchDiagnostics(draft, DEFAULT_CASE_ID)
    if (report === undefined) throw new Error('Expected diagnostics report.')

    const initial = createWorkbenchDiagnosticsState()
    const running = beginWorkbenchDiagnostics(initial)
    const current = completeWorkbenchDiagnostics(running, running.requestId, report)
    expect(current).toMatchObject({
      status: 'current',
      requestId: 1,
      report,
    })
    expect(diagnosticsReportForState(current)).toBe(report)

    const stale = markWorkbenchDiagnosticsStale(current, 'draft changed')
    expect(stale).toMatchObject({
      status: 'stale',
      requestId: 1,
      report,
      message: 'draft changed',
    })
    expect(diagnosticsReportForState(stale)).toBe(report)
  }, 30_000)

  it('discards completed diagnostics when a running request has gone stale', () => {
    const draft = createWorkbenchDraftFromPuzzle(getCaseById(DEFAULT_CASE_ID))
    const report = evaluateWorkbenchDiagnostics(draft, DEFAULT_CASE_ID)
    if (report === undefined) throw new Error('Expected diagnostics report.')

    const running = beginWorkbenchDiagnostics(createWorkbenchDiagnosticsState())
    const changed = markWorkbenchDiagnosticsStale(running)
    const completed = completeWorkbenchDiagnostics(changed, running.requestId, report)

    expect(changed).toMatchObject({
      status: 'idle',
      requestId: running.requestId,
    })
    expect(completed).toBe(changed)
    expect(diagnosticsReportForState(completed)).toBeUndefined()
  }, 30_000)

  it('reports unavailable and failed diagnostics without fabricating a report', () => {
    const running = beginWorkbenchDiagnostics(createWorkbenchDiagnosticsState())
    const unavailable = completeWorkbenchDiagnostics(running, running.requestId, undefined)
    expect(unavailable).toMatchObject({
      status: 'unavailable',
      requestId: running.requestId,
    })
    expect(diagnosticsReportForState(unavailable)).toBeUndefined()

    const failedRunning = beginWorkbenchDiagnostics(unavailable)
    const failed = failWorkbenchDiagnostics(failedRunning, failedRunning.requestId, new Error('boom'))
    expect(failed).toMatchObject({
      status: 'failed',
      requestId: failedRunning.requestId,
      message: 'boom',
    })
    expect(diagnosticsReportForState(failed)).toBeUndefined()
  })
})
