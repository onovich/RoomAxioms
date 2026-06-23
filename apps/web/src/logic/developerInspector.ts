import type { AnalysisResult } from './analysis'
import type {
  AnalysisStatus,
  RuntimeAnalysis,
  RuntimeAnalysisError,
  RuntimeAnalysisWarning,
} from '../runtime/contracts'

export interface DeveloperInspectorInput {
  readonly devMode: boolean
  readonly requestId: number | null
  readonly status: AnalysisStatus
  readonly analysis: AnalysisResult
  readonly runtimeAnalysis: RuntimeAnalysis | null
  readonly warnings: readonly RuntimeAnalysisWarning[]
  readonly error: RuntimeAnalysisError | null
}

export interface DeveloperInspectorModel {
  readonly request: string
  readonly satisfiable: string
  readonly candidateGuestLayouts: string
  readonly forcedSafe: string
  readonly forcedGuests: string
  readonly solverStats: string
  readonly proofStats: string
  readonly noGuess: string
  readonly warnings: string
  readonly error: string | null
  readonly proofLines: readonly string[]
}

export function createDeveloperInspectorModel(
  input: DeveloperInspectorInput,
): DeveloperInspectorModel | null {
  if (!input.devMode) return null

  return {
    request: requestText(input),
    satisfiable: input.analysis.satisfiable ? 'yes' : 'no',
    candidateGuestLayouts: candidateText(input.analysis),
    forcedSafe: cellList(input.analysis.forcedSafe),
    forcedGuests: cellList(input.analysis.forcedGuests),
    solverStats: solverStatsText(input),
    proofStats: proofStatsText(input.runtimeAnalysis),
    noGuess: noGuessText(input.runtimeAnalysis),
    warnings: warningText(input.warnings),
    error: input.error?.message ?? null,
    proofLines: input.runtimeAnalysis?.proofLines.slice(0, 12) ?? [],
  }
}

function requestText(input: DeveloperInspectorInput): string {
  const requestId = input.requestId === null ? '-' : `#${input.requestId}`
  const truncated = input.analysis.truncated ? ' truncated' : ''
  return `${input.status} ${requestId}${truncated}`
}

function candidateText(analysis: AnalysisResult): string {
  const prefix = analysis.layoutCountGreaterThan === undefined ? '' : '>'
  return `${prefix}${analysis.layoutCount}`
}

function solverStatsText(input: DeveloperInspectorInput): string {
  const stats = input.runtimeAnalysis?.stats.solver ?? input.analysis.stats
  return `${stats.nodeCount} nodes / ${stats.propagationCount} props`
}

function proofStatsText(runtimeAnalysis: RuntimeAnalysis | null): string {
  if (runtimeAnalysis === null) return '-'

  return [
    `${runtimeAnalysis.stats.proof.deductionCount} deductions`,
    `${runtimeAnalysis.stats.proof.proofLineCount} lines`,
    `${runtimeAnalysis.stats.proof.issueCount} issues`,
  ].join(' / ')
}

function noGuessText(runtimeAnalysis: RuntimeAnalysis | null): string {
  const noGuess = runtimeAnalysis?.noGuess
  if (noGuess === undefined) return 'not requested'

  return [
    noGuess.noGuess ? 'no-guess pass' : 'no-guess fail',
    noGuess.humanExplainable ? 'human pass' : 'human gap',
    noGuess.guestLayoutUniqueAtEnd ? 'unique end' : 'non-unique end',
  ].join(' / ')
}

function warningText(warnings: readonly RuntimeAnalysisWarning[]): string {
  if (warnings.length === 0) return '-'
  return warnings.map((warning) => warning.code).join(', ')
}

function cellList(cellIds: readonly string[]): string {
  return cellIds.length === 0 ? '-' : cellIds.join(', ')
}
