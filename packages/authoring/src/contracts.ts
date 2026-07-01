import type { GeneratorRunReport, ProvisionalDifficultyScore, RevealMinimizationReport } from '@room-axioms/generator'
import type { TechniqueId } from '@room-axioms/proof'
import type { AntiCloneReport } from './antiCloneReport.js'

export const AUTHORING_PACKAGE_NAME = '@room-axioms/authoring' as const

export const AUTHORING_CLI_VERSION = 'phase-10-authoring-v1' as const

export type AuthoringCommandName =
  | 'validate'
  | 'report'
  | 'score'
  | 'minimize'
  | 'sample'
  | 'anti-clone'

export type AuthoringOutputFormat = 'json'

export interface AuthoringCliOptions {
  readonly format: AuthoringOutputFormat
  readonly outputPath?: string
  readonly requiredTechniqueIds?: readonly TechniqueId[]
}

export type AuthoringCliCommand =
  | CasePathCommand
  | SampleCommand
  | AntiCloneCommand

export interface CasePathCommand {
  readonly name: Exclude<AuthoringCommandName, 'sample' | 'anti-clone'>
  readonly casePath: string
  readonly options: AuthoringCliOptions
}

export interface SampleCommand {
  readonly name: 'sample'
  readonly seed: number
  readonly templatePath: string
  readonly options: AuthoringCliOptions
}

export interface AntiCloneCommand {
  readonly name: 'anti-clone'
  readonly casePaths: readonly string[]
  readonly noveltyManifestPath?: string
  readonly includeDegeneracy?: boolean
  readonly options: AuthoringCliOptions
}

export interface AuthoringCliParseError {
  readonly code:
    | 'UNKNOWN_COMMAND'
    | 'MISSING_CASE_PATH'
    | 'MISSING_FLAG_VALUE'
    | 'UNKNOWN_FLAG'
    | 'INVALID_SEED'
    | 'INVALID_TECHNIQUE'
    | 'MISSING_SEED'
    | 'MISSING_TEMPLATE'
  readonly message: string
  readonly argument?: string
}

export type AuthoringCliParseResult =
  | { readonly ok: true; readonly command: AuthoringCliCommand }
  | { readonly ok: false; readonly error: AuthoringCliParseError }

export interface AuthoringCliReport {
  readonly version: typeof AUTHORING_CLI_VERSION
  readonly ok: boolean
  readonly command?: AuthoringCommandName
  readonly inputPath?: string
  readonly resolvedInputPath?: string
  readonly outputPath?: string
  readonly seed?: number
  readonly templatePath?: string
  readonly status:
    | 'parsed'
    | 'not-implemented'
    | 'validated'
    | 'reported'
    | 'scored'
    | 'minimized'
    | 'sampled'
    | 'anti-clone-reported'
    | 'error'
  readonly diagnostics: readonly AuthoringCliDiagnostic[]
  readonly validation?: AuthoringCaseValidationReport
  readonly score?: ProvisionalDifficultyScore
  readonly minimization?: RevealMinimizationReport
  readonly techniqueRetention?: AuthoringTechniqueRetentionReport
  readonly sample?: GeneratorRunReport
  readonly antiClone?: AntiCloneReport
}

export interface AuthoringCliDiagnostic {
  readonly code: string
  readonly severity: 'info' | 'warning' | 'error'
  readonly message: string
}

export type AuthoringRecommendation =
  | 'ready-for-experimental-review'
  | 'repair-schema'
  | 'repair-target-rules'
  | 'repair-initial-satisfiability'
  | 'repair-proof'
  | 'repair-final-uniqueness'
  | 'raise-caps-or-simplify'

export interface AuthoringSolverCapsReport {
  readonly maxNodes: number
  readonly maxModels: number
  readonly maxGuestLayouts: number
  readonly candidateLayoutCap: number
}

export interface AuthoringSolverStatsReport {
  readonly nodeCount: number
  readonly propagationCount: number
  readonly truncated: boolean
}

