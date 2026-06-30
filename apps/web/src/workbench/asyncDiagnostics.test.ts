import { afterEach, describe, expect, it, vi } from 'vitest'

import type { AuthoringDraftDiagnosticsReport } from '@room-axioms/authoring/diagnostics'

import { getCaseById } from '../content/cases'
import {
  DEFAULT_WORKBENCH_DIAGNOSTIC_IDS,
  filterDiagnosticsReport,
  runSelectedWorkbenchDiagnostics,
  WORKBENCH_DIAGNOSTIC_OPTIONS,
} from './asyncDiagnostics'
import {
  createWorkbenchDraftFromPuzzle,
  defaultWorkbenchDiagnosticsCaps,
  evaluateWorkbenchDiagnostics,
} from './model'

describe('workbench async diagnostics', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('defines plain-language selectable checks without internal primary labels', () => {
    expect(WORKBENCH_DIAGNOSTIC_OPTIONS.map((option) => option.label)).toEqual([
      '能不能成立',
      '答案是不是唯一',
      '能不能不靠猜解开',
      '每条规则有没有用',
      '有没有白送答案',
      '有没有太像旧案例',
      '大概难度',
      '文案是否清晰',
      '会不会太慢',
    ])
    expect(WORKBENCH_DIAGNOSTIC_OPTIONS.map((option) => `${option.label} ${option.description}`).join('\n'))
      .not.toMatch(/solver|CSP|proof DAG|candidateGuestLayouts|truncated/i)
  })

  it('filters a full diagnostics report to selected user checks', () => {
    const draft = createWorkbenchDraftFromPuzzle(getCaseById('case-004'))
    const report = evaluateWorkbenchDiagnostics(draft, 'case-004')
    if (report === undefined) throw new Error('Expected diagnostics report.')

    const filtered = filterDiagnosticsReport(report, ['can-solve', 'copy'])

    expect(filtered.groups.map((group) => group.id)).toEqual([
      'blocking-errors',
      'correctness',
      'copy',
    ])
  }, 30_000)

  it('runs selected diagnostics with progress and filtered results', async () => {
    const draft = createWorkbenchDraftFromPuzzle(getCaseById('case-004'))
    const progressLabels: string[] = []
    const result = await runSelectedWorkbenchDiagnostics({
      draft,
      selectedCaseId: 'case-004',
      selectedIds: ['can-solve', 'difficulty'],
      caps: defaultWorkbenchDiagnosticsCaps(),
      comparisonPuzzles: [],
      signal: new AbortController().signal,
      onProgress: (progress) => progressLabels.push(progress.currentLabel),
    })

    expect(result.status).toBe('completed')
    if (result.status !== 'completed' || result.report === undefined) throw new Error('Expected completed report.')
    expect(result.report.groups.map((group) => group.id)).toEqual([
      'blocking-errors',
      'correctness',
      'difficulty',
    ])
    expect(progressLabels).toEqual(expect.arrayContaining([
      '准备诊断草稿',
      '运行已选择的核心检查',
      '诊断完成',
    ]))
  }, 30_000)

  it('passes selected check ids to the injected diagnostics evaluator', async () => {
    const draft = createWorkbenchDraftFromPuzzle(getCaseById('case-004'))
    const seenSelectedIds: string[][] = []
    const result = await runSelectedWorkbenchDiagnostics({
      draft,
      selectedCaseId: 'case-004',
      selectedIds: ['copy'],
      caps: defaultWorkbenchDiagnosticsCaps(),
      comparisonPuzzles: [],
      signal: new AbortController().signal,
      evaluate: (_draft, _selectedCaseId, _caps, _comparisonPuzzles, selectedIds) => {
        seenSelectedIds.push([...selectedIds])
        return syntheticReport()
      },
    })

    expect(result.status).toBe('completed')
    expect(seenSelectedIds).toEqual([['copy']])
  })

  it('returns partial results when cancellation happens after the core report is available', async () => {
    const draft = createWorkbenchDraftFromPuzzle(getCaseById('case-004'))
    const controller = new AbortController()
    let progressCount = 0
    const result = await runSelectedWorkbenchDiagnostics({
      draft,
      selectedCaseId: 'case-004',
      selectedIds: DEFAULT_WORKBENCH_DIAGNOSTIC_IDS,
      caps: defaultWorkbenchDiagnosticsCaps(),
      comparisonPuzzles: [],
      signal: controller.signal,
      evaluate: () => syntheticReport(),
      onProgress: () => {
        progressCount += 1
        if (progressCount === 3) controller.abort()
      },
    })

    expect(result.status).toBe('cancelled')
    if (result.status !== 'cancelled') throw new Error('Expected cancelled diagnostics.')
    expect(result.report?.groups.length).toBeGreaterThan(0)
  })

  it('runs browser diagnostics in a cancellable worker instead of a main-thread core block', async () => {
    const workers: FakeDiagnosticsWorker[] = []
    vi.stubGlobal('Worker', class extends FakeDiagnosticsWorker {
      constructor(url: URL, options?: WorkerOptions) {
        super(url, options)
        workers.push(this)
      }
    })

    const draft = createWorkbenchDraftFromPuzzle(getCaseById('case-004'))
    const controller = new AbortController()
    const progressLabels: string[] = []
    const resultPromise = runSelectedWorkbenchDiagnostics({
      draft,
      selectedCaseId: 'case-004',
      selectedIds: DEFAULT_WORKBENCH_DIAGNOSTIC_IDS,
      caps: defaultWorkbenchDiagnosticsCaps(),
      comparisonPuzzles: [],
      signal: controller.signal,
      onProgress: (progress) => progressLabels.push(progress.currentLabel),
    })

    await new Promise((resolve) => setTimeout(resolve, 0))
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(workers).toHaveLength(1)
    expect(workers[0]?.postedMessage).toMatchObject({
      selectedCaseId: 'case-004',
      selectedIds: DEFAULT_WORKBENCH_DIAGNOSTIC_IDS,
    })

    controller.abort()
    const result = await resultPromise

    expect(result.status).toBe('cancelled')
    expect(workers[0]?.terminated).toBe(true)
    expect(progressLabels.length).toBeGreaterThanOrEqual(2)
  })
})

class FakeDiagnosticsWorker extends EventTarget {
  readonly url: URL
  readonly options: WorkerOptions | undefined
  postedMessage: unknown
  terminated = false

  constructor(url: URL, options?: WorkerOptions) {
    super()
    this.url = url
    this.options = options
  }

  postMessage(message: unknown): void {
    this.postedMessage = message
  }

  terminate(): void {
    this.terminated = true
  }
}

function syntheticReport(): AuthoringDraftDiagnosticsReport {
  return {
    ok: false,
    status: 'valid-review-needed',
    validation: {
      sourcePath: '<test>',
      resolvedPath: '<test>',
      caps: defaultWorkbenchDiagnosticsCaps(),
      schema: {
        ok: true,
        issueCount: 0,
        issues: [],
      },
      recommendation: 'ready-for-experimental-review',
    },
    copyWarnings: [],
    groups: [
      group('blocking-errors'),
      group('correctness'),
      group('human-proof'),
      group('quality'),
      group('clone-risk'),
      group('difficulty'),
      group('copy'),
      group('performance'),
    ],
    performance: {
      truncated: false,
      capWarnings: [],
    },
  }
}

function group(id: AuthoringDraftDiagnosticsReport['groups'][number]['id']): AuthoringDraftDiagnosticsReport['groups'][number] {
  return {
    id,
    title: id,
    status: 'info',
    items: [{
      code: `${id}-ok`,
      severity: 'info',
      message: id,
    }],
  }
}
