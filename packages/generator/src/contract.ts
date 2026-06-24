import type {
  BoardSize,
  CellId,
  CellKind,
  Observation,
  PuzzleDefinition,
  PuzzleMetadata,
  RuleDefinition,
} from '@room-axioms/domain'
import type { TechniqueId, VerificationReport } from '@room-axioms/proof'
import type { SolverOptions, SolverStats } from '@room-axioms/solver'

export const GENERATOR_PACKAGE_NAME = '@room-axioms/generator' as const

export const GENERATOR_SPIKE_VERSION = 'phase-9-spike-v1' as const

export type GeneratorArtifactPolicy =
  | 'report-only'
  | 'content-experimental'
  | 'candidate-for-planner-promotion'

export type GeneratorValidationStage =
  | 'schema'
  | 'target-rules'
  | 'initial-satisfiable'
  | 'final-guest-layout-unique'
  | 'proof-no-guess'
  | 'runtime-ready'

export type GeneratorFailureCode =
  | 'SCHEMA_INVALID'
  | 'TARGET_VIOLATES_RULES'
  | 'INITIAL_UNSAT'
  | 'FINAL_GUEST_LAYOUT_AMBIGUOUS'
  | 'PROOF_GUESS_POINT'
  | 'PROOF_EXPLANATION_GAP'
  | 'SOLVER_TRUNCATED'
  | 'SEARCH_CAP_REACHED'
  | 'NO_CANDIDATE_ACCEPTED'

export interface GeneratorSeedPolicy {
  readonly algorithm: 'mulberry32'
  readonly seed: number
  readonly deterministic: true
}

export interface GeneratorCaps {
  readonly maxAttempts: number
  readonly maxNodes: number
  readonly maxModels: number
  readonly maxGuestLayouts: number
  readonly maxAccepted: number
}

export interface GeneratorInputContract {
  readonly seed: GeneratorSeedPolicy
  readonly board: BoardSize
  readonly allowedKinds: readonly CellKind[]
  readonly guestCount: number
  readonly rules: readonly RuleDefinition[]
  readonly initialRevealRange: {
    readonly min: number
    readonly max: number
  }
  readonly caps: GeneratorCaps
  readonly solver?: SolverOptions
  readonly artifactPolicy: GeneratorArtifactPolicy
}

export interface GeneratedCandidate {
  readonly puzzle: PuzzleDefinition
  readonly source: 'sampled-target' | 'fixture'
  readonly seed: GeneratorSeedPolicy
  readonly initialObservations: readonly Observation[]
}

export interface RejectedCandidate {
  readonly attempt: number
  readonly code: GeneratorFailureCode
  readonly stage: GeneratorValidationStage
  readonly message: string
}

export interface AcceptedCandidate {
  readonly attempt: number
  readonly puzzle: PuzzleDefinition
  readonly validationStages: readonly GeneratorValidationStage[]
  readonly proof: VerificationReport
  readonly stats: SolverStats
}

export interface GeneratorRunReport {
  readonly version: typeof GENERATOR_SPIKE_VERSION
  readonly input: GeneratorInputContract
  readonly attempts: number
  readonly accepted: readonly AcceptedCandidate[]
  readonly rejected: readonly RejectedCandidate[]
  readonly stats: SolverStats
  readonly artifactPolicy: GeneratorArtifactPolicy
}

export interface RevealMinimizationStep {
  readonly cellId: CellId
  readonly removed: boolean
  readonly reason:
    | 'preserved-no-guess-and-uniqueness'
    | 'required-for-proof'
    | 'required-for-uniqueness'
    | 'solver-truncated'
}

export interface RevealMinimizationReport {
  readonly puzzleId: string
  readonly beforeCount: number
  readonly afterCount: number
  readonly beforeCells: readonly CellId[]
  readonly afterCells: readonly CellId[]
  readonly steps: readonly RevealMinimizationStep[]
  readonly proofBefore: VerificationReport
  readonly proofAfter: VerificationReport
}

export interface ProvisionalDifficultyScore {
  readonly puzzleId: string
  readonly calibratedWithRealPlaytest: false
  readonly score: number
  readonly band: 1 | 2 | 3 | 4 | 5
  readonly metrics: {
    readonly boardCells: number
    readonly revealCount: number
    readonly proofWaveCount: number
    readonly deductionCount: number
    readonly techniqueCount: number
    readonly techniqueIds: readonly TechniqueId[]
    readonly solverNodeCount: number
    readonly solverPropagationCount: number
  }
}

export interface GeneratorPuzzleTemplate {
  readonly idPrefix?: string
  readonly titlePrefix?: string
  readonly caseNamePrefix?: string
  readonly metadata?: PuzzleMetadata
}
