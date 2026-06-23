import type { CellId, CellKind, Observation, PuzzleDefinition } from '@room-axioms/domain';
import type { SolverOptions, SolverStats } from '@room-axioms/solver';

export type TechniqueId =
  | 'GLOBAL_COUNT_SATURATED'
  | 'GLOBAL_COUNT_ALL_REMAINING'
  | 'LOCAL_COUNT_SATURATED'
  | 'LOCAL_COUNT_ALL_REMAINING'
  | 'UNIQUE_TARGET_NEIGHBOR_INTERSECTION'
  | 'LOCAL_SCOPE_INTERSECTION'
  | 'LOCAL_SCOPE_DIFFERENCE'
  | 'KNOWN_SAFE_FROM_NON_GUEST_OBJECT';

export interface KnowledgeState {
  readonly puzzle: PuzzleDefinition;
  readonly observations: readonly Observation[];
}

export type DeductionConclusion =
  | { readonly kind: 'safe'; readonly cellId: CellId }
  | { readonly kind: 'guest'; readonly cellId: CellId }
  | { readonly kind: 'object'; readonly cellId: CellId; readonly object: CellKind };

export interface ProofPremise {
  readonly kind: 'observation' | 'rule' | 'count' | 'scope' | 'derived';
  readonly label: string;
  readonly cellIds?: readonly CellId[];
  readonly ruleIds?: readonly string[];
}

export interface Deduction {
  readonly id: string;
  readonly conclusion: DeductionConclusion;
  readonly ruleIds: readonly string[];
  readonly premises: readonly ProofPremise[];
  readonly technique: TechniqueId;
  readonly proofNodeIds: readonly string[];
}

export interface DeductionInput {
  readonly conclusion: DeductionConclusion;
  readonly ruleIds?: readonly string[];
  readonly premises?: readonly ProofPremise[];
  readonly technique: TechniqueId;
}

export interface ProofNode {
  readonly id: string;
  readonly kind: 'fact' | 'rule' | 'derived';
  readonly label: string;
  readonly parents: readonly string[];
}

export interface ProofGraph {
  readonly nodes: readonly ProofNode[];
  readonly rootIds: readonly string[];
}

export type VerificationIssueCode =
  | 'CONTRADICTION'
  | 'EXPLANATION_GAP'
  | 'GUESS_POINT'
  | 'INVALID_DEDUCTION'
  | 'NON_PROGRESS'
  | 'SOLVER_TRUNCATED'
  | 'TARGET_VIOLATES_RULE';

export interface VerificationIssue {
  readonly code: VerificationIssueCode;
  readonly message: string;
  readonly cellIds?: readonly CellId[];
  readonly deductionIds?: readonly string[];
  readonly waveIndex?: number;
}

export interface DeductionValidationResult {
  readonly deductionId: string;
  readonly valid: boolean;
  readonly issues: readonly VerificationIssue[];
  readonly stats: SolverStats;
}

export interface ExplanationGapReport {
  readonly forcedSafe: readonly CellId[];
  readonly forcedGuests: readonly CellId[];
  readonly explainedSafe: readonly CellId[];
  readonly explainedGuests: readonly CellId[];
  readonly validationResults: readonly DeductionValidationResult[];
  readonly issues: readonly VerificationIssue[];
  readonly stats: SolverStats;
}

export interface VerificationWave {
  readonly index: number;
  readonly observations: readonly Observation[];
  readonly deductions: readonly Deduction[];
  readonly revealed: readonly Observation[];
  readonly confirmedGuests: readonly CellId[];
  readonly issues: readonly VerificationIssue[];
  readonly solverStats: SolverStats;
}

export interface VerificationMetrics {
  readonly waveCount: number;
  readonly deductionCount: number;
  readonly revealedSafeCount: number;
  readonly confirmedGuestCount: number;
  readonly techniqueIds: readonly TechniqueId[];
}

export interface VerificationReport {
  readonly satisfiable: boolean;
  readonly targetSatisfiesRules: boolean;
  readonly guestLayoutUniqueAtEnd: boolean;
  readonly finalGuestCells: readonly CellId[] | null;
  readonly noGuess: boolean;
  readonly humanExplainable: boolean;
  readonly waves: readonly VerificationWave[];
  readonly issues: readonly VerificationIssue[];
  readonly metrics: VerificationMetrics;
}

export interface VerificationOptions {
  readonly solver?: SolverOptions;
  readonly maxWaves?: number;
}
