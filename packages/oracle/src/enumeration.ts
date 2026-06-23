import { allCells } from '@room-axioms/domain';
import type { CellId, CellKind, Observation, PuzzleDefinition } from '@room-axioms/domain';

import { satisfiesRules } from './rules.js';
import type { CellAssignment, OracleModel, OracleOptions, OracleSearchResult } from './types.js';

export function enumerateModels(
  puzzle: PuzzleDefinition,
  observations: readonly Observation[] = [],
  options: OracleOptions = {},
): OracleSearchResult {
  const cellsInOrder = allCells(puzzle.board);
  const observedKinds = toObservationMap(cellsInOrder, puzzle.allowedKinds, observations);

  if (observedKinds === undefined) {
    return emptySearchResult(false);
  }

  const maxModels = normalizeLimit(options.maxModels);
  const maxNodes = normalizeLimit(options.maxNodes);
  const models: OracleModel[] = [];
  const partial: Record<CellId, CellKind> = {};
  let modelCount = 0;
  let nodeCount = 0;
  let truncated = false;
  let stopped = false;

  const visitNode = (): boolean => {
    if (nodeCount >= maxNodes) {
      truncated = true;
      stopped = true;
      return false;
    }

    nodeCount += 1;
    return true;
  };

  const search = (cellIndex: number): void => {
    if (stopped) return;

    if (cellIndex === cellsInOrder.length) {
      const candidate = { cells: { ...partial } as CellAssignment };
      if (!satisfiesRules(puzzle, candidate)) return;

      modelCount += 1;
      if (models.length < maxModels) {
        models.push(candidate);
        return;
      }

      truncated = true;
      stopped = true;
      return;
    }

    const cellId = cellsInOrder[cellIndex];
    const observedKind = observedKinds.get(cellId);
    const choices = observedKind === undefined ? puzzle.allowedKinds : [observedKind];

    for (const kind of choices) {
      if (!visitNode()) return;

      partial[cellId] = kind;
      search(cellIndex + 1);
      delete partial[cellId];

      if (stopped) return;
    }
  };

  search(0);

  return {
    satisfiable: modelCount > 0,
    models,
    modelCount,
    nodeCount,
    truncated,
  };
}

function toObservationMap(
  cellsInOrder: readonly CellId[],
  allowedKinds: readonly CellKind[],
  observations: readonly Observation[],
): ReadonlyMap<CellId, CellKind> | undefined {
  const knownCells = new Set(cellsInOrder);
  const allowedKindSet = new Set(allowedKinds);
  const observedKinds = new Map<CellId, CellKind>();

  for (const observation of observations) {
    if (!knownCells.has(observation.cellId) || !allowedKindSet.has(observation.kind)) {
      return undefined;
    }

    const existing = observedKinds.get(observation.cellId);
    if (existing !== undefined && existing !== observation.kind) {
      return undefined;
    }

    observedKinds.set(observation.cellId, observation.kind);
  }

  return observedKinds;
}

function normalizeLimit(value: number | undefined): number {
  if (value === undefined) return Number.POSITIVE_INFINITY;
  if (!Number.isFinite(value)) return Number.POSITIVE_INFINITY;
  return Math.max(0, Math.floor(value));
}

function emptySearchResult(truncated: boolean): OracleSearchResult {
  return {
    satisfiable: false,
    models: [],
    modelCount: 0,
    nodeCount: 0,
    truncated,
  };
}
