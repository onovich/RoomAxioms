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
import { searchFirstModel, visitModels } from './search.js';

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

export function isGuestLayoutUnique(input: SolveInput, options: SolverOptions = {}): UniqueLayoutResult {
  const summary = collectGuestLayouts(input, 1, options);
  const unique = !summary.stats.truncated && summary.count === 1 && summary.greaterThan === undefined;

  return {
    unique,
    guestCells: unique ? summary.layouts[0] ?? null : null,
    stats: summary.stats,
  };
}

export function countGuestLayouts(
  input: SolveInput,
  cap: number,
  options: SolverOptions = {},
): GuestLayoutCountResult {
  const summary = collectGuestLayouts(input, cap, options);

  return {
    count: summary.count,
    ...(summary.greaterThan === undefined ? {} : { greaterThan: summary.greaterThan }),
    stats: summary.stats,
  };
}

interface GuestLayoutSummary {
  readonly count: number;
  readonly greaterThan?: number;
  readonly layouts: readonly (readonly string[])[];
  readonly stats: SolveResult['stats'];
}

function combineStats(left: SolveResult['stats'], right: SolveResult['stats']): SolveResult['stats'] {
  return {
    nodeCount: left.nodeCount + right.nodeCount,
    propagationCount: left.propagationCount + right.propagationCount,
    truncated: left.truncated || right.truncated,
  };
}

function collectGuestLayouts(input: SolveInput, cap: number, options: SolverOptions): GuestLayoutSummary {
  const optionCap = options.maxGuestLayouts ?? cap;
  const effectiveCap = Math.max(0, Math.floor(Math.min(cap, optionCap)));
  const cells = allCells(input.puzzle.board);
  const layouts = new Map<string, readonly string[]>();
  let greaterThan: number | undefined;

  const result = visitModels(input, [], options, (model) => {
    const guestCells = cells.filter((cellId) => model.cells[cellId] === 'guest');
    const key = guestCells.join('|');

    if (!layouts.has(key)) {
      if (layouts.size >= effectiveCap) {
        greaterThan = effectiveCap;
        return false;
      }

      layouts.set(key, guestCells);
    }

    return true;
  });

  return {
    count: layouts.size,
    ...(greaterThan === undefined ? {} : { greaterThan }),
    layouts: [...layouts.values()],
    stats: result.stats,
  };
}
