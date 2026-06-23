import { allCells, assertNever, neighbors } from '@room-axioms/domain';
import type {
  CellId,
  CellKind,
  Comparator,
  ForEachCountRule,
  GlobalCountRule,
  PuzzleDefinition,
  RuleDefinition,
} from '@room-axioms/domain';

import { containsKind, isSingleton, singletonKind } from './bitset.js';
import type { DomainState } from './bitset.js';

export interface CountBounds {
  readonly minimum: number;
  readonly maximum: number;
}

export interface GlobalCountConstraint {
  readonly kind: 'globalCount';
  readonly rule: GlobalCountRule;
  readonly cells: readonly CellId[];
}

export interface ForEachCountEntry {
  readonly cellId: CellId;
  readonly neighbors: readonly CellId[];
}

export interface ForEachCountConstraint {
  readonly kind: 'forEachCount';
  readonly rule: ForEachCountRule;
  readonly entries: readonly ForEachCountEntry[];
}

export type CompiledConstraint = GlobalCountConstraint | ForEachCountConstraint;

export interface GlobalCountBounds {
  readonly kind: 'globalCount';
  readonly ruleId: string;
  readonly bounds: CountBounds;
  readonly possible: boolean;
}

export interface ForEachCountEntryBounds {
  readonly cellId: CellId;
  readonly subjectPossible: boolean;
  readonly subjectForced: boolean;
  readonly targetBounds: CountBounds;
  readonly possible: boolean;
}

export interface ForEachCountBounds {
  readonly kind: 'forEachCount';
  readonly ruleId: string;
  readonly entries: readonly ForEachCountEntryBounds[];
  readonly possible: boolean;
}

export type ConstraintBounds = GlobalCountBounds | ForEachCountBounds;

export function compileConstraints(puzzle: PuzzleDefinition): readonly CompiledConstraint[] {
  return puzzle.rules.map((rule) => compileRule(rule, puzzle));
}

export function evaluateConstraintBounds(
  constraint: CompiledConstraint,
  domains: DomainState,
): ConstraintBounds {
  switch (constraint.kind) {
    case 'globalCount': {
      const bounds = countKindBounds(constraint.cells, constraint.rule.target, domains);

      return {
        kind: 'globalCount',
        ruleId: constraint.rule.id,
        bounds,
        possible: comparatorCanBeSatisfied(bounds, constraint.rule.count),
      };
    }

    case 'forEachCount': {
      const entries = constraint.entries.map((entry) =>
        evaluateForEachEntryBounds(entry, constraint.rule, domains),
      );

      return {
        kind: 'forEachCount',
        ruleId: constraint.rule.id,
        entries,
        possible: entries.every((entry) => entry.possible),
      };
    }

    default:
      return assertNever(constraint);
  }
}

export function countKindBounds(
  cells: readonly CellId[],
  target: CellKind,
  domains: DomainState,
): CountBounds {
  let minimum = 0;
  let maximum = 0;

  for (const cellId of cells) {
    const mask = domains[cellId];
    if (mask === undefined) continue;
    if (singletonKind(mask) === target) minimum += 1;
    if (containsKind(mask, target)) maximum += 1;
  }

  return { minimum, maximum };
}

export function comparatorCanBeSatisfied(bounds: CountBounds, comparator: Comparator): boolean {
  switch (comparator.op) {
    case 'eq':
      return bounds.minimum <= comparator.value && comparator.value <= bounds.maximum;
    case 'gte':
      return bounds.maximum >= comparator.value;
    case 'lte':
      return bounds.minimum <= comparator.value;
    default:
      return assertNever(comparator);
  }
}

function compileRule(rule: RuleDefinition, puzzle: PuzzleDefinition): CompiledConstraint {
  switch (rule.type) {
    case 'globalCount':
      return {
        kind: 'globalCount',
        rule,
        cells: allCells(puzzle.board),
      };

    case 'forEachCount':
      return {
        kind: 'forEachCount',
        rule,
        entries: allCells(puzzle.board).map((cellId) => ({
          cellId,
          neighbors: neighbors(cellId, rule.scope.kind, puzzle.board),
        })),
      };

    default:
      return assertNever(rule);
  }
}

function evaluateForEachEntryBounds(
  entry: ForEachCountEntry,
  rule: ForEachCountRule,
  domains: DomainState,
): ForEachCountEntryBounds {
  const subjectMask = domains[entry.cellId];
  const subjectPossible = subjectMask !== undefined && containsKind(subjectMask, rule.subject);
  const subjectForced = subjectMask !== undefined && isSingleton(subjectMask) && containsKind(subjectMask, rule.subject);
  const targetBounds = countKindBounds(entry.neighbors, rule.target, domains);
  const targetCanSatisfy = comparatorCanBeSatisfied(targetBounds, rule.count);

  return {
    cellId: entry.cellId,
    subjectPossible,
    subjectForced,
    targetBounds,
    possible: !subjectForced || targetCanSatisfy,
  };
}
