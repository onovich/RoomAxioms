import { allCells, lineCells, neighbors, rayCells, regionCells, sortCellIds } from '@room-axioms/domain';
import type {
  CellId,
  CellKind,
  Comparator,
  AnchorCountRule,
  ConditionalCountClause,
  CountScopeRef,
  ForEachCountRule,
  GlobalCountRule,
  LineCountRule,
  Observation,
  PuzzleDefinition,
  RegionCountRule,
  RuleDefinition,
  ScopeOverlapCountRule,
} from '@room-axioms/domain';

import type { KnowledgeState, ProofPremise } from './types.js';

export interface KnowledgeIndex {
  readonly observationsByCell: ReadonlyMap<CellId, Observation>;
  readonly knownCellIds: readonly CellId[];
  readonly unknownCellIds: readonly CellId[];
}

export interface CountBounds {
  readonly lowerBound: number;
  readonly upperBound: number | null;
}

export interface CountSummary {
  readonly ruleId: string;
  readonly target: CellKind;
  readonly bounds: CountBounds;
  readonly scopeCellIds: readonly CellId[];
  readonly knownTargetCellIds: readonly CellId[];
  readonly knownOtherCellIds: readonly CellId[];
  readonly unknownCellIds: readonly CellId[];
}

export function createKnowledgeIndex(state: KnowledgeState): KnowledgeIndex {
  const observationsByCell = new Map<CellId, Observation>();
  for (const observation of state.observations) observationsByCell.set(observation.cellId, observation);

  const knownCellIds = sortCellIds(observationsByCell.keys(), state.puzzle.board);
  const known = new Set(knownCellIds);
  const unknownCellIds = allCells(state.puzzle.board).filter((cellId) => !known.has(cellId));

  return {
    observationsByCell,
    knownCellIds,
    unknownCellIds,
  };
}

export function summarizeGlobalCount(state: KnowledgeState, rule: GlobalCountRule): CountSummary {
  return summarizeCountInCells(state, rule, allCells(state.puzzle.board));
}

export function summarizeRegionCount(state: KnowledgeState, rule: RegionCountRule): CountSummary {
  const region = state.puzzle.regions?.find((candidate) => candidate.id === rule.regionId);
  if (region === undefined) throw new Error(`Rule ${rule.id} references unknown region ${rule.regionId}.`);

  return summarizeCountInCells(state, rule, regionCells(region, state.puzzle.board));
}

export function summarizeLineCount(state: KnowledgeState, rule: LineCountRule): CountSummary {
  return summarizeCountInCells(state, rule, lineScopeCells(state, rule));
}

export function summarizeScopeOverlapCount(
  state: KnowledgeState,
  rule: ScopeOverlapCountRule,
): CountSummary {
  return summarizeCountInCells(state, rule, scopeOverlapCells(state, rule));
}

export function summarizeConditionalClause(
  state: KnowledgeState,
  ruleId: string,
  clause: ConditionalCountClause,
): CountSummary {
  return summarizeCountInCells(state, { id: ruleId, target: clause.target, count: clause.count }, countScopeCells(state, clause.scope));
}

export function summarizeAnchorScope(
  state: KnowledgeState,
  rule: AnchorCountRule,
  anchorCellId: CellId,
): CountSummary {
  return summarizeCountInCells(state, rule, anchorScopeCells(state.puzzle, rule, anchorCellId));
}

export function summarizeForEachScope(
  state: KnowledgeState,
  rule: ForEachCountRule,
  subjectCellId: CellId,
): CountSummary {
  return summarizeCountInCells(state, rule, scopeCellsForRule(state.puzzle, rule, subjectCellId));
}

export function summarizeCountInCells(
  state: KnowledgeState,
  rule: Pick<RuleDefinition, 'id'> & { readonly target: CellKind; readonly count: Comparator },
  scopeCellIds: readonly CellId[],
): CountSummary {
  const index = createKnowledgeIndex(state);
  const sortedScope = sortCellIds(scopeCellIds, state.puzzle.board);
  const knownTargetCellIds: CellId[] = [];
  const knownOtherCellIds: CellId[] = [];
  const unknownCellIds: CellId[] = [];

  for (const cellId of sortedScope) {
    const observation = index.observationsByCell.get(cellId);
    if (observation === undefined) {
      unknownCellIds.push(cellId);
    } else if (observation.kind === rule.target) {
      knownTargetCellIds.push(cellId);
    } else {
      knownOtherCellIds.push(cellId);
    }
  }

  return {
    ruleId: rule.id,
    target: rule.target,
    bounds: comparatorBounds(rule.count),
    scopeCellIds: sortedScope,
    knownTargetCellIds,
    knownOtherCellIds,
    unknownCellIds,
  };
}

