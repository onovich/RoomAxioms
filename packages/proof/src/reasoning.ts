import { allCells, lineCells, neighbors, rayCells, regionCells, sortCellIds } from '@room-axioms/domain';
import type {
  CellId,
  CellKind,
  Comparator,
  AnchorCountRule,
  ComparativeCountRule,
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

import type { Deduction, KnowledgeState, ProofPremise } from './types.js';

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
  readonly derivedPremises: readonly ProofPremise[];
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

export function summarizeGlobalCount(
  state: KnowledgeState,
  rule: GlobalCountRule,
  derivedDeductions: readonly Deduction[] = [],
): CountSummary {
  return summarizeCountInCells(state, rule, allCells(state.puzzle.board), derivedDeductions);
}

export function summarizeRegionCount(
  state: KnowledgeState,
  rule: RegionCountRule,
  derivedDeductions: readonly Deduction[] = [],
): CountSummary {
  const region = state.puzzle.regions?.find((candidate) => candidate.id === rule.regionId);
  if (region === undefined) throw new Error(`Rule ${rule.id} references unknown region ${rule.regionId}.`);

  return summarizeCountInCells(state, rule, regionCells(region, state.puzzle.board), derivedDeductions);
}

export function summarizeLineCount(
  state: KnowledgeState,
  rule: LineCountRule,
  derivedDeductions: readonly Deduction[] = [],
): CountSummary {
  return summarizeCountInCells(state, rule, lineScopeCells(state, rule), derivedDeductions);
}

export function summarizeScopeOverlapCount(
  state: KnowledgeState,
  rule: ScopeOverlapCountRule,
  derivedDeductions: readonly Deduction[] = [],
): CountSummary {
  return summarizeCountInCells(state, rule, scopeOverlapCells(state, rule), derivedDeductions);
}

export function summarizeConditionalClause(
  state: KnowledgeState,
  ruleId: string,
  clause: ConditionalCountClause,
  derivedDeductions: readonly Deduction[] = [],
): CountSummary {
  return summarizeCountInCells(
    state,
    { id: ruleId, target: clause.target, count: clause.count },
    countScopeCells(state, clause.scope),
    derivedDeductions,
  );
}

export function summarizeComparativeScope(
  state: KnowledgeState,
  rule: ComparativeCountRule,
  side: 'left' | 'right',
  derivedDeductions: readonly Deduction[] = [],
): CountSummary {
  const scope = side === 'left' ? rule.left : rule.right;
  return summarizeCountInCells(
    state,
    { id: rule.id, target: rule.target, count: { op: 'gte', value: 0 } },
    countScopeCells(state, scope),
    derivedDeductions,
  );
}

export function summarizeAnchorScope(
  state: KnowledgeState,
  rule: AnchorCountRule,
  anchorCellId: CellId,
  derivedDeductions: readonly Deduction[] = [],
): CountSummary {
  return summarizeCountInCells(
    state,
    rule,
    anchorScopeCells(state.puzzle, rule, anchorCellId),
    derivedDeductions,
  );
}

export function summarizeForEachScope(
  state: KnowledgeState,
  rule: ForEachCountRule,
  subjectCellId: CellId,
  derivedDeductions: readonly Deduction[] = [],
): CountSummary {
  return summarizeCountInCells(
    state,
    rule,
    scopeCellsForRule(state.puzzle, rule, subjectCellId),
    derivedDeductions,
  );
}

export function summarizeCountInCells(
  state: KnowledgeState,
  rule: Pick<RuleDefinition, 'id'> & { readonly target: CellKind; readonly count: Comparator },
  scopeCellIds: readonly CellId[],
  derivedDeductions: readonly Deduction[] = [],
): CountSummary {
  const index = createKnowledgeIndex(state);
  const sortedScope = sortCellIds(scopeCellIds, state.puzzle.board);
  const knownTargetCellIds: CellId[] = [];
  const knownOtherCellIds: CellId[] = [];
  const unknownCellIds: CellId[] = [];
  const derivedPremisesByLabel = new Map<string, ProofPremise>();

  for (const cellId of sortedScope) {
    const observation = index.observationsByCell.get(cellId);
    if (observation === undefined) {
      const derivedFact = derivedCountFactForCell(rule.target, cellId, derivedDeductions);
      if (derivedFact === null) {
        unknownCellIds.push(cellId);
      } else if (derivedFact.kind === 'target') {
        knownTargetCellIds.push(cellId);
        derivedPremisesByLabel.set(derivedFact.premise.label, derivedFact.premise);
      } else {
        knownOtherCellIds.push(cellId);
        derivedPremisesByLabel.set(derivedFact.premise.label, derivedFact.premise);
      }
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
    derivedPremises: [...derivedPremisesByLabel.values()],
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

export function comparativePremise(rule: ComparativeCountRule, fixedSide: 'left' | 'right', fixedCount: number): ProofPremise {
  const offset = rule.comparison.offset ?? 0;
  const offsetText = offset === 0 ? '' : offset > 0 ? ` + ${offset}` : ` - ${Math.abs(offset)}`;
  return {
    kind: 'count',
    label: `${rule.id} comparative ${rule.comparison.op}: left ${rule.target} count = right count${offsetText}; ${fixedSide} side fixed at ${fixedCount}`,
    ruleIds: [rule.id],
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

export function countPremises(summary: CountSummary): readonly ProofPremise[] {
  return [...summary.derivedPremises, countPremise(summary)];
}

interface DerivedCountFact {
  readonly kind: 'target' | 'other';
  readonly premise: ProofPremise;
}

function derivedCountFactForCell(
  target: CellKind,
  cellId: CellId,
  deductions: readonly Deduction[],
): DerivedCountFact | null {
  for (const deduction of deductions) {
    if (deduction.conclusion.cellId !== cellId) continue;

    if (deduction.conclusion.kind === 'guest') {
      return {
        kind: target === 'guest' ? 'target' : 'other',
        premise: derivedPremise(deduction),
      };
    }

    if (deduction.conclusion.kind === 'object') {
      return {
        kind: deduction.conclusion.object === target ? 'target' : 'other',
        premise: derivedPremise(deduction),
      };
    }

    if (deduction.conclusion.kind === 'safe' && target === 'guest') {
      return {
        kind: 'other',
        premise: derivedPremise(deduction),
      };
    }
  }

  return null;
}

function derivedPremise(deduction: Deduction): ProofPremise {
  return {
    kind: 'derived',
    label: deduction.id,
    cellIds: [deduction.conclusion.cellId],
    ruleIds: deduction.ruleIds,
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
