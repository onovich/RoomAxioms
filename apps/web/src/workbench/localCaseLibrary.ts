import { formatDraftJson, parseDraftJson, type WorkbenchDraftState } from '@room-axioms/authoring/drafts'
import type { PuzzleDefinition } from '@room-axioms/domain'

export const WORKBENCH_LOCAL_LIBRARY_VERSION = 1
export const WORKBENCH_LOCAL_LIBRARY_DB = 'room-axioms-authoring-library'
export const WORKBENCH_LOCAL_LIBRARY_STORE = 'cases'

export type WorkbenchLocalCaseState = 'draft' | 'published'

export interface WorkbenchLocalCaseRecord {
  readonly localId: string
  readonly version: number
  readonly state: WorkbenchLocalCaseState
  readonly title: string
  readonly caseName?: string
  readonly jsonText: string
  readonly createdAt: string
  readonly updatedAt: string
  readonly source: WorkbenchLocalCaseSource
}

export type WorkbenchLocalCaseSource =
  | { readonly kind: 'new' }
  | { readonly kind: 'template-copy'; readonly templateCaseId: string }

export interface WorkbenchLocalCaseStore {
  readonly loadAll: () => Promise<readonly WorkbenchLocalCaseRecord[]>
  readonly put: (record: WorkbenchLocalCaseRecord) => Promise<void>
  readonly delete: (localId: string) => Promise<void>
}

export type WorkbenchLocalCaseResult =
  | { readonly ok: true; readonly record: WorkbenchLocalCaseRecord }
  | { readonly ok: false; readonly message: string }

export function createLocalCaseFromTemplate(
  template: PuzzleDefinition,
  options: {
    readonly localId: string
    readonly title?: string
    readonly now?: Date
  },
): WorkbenchLocalCaseRecord {
  const now = timestamp(options.now)
  const title = options.title ?? `${template.caseName ?? template.title} 草稿`
  const puzzle = renamePuzzleForLocalDraft(template, options.localId, title)

  return {
    localId: options.localId,
    version: WORKBENCH_LOCAL_LIBRARY_VERSION,
    state: 'draft',
    title,
    ...(puzzle.caseName === undefined ? {} : { caseName: puzzle.caseName }),
    jsonText: formatDraftJson(puzzle),
    createdAt: now,
    updatedAt: now,
    source: {
      kind: 'template-copy',
      templateCaseId: template.id,
    },
  }
}

export function createBlankLocalCaseFromTemplate(
  template: PuzzleDefinition,
  options: {
    readonly localId: string
    readonly now?: Date
  },
): WorkbenchLocalCaseRecord {
  return createLocalCaseFromTemplate(template, {
    localId: options.localId,
    title: '未命名草稿',
    now: options.now,
  })
}

export function saveLocalCaseDraft(
  record: WorkbenchLocalCaseRecord,
  draft: WorkbenchDraftState,
  now = new Date(),
): WorkbenchLocalCaseResult {
  const parse = parseDraftJson(draft.jsonText)
  if (!parse.ok) {
    return {
      ok: false,
      message: '草稿格式还不能保存；请先修复 JSON 或结构错误。',
    }
  }

  const puzzle = parse.puzzle
  return {
    ok: true,
    record: {
      ...record,
      title: puzzle.title,
      ...(puzzle.caseName === undefined ? {} : { caseName: puzzle.caseName }),
      jsonText: draft.jsonText,
      updatedAt: timestamp(now),
    },
  }
}

export function publishLocalCase(
  record: WorkbenchLocalCaseRecord,
  now = new Date(),
): WorkbenchLocalCaseRecord {
  return {
    ...record,
    state: 'published',
    updatedAt: timestamp(now),
  }
}

export function retractLocalCase(
  record: WorkbenchLocalCaseRecord,
  now = new Date(),
): WorkbenchLocalCaseRecord {
  return {
    ...record,
    state: 'draft',
    updatedAt: timestamp(now),
  }
}

export function groupLocalCases(records: readonly WorkbenchLocalCaseRecord[]): {
  readonly draft: readonly WorkbenchLocalCaseRecord[]
  readonly published: readonly WorkbenchLocalCaseRecord[]
} {
  return {
    draft: sortLocalCases(records.filter((record) => record.state === 'draft')),
    published: sortLocalCases(records.filter((record) => record.state === 'published')),
  }
}