export function scopeCellsForRule(
  puzzle: PuzzleDefinition,
  rule: ForEachCountRule,
  subjectCellId: CellId,
): readonly CellId[] {
  return neighbors(subjectCellId, rule.scope.kind, puzzle.board);
}

export function rulePremise(rule: RuleDefinition): ProofPremise {
  return {
    kind: 'rule',
    label: `${rule.id}: ${rule.presentation.title}`,
    ruleIds: [rule.id],
  };
}

export function scopePremise(
  rule: ForEachCountRule,
  subjectCellId: CellId,
  scopeCellIds: readonly CellId[],
): ProofPremise {
  return {
    kind: 'scope',
    label: `${rule.id} ${rule.scope.kind} scope for ${subjectCellId}: ${scopeCellIds.join(', ')}`,
    cellIds: scopeCellIds,
    ruleIds: [rule.id],
  };
}

export function regionScopePremise(rule: RegionCountRule, scopeCellIds: readonly CellId[]): ProofPremise {
  return {
    kind: 'scope',
    label: `${rule.id} region ${rule.regionId}: ${scopeCellIds.join(', ')}`,
    cellIds: scopeCellIds,
    ruleIds: [rule.id],
  };
}

export function lineScopePremise(rule: LineCountRule, scopeCellIds: readonly CellId[]): ProofPremise {
  const label =
    rule.scope.kind === 'ray'
      ? `${rule.id} ${rule.scope.direction} ray from ${rule.origin ?? 'unknown'}: ${scopeCellIds.join(', ')}`
      : `${rule.id} ${rule.scope.kind} ${rule.scope.index}: ${scopeCellIds.join(', ')}`;

  return {
    kind: 'scope',
    label,
    cellIds: scopeCellIds,
    ruleIds: [rule.id],
  };
}

export function countScopePremise(
  ruleId: string,
  scope: CountScopeRef,
  scopeCellIds: readonly CellId[],
): ProofPremise {
  return {
    kind: 'scope',
    label: `${ruleId} ${countScopeLabel(scope)}: ${scopeCellIds.join(', ')}`,
    cellIds: scopeCellIds,
    ruleIds: [ruleId],
  };
}

export function scopeOverlapPremise(
  rule: ScopeOverlapCountRule,
  scopeCellIds: readonly CellId[],
): ProofPremise {
  return {
    kind: 'scope',
    label: `${rule.id} ${rule.mode} overlap scope: ${scopeCellIds.join(', ')}`,
    cellIds: scopeCellIds,
    ruleIds: [rule.id],
  };
}

export function anchorScopePremise(
  rule: AnchorCountRule,
  anchorCellId: CellId,
  scopeCellIds: readonly CellId[],
): ProofPremise {
  return {
    kind: 'scope',
    label: `${rule.id} anchor ${rule.anchorId} scope for ${anchorCellId}: ${scopeCellIds.join(', ')}`,
    cellIds: scopeCellIds,
    ruleIds: [rule.id],
  };
}

export function countPremise(summary: CountSummary): ProofPremise {
  return {
    kind: 'count',
    label: [
      `${summary.ruleId} ${summary.target} count ${boundsLabel(summary.bounds)}`,
      `known target ${summary.knownTargetCellIds.length}`,
      `known other ${summary.knownOtherCellIds.length}`,
      `unknown ${summary.unknownCellIds.length}`,
    ].join('; '),
    cellIds: summary.scopeCellIds,
    ruleIds: [summary.ruleId],
  };
}

function lineScopeCells(state: KnowledgeState, rule: LineCountRule): readonly CellId[] {
  switch (rule.scope.kind) {
    case 'row':
    case 'column':
      return lineCells(rule.scope, state.puzzle.board);
    case 'ray':
      break;
  }

  if (rule.origin === undefined) throw new Error(`Rule ${rule.id} must include origin for a ray scope.`);

  const cells = rayCells(rule.origin, rule.scope.direction, state.puzzle.board);
  const stopAtKinds = new Set(rule.scope.stopAtKinds ?? []);
  if (stopAtKinds.size === 0) return cells;

  const observations = createKnowledgeIndex(state).observationsByCell;
  const visible: CellId[] = [];

  for (const cellId of cells) {
    const observedKind = observations.get(cellId)?.kind;
    if (observedKind !== undefined && stopAtKinds.has(observedKind)) break;
    visible.push(cellId);
  }

  return visible;
}

