import { allCells, assertNever, lineCells, neighbors, rayCells, regionCells } from '@room-axioms/domain';
import type {
  CellId,
  CellKind,
  Comparator,
  AnchorCountRule,
  AnchorDefinition,
  ForEachCountRule,
  GlobalCountRule,
  LineCountRule,
  PuzzleDefinition,
  RegionCountRule,
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

export interface AnchorCountConstraint {
  readonly kind: 'anchorCount';
  readonly rule: AnchorCountRule;
  readonly anchor: AnchorDefinition;
  readonly entries: readonly ForEachCountEntry[];
}

export interface RegionCountConstraint {
  readonly kind: 'regionCount';
  readonly rule: RegionCountRule;
  readonly cells: readonly CellId[];
}

export interface LineCountConstraint {
  readonly kind: 'lineCount';
  readonly rule: LineCountRule;
  readonly cells: readonly CellId[];
  readonly dynamicScope: boolean;
}

export type CompiledConstraint =
  | GlobalCountConstraint
  | ForEachCountConstraint
  | AnchorCountConstraint
  | RegionCountConstraint
  | LineCountConstraint;

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

export interface AnchorCountBounds {
  readonly kind: 'anchorCount';
  readonly ruleId: string;
  readonly entries: readonly ForEachCountEntryBounds[];
  readonly possible: boolean;
}

export interface RegionCountBounds {
  readonly kind: 'regionCount';
  readonly ruleId: string;
  readonly bounds: CountBounds;
  readonly possible: boolean;
}

export interface LineCountBounds {
  readonly kind: 'lineCount';
  readonly ruleId: string;
  readonly bounds: CountBounds;
  readonly possible: boolean;
}

export type ConstraintBounds =
  | GlobalCountBounds
  | ForEachCountBounds
  | AnchorCountBounds
  | RegionCountBounds
  | LineCountBounds;

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
        evaluateForEachEntryBounds(entry, constraint.rule.subject, constraint.rule.target, constraint.rule.count, domains),
      );

      return {
        kind: 'forEachCount',
        ruleId: constraint.rule.id,
        entries,
        possible: entries.every((entry) => entry.possible),
      };
    }

    case 'anchorCount': {
      const entries = constraint.entries.map((entry) =>
        evaluateForEachEntryBounds(entry, constraint.anchor.subject, constraint.rule.target, constraint.rule.count, domains),
      );

      return {
        kind: 'anchorCount',
        ruleId: constraint.rule.id,
        entries,
        possible: entries.every((entry) => entry.possible),
      };
    }

    case 'regionCount': {
      const bounds = countKindBounds(constraint.cells, constraint.rule.target, domains);

      return {
        kind: 'regionCount',
        ruleId: constraint.rule.id,
        bounds,
        possible: comparatorCanBeSatisfied(bounds, constraint.rule.count),
      };
    }

    case 'lineCount': {
      const bounds = countLineBounds(constraint, domains);

      return {
        kind: 'lineCount',
        ruleId: constraint.rule.id,
        bounds,
        possible: comparatorCanBeSatisfied(bounds, constraint.rule.count),
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

    case 'anchorCount': {
      const anchor = anchorForRule(rule, puzzle);
      return {
        kind: 'anchorCount',
        rule,
        anchor,
        entries: allCells(puzzle.board).map((cellId) => ({
          cellId,
          neighbors: cellsForAnchorRule(rule, cellId, puzzle),
        })),
      };
    }

    case 'regionCount':
      return {
        kind: 'regionCount',
        rule,
        cells: cellsForRegionRule(rule, puzzle),
      };

    case 'lineCount': {
      const line = cellsForLineRule(rule, puzzle);
      return {
        kind: 'lineCount',
        rule,
        cells: line.cells,
        dynamicScope: line.dynamicScope,
      };
    }

    default:
      return assertNever(rule);
  }
}

