import type { AuthoringDiagnosticsGroupId, AuthoringDraftDiagnosticsReport } from '@room-axioms/authoring/diagnostics'

import type { WorkbenchDiagnosticsCaps } from './model'
import { evaluateWorkbenchDiagnostics } from './model'
import type { WorkbenchDraftState } from '@room-axioms/authoring/drafts'
import type { PuzzleDefinition } from '@room-axioms/domain'
import type { DiagnosticsWorkerResponse } from './diagnosticsWorker'

export type WorkbenchDiagnosticOptionId =
  | 'can-solve'
  | 'unique-answer'
  | 'no-guess'
  | 'rule-contribution'
  | 'degeneracy'
  | 'clone-risk'
  | 'difficulty'
  | 'copy'
  | 'performance'

export interface WorkbenchDiagnosticOption {
  readonly id: WorkbenchDiagnosticOptionId
  readonly label: string
  readonly description: string
  readonly groupIds: readonly AuthoringDiagnosticsGroupId[]
}

export interface WorkbenchDiagnosticProgress {
  readonly completedSteps: number
  readonly totalSteps: number
  readonly currentLabel: string
}

export interface RunSelectedWorkbenchDiagnosticsInput {
  readonly draft: WorkbenchDraftState
  readonly selectedCaseId: string
  readonly selectedIds: readonly WorkbenchDiagnosticOptionId[]
  readonly caps: WorkbenchDiagnosticsCaps
  readonly comparisonPuzzles: readonly PuzzleDefinition[]
  readonly signal: AbortSignal
  readonly onProgress?: (progress: WorkbenchDiagnosticProgress) => void
  readonly evaluate?: EvaluateWorkbenchDiagnostics
}

type EvaluateWorkbenchDiagnostics = (
  draft: WorkbenchDraftState,
  selectedCaseId: string,
  caps: WorkbenchDiagnosticsCaps,
  comparisonPuzzles: readonly PuzzleDefinition[],
  selectedIds: readonly WorkbenchDiagnosticOptionId[],
) => AuthoringDraftDiagnosticsReport | undefined | Promise<AuthoringDraftDiagnosticsReport | undefined>

type CoreDiagnosticsResult =
  | {
      readonly status: 'completed'
      readonly report: AuthoringDraftDiagnosticsReport | undefined
    }
  | {
      readonly status: 'cancelled'
    }

export type RunSelectedWorkbenchDiagnosticsResult =
  | {
      readonly status: 'completed'
      readonly report: AuthoringDraftDiagnosticsReport | undefined
    }
  | {
      readonly status: 'cancelled'
      readonly report?: AuthoringDraftDiagnosticsReport
    }

export const WORKBENCH_DIAGNOSTIC_OPTIONS: readonly WorkbenchDiagnosticOption[] = [
  {
    id: 'can-solve',
    label: '能不能成立',
    description: '检查当前规则和初始信息是否至少存在一个有效解。',
    groupIds: ['correctness'],
  },
  {
    id: 'unique-answer',
    label: '答案是不是唯一',
    description: '检查最终异常布局是否能被唯一确定。',
    groupIds: ['human-proof'],
  },
  {
    id: 'no-guess',
    label: '能不能不靠猜解开',
    description: '检查人类推理链是否能在不猜的情况下完成。',
    groupIds: ['human-proof'],
  },
  {
    id: 'rule-contribution',
    label: '每条规则有没有用',
    description: '检查规则是否真的缩小了解空间，提示冗余规则。',
    groupIds: ['quality'],
  },
  {
    id: 'degeneracy',
    label: '有没有白送答案',
    description: '检查单格视线、直接边缘赠送、过度揭示等退化问题。',
    groupIds: ['quality'],
  },
  {
    id: 'clone-risk',
    label: '有没有太像旧案例',
    description: '发布前慢检查：对照内置案例和本地已发布案例，提示克隆或填充风险。',
    groupIds: ['clone-risk'],
  },
  {
    id: 'difficulty',
    label: '大概难度',
    description: '估算推理波数、步骤数、规则材料和分支压力等未校准信号。',
    groupIds: ['difficulty'],
  },
  {
    id: 'copy',
    label: '文案是否清晰',
    description: '检查内部术语、范围说明不清、只靠高亮理解等文案风险。',
    groupIds: ['copy'],
  },
  {
    id: 'performance',
    label: '会不会太慢',
    description: '检查上限、耗时风险和是否需要缩小诊断范围。',
    groupIds: ['performance'],
  },
]

export const DEFAULT_WORKBENCH_DIAGNOSTIC_IDS: readonly WorkbenchDiagnosticOptionId[] =
  WORKBENCH_DIAGNOSTIC_OPTIONS
    .filter((option) => option.id !== 'clone-risk')
    .map((option) => option.id)

export const ALL_WORKBENCH_DIAGNOSTIC_IDS: readonly WorkbenchDiagnosticOptionId[] =
  WORKBENCH_DIAGNOSTIC_OPTIONS.map((option) => option.id)