export interface AuthoringCaseValidationReport {
  readonly puzzleId?: string
  readonly sourcePath: string
  readonly resolvedPath: string
  readonly caps: AuthoringSolverCapsReport
  readonly schema: {
    readonly ok: boolean
    readonly issueCount: number
    readonly issues: readonly AuthoringSchemaIssueReport[]
  }
  readonly targetRules?: {
    readonly satisfiesRules: boolean
    readonly stats: AuthoringSolverStatsReport
  }
  readonly initialSatisfiability?: {
    readonly satisfiable: boolean
    readonly stats: AuthoringSolverStatsReport
  }
  readonly initialGuestLayouts?: {
    readonly count: number
    readonly greaterThan?: number
    readonly stats: AuthoringSolverStatsReport
  }
  readonly proof?: {
    readonly noGuess: boolean
    readonly humanExplainable: boolean
    readonly targetSatisfiesRules: boolean
    readonly guestLayoutUniqueAtEnd: boolean
    readonly finalGuestCells: readonly string[] | null
    readonly issueCodes: readonly string[]
    readonly waveCount: number
    readonly deductionCount: number
    readonly techniqueIds: readonly string[]
    readonly stats: AuthoringSolverStatsReport
  }
  readonly interactiveTrace?: AuthoringInteractiveTraceReport
  readonly terminalGuestLayoutExamples?: {
    readonly layouts: readonly AuthoringGuestLayoutExample[]
    readonly shown: number
    readonly hasMore: boolean
    readonly stats: AuthoringSolverStatsReport
  }
  readonly recordSets?: {
    readonly possibleAssignments: readonly {
      readonly assignmentId: string
      readonly falseRecordIds: readonly string[]
      readonly activeRuleIds: readonly string[]
    }[]
    readonly stats: AuthoringSolverStatsReport
  }
  readonly difficultyReview?: AuthoringDifficultyReviewReport
  readonly recommendation: AuthoringRecommendation
}

export type AuthoringInteractiveTerminalStatus =
  | 'unique'
  | 'ambiguous'
  | 'guess-needed'
  | 'truncated'
  | 'invalid'

export interface AuthoringInteractiveTraceReport {
  readonly terminalStatus: AuthoringInteractiveTerminalStatus
  readonly finalObservations: readonly AuthoringObservationReport[]
  readonly waves: readonly AuthoringInteractiveTraceWave[]
}

export interface AuthoringInteractiveTraceWave {
  readonly index: number
  readonly deductionCount: number
  readonly revealed: readonly AuthoringObservationReport[]
  readonly confirmedGuestCells: readonly string[]
}

export interface AuthoringObservationReport {
  readonly cellId: string
  readonly kind: string
}

export interface AuthoringGuestLayoutExample {
  readonly guestCells: readonly string[]
  readonly cells: Readonly<Record<string, string>>
  readonly changedCells: readonly AuthoringGuestLayoutChangedCell[]
}

export interface AuthoringGuestLayoutChangedCell {
  readonly cellId: string
  readonly current: string
  readonly alternative: string
}

export type AuthoringDifficultyReviewBucket =
  | 'tutorial-or-baseline'
  | 'target-4'
  | 'super-hard-6-7'

export interface AuthoringDifficultyReviewReport {
  readonly puzzleId: string
  readonly recommendedBucket: AuthoringDifficultyReviewBucket
  readonly boardUnknownCellCount: number
  readonly effectiveUnknownCellCount: number
  readonly effectiveCellCount: number
  readonly irrelevantCellCount: number
  readonly openingRevealCount: number
  readonly proofWaveCount: number
  readonly deductionCount: number
  readonly frontierUnlockCount: number
  readonly sharedVariableOverlapCount: number
  readonly techniqueIds: readonly string[]
  readonly materialRuleFamilyCount: number
  readonly materialRuleFamilies: readonly string[]
  readonly materialRuleIds: readonly string[]
  readonly redundantRuleIds: readonly string[]
  readonly degeneracy: {
    readonly status: 'pass' | 'warning' | 'fail'
    readonly failureCount: number
    readonly warningCount: number
  }
  readonly targetFour: AuthoringDifficultyThresholdReport
  readonly superHard: AuthoringDifficultyThresholdReport
}

export interface AuthoringDifficultyThresholdReport {
  readonly pass: boolean
  readonly missing: readonly string[]
}

export interface AuthoringSchemaIssueReport {
  readonly code: string
  readonly path: readonly (string | number)[]
  readonly message: string
  readonly context?: Readonly<Record<string, unknown>>
}

export interface AuthoringTechniqueRetentionReport {
  readonly beforeTechniqueIds: readonly TechniqueId[]
  readonly afterTechniqueIds: readonly TechniqueId[]
  readonly preservedTechniqueIds: readonly TechniqueId[]
  readonly lostTechniqueIds: readonly TechniqueId[]
  readonly requiredTechniqueIds: readonly TechniqueId[]
  readonly missingRequiredTechniqueIds: readonly TechniqueId[]
  readonly requiredTechniquesRetained: boolean
}
