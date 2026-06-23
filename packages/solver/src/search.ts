import type { CellId, CellKind } from '@room-axioms/domain';

import { domainSize, isSingleton, kindsInMask, singletonKind } from './bitset.js';
import { compileConstraints } from './constraints.js';
import {
  assignCellKind,
  checkpoint,
  createSolverState,
  createTrail,
  propagate,
  rollback,
} from './propagation.js';
import type { SolverState, Trail } from './propagation.js';
import type { SolveInput, SolveResult, SolverModel, SolverOptions, SolverStats } from './types.js';

interface SearchContext {
  readonly input: SolveInput;
  readonly maxNodes: number;
  nodeCount: number;
  truncated: boolean;
}

export function searchFirstModel(input: SolveInput, options: SolverOptions = {}): SolveResult {
  const state = createSolverState(input);
  const trail = createTrail();
  const context: SearchContext = {
    input,
    maxNodes: normalizeLimit(options.maxNodes),
    nodeCount: 0,
    truncated: false,
  };
  const constraints = compileConstraints(input.puzzle);
  const model = search(state, trail, context, constraints);

  return {
    satisfiable: model !== null,
    model,
    stats: toStats(context, state),
  };
}

function search(
  state: SolverState,
  trail: Trail,
  context: SearchContext,
  constraints: ReturnType<typeof compileConstraints>,
): SolverModel | null {
  if (context.nodeCount >= context.maxNodes) {
    context.truncated = true;
    return null;
  }

  context.nodeCount += 1;

  const propagation = propagate(state, constraints, trail);
  if (!propagation.ok) return null;

  if (isComplete(state)) return modelFromState(state);

  const cellId = selectMrvCell(state);
  if (cellId === null) return null;

  for (const kind of kindsInMask(state.domains[cellId], context.input.puzzle.allowedKinds)) {
    const branch = checkpoint(trail);
    const assigned = assignCellKind(state, trail, cellId, kind);

    if (assigned.contradiction === null) {
      const model = search(state, trail, context, constraints);
      if (model !== null) return model;
    }

    rollback(state, trail, branch);
    if (context.truncated) return null;
  }

  return null;
}

function isComplete(state: SolverState): boolean {
  return state.cells.every((cellId) => isSingleton(state.domains[cellId]));
}

function selectMrvCell(state: SolverState): CellId | null {
  let selected: CellId | null = null;
  let selectedSize = Number.POSITIVE_INFINITY;

  for (const cellId of state.cells) {
    const size = domainSize(state.domains[cellId]);
    if (size <= 1 || size >= selectedSize) continue;

    selected = cellId;
    selectedSize = size;
  }

  return selected;
}

function modelFromState(state: SolverState): SolverModel {
  const cells: Record<CellId, CellKind> = {};

  for (const cellId of state.cells) {
    const kind = singletonKind(state.domains[cellId]);
    if (kind === null) {
      throw new Error(`Cannot create solver model with non-singleton domain at ${cellId}.`);
    }
    cells[cellId] = kind;
  }

  return { cells };
}

function toStats(context: SearchContext, state: SolverState): SolverStats {
  return {
    nodeCount: context.nodeCount,
    propagationCount: state.propagationCount,
    truncated: context.truncated,
  };
}

function normalizeLimit(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) return Number.POSITIVE_INFINITY;
  return Math.max(0, Math.floor(value));
}
