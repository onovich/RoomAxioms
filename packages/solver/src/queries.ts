import { allCells } from '@room-axioms/domain';

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
  return searchFirstModel(input, assumptions, options);
}

export function findModel(
  input: SolveInput,
  assumptions: readonly SolverAssumption[] = [],
  options: SolverOptions = {},
): SolveResult {
  return searchFirstModel(input, assumptions, options);
}

export function findForcedCells(input: SolveInput, options: SolverOptions = {}): ForcedCellResult {
  const base = findModel(input, [], options);
  if (!base.satisfiable || base.stats.truncated) {
    return {
      safe: [],
      guests: [],
      stats: base.stats,
    };
  }

  const observedCells = new Set(input.observations?.map((observation) => observation.cellId) ?? []);
  const safe: string[] = [];
  const guests: string[] = [];
  let stats = base.stats;

  for (const cellId of allCells(input.puzzle.board)) {
    if (observedCells.has(cellId)) continue;

    const guestResult = isSatisfiable(input, [{ kind: 'cellIs', cellId, value: 'guest' }], options);
    stats = combineStats(stats, guestResult.stats);
    if (!guestResult.stats.truncated && !guestResult.satisfiable) {
      safe.push(cellId);
      continue;
    }

    const safeResult = isSatisfiable(input, [{ kind: 'cellIsNot', cellId, value: 'guest' }], options);
    stats = combineStats(stats, safeResult.stats);
    if (!safeResult.stats.truncated && !safeResult.satisfiable) {
      guests.push(cellId);
    }
  }

  return { safe, guests, stats };
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

function combineStats(left: SolveResult['stats'], right: SolveResult['stats']): SolveResult['stats'] {
  return {
    nodeCount: left.nodeCount + right.nodeCount,
    propagationCount: left.propagationCount + right.propagationCount,
    truncated: left.truncated || right.truncated,
  };
}
