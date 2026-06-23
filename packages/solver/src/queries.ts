import type {
  ForcedCellResult,
  GuestLayoutCountResult,
  SolveInput,
  SolveResult,
  SolverAssumption,
  SolverOptions,
  UniqueLayoutResult,
} from './types.js';

export function isSatisfiable(
  _input: SolveInput,
  _assumptions: readonly SolverAssumption[] = [],
  _options: SolverOptions = {},
): SolveResult {
  throw new Error('Solver satisfiability search is implemented in Phase 4 Round 4.');
}

export function findModel(
  _input: SolveInput,
  _assumptions: readonly SolverAssumption[] = [],
  _options: SolverOptions = {},
): SolveResult {
  throw new Error('Solver model search is implemented in Phase 4 Round 4.');
}

export function findForcedCells(_input: SolveInput, _options: SolverOptions = {}): ForcedCellResult {
  throw new Error('Solver forced-cell queries are implemented in Phase 4 Round 5.');
}

export function isGuestLayoutUnique(_input: SolveInput, _options: SolverOptions = {}): UniqueLayoutResult {
  throw new Error('Solver guest-layout uniqueness is implemented in Phase 4 Round 6.');
}

export function countGuestLayouts(
  _input: SolveInput,
  _cap: number,
  _options: SolverOptions = {},
): GuestLayoutCountResult {
  throw new Error('Solver guest-layout counting is implemented in Phase 4 Round 6.');
}