export function assertCanDeleteLocalCase(record: WorkbenchLocalCaseRecord | undefined): string | undefined {
  if (record === undefined) return '内置案例不能删除；请先复制成本地草稿。'
  return undefined
}

export function createMemoryLocalCaseStore(
  initialRecords: readonly WorkbenchLocalCaseRecord[] = [],
): WorkbenchLocalCaseStore {
  const records = new Map(initialRecords.map((record) => [record.localId, record]))

  return {
    async loadAll() {
      return sortLocalCases([...records.values()])
    },
    async put(record) {
      records.set(record.localId, record)
    },
    async delete(localId) {
      records.delete(localId)
    },
  }
}

export function createBrowserLocalCaseStore(): WorkbenchLocalCaseStore {
  if (typeof globalThis.indexedDB !== 'undefined') {
    return createIndexedDbLocalCaseStore(globalThis.indexedDB)
  }

  return createMemoryLocalCaseStore()
}

export function createIndexedDbLocalCaseStore(indexedDb: IDBFactory): WorkbenchLocalCaseStore {
  return {
    async loadAll() {
      const db = await openLocalCasesDb(indexedDb)
      return new Promise<readonly WorkbenchLocalCaseRecord[]>((resolve, reject) => {
        const transaction = db.transaction(WORKBENCH_LOCAL_LIBRARY_STORE, 'readonly')
        const request = transaction.objectStore(WORKBENCH_LOCAL_LIBRARY_STORE).getAll()
        request.onerror = () => reject(request.error ?? new Error('Unable to load local cases.'))
        request.onsuccess = () => resolve(sortLocalCases(request.result as WorkbenchLocalCaseRecord[]))
      }).finally(() => db.close())
    },
    async put(record) {
      const db = await openLocalCasesDb(indexedDb)
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(WORKBENCH_LOCAL_LIBRARY_STORE, 'readwrite')
        const request = transaction.objectStore(WORKBENCH_LOCAL_LIBRARY_STORE).put(record)
        request.onerror = () => reject(request.error ?? new Error('Unable to save local case.'))
        request.onsuccess = () => resolve()
      }).finally(() => db.close())
    },
    async delete(localId) {
      const db = await openLocalCasesDb(indexedDb)
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(WORKBENCH_LOCAL_LIBRARY_STORE, 'readwrite')
        const request = transaction.objectStore(WORKBENCH_LOCAL_LIBRARY_STORE).delete(localId)
        request.onerror = () => reject(request.error ?? new Error('Unable to delete local case.'))
        request.onsuccess = () => resolve()
      }).finally(() => db.close())
    },
  }
}

function openLocalCasesDb(indexedDb: IDBFactory): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDb.open(WORKBENCH_LOCAL_LIBRARY_DB, WORKBENCH_LOCAL_LIBRARY_VERSION)
    request.onerror = () => reject(request.error ?? new Error('Unable to open local authoring library.'))
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(WORKBENCH_LOCAL_LIBRARY_STORE)) {
        db.createObjectStore(WORKBENCH_LOCAL_LIBRARY_STORE, { keyPath: 'localId' })
      }
    }
    request.onsuccess = () => resolve(request.result)
  })
}

function renamePuzzleForLocalDraft(
  template: PuzzleDefinition,
  localId: string,
  title: string,
): PuzzleDefinition {
  return {
    ...template,
    id: localId,
    title,
    caseName: title,
    metadata: {
      ...template.metadata,
      status: 'draft',
      tags: uniqueStrings([...template.metadata.tags, 'local-authoring']),
      notes: [
        template.metadata.notes,
        `Local authoring draft copied from ${template.id}.`,
      ].filter((value): value is string => value !== undefined && value.trim() !== '').join(' '),
    },
  }
}

function sortLocalCases(records: readonly WorkbenchLocalCaseRecord[]): readonly WorkbenchLocalCaseRecord[] {
  return [...records].sort((left, right) => {
    const time = right.updatedAt.localeCompare(left.updatedAt)
    if (time !== 0) return time
    return left.title.localeCompare(right.title)
  })
}

function uniqueStrings(values: readonly string[]): readonly string[] {
  return [...new Set(values)]
}

function timestamp(date = new Date()): string {
  return date.toISOString()
}
