import type { CellId, CellKind } from '@room-axioms/domain';

import {
  containsKind,
  createInitialDomains,
  intersectMask,
  removeKind,
  singletonMask,
} from './bitset.js';
import type { DomainMask, DomainState } from './bitset.js';
import {
  comparatorCanBeSatisfied,
  countKindBounds,
  evaluateConstraintBounds,
} from './constraints.js';
import type {
  CompiledConstraint,
  CountBounds,
  ForEachCountConstraint,
  GlobalCountConstraint,
} from './constraints.js';
import type { SolveInput } from './types.js';

export interface SolverState {
  readonly cells: readonly CellId[];
  readonly domains: Record<CellId, DomainMask>;
  propagationCount: number;
}

export interface DomainChange {
  readonly cellId: CellId;
  readonly previous: DomainMask;
}

export interface Trail {
  readonly changes: DomainChange[];
}

export interface DomainMutationResult {
  readonly changed: boolean;
  readonly contradiction: string | null;
}

export interface PropagationResult {
  readonly ok: boolean;
  readonly contradiction: string | null;
  readonly propagationCount: number;
}

type ConstraintPropagation = {
  readonly changed: boolean;
  readonly contradiction: string | null;
};

export function createSolverState(input: SolveInput): SolverState {
  const initial = createInitialDomains(input.puzzle);
  const domains = { ...initial };

  for (const observation of input.observations ?? []) {
    domains[observation.cellId] = singletonMask(observation.kind);
  }

  return {
    cells: Object.keys(domains),
    domains,
    propagationCount: 0,
  };
}

export function createTrail(): Trail {
  return { changes: [] };
}

export function checkpoint(trail: Trail): number {
  return trail.changes.length;
}

export function rollback(state: SolverState, trail: Trail, checkpointIndex: number): void {
  while (trail.changes.length > checkpointIndex) {
    const change = trail.changes.pop();
    if (change !== undefined) {
      state.domains[change.cellId] = change.previous;
    }
  }
}

export function assignCellKind(state: SolverState, trail: Trail, cellId: CellId, kind: CellKind): DomainMutationResult {
  return intersectCellDomain(state, trail, cellId, singletonMask(kind));
}

export function intersectCellDomain(
  state: SolverState,
  trail: Trail,
  cellId: CellId,
  mask: DomainMask,
): DomainMutationResult {
  const current = state.domains[cellId];
  if (current === undefined) {
    return {
      changed: false,
      contradiction: `Unknown cell: ${cellId}.`,
    };
  }

  const next = intersectMask(current, mask);

  return setCellDomain(state, trail, cellId, next);
}

export function removeCellKind(
  state: SolverState,
  trail: Trail,
  cellId: CellId,
  kind: Parameters<typeof removeKind>[1],
): DomainMutationResult {
  const current = state.domains[cellId];
  if (current === undefined) {
    return {
      changed: false,
      contradiction: `Unknown cell: ${cellId}.`,
    };
  }

  return setCellDomain(state, trail, cellId, removeKind(current, kind));
}

export function propagate(
  state: SolverState,
  constraints: readonly CompiledConstraint[],
  trail: Trail,
): PropagationResult {
  let changed = true;

  while (changed) {
    changed = false;

    for (const constraint of constraints) {
      state.propagationCount += 1;

      const result = propagateConstraint(state, trail, constraint);
      if (result.contradiction !== null) {
        return {
          ok: false,
          contradiction: result.contradiction,
          propagationCount: state.propagationCount,
        };
      }

      changed = changed || result.changed;
    }
  }

  return {
    ok: true,
    contradiction: null,
    propagationCount: state.propagationCount,
  };
}

function propagateConstraint(
  state: SolverState,
  trail: Trail,
  constraint: CompiledConstraint,
): ConstraintPropagation {
  const bounds = evaluateConstraintBounds(constraint, state.domains as DomainState);

  if (!bounds.possible) {
    return {
      changed: false,
      contradiction: `Constraint ${bounds.ruleId} cannot be satisfied.`,
    };
  }

  switch (constraint.kind) {
    case 'globalCount':
      return propagateGlobalCount(state, trail, constraint);
    case 'forEachCount':
      return propagateForEachCount(state, trail, constraint);
  }
}

function propagateGlobalCount(
  state: SolverState,
  trail: Trail,
  constraint: GlobalCountConstraint,
): ConstraintPropagation {
  const bounds = countKindBounds(constraint.cells, constraint.rule.target, state.domains as DomainState);

  return enforceTargetCount(
    state,
    trail,
    constraint.cells,
    constraint.rule.target,
    constraint.rule.count,
    bounds,
    constraint.rule.id,
  );
}

