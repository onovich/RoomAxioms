export const SOLVER_PACKAGE_NAME = '@room-axioms/solver' as const;

export {
  countGuestLayouts,
  findForcedCells,
  findModel,
  findPossibleRecordSets,
  isGuestLayoutUnique,
  isSatisfiable,
  previewGuestLayouts,
} from './queries.js';

export type {
  ForcedCellResult,
  GuestLayoutCountResult,
  GuestLayoutPreviewResult,
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
