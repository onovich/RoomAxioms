import { allCells, assertNever, lineCells, neighbors, rayCells, regionCells } from '@room-axioms/domain';
import type {
  CellId,
  CellKind,
  Comparator,
  AnchorCountRule,
  AnchorDefinition,
  ComparativeCountRule,
  ConditionalCountRule,
  CountScopeRef,
  ForEachCountRule,
  GlobalCountRule,
  LineCountRule,
  LocalScopeKind,
  PuzzleDefinition,
  RegionCountRule,
  RuleDefinition,
  ScopeOverlapCountRule,
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

export interface CountScopeConstraint {
  readonly source: CountScopeRef;
  readonly cells: readonly CellId[];
  readonly dynamicScope: boolean;
}

export interface ScopeOverlapCountConstraint {
  readonly kind: 'scopeOverlapCount';
  readonly rule: ScopeOverlapCountRule;
  readonly left: CountScopeConstraint;
  readonly right: CountScopeConstraint;
}

export interface ComparativeCountConstraint {
  readonly kind: 'comparativeCount';
  readonly rule: ComparativeCountRule;
  readonly left: CountScopeConstraint;
  readonly right: CountScopeConstraint;
}

export interface ConditionalCountConstraint {
  readonly kind: 'conditionalCount';
  readonly rule: ConditionalCountRule;
  readonly condition: CountScopeConstraint;
  readonly then: CountScopeConstraint;
}

export type CompiledConstraint =
  | GlobalCountConstraint
  | ForEachCountConstraint
  | AnchorCountConstraint
  | RegionCountConstraint
  | LineCountConstraint
  | ScopeOverlapCountConstraint
  | ComparativeCountConstraint
  | ConditionalCountConstraint;

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

export interface ScopeOverlapCountBounds {
  readonly kind: 'scopeOverlapCount';
  readonly ruleId: string;
  readonly cells: readonly CellId[];
  readonly bounds: CountBounds;
  readonly possible: boolean;
}

export interface ComparativeCountBounds {
  readonly kind: 'comparativeCount';
  readonly ruleId: string;
  readonly leftBounds: CountBounds;
  readonly rightBounds: CountBounds;
  readonly possible: boolean;
}

export interface ConditionalCountBounds {
  readonly kind: 'conditionalCount';
  readonly ruleId: string;
  readonly conditionBounds: CountBounds;
  readonly thenBounds: CountBounds;
  readonly conditionCanBeTrue: boolean;
  readonly conditionMustBeTrue: boolean;
  readonly thenCanBeSatisfied: boolean;
  readonly possible: boolean;
}

export type ConstraintBounds =
  | GlobalCountBounds
  | ForEachCountBounds
  | AnchorCountBounds
  | RegionCountBounds
  | LineCountBounds
  | ScopeOverlapCountBounds
  | ComparativeCountBounds
  | ConditionalCountBounds;

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

    case 'scopeOverlapCount': {
      const resolved = scopeOverlapCells(constraint, domains);
      const bounds = countCellsWithScopeCompleteness(resolved.cells, constraint.rule.target, resolved.complete, domains);

      return {
        kind: 'scopeOverlapCount',
        ruleId: constraint.rule.id,
        cells: resolved.cells,
        bounds,
        possible: comparatorCanBeSatisfied(bounds, constraint.rule.count),
      };
    }

    case 'comparativeCount': {
      const leftBounds = countScopeBounds(constraint.left, constraint.rule.target, domains);
      const rightBounds = countScopeBounds(constraint.right, constraint.rule.target, domains);

      return {
        kind: 'comparativeCount',
        ruleId: constraint.rule.id,
        leftBounds,
        rightBounds,
        possible: countComparisonCanBeSatisfied(leftBounds, rightBounds, constraint.rule.comparison),
      };
    }

    case 'conditionalCount': {
      const conditionBounds = countScopeBounds(
        constraint.condition,
        constraint.rule.condition.target,
        domains,
      );
      const thenBounds = countScopeBounds(
        constraint.then,
        constraint.rule.then.target,
        domains,
      );
      const conditionCanBeTrue = comparatorCanBeSatisfied(conditionBounds, constraint.rule.condition.count);
      const conditionMustBeTrue = allCountsSatisfyComparator(conditionBounds, constraint.rule.condition.count);
      const thenCanBeSatisfied = comparatorCanBeSatisfied(thenBounds, constraint.rule.then.count);

      return {
        kind: 'conditionalCount',
        ruleId: constraint.rule.id,
        conditionBounds,
        thenBounds,
        conditionCanBeTrue,
        conditionMustBeTrue,
        thenCanBeSatisfied,
        possible: !conditionMustBeTrue || thenCanBeSatisfied,
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
    case 'neq':
      return bounds.minimum !== comparator.value || bounds.maximum !== comparator.value;
    case 'gt':
      return bounds.maximum > comparator.value;
    case 'gte':
      return bounds.maximum >= comparator.value;
    case 'lt':
      return bounds.minimum < comparator.value;
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

    case 'recordSet':
      throw new Error(`Record-set rule ${rule.id} must be expanded before constraint compilation.`);

    case 'scopeOverlapCount':
      return {
        kind: 'scopeOverlapCount',
        rule,
        left: cellsForCountScope(rule.left, puzzle, rule.id),
        right: cellsForCountScope(rule.right, puzzle, rule.id),
      };

    case 'comparativeCount':
      return {
        kind: 'comparativeCount',
        rule,
        left: cellsForCountScope(rule.left, puzzle, rule.id),
        right: cellsForCountScope(rule.right, puzzle, rule.id),
      };

    case 'conditionalCount':
      return {
        kind: 'conditionalCount',
        rule,
        condition: cellsForCountScope(rule.condition.scope, puzzle, rule.id),
        then: cellsForCountScope(rule.then.scope, puzzle, rule.id),
      };

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
  if (isLocalScopeKind(rule.scope.kind)) {
    return neighbors(cellId, rule.scope.kind, puzzle.board);
  }

  throw new Error(`Rule ${rule.id} uses unsupported anchor scope ${rule.scope.kind}.`);
}

function isLocalScopeKind(kind: string): kind is LocalScopeKind {
  return (
    kind === 'orthogonal' ||
    kind === 'adjacent' ||
    kind === 'north' ||
    kind === 'south' ||
    kind === 'east' ||
    kind === 'west'
  );
}

function cellsForRegionRule(rule: RegionCountRule, puzzle: PuzzleDefinition): readonly CellId[] {
  const region = puzzle.regions?.find((candidate) => candidate.id === rule.regionId);
  if (region === undefined) {
    throw new Error(`Rule ${rule.id} references unknown region ${rule.regionId}.`);
  }

  return regionCells(region, puzzle.board);
}

function cellsForCountScope(
  scope: CountScopeRef,
  puzzle: PuzzleDefinition,
  ruleId: string,
): CountScopeConstraint {
  switch (scope.kind) {
    case 'global':
      return {
        source: scope,
        cells: allCells(puzzle.board),
        dynamicScope: false,
      };

    case 'region': {
      const region = puzzle.regions?.find((candidate) => candidate.id === scope.regionId);
      if (region === undefined) {
        throw new Error(`Rule ${ruleId} references unknown region ${scope.regionId}.`);
      }

      return {
        source: scope,
        cells: regionCells(region, puzzle.board),
        dynamicScope: false,
      };
    }

    case 'line': {
      const line = cellsForLineScope(scope.scope, scope.origin, puzzle, ruleId);

      return {
        source: scope,
        cells: line.cells,
        dynamicScope: line.dynamicScope,
      };
    }

    default:
      return assertNever(scope);
  }
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
  return cellsForLineScope(rule.scope, rule.origin, puzzle, rule.id);
}

function cellsForLineScope(
  scope: LineCountRule['scope'],
  origin: CellId | undefined,
  puzzle: PuzzleDefinition,
  ruleId: string,
): { readonly cells: readonly CellId[]; readonly dynamicScope: boolean } {
  switch (scope.kind) {
    case 'row':
    case 'column':
      return {
        cells: lineCells(scope, puzzle.board),
        dynamicScope: false,
      };
    case 'ray':
      break;
  }

  if (origin === undefined) {
    throw new Error(`Rule ${ruleId} must include origin for a ray scope.`);
  }

  return {
    cells: rayCells(origin, scope.direction, puzzle.board),
    dynamicScope: (scope.stopAtKinds ?? []).length > 0,
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

export function countScopeBounds(
  scope: CountScopeConstraint,
  target: CellKind,
  domains: DomainState,
): CountBounds {
  const resolved = countScopeCells(scope, domains);

  return countCellsWithScopeCompleteness(resolved.cells, target, resolved.complete, domains);
}

function countCellsWithScopeCompleteness(
  cells: readonly CellId[],
  target: CellKind,
  complete: boolean,
  domains: DomainState,
): CountBounds {
  const bounds = countKindBounds(cells, target, domains);
  if (complete) return bounds;

  return {
    minimum: 0,
    maximum: bounds.maximum,
  };
}

function countScopeCells(
  scope: CountScopeConstraint,
  domains: DomainState,
): { readonly cells: readonly CellId[]; readonly complete: boolean } {
  if (!scope.dynamicScope) {
    return {
      cells: scope.cells,
      complete: true,
    };
  }

  if (!countScopeComplete(scope, domains)) {
    return {
      cells: scope.cells,
      complete: false,
    };
  }

  return {
    cells: visibleDynamicCountScopeCells(scope, domains),
    complete: true,
  };
}

function countScopeComplete(scope: CountScopeConstraint, domains: DomainState): boolean {
  return scope.cells.every((cellId) => {
    const mask = domains[cellId];
    return mask !== undefined && isSingleton(mask);
  });
}

function visibleDynamicCountScopeCells(
  scope: CountScopeConstraint,
  domains: DomainState,
): readonly CellId[] {
  if (scope.source.kind !== 'line' || scope.source.scope.kind !== 'ray') return scope.cells;

  const blockerKinds = new Set(scope.source.scope.stopAtKinds ?? []);
  const visible: CellId[] = [];

  for (const cellId of scope.cells) {
    const kind = singletonKind(domains[cellId]);
    if (kind !== null && blockerKinds.has(kind)) break;
    visible.push(cellId);
  }

  return visible;
}

function scopeOverlapCells(
  constraint: ScopeOverlapCountConstraint,
  domains: DomainState,
): { readonly cells: readonly CellId[]; readonly complete: boolean } {
  const left = countScopeCells(constraint.left, domains);
  const right = countScopeCells(constraint.right, domains);
  const leftSet = new Set(left.cells);
  const rightSet = new Set(right.cells);

  switch (constraint.rule.mode) {
    case 'intersection':
      return {
        cells: left.cells.filter((cellId) => rightSet.has(cellId)),
        complete: left.complete && right.complete,
      };
    case 'union':
      return {
        cells: [...left.cells, ...right.cells.filter((cellId) => !leftSet.has(cellId))],
        complete: left.complete && right.complete,
      };
    case 'leftOnly':
      return {
        cells: left.cells.filter((cellId) => !rightSet.has(cellId)),
        complete: left.complete && right.complete,
      };
    case 'rightOnly':
      return {
        cells: right.cells.filter((cellId) => !leftSet.has(cellId)),
        complete: left.complete && right.complete,
      };
    default:
      return assertNever(constraint.rule.mode);
  }
}

export function countComparisonCanBeSatisfied(
  left: CountBounds,
  right: CountBounds,
  comparison: ComparativeCountRule['comparison'],
): boolean {
  const offset = comparison.offset ?? 0;
  const rightMinimum = right.minimum + offset;
  const rightMaximum = right.maximum + offset;

  switch (comparison.op) {
    case 'eq':
      return left.minimum <= rightMaximum && rightMinimum <= left.maximum;
    case 'neq':
      return left.minimum !== left.maximum || rightMinimum !== rightMaximum || left.minimum !== rightMinimum;
    case 'gt':
      return left.maximum > rightMinimum;
    case 'gte':
      return left.maximum >= rightMinimum;
    case 'lt':
      return left.minimum < rightMaximum;
    case 'lte':
      return left.minimum <= rightMaximum;
    default:
      return assertNever(comparison.op);
  }
}

export function allCountsSatisfyComparator(bounds: CountBounds, comparator: Comparator): boolean {
  switch (comparator.op) {
    case 'eq':
      return bounds.minimum === comparator.value && bounds.maximum === comparator.value;
    case 'neq':
      return comparator.value < bounds.minimum || comparator.value > bounds.maximum;
    case 'gt':
      return bounds.minimum > comparator.value;
    case 'gte':
      return bounds.minimum >= comparator.value;
    case 'lt':
      return bounds.maximum < comparator.value;
    case 'lte':
      return bounds.maximum <= comparator.value;
    default:
      return assertNever(comparator);
  }
}
