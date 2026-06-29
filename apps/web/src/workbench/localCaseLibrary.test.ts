import { describe, expect, it } from 'vitest'

import { updateDraftJsonText } from '@room-axioms/authoring/drafts'

import { getCaseById } from '../content/cases'
import {
  assertCanDeleteLocalCase,
  createBlankLocalCaseFromTemplate,
  createLocalCaseFromTemplate,
  createMemoryLocalCaseStore,
  groupLocalCases,
  publishLocalCase,
  retractLocalCase,
  saveLocalCaseDraft,
  WORKBENCH_LOCAL_LIBRARY_VERSION,
} from './localCaseLibrary'
import { createWorkbenchDraftFromPuzzle } from './model'

describe('workbench local case library model', () => {
  it('copies a built-in case into a local draft without mutating the template', () => {
    const template = getCaseById('case-004')
    const record = createLocalCaseFromTemplate(template, {
      localId: 'local-case-004-copy',
      title: '手工草稿',
      now: new Date('2026-06-30T00:00:00.000Z'),
    })

    expect(record).toMatchObject({
      localId: 'local-case-004-copy',
      version: WORKBENCH_LOCAL_LIBRARY_VERSION,
      state: 'draft',
      title: '手工草稿',
      caseName: '手工草稿',
      createdAt: '2026-06-30T00:00:00.000Z',
      updatedAt: '2026-06-30T00:00:00.000Z',
      source: {
        kind: 'template-copy',
        templateCaseId: 'case-004',
      },
    })
    expect(JSON.parse(record.jsonText)).toMatchObject({
      id: 'local-case-004-copy',
      title: '手工草稿',
      metadata: {
        status: 'draft',
        tags: expect.arrayContaining(['local-authoring']),
      },
    })
    expect(template.id).toBe('case-004')
  })

  it('creates a blank local draft from the default template vocabulary', () => {
    const template = getCaseById('case-004')
    const record = createBlankLocalCaseFromTemplate(template, {
      localId: 'local-blank',
      now: new Date('2026-06-30T00:01:00.000Z'),
    })

    expect(record.title).toBe('未命名草稿')
    expect(record.state).toBe('draft')
    expect(JSON.parse(record.jsonText)).toMatchObject({
      id: 'local-blank',
      caseName: '未命名草稿',
    })
  })

  it('saves schema-valid local drafts while preserving diagnostic-invalid puzzles for later repair', () => {
    const template = getCaseById('case-004')
    const record = createLocalCaseFromTemplate(template, {
      localId: 'local-save',
      now: new Date('2026-06-30T00:00:00.000Z'),
    })
    const draft = updateDraftJsonText(
      createWorkbenchDraftFromPuzzle(template),
      JSON.stringify({
        ...template,
        id: 'local-save',
        title: '保存后的草稿',
        caseName: '保存后的草稿',
        metadata: {
          ...template.metadata,
          status: 'draft',
        },
        initialReveals: [],
      }, null, 2),
    )
    const result = saveLocalCaseDraft(record, draft, new Date('2026-06-30T00:02:00.000Z'))

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error(result.message)
    expect(result.record).toMatchObject({
      title: '保存后的草稿',
      caseName: '保存后的草稿',
      updatedAt: '2026-06-30T00:02:00.000Z',
    })
    expect(JSON.parse(result.record.jsonText)).toMatchObject({
      initialReveals: [],
    })
  })

  it('rejects saving malformed drafts before storage is updated', () => {
    const template = getCaseById('case-004')
    const record = createLocalCaseFromTemplate(template, { localId: 'local-invalid' })
    const invalidDraft = updateDraftJsonText(createWorkbenchDraftFromPuzzle(template), '{ "id": "broken"')
    const result = saveLocalCaseDraft(record, invalidDraft)

    expect(result).toMatchObject({
      ok: false,
      message: expect.stringContaining('不能保存'),
    })
  })

  it('publishes, retracts, groups, and sorts local cases', () => {
    const template = getCaseById('case-004')
    const older = createLocalCaseFromTemplate(template, {
      localId: 'older',
      title: '旧草稿',
      now: new Date('2026-06-30T00:00:00.000Z'),
    })
    const newer = createLocalCaseFromTemplate(template, {
      localId: 'newer',
      title: '新草稿',
      now: new Date('2026-06-30T00:02:00.000Z'),
    })
    const published = publishLocalCase(older, new Date('2026-06-30T00:03:00.000Z'))
    const retracted = retractLocalCase(published, new Date('2026-06-30T00:04:00.000Z'))

    expect(published.state).toBe('published')
    expect(retracted.state).toBe('draft')
    expect(groupLocalCases([older, newer, published])).toMatchObject({
      draft: [
        { localId: 'newer' },
        { localId: 'older' },
      ],
      published: [
        { localId: 'older' },
      ],
    })
  })

  it('persists local cases through the memory store and deletes only local records', async () => {
    const template = getCaseById('case-004')
    const record = createLocalCaseFromTemplate(template, { localId: 'local-store' })
    const store = createMemoryLocalCaseStore()

    await store.put(record)
    expect(await store.loadAll()).toEqual([record])
    await store.delete(record.localId)
    expect(await store.loadAll()).toEqual([])
    expect(assertCanDeleteLocalCase(record)).toBeUndefined()
    expect(assertCanDeleteLocalCase(undefined)).toContain('内置案例不能删除')
  })
})
