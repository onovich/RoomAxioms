import type { CellId, Observation, PuzzleDefinition } from '@room-axioms/domain'
import type { Deduction, VerificationIssue, VerificationMetrics } from '@room-axioms/proof'
import type { SolverOptions, SolverStats } from '@room-axioms/solver'

export type AnalysisStatus = 'idle' | 'loading' | 'ready' | 'error' | 'stale'

export type RuntimeRequestKind = 'ANALYZE_STATE' | 'GET_HINT' | 'VERIFY_CASE'

export type RuntimeAnalysisMode = 'player' | 'developer'

export interface RuntimeAnalysisRequest {
  readonly requestId: number
  readonly kind: RuntimeRequestKind
  readonly puzzle: PuzzleDefinition
  readonly observations: readonly Observation[]
  readonly mode: RuntimeAnalysisMode
  readonly options?: RuntimeAnalyzerOptions
}

export interface RuntimeAnalyzerOptions {
  readonly solver?: SolverOptions
  readonly candidateLayoutCap?: number
  readonly includeNoGuessReport?: boolean
}

export type RuntimeAnalysisWarningCode =
  | 'CANDIDATE_CAP_REACHED'
  | 'EXPLANATION_GAP'
  | 'INVALID_DEDUCTION'
  | 'SOLVER_TRUNCATED'
  | 'STATE_UNSAT'
  | 'TARGET_VIOLATES_RULE'
  | 'VERIFIER_ISSUE'

export interface RuntimeAnalysisWarning {
  readonly code: RuntimeAnalysisWarningCode
  readonly message: string
  readonly cellIds?: readonly CellId[]
  readonly deductionIds?: readonly string[]
}

export interface RuntimeHint {
  readonly deductionId: string
  readonly technique: Deduction['technique']
  readonly conclusion: Deduction['conclusion']
  readonly ruleIds: readonly string[]
  readonly proofLines: readonly string[]
  readonly highlight: CellId | null
}

export interface RuntimeAnalysisStats {
  readonly elapsedMs: number
  readonly solver: SolverStats
  readonly proof: {
    readonly deductionCount: number
    readonly proofLineCount: number
    readonly issueCount: number
  }
}

export interface RuntimeNoGuessSummary {
  readonly noGuess: boolean
  readonly humanExplainable: boolean
  readonly guestLayoutUniqueAtEnd: boolean
  readonly finalGuestCells: readonly CellId[] | null
  readonly issues: readonly VerificationIssue[]
  readonly metrics: VerificationMetrics
}

export interface RuntimeAnalysis {
  readonly requestId: number
  readonly status: Extract<AnalysisStatus, 'ready' | 'error'>
  readonly satisfiable: boolean
  readonly candidateGuestLayouts: number
  readonly candidateGuestLayoutsGreaterThan?: number
  readonly guestLayoutUnique: boolean
  readonly uniqueGuestCells: readonly CellId[] | null
  readonly binCandidates: readonly CellId[]
  readonly forcedSafe: readonly CellId[]
  readonly forcedGuests: readonly CellId[]
  readonly hint: RuntimeHint | null
  readonly proofLines: readonly string[]
  readonly noGuess?: RuntimeNoGuessSummary
  readonly stats: RuntimeAnalysisStats
  readonly warnings: readonly RuntimeAnalysisWarning[]
}

export type RuntimeWorkerRequest =
  | RuntimeAnalysisRequest
  | { readonly requestId: number; readonly kind: 'CANCEL'; readonly targetRequestId: number }

export type RuntimeWorkerResponse =
  | { readonly requestId: number; readonly status: 'loading' }
  | { readonly requestId: number; readonly status: 'ready'; readonly analysis: RuntimeAnalysis }
  | { readonly requestId: number; readonly status: 'stale' }
  | { readonly requestId: number; readonly status: 'error'; readonly error: RuntimeAnalysisError }

export interface RuntimeAnalysisError {
  readonly code: string
  readonly message: string
  readonly requestId?: number
}
