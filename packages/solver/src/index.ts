export const SOLVER_PACKAGE_NAME = '@room-axioms/solver' as const;

export {
  countGuestLayouts,
  findForcedCells,
  findModel,
  findPossibleRecordSets,
  isGuestLayoutUnique,
  isSatisfiable,
} from './queries.js';

export type {
  ForcedCellResult,
  GuestLayoutCountResult,
  RecordSetPossibility,
  RecordSetPossibilityResult,
  SolveInput,
  SolveResult,
  SolverAssumption,
  SolverModel,
  SolverOptions,
  SolverStats,
  UniqueLayoutResult,
} from './types.js';
