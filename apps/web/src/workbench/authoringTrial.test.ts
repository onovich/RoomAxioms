import { describe, expect, it } from 'vitest'

import { contentCases } from '../content/cases'
import { getWorkbenchCaseImportById } from './caseLibrary'
import {
  createWorkbenchDraftFromPuzzle,
  createWorkbenchScopeCollectionsJson,
  createWorkbenchShellModel,
  evaluateWorkbenchDiagnostics,
  patchWorkbenchMetadata,
  patchWorkbenchRulePresentation,
  patchWorkbenchScopeCollectionsJson,
} from './model'

describe('authoring workbench trial', () => {
  it('repairs highlight-dependent copy while preserving unresolved mechanical warnings', () => {
    const fixture = getWorkbenchCaseImportById('phase-25-singleton-region-giveaway').puzzle
    const before = evaluateWorkbenchDiagnostics(createWorkbenchDraftFromPuzzle(fixture), fixture.id)

    expect(before?.status).toBe('valid-degenerate')
    expect(before?.copyWarnings.map((warning) => warning.code)).toEqual(expect.arrayContaining([
      'COPY_INTERNAL_TERM',
      'COPY_SCOPE_NEEDS_EXPLICIT_TEXT',
      'COPY_DIRECT_SAFE_GIVEAWAY',
    ]))

    const regionPatch = patchWorkbenchScopeCollectionsJson(
      createWorkbenchDraftFromPuzzle(fixture),
      JSON.stringify({
        regions: [
          {
            id: 'east-room',
            title: 'A1 and B1',
            cells: ['A1', 'B1'],
          },
        ],
        anchors: [],
      }, null, 2),
    )
    expect(regionPatch.ok).toBe(true)
    if (!regionPatch.ok) throw new Error('Trial region patch failed.')

    const rulePatch = patchWorkbenchRulePresentation(regionPatch.state, {
      ruleId: 'ZR1',
      title: 'A1 and B1 count',
      flavor: 'A1 and B1 contain exactly one no-guest cell.',
    })
    expect(rulePatch.ok).toBe(true)
    if (!rulePatch.ok) throw new Error('Trial rule-copy patch failed.')

    const metadataPatch = patchWorkbenchMetadata(rulePatch.state, {
      title: 'Phase 25 workbench trial - copy repair',
      caseName: 'Phase 25 Trial - Copy Repair Only',
      difficulty: 1,
      tags: ['phase-25', 'authoring-trial', 'workbench-only', 'not-for-promotion'],
      status: 'draft',
      notes: 'Workbench trial: copy and scope wording were repaired, but direct-giveaway and degeneracy warnings remain.',
    })
    expect(metadataPatch.ok).toBe(true)
    if (!metadataPatch.ok) throw new Error('Trial metadata patch failed.')

    const after = evaluateWorkbenchDiagnostics(metadataPatch.state, fixture.id)
    const trialModel = createWorkbenchShellModel([], fixture.id, metadataPatch.state)
    const trialPuzzle = trialModel.exported.puzzle

    expect(after?.status).toBe('valid-degenerate')
    expect(after?.quality?.degeneracy.status).toBe('fail')
    expect(after?.copyWarnings.map((warning) => warning.code)).not.toContain('COPY_INTERNAL_TERM')
    expect(after?.copyWarnings.map((warning) => warning.code)).not.toContain('COPY_SCOPE_NEEDS_EXPLICIT_TEXT')
    expect(after?.copyWarnings.map((warning) => warning.code)).toContain('COPY_DIRECT_SAFE_GIVEAWAY')
    expect(trialModel.exportStatus).toMatchObject({
      ok: true,
      fileName: 'phase-25-singleton-region-giveaway-workbench-draft.json',
      issueCount: 0,
    })
    expect(trialPuzzle).toMatchObject({
      title: 'Phase 25 workbench trial - copy repair',
      caseName: 'Phase 25 Trial - Copy Repair Only',
      metadata: {
        difficulty: 1,
        tags: ['phase-25', 'authoring-trial', 'workbench-only', 'not-for-promotion'],
        status: 'draft',
      },
      regions: [
        {
          id: 'east-room',
          title: 'A1 and B1',
          cells: ['A1', 'B1'],
        },
      ],
    })
    expect(trialPuzzle?.rules.find((rule) => rule.id === 'ZR1')?.presentation).toEqual({
      title: 'A1 and B1 count',
      flavor: 'A1 and B1 contain exactly one no-guest cell.',
    })
    expect(createWorkbenchScopeCollectionsJson(trialPuzzle)).toContain('"title": "A1 and B1"')
    expect(contentCases.map((puzzle) => puzzle.id)).not.toContain('phase-25-singleton-region-giveaway')
  }, 60_000)
})
