export const SOLVER_PACKAGE_NAME = '@room-axioms/solver' as const;

export {
  countGuestLayouts,
  findForcedCells,
  findModel,
  isGuestLayoutUnique,
  isSatisfiable,
} from './queries.js';

export type {
  ForcedCellResult,
  GuestLayoutCountResult,
  SolveInput,
  SolveResult,
  SolverAssumption,
  SolverModel,
  SolverOptions,
  SolverStats,
  UniqueLayoutResult,
} from './types.js';
