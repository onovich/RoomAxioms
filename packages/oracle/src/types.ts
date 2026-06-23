import type { CellId, CellKind } from '@room-axioms/domain';

export type CellAssignment = Readonly<Record<CellId, CellKind>>;

export interface OracleModel {
  readonly cells: CellAssignment;
}

export interface RuleEvaluation {
  readonly ruleId: string;
  readonly satisfied: boolean;
  readonly actual: number | readonly number[];
}

export interface OracleOptions {
  readonly maxModels?: number;
  readonly maxNodes?: number;
}

export interface OracleSearchResult {
  readonly satisfiable: boolean;
  readonly models: readonly OracleModel[];
  readonly modelCount: number;
  readonly nodeCount: number;
  readonly truncated: boolean;
}

export interface OracleVerificationReport {
  readonly targetSatisfiesRules: boolean;
  readonly initialSatisfiable: boolean;
  readonly issues: readonly string[];
  readonly metrics: Readonly<Record<string, number | boolean>>;
}
