import { analyzeRuntimeState, type RuntimeAnalyzerDependencies } from './analyzer'
import type {
  AnalysisStatus,
  RuntimeAnalysis,
  RuntimeAnalysisError,
  RuntimeAnalysisRequest,
  RuntimeWorkerRequest,
  RuntimeWorkerResponse,
} from './contracts'

export type RuntimeAnalysisInput = Omit<RuntimeAnalysisRequest, 'requestId'>

export type RuntimeAnalyzeHandler = (
  request: RuntimeAnalysisRequest,
) => RuntimeAnalysis | Promise<RuntimeAnalysis>

export type RuntimeResponseListener = (response: RuntimeWorkerResponse) => void

export interface RuntimeFacadeSnapshot {
  readonly requestId: number | null
  readonly status: AnalysisStatus
  readonly analysis: RuntimeAnalysis | null
  readonly error: RuntimeAnalysisError | null
}

export interface RuntimeFacadeOptions {
  readonly analyze?: RuntimeAnalyzeHandler
  readonly dependencies?: RuntimeAnalyzerDependencies
  readonly onResponse?: RuntimeResponseListener
}

export class RuntimeAnalysisFacade {
  private readonly analyze: RuntimeAnalyzeHandler
  private readonly onResponse?: RuntimeResponseListener
  private nextRequestId = 1
  private activeRequestId: number | null = null
  private readonly cancelledRequestIds = new Set<number>()
  private snapshot: RuntimeFacadeSnapshot = {
    requestId: null,
    status: 'idle',
    analysis: null,
    error: null,
  }

  constructor(options: RuntimeFacadeOptions = {}) {
    this.analyze = options.analyze ?? ((request) => analyzeRuntimeState(request, options.dependencies))
    this.onResponse = options.onResponse
  }

  getSnapshot(): RuntimeFacadeSnapshot {
    return this.snapshot
  }

  submit(input: RuntimeAnalysisInput): number {
    return this.submitRequest({
      ...input,
      requestId: this.nextRequestId,
    })
  }

  submitRequest(request: RuntimeAnalysisRequest): number {
    this.nextRequestId = Math.max(this.nextRequestId, request.requestId + 1)
    this.supersedeActiveRequest()
    this.activeRequestId = request.requestId
    this.cancelledRequestIds.delete(request.requestId)
    this.emit({ requestId: request.requestId, status: 'loading' })
    void this.runRequest(request)
    return request.requestId
  }

  dispatch(message: RuntimeWorkerRequest): number | null {
    if (message.kind === 'CANCEL') {
      return this.cancel(message.targetRequestId) ? message.targetRequestId : null
    }

    return this.submitRequest(message)
  }

  cancel(requestId: number | null = this.activeRequestId): boolean {
    if (requestId === null) return false

    this.cancelledRequestIds.add(requestId)
    if (this.activeRequestId !== requestId) return false

    this.activeRequestId = null
    this.emit({ requestId, status: 'stale' })
    return true
  }

  handleResponse(response: RuntimeWorkerResponse): boolean {
    if (this.isStale(response.requestId)) {
      return false
    }

    if (response.status === 'stale') {
      this.cancel(response.requestId)
      return true
    }

    if (response.status === 'ready' || response.status === 'error') {
      this.activeRequestId = null
    }

    this.emit(response)
    return true
  }

  private async runRequest(request: RuntimeAnalysisRequest): Promise<void> {
    try {
      await Promise.resolve()
      if (this.isStale(request.requestId)) return

      const analysis = await this.analyze(request)
      this.handleResponse({
        requestId: request.requestId,
        status: 'ready',
        analysis,
      })
    } catch (error) {
      this.handleResponse({
        requestId: request.requestId,
        status: 'error',
        error: toRuntimeAnalysisError(error, request.requestId),
      })
    }
  }

  private supersedeActiveRequest(): void {
    if (this.activeRequestId === null) return

    const requestId = this.activeRequestId
    this.cancelledRequestIds.add(requestId)
    this.activeRequestId = null
    this.emit({ requestId, status: 'stale' })
  }

  private isStale(requestId: number): boolean {
    return this.activeRequestId !== requestId || this.cancelledRequestIds.has(requestId)
  }

  private emit(response: RuntimeWorkerResponse): void {
    this.snapshot = reduceSnapshot(response)
    this.onResponse?.(response)
  }
}

export function createRuntimeAnalysisFacade(options: RuntimeFacadeOptions = {}): RuntimeAnalysisFacade {
  return new RuntimeAnalysisFacade(options)
}

function reduceSnapshot(response: RuntimeWorkerResponse): RuntimeFacadeSnapshot {
  switch (response.status) {
    case 'loading':
      return {
        requestId: response.requestId,
        status: 'loading',
        analysis: null,
        error: null,
      }
    case 'ready':
      return {
        requestId: response.requestId,
        status: 'ready',
        analysis: response.analysis,
        error: null,
      }
    case 'error':
      return {
        requestId: response.requestId,
        status: 'error',
        analysis: null,
        error: response.error,
      }
    case 'stale':
      return {
        requestId: response.requestId,
        status: 'stale',
        analysis: null,
        error: null,
      }
  }
}

function toRuntimeAnalysisError(error: unknown, requestId: number): RuntimeAnalysisError {
  if (error instanceof Error) {
    return {
      code: 'RUNTIME_ANALYSIS_FAILED',
      message: error.message,
      requestId,
    }
  }

  return {
    code: 'RUNTIME_ANALYSIS_FAILED',
    message: String(error),
    requestId,
  }
}
