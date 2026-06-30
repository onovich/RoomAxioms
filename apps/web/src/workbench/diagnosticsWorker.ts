import type { PuzzleDefinition } from '@room-axioms/domain'
import type { WorkbenchDraftState } from '@room-axioms/authoring/drafts'

import type { WorkbenchDiagnosticsCaps } from './model'
import { evaluateWorkbenchDiagnostics } from './model'

interface DiagnosticsWorkerRequest {
  readonly requestId: number
  readonly draft: WorkbenchDraftState
  readonly selectedCaseId: string
  readonly caps: WorkbenchDiagnosticsCaps
  readonly comparisonPuzzles: readonly PuzzleDefinition[]
}

interface DiagnosticsWorkerSuccess {
  readonly requestId: number
  readonly ok: true
  readonly report: ReturnType<typeof evaluateWorkbenchDiagnostics>
}

interface DiagnosticsWorkerFailure {
  readonly requestId: number
  readonly ok: false
  readonly message: string
}

export type DiagnosticsWorkerResponse = DiagnosticsWorkerSuccess | DiagnosticsWorkerFailure

self.onmessage = (event: MessageEvent<DiagnosticsWorkerRequest>) => {
  const request = event.data
  try {
    const report = evaluateWorkbenchDiagnostics(
      request.draft,
      request.selectedCaseId,
      request.caps,
      request.comparisonPuzzles,
    )
    self.postMessage({
      requestId: request.requestId,
      ok: true,
      report,
    } satisfies DiagnosticsWorkerResponse)
  } catch (error) {
    self.postMessage({
      requestId: request.requestId,
      ok: false,
      message: error instanceof Error ? error.message : 'Diagnostics worker failed.',
    } satisfies DiagnosticsWorkerResponse)
  }
}