function countScopeCells(state: KnowledgeState, scope: CountScopeRef): readonly CellId[] {
  switch (scope.kind) {
    case 'global':
      return allCells(state.puzzle.board);
    case 'region': {
      const region = state.puzzle.regions?.find((candidate) => candidate.id === scope.regionId);
      if (region === undefined) throw new Error(`Count scope references unknown region ${scope.regionId}.`);
      return regionCells(region, state.puzzle.board);
    }
    case 'line':
      return lineCountScopeCells(state, scope);
  }
}

function lineCountScopeCells(state: KnowledgeState, scope: Extract<CountScopeRef, { readonly kind: 'line' }>): readonly CellId[] {
  switch (scope.scope.kind) {
    case 'row':
    case 'column':
      return lineCells(scope.scope, state.puzzle.board);
    case 'ray':
      break;
  }

  if (scope.origin === undefined) throw new Error('Line count scope must include origin for a ray scope.');

  const cells = rayCells(scope.origin, scope.scope.direction, state.puzzle.board);
  const stopAtKinds = new Set(scope.scope.stopAtKinds ?? []);
  if (stopAtKinds.size === 0) return cells;

  const observations = createKnowledgeIndex(state).observationsByCell;
  const visible: CellId[] = [];

  for (const cellId of cells) {
    const observedKind = observations.get(cellId)?.kind;
    if (observedKind !== undefined && stopAtKinds.has(observedKind)) break;
    visible.push(cellId);
  }

  return visible;
}

function scopeOverlapCells(state: KnowledgeState, rule: ScopeOverlapCountRule): readonly CellId[] {
  const left = countScopeCells(state, rule.left);
  const right = countScopeCells(state, rule.right);
  const rightSet = new Set(right);
  const leftSet = new Set(left);

  switch (rule.mode) {
    case 'intersection':
      return sortCellIds(left.filter((cellId) => rightSet.has(cellId)), state.puzzle.board);
    case 'union':
      return sortCellIds(new Set([...left, ...right]), state.puzzle.board);
    case 'leftOnly':
      return sortCellIds(left.filter((cellId) => !rightSet.has(cellId)), state.puzzle.board);
    case 'rightOnly':
      return sortCellIds(right.filter((cellId) => !leftSet.has(cellId)), state.puzzle.board);
  }
}

function countScopeLabel(scope: CountScopeRef): string {
  switch (scope.kind) {
    case 'global':
      return 'global scope';
    case 'region':
      return `region ${scope.regionId}`;
    case 'line':
      if (scope.scope.kind === 'ray') return `${scope.scope.direction} ray from ${scope.origin ?? 'unknown'}`;
      return `${scope.scope.kind} ${scope.scope.index}`;
  }
}

function anchorScopeCells(
  puzzle: KnowledgeState['puzzle'],
  rule: AnchorCountRule,
  anchorCellId: CellId,
): readonly CellId[] {
  if (rule.scope.kind === 'orthogonal' || rule.scope.kind === 'adjacent') {
    return neighbors(anchorCellId, rule.scope.kind, puzzle.board);
  }

  throw new Error(`Rule ${rule.id} uses unsupported anchor scope ${rule.scope.kind}.`);
}

export function comparatorBounds(comparator: Comparator): CountBounds {
  switch (comparator.op) {
    case 'eq':
      return { lowerBound: comparator.value, upperBound: comparator.value };
    case 'neq':
      return { lowerBound: 0, upperBound: null };
    case 'gt':
      return { lowerBound: comparator.value + 1, upperBound: null };
    case 'gte':
      return { lowerBound: comparator.value, upperBound: null };
    case 'lt':
      return { lowerBound: 0, upperBound: Math.max(0, comparator.value - 1) };
    case 'lte':
      return { lowerBound: 0, upperBound: comparator.value };
  }
}

function boundsLabel(bounds: CountBounds): string {
  if (bounds.upperBound === null) return `>= ${bounds.lowerBound}`;
  if (bounds.lowerBound === bounds.upperBound) return `= ${bounds.lowerBound}`;
  return `${bounds.lowerBound}..${bounds.upperBound}`;
}