function propagateForEachCount(
  state: SolverState,
  trail: Trail,
  constraint: ForEachCountConstraint,
): ConstraintPropagation {
  let changed = false;

  for (const entry of constraint.entries) {
    const subjectMask = state.domains[entry.cellId];
    if (!containsKind(subjectMask, constraint.rule.subject)) continue;

    const subjectForced = subjectMask === singletonMask(constraint.rule.subject);
    const targetBounds = countKindBounds(entry.neighbors, constraint.rule.target, state.domains as DomainState);
    const targetCanSatisfy = comparatorCanBeSatisfied(targetBounds, constraint.rule.count);

    if (!subjectForced && !targetCanSatisfy) {
      const removed = removeCellKind(state, trail, entry.cellId, constraint.rule.subject);
      if (removed.contradiction !== null) return { changed: removed.changed, contradiction: removed.contradiction };
      changed = changed || removed.changed;
      continue;
    }

    if (!subjectForced) continue;

    const enforced = enforceTargetCount(
      state,
      trail,
      entry.neighbors,
      constraint.rule.target,
      constraint.rule.count,
      targetBounds,
      constraint.rule.id,
    );
    if (enforced.contradiction !== null) return enforced;
    changed = changed || enforced.changed;
  }

  return { changed, contradiction: null };
}

function enforceTargetCount(
  state: SolverState,
  trail: Trail,
  cells: readonly CellId[],
  target: Parameters<typeof containsKind>[1],
  comparator: Parameters<typeof comparatorCanBeSatisfied>[1],
  bounds: CountBounds,
  ruleId: string,
): ConstraintPropagation {
  if (!comparatorCanBeSatisfied(bounds, comparator)) {
    return {
      changed: false,
      contradiction: `Rule ${ruleId} has impossible target-count bounds.`,
    };
  }

  switch (comparator.op) {
    case 'eq': {
      const removeResult = bounds.minimum === comparator.value ? removeTargetFromOptionalCells(state, trail, cells, target) : null;
      if (removeResult?.contradiction !== null && removeResult !== null) return removeResult;

      const forceResult = bounds.maximum === comparator.value ? forceTargetInPossibleCells(state, trail, cells, target) : null;
      if (forceResult?.contradiction !== null && forceResult !== null) return forceResult;

      return {
        changed: (removeResult?.changed ?? false) || (forceResult?.changed ?? false),
        contradiction: null,
      };
    }

    case 'gte': {
      if (bounds.maximum !== comparator.value) return { changed: false, contradiction: null };
      return forceTargetInPossibleCells(state, trail, cells, target);
    }

    case 'lte': {
      if (bounds.minimum !== comparator.value) return { changed: false, contradiction: null };
      return removeTargetFromOptionalCells(state, trail, cells, target);
    }
  }
}

function forceTargetInPossibleCells(
  state: SolverState,
  trail: Trail,
  cells: readonly CellId[],
  target: Parameters<typeof containsKind>[1],
): ConstraintPropagation {
  let changed = false;

  for (const cellId of cells) {
    if (!containsKind(state.domains[cellId], target)) continue;

    const result = intersectCellDomain(state, trail, cellId, singletonMask(target));
    if (result.contradiction !== null) return result;
    changed = changed || result.changed;
  }

  return { changed, contradiction: null };
}

function removeTargetFromOptionalCells(
  state: SolverState,
  trail: Trail,
  cells: readonly CellId[],
  target: Parameters<typeof containsKind>[1],
): ConstraintPropagation {
  let changed = false;
  const targetMask = singletonMask(target);

  for (const cellId of cells) {
    const current = state.domains[cellId];
    if (!containsKind(current, target) || current === targetMask) continue;

    const result = removeCellKind(state, trail, cellId, target);
    if (result.contradiction !== null) return result;
    changed = changed || result.changed;
  }

  return { changed, contradiction: null };
}

function setCellDomain(
  state: SolverState,
  trail: Trail,
  cellId: CellId,
  next: DomainMask,
): DomainMutationResult {
  const current = state.domains[cellId];
  if (current === undefined) {
    return {
      changed: false,
      contradiction: `Unknown cell: ${cellId}.`,
    };
  }

  if (current === next) return { changed: false, contradiction: null };

  trail.changes.push({ cellId, previous: current });
  state.domains[cellId] = next;

  return {
    changed: true,
    contradiction: next === 0 ? `Cell ${cellId} has an empty domain.` : null,
  };
}
