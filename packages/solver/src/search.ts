import type { CellId, CellKind } from '@room-axioms/domain';

import { domainSize, isSingleton, kindsInMask, singletonKind } from './bitset.js';
import { compileConstraints } from './constraints.js';
import {
  assignCellKind,
  checkpoint,
  createSolverState,
  createTrail,
  propagate,
  removeCellKind,
  rollback,
} from './propagation.js';
import type { SolverState, Trail } from './propagation.js';
import type {
  SolveInput,
  SolveResult,
  SolverAssumption,
  SolverModel,
  SolverOptions,
  SolverStats,
} from './types.js';

interface SearchContext {
  readonly input: SolveInput;
  readonly maxNodes: number;
  readonly maxModels: number;
  nodeCount: number;
  modelCount: number;
  truncated: boolean;
  stopped: boolean;
}

export interface ModelVisitResult {
  readonly modelCount: number;
  readonly stats: SolverStats;
}

type ModelVisitor = (model: SolverModel) => boolean;

export function searchFirstModel(
  input: SolveInput,
  assumptions: readonly SolverAssumption[] = [],
  options: SolverOptions = {},
): SolveResult {
  let firstModel: SolverModel | null = null;
  const result = visitModels(input, assumptions, options, (model) => {
    firstModel = model;
    return false;
  });

  return {
    satisfiable: firstModel !== null,
    model: firstModel,
    stats: result.stats,
  };
}

export function visitModels(
  input: SolveInput,
  assumptions: readonly SolverAssumption[] = [],
  options: SolverOptions = {},
  visitor: ModelVisitor,
): ModelVisitResult {
  const state = createSolverState(input);
  const trail = createTrail();
  const context: SearchContext = {
    input,
    maxNodes: normalizeLimit(options.maxNodes),
    maxModels: normalizeLimit(options.maxModels),
    nodeCount: 0,
    modelCount: 0,
    truncated: false,
    stopped: false,
  };
  const constraints = compileConstraints(input.puzzle);

  const assumptionFailure = applyAssumptions(state, trail, assumptions);
  if (assumptionFailure !== null) {
    return {
      modelCount: 0,
      stats: toStats(context, state),
    };
  }

  search(state, trail, context, constraints, visitor);
  return {
    modelCount: context.modelCount,
    stats: toStats(context, state),
  };
}

function applyAssumptions(
  state: SolverState,
  trail: Trail,
  assumptions: readonly SolverAssumption[],
): string | null {
  for (const assumption of assumptions) {
    const result =
      assumption.kind === 'cellIs'
        ? assignCellKind(state, trail, assumption.cellId, assumption.value)
        : removeCellKind(state, trail, assumption.cellId, assumption.value);

    if (result.contradiction !== null) return result.contradiction;
  }

  return null;
}

function search(
  state: SolverState,
  trail: Trail,
  context: SearchContext,
  constraints: ReturnType<typeof compileConstraints>,
  visitor: ModelVisitor,
): void {
  if (context.stopped) return;

  if (context.nodeCount >= context.maxNodes) {
    context.truncated = true;
    context.stopped = true;
    return;
  }

  context.nodeCount += 1;

  const propagation = propagate(state, constraints, trail);
  if (!propagation.ok) return;

  if (isComplete(state)) {
    if (context.modelCount >= context.maxModels) {
      context.truncated = true;
      context.stopped = true;
      return;
    }

    context.modelCount += 1;
    context.stopped = !visitor(modelFromState(state));
    return;
  }

  const cellId = selectMrvCell(state);
  if (cellId === null) return;

  for (const kind of kindsInMask(state.domains[cellId], context.input.puzzle.allowedKinds)) {
    const branch = checkpoint(trail);
    const assigned = assignCellKind(state, trail, cellId, kind);

    if (assigned.contradiction === null) {
      search(state, trail, context, constraints, visitor);
    }

    rollback(state, trail, branch);
    if (context.stopped) return;
  }
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