export async function runSelectedWorkbenchDiagnostics(
  input: RunSelectedWorkbenchDiagnosticsInput,
): Promise<RunSelectedWorkbenchDiagnosticsResult> {
  const selectedGroups = selectedGroupIds(input.selectedIds)
  const totalSteps = 2 + selectedGroups.length
  let completedSteps = 0

  input.onProgress?.({
    completedSteps,
    totalSteps,
    currentLabel: '准备诊断草稿',
  })
  await yieldToBrowser()
  if (input.signal.aborted) return { status: 'cancelled' }

  input.onProgress?.({
    completedSteps,
    totalSteps,
    currentLabel: '运行已选择的核心检查',
  })
  const coreResult = await evaluateDiagnosticsCore(input)
  if (coreResult.status === 'cancelled') return { status: 'cancelled' }
  const fullReport = coreResult.report
  completedSteps += 1
  await yieldToBrowser()
  if (input.signal.aborted) {
    return {
      status: 'cancelled',
      ...(fullReport === undefined ? {} : { report: filterDiagnosticsReport(fullReport, input.selectedIds) }),
    }
  }

  let partialReport: AuthoringDraftDiagnosticsReport | undefined
  const processedGroups: AuthoringDiagnosticsGroupId[] = ['blocking-errors']
  for (const groupId of selectedGroups) {
    input.onProgress?.({
      completedSteps,
      totalSteps,
      currentLabel: diagnosticGroupLabel(groupId),
    })
    processedGroups.push(groupId)
    partialReport = fullReport === undefined ? undefined : filterDiagnosticsReportByGroups(fullReport, processedGroups)
    completedSteps += 1
    await yieldToBrowser()
    if (input.signal.aborted) {
      return {
        status: 'cancelled',
        ...(partialReport === undefined ? {} : { report: partialReport }),
      }
    }
  }

  input.onProgress?.({
    completedSteps: totalSteps,
    totalSteps,
    currentLabel: '诊断完成',
  })

  return {
    status: 'completed',
    report: fullReport === undefined ? undefined : filterDiagnosticsReport(fullReport, input.selectedIds),
  }
}

export function filterDiagnosticsReport(
  report: AuthoringDraftDiagnosticsReport,
  selectedIds: readonly WorkbenchDiagnosticOptionId[],
): AuthoringDraftDiagnosticsReport {
  return filterDiagnosticsReportByGroups(report, ['blocking-errors', ...selectedGroupIds(selectedIds)])
}

function filterDiagnosticsReportByGroups(
  report: AuthoringDraftDiagnosticsReport,
  groupIds: readonly AuthoringDiagnosticsGroupId[],
): AuthoringDraftDiagnosticsReport {
  const selected = new Set(groupIds)

  return {
    ...report,
    groups: report.groups.filter((group) => selected.has(group.id)),
  }
}

function selectedGroupIds(selectedIds: readonly WorkbenchDiagnosticOptionId[]): readonly AuthoringDiagnosticsGroupId[] {
  const selected = new Set(selectedIds)
  const groups = new Set<AuthoringDiagnosticsGroupId>()
  for (const option of WORKBENCH_DIAGNOSTIC_OPTIONS) {
    if (!selected.has(option.id)) continue
    for (const groupId of option.groupIds) groups.add(groupId)
  }

  return [...groups]
}

function diagnosticGroupLabel(groupId: AuthoringDiagnosticsGroupId): string {
  switch (groupId) {
    case 'blocking-errors':
      return '检查草稿结构'
    case 'correctness':
      return '检查是否成立'
    case 'human-proof':
      return '检查唯一性和无猜推理'
    case 'quality':
      return '检查规则贡献和白送答案'
    case 'clone-risk':
      return '检查旧案例相似度'
    case 'difficulty':
      return '估算难度信号'
    case 'copy':
      return '检查文案清晰度'
    case 'performance':
      return '检查耗时和上限'
  }
}

async function evaluateDiagnosticsCore(
  input: RunSelectedWorkbenchDiagnosticsInput,
): Promise<CoreDiagnosticsResult> {
  if (input.evaluate !== undefined) {
    const report = await input.evaluate(
      input.draft,
      input.selectedCaseId,
      input.caps,
      input.comparisonPuzzles,
      input.selectedIds,
    )
    return input.signal.aborted ? { status: 'cancelled' } : { status: 'completed', report }
  }

  if (typeof Worker === 'undefined') {
    const report = evaluateWorkbenchDiagnostics(
      input.draft,
      input.selectedCaseId,
      input.caps,
      input.comparisonPuzzles,
      input.selectedIds,
    )
    return input.signal.aborted ? { status: 'cancelled' } : { status: 'completed', report }
  }

  return evaluateDiagnosticsInWorker(input)
}

function evaluateDiagnosticsInWorker(
  input: RunSelectedWorkbenchDiagnosticsInput,
): Promise<CoreDiagnosticsResult> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./diagnosticsWorker.ts', import.meta.url), { type: 'module' })
    const requestId = Date.now()
    let settled = false

    const cleanup = () => {
      input.signal.removeEventListener('abort', onAbort)
      worker.removeEventListener('message', onMessage)
      worker.removeEventListener('error', onError)
      worker.terminate()
    }

    const settle = (result: CoreDiagnosticsResult) => {
      if (settled) return
      settled = true
      cleanup()
      resolve(result)
    }

    function onAbort(): void {
      settle({ status: 'cancelled' })
    }

    function onMessage(event: MessageEvent<DiagnosticsWorkerResponse>): void {
      const response = event.data
      if (response.requestId !== requestId) return
      if (!response.ok) {
        cleanup()
        reject(new Error(response.message))
        return
      }
      settle({ status: 'completed', report: response.report })
    }

    function onError(event: ErrorEvent): void {
      cleanup()
      reject(new Error(event.message || 'Diagnostics worker failed.'))
    }

    if (input.signal.aborted) {
      worker.terminate()
      resolve({ status: 'cancelled' })
      return
    }

    input.signal.addEventListener('abort', onAbort, { once: true })
    worker.addEventListener('message', onMessage)
    worker.addEventListener('error', onError)
    worker.postMessage({
      requestId,
      draft: input.draft,
      selectedCaseId: input.selectedCaseId,
      selectedIds: input.selectedIds,
      caps: input.caps,
      comparisonPuzzles: input.comparisonPuzzles,
    })
  })
}

function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, 0)
  })
}
