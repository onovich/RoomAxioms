import { allCells } from '@room-axioms/domain';

import type {
  ForcedCellResult,
  GuestLayoutCountResult,
  GuestLayoutPreviewResult,
  RecordSetPossibility,
  RecordSetPossibilityResult,
  SolveInput,
  SolveResult,
  SolverAssumption,
  SolverOptions,
  UniqueLayoutResult,
} from './types.js';
import { expandRecordSetAssignments, hasRecordSetRules } from './recordSets.js';
import { searchFirstModel, visitModels } from './search.js';

export function isSatisfiable(
  input: SolveInput,
  assumptions: readonly SolverAssumption[] = [],
  options: SolverOptions = {},
): SolveResult {
  if (hasRecordSetRules(input.puzzle)) {
    return searchFirstContaminatedModel(input, assumptions, options);
  }

  return searchFirstModel(input, assumptions, options);
}

export function findModel(
  input: SolveInput,
  assumptions: readonly SolverAssumption[] = [],
  options: SolverOptions = {},
): SolveResult {
  if (hasRecordSetRules(input.puzzle)) {
    return searchFirstContaminatedModel(input, assumptions, options);
  }

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

export function previewGuestLayouts(
  input: SolveInput,
  cap: number,
  options: SolverOptions = {},
): GuestLayoutPreviewResult {
  const summary = collectGuestLayouts(input, cap, options);

  return {
    count: summary.count,
    ...(summary.greaterThan === undefined ? {} : { greaterThan: summary.greaterThan }),
    layouts: summary.layouts,
    stats: summary.stats,
  };
}

export function findPossibleRecordSets(
  input: SolveInput,
  options: SolverOptions = {},
): RecordSetPossibilityResult {
  if (!hasRecordSetRules(input.puzzle)) {
    return {
      possibleAssignments: [],
      stats: zeroStats(),
    };
  }

  const possibleAssignments: RecordSetPossibility[] = [];
  let stats = zeroStats();

  for (const assignment of expandRecordSetAssignments(input.puzzle)) {
    const result = searchFirstModel({ ...input, puzzle: assignment.puzzle }, [], options);
    stats = combineStats(stats, result.stats);
    if (result.satisfiable && !result.stats.truncated) {
      possibleAssignments.push({
        assignmentId: assignment.id,
        falseRecordIds: assignment.falseRecordIds,
        activeRuleIds: assignment.activeRuleIds,
      });
    }
    if (result.stats.truncated) break;
  }

  return {
    possibleAssignments,
    stats,
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
  let stopped = false;
  let stats = zeroStats();

  for (const assignment of expandRecordSetAssignments(input.puzzle)) {
    if (stopped) break;

    const result = visitModels({ ...input, puzzle: assignment.puzzle }, [], options, (model) => {
      const guestCells = cells.filter((cellId) => model.cells[cellId] === 'guest');
      const key = guestCells.join('|');

      if (!layouts.has(key)) {
        if (layouts.size >= effectiveCap) {
          greaterThan = effectiveCap;
          stopped = true;
          return false;
        }

        layouts.set(key, guestCells);
      }

      return true;
    });
    stats = combineStats(stats, result.stats);
    if (result.stats.truncated) break;
  }

  return {
    count: layouts.size,
    ...(greaterThan === undefined ? {} : { greaterThan }),
    layouts: [...layouts.values()],
    stats,
  };
}

function searchFirstContaminatedModel(
  input: SolveInput,
  assumptions: readonly SolverAssumption[],
  options: SolverOptions,
): SolveResult {
  let stats = zeroStats();

  for (const assignment of expandRecordSetAssignments(input.puzzle)) {
    const result = searchFirstModel({ ...input, puzzle: assignment.puzzle }, assumptions, options);
    stats = combineStats(stats, result.stats);
    if (result.satisfiable || result.stats.truncated) {
      return {
        satisfiable: result.satisfiable,
        model: result.model,
        stats,
      };
    }
  }

  return {
    satisfiable: false,
    model: null,
    stats,
  };
}

function zeroStats(): SolveResult['stats'] {
  return {
    nodeCount: 0,
    propagationCount: 0,
    truncated: false,
  };
}
