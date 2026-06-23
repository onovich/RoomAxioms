import { allCells, neighbors, sortCellIds } from '@room-axioms/domain';
import type {
  CellId,
  CellKind,
  Comparator,
  ForEachCountRule,
  GlobalCountRule,
  Observation,
  PuzzleDefinition,
  RuleDefinition,
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

export function summarizeForEachScope(
  state: KnowledgeState,
  rule: ForEachCountRule,
  subjectCellId: CellId,
): CountSummary {
  return summarizeCountInCells(state, rule, scopeCellsForRule(state.puzzle, rule, subjectCellId));
}

export function summarizeCountInCells(
  state: KnowledgeState,
  rule: GlobalCountRule | ForEachCountRule,
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

export function comparatorBounds(comparator: Comparator): CountBounds {
  switch (comparator.op) {
    case 'eq':
      return { lowerBound: comparator.value, upperBound: comparator.value };
    case 'gte':
      return { lowerBound: comparator.value, upperBound: null };
    case 'lte':
      return { lowerBound: 0, upperBound: comparator.value };
  }
}

function boundsLabel(bounds: CountBounds): string {
  if (bounds.upperBound === null) return `>= ${bounds.lowerBound}`;
  if (bounds.lowerBound === bounds.upperBound) return `= ${bounds.lowerBound}`;
  return `${bounds.lowerBound}..${bounds.upperBound}`;
}
