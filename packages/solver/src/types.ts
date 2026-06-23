import type { CellId, CellKind, Observation, PuzzleDefinition } from '@room-axioms/domain';

export type SolverAssumption =
  | { readonly kind: 'cellIs'; readonly cellId: CellId; readonly value: CellKind }
  | { readonly kind: 'cellIsNot'; readonly cellId: CellId; readonly value: CellKind };

export interface SolveInput {
  readonly puzzle: PuzzleDefinition;
  readonly observations?: readonly Observation[];
}

export interface SolverOptions {
  readonly maxNodes?: number;
  readonly maxModels?: number;
  readonly maxGuestLayouts?: number;
}

export interface SolverStats {
  readonly nodeCount: number;
  readonly propagationCount: number;
  readonly truncated: boolean;
}

export interface SolverModel {
  readonly cells: Readonly<Record<CellId, CellKind>>;
}

export interface SolveResult {
  readonly satisfiable: boolean;
  readonly model: SolverModel | null;
  readonly stats: SolverStats;
}

export interface ForcedCellResult {
  readonly safe: readonly CellId[];
  readonly guests: readonly CellId[];
  readonly stats: SolverStats;
}

export interface UniqueLayoutResult {
  readonly unique: boolean;
  readonly guestCells: readonly CellId[] | null;
  readonly stats: SolverStats;
}

export interface GuestLayoutCountResult {
  readonly count: number;
  readonly greaterThan?: number;
  readonly stats: SolverStats;
}
