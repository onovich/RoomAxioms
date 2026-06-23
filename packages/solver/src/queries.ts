import type {
  ForcedCellResult,
  GuestLayoutCountResult,
  SolveInput,
  SolveResult,
  SolverAssumption,
  SolverOptions,
  UniqueLayoutResult,
} from './types.js';
import { searchFirstModel } from './search.js';

export function isSatisfiable(
  input: SolveInput,
  assumptions: readonly SolverAssumption[] = [],
  options: SolverOptions = {},
): SolveResult {
  assertNoAssumptions(assumptions);
  return searchFirstModel(input, options);
}

export function findModel(
  input: SolveInput,
  assumptions: readonly SolverAssumption[] = [],
  options: SolverOptions = {},
): SolveResult {
  assertNoAssumptions(assumptions);
  return searchFirstModel(input, options);
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

function assertNoAssumptions(assumptions: readonly SolverAssumption[]): void {
  if (assumptions.length > 0) {
    throw new Error('Solver assumptions are implemented in Phase 4 Round 5.');
  }
}