function anchorForRule(rule: AnchorCountRule, puzzle: PuzzleDefinition): AnchorDefinition {
  const anchor = puzzle.anchors?.find((candidate) => candidate.id === rule.anchorId);
  if (anchor === undefined) {
    throw new Error(`Rule ${rule.id} references unknown anchor ${rule.anchorId}.`);
  }

  return anchor;
}

function cellsForAnchorRule(
  rule: AnchorCountRule,
  cellId: CellId,
  puzzle: PuzzleDefinition,
): readonly CellId[] {
  if (rule.scope.kind === 'orthogonal' || rule.scope.kind === 'adjacent') {
    return neighbors(cellId, rule.scope.kind, puzzle.board);
  }

  throw new Error(`Rule ${rule.id} uses unsupported anchor scope ${rule.scope.kind}.`);
}

function cellsForRegionRule(rule: RegionCountRule, puzzle: PuzzleDefinition): readonly CellId[] {
  const region = puzzle.regions?.find((candidate) => candidate.id === rule.regionId);
  if (region === undefined) {
    throw new Error(`Rule ${rule.id} references unknown region ${rule.regionId}.`);
  }

  return regionCells(region, puzzle.board);
}

export function countLineBounds(
  constraint: LineCountConstraint,
  domains: DomainState,
): CountBounds {
  if (!constraint.dynamicScope) {
    return countKindBounds(constraint.cells, constraint.rule.target, domains);
  }

  if (!lineConstraintScopeComplete(constraint, domains)) {
    return { minimum: 0, maximum: countKindBounds(constraint.cells, constraint.rule.target, domains).maximum };
  }

  return countKindBounds(visibleDynamicLineCells(constraint, domains), constraint.rule.target, domains);
}

export function lineConstraintScopeComplete(
  constraint: LineCountConstraint,
  domains: DomainState,
): boolean {
  return constraint.cells.every((cellId) => {
    const mask = domains[cellId];
    return mask !== undefined && isSingleton(mask);
  });
}

function visibleDynamicLineCells(
  constraint: LineCountConstraint,
  domains: DomainState,
): readonly CellId[] {
  if (constraint.rule.scope.kind !== 'ray') return constraint.cells;

  const blockerKinds = new Set(constraint.rule.scope.stopAtKinds ?? []);
  const visible: CellId[] = [];

  for (const cellId of constraint.cells) {
    const kind = singletonKind(domains[cellId]);
    if (kind !== null && blockerKinds.has(kind)) break;
    visible.push(cellId);
  }

  return visible;
}

function cellsForLineRule(
  rule: LineCountRule,
  puzzle: PuzzleDefinition,
): { readonly cells: readonly CellId[]; readonly dynamicScope: boolean } {
  switch (rule.scope.kind) {
    case 'row':
    case 'column':
      return {
        cells: lineCells(rule.scope, puzzle.board),
        dynamicScope: false,
      };
    case 'ray':
      break;
  }

  if (rule.origin === undefined) {
    throw new Error(`Rule ${rule.id} must include origin for a ray scope.`);
  }

  return {
    cells: rayCells(rule.origin, rule.scope.direction, puzzle.board),
    dynamicScope: (rule.scope.stopAtKinds ?? []).length > 0,
  };
}

function evaluateForEachEntryBounds(
  entry: ForEachCountEntry,
  subject: CellKind,
  target: CellKind,
  count: Comparator,
  domains: DomainState,
): ForEachCountEntryBounds {
  const subjectMask = domains[entry.cellId];
  const subjectPossible = subjectMask !== undefined && containsKind(subjectMask, subject);
  const subjectForced = subjectMask !== undefined && isSingleton(subjectMask) && containsKind(subjectMask, subject);
  const targetBounds = countKindBounds(entry.neighbors, target, domains);
  const targetCanSatisfy = comparatorCanBeSatisfied(targetBounds, count);

  return {
    cellId: entry.cellId,
    subjectPossible,
    subjectForced,
    targetBounds,
    possible: !subjectForced || targetCanSatisfy,
  };
}
