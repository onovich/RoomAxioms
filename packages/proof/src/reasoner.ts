import { sortCellIds } from '@room-axioms/domain';
import type {
  CellId,
  CellKind,
  ForEachCountRule,
  GlobalCountRule,
  RuleDefinition,
} from '@room-axioms/domain';

import { createDeduction, normalizeProofPremises } from './graph.js';
import {
  comparatorBounds,
  countPremise,
  createKnowledgeIndex,
  rulePremise,
  scopePremise,
  summarizeForEachScope,
  summarizeGlobalCount,
} from './reasoning.js';
import type { Deduction, DeductionConclusion, KnowledgeState, ProofPremise } from './types.js';

export function deriveHumanDeductions(state: KnowledgeState): readonly Deduction[] {
  const baseDeductions: Deduction[] = [];

  for (const rule of state.puzzle.rules) {
    if (rule.type === 'globalCount') {
      baseDeductions.push(...deriveGlobalCountDeductions(state, rule));
    } else if (rule.type === 'forEachCount') {
      baseDeductions.push(...deriveLocalCountDeductions(state, rule));
    }
  }

  const intersectionDeductions = deriveUniqueTargetNeighborIntersectionDeductions(state);
  const derivedLocalDeductions: Deduction[] = [];

  for (const rule of state.puzzle.rules) {
    if (rule.type === 'forEachCount') {
      derivedLocalDeductions.push(
        ...deriveLocalCountDeductions(state, rule, intersectionDeductions),
      );
    }
  }

  const objectDeductions = mergeDeductions([
    ...baseDeductions,
    ...intersectionDeductions,
    ...derivedLocalDeductions,
  ]);
  const safeFromObjectDeductions = deriveKnownSafeFromObjectDeductions(state, objectDeductions);
  const deductions = mergeDeductions([...objectDeductions, ...safeFromObjectDeductions]);

  return sortDeductions(state, mergeDeductions(deductions));
}

export function deriveGlobalCountDeductions(
  state: KnowledgeState,
  rule: GlobalCountRule,
): readonly Deduction[] {
  const summary = summarizeGlobalCount(state, rule);
  const premises = [rulePremise(rule), countPremise(summary)];
  const deductions: Deduction[] = [];
  const upperBound = summary.bounds.upperBound;

  if (
    rule.target === 'guest' &&
    upperBound !== null &&
    summary.knownTargetCellIds.length === upperBound
  ) {
    for (const cellId of summary.unknownCellIds) {
      deductions.push(createDeduction({
        technique: 'GLOBAL_COUNT_SATURATED',
        conclusion: { kind: 'safe', cellId },
        ruleIds: [rule.id],
        premises,
      }));
    }
  }

  const remainingRequired = summary.bounds.lowerBound - summary.knownTargetCellIds.length;
  if (remainingRequired > 0 && remainingRequired === summary.unknownCellIds.length) {
    for (const cellId of summary.unknownCellIds) {
      deductions.push(createDeduction({
        technique: 'GLOBAL_COUNT_ALL_REMAINING',
        conclusion: targetConclusion(cellId, rule.target),
        ruleIds: [rule.id],
        premises,
      }));
    }
  }

  return sortDeductions(state, deductions);
}

export function deriveLocalCountDeductions(
  state: KnowledgeState,
  rule: ForEachCountRule,
  objectDeductions: readonly Deduction[] = [],
): readonly Deduction[] {
  const deductions: Deduction[] = [];

  for (const subjectFact of knownSubjectFacts(state, rule.subject, objectDeductions)) {
    const summary = summarizeForEachScope(state, rule, subjectFact.cellId);
    const premises = [
      rulePremise(rule),
      subjectFact.premise,
      scopePremise(rule, subjectFact.cellId, summary.scopeCellIds),
      countPremise(summary),
    ];
    const upperBound = summary.bounds.upperBound;

    if (
      rule.target === 'guest' &&
      upperBound !== null &&
      summary.knownTargetCellIds.length === upperBound
    ) {
      for (const cellId of summary.unknownCellIds) {
        deductions.push(createDeduction({
          technique: 'LOCAL_COUNT_SATURATED',
          conclusion: { kind: 'safe', cellId },
          ruleIds: [rule.id],
          premises,
        }));
      }
    }

    const remainingRequired = summary.bounds.lowerBound - summary.knownTargetCellIds.length;
    if (remainingRequired > 0 && remainingRequired === summary.unknownCellIds.length) {
      for (const cellId of summary.unknownCellIds) {
        deductions.push(createDeduction({
          technique: 'LOCAL_COUNT_ALL_REMAINING',
          conclusion: targetConclusion(cellId, rule.target),
          ruleIds: [rule.id],
          premises,
        }));
      }
    }
  }

  return sortDeductions(state, mergeDeductions(deductions));
}

export function deriveUniqueTargetNeighborIntersectionDeductions(
  state: KnowledgeState,
  objectDeductions: readonly Deduction[] = [],
): readonly Deduction[] {
  const deductions: Deduction[] = [];
  const singletonGlobalRules = state.puzzle.rules.filter(isUnresolvedGlobalSingletonRule);

  for (const globalRule of singletonGlobalRules) {
    const globalSummary = summarizeGlobalCount(state, globalRule);
    if (globalSummary.knownTargetCellIds.length > 0) continue;

    const localRules = state.puzzle.rules
      .filter(isForEachCountRule)
      .filter((rule) => rule.target === globalRule.target)
      .filter((rule) => comparatorBounds(rule.count).lowerBound > 0);

    for (const localRule of localRules) {
      const subjectScopes = possibleRequiredTargetScopes(state, localRule, objectDeductions);
      if (subjectScopes.length < 2) continue;

      const intersection = intersectCellSets(subjectScopes.map((scope) => scope.possibleTargetCellIds));
      if (intersection.length !== 1) continue;

      const [cellId] = intersection;
      if (cellId === undefined || globalSummary.knownOtherCellIds.includes(cellId)) continue;

      deductions.push(createDeduction({
        technique: 'UNIQUE_TARGET_NEIGHBOR_INTERSECTION',
        conclusion: targetConclusion(cellId, globalRule.target),
        ruleIds: [globalRule.id, localRule.id],
        premises: [
          rulePremise(globalRule),
          countPremise(globalSummary),
          rulePremise(localRule),
          ...subjectScopes.flatMap((scope) => [
            scope.subjectPremise,
            scopePremise(localRule, scope.subjectCellId, scope.summary.scopeCellIds),
            countPremise(scope.summary),
          ]),
        ],
      }));
    }
  }

  return sortDeductions(state, mergeDeductions(deductions));
}

export function deriveKnownSafeFromObjectDeductions(
  state: KnowledgeState,
  objectDeductions: readonly Deduction[],
): readonly Deduction[] {
  const observedCells = new Set(state.observations.map((observation) => observation.cellId));
  const deductions: Deduction[] = [];

  for (const deduction of objectDeductions) {
    if (deduction.conclusion.kind !== 'object') continue;
    if (deduction.conclusion.object === 'guest') continue;
    if (observedCells.has(deduction.conclusion.cellId)) continue;

    deductions.push(createDeduction({
      technique: 'KNOWN_SAFE_FROM_NON_GUEST_OBJECT',
      conclusion: { kind: 'safe', cellId: deduction.conclusion.cellId },
      ruleIds: deduction.ruleIds,
      premises: [
        {
          kind: 'derived',
          label: deduction.id,
          cellIds: [deduction.conclusion.cellId],
          ruleIds: deduction.ruleIds,
        },
      ],
    }));
  }

  return sortDeductions(state, mergeDeductions(deductions));
}

function targetConclusion(cellId: CellId, target: CellKind): DeductionConclusion {
  if (target === 'guest') return { kind: 'guest', cellId };
  return { kind: 'object', cellId, object: target };
}

interface KnownSubjectFact {
  readonly cellId: CellId;
  readonly premise: ProofPremise;
}

interface PossibleRequiredTargetScope {
  readonly subjectCellId: CellId;
  readonly subjectPremise: ProofPremise;
  readonly summary: ReturnType<typeof summarizeForEachScope>;
  readonly possibleTargetCellIds: readonly CellId[];
}

function knownSubjectFacts(
  state: KnowledgeState,
  subject: CellKind,
  objectDeductions: readonly Deduction[],
): readonly KnownSubjectFact[] {
  const index = createKnowledgeIndex(state);
  const facts = new Map<CellId, KnownSubjectFact>();

  for (const cellId of index.knownCellIds) {
    const observation = index.observationsByCell.get(cellId);
    if (observation?.kind !== subject) continue;

    facts.set(cellId, {
      cellId,
      premise: {
        kind: 'observation',
        label: `${cellId} is ${subject}`,
        cellIds: [cellId],
      },
    });
  }

  for (const deduction of objectDeductions) {
    if (deduction.conclusion.kind !== 'object') continue;
    if (deduction.conclusion.object !== subject) continue;
    if (facts.has(deduction.conclusion.cellId)) continue;

    facts.set(deduction.conclusion.cellId, {
      cellId: deduction.conclusion.cellId,
      premise: {
        kind: 'derived',
        label: deduction.id,
        cellIds: [deduction.conclusion.cellId],
        ruleIds: deduction.ruleIds,
      },
    });
  }

  return sortCellIds(facts.keys(), state.puzzle.board).map((cellId) => facts.get(cellId)).filter(isDefined);
}

function possibleRequiredTargetScopes(
  state: KnowledgeState,
  rule: ForEachCountRule,
  objectDeductions: readonly Deduction[],
): readonly PossibleRequiredTargetScope[] {
  const scopes: PossibleRequiredTargetScope[] = [];

  for (const subjectFact of knownSubjectFacts(state, rule.subject, objectDeductions)) {
    const summary = summarizeForEachScope(state, rule, subjectFact.cellId);
    const remainingRequired = summary.bounds.lowerBound - summary.knownTargetCellIds.length;
    if (remainingRequired <= 0) continue;

    const possibleTargetCellIds = sortCellIds(
      [...summary.knownTargetCellIds, ...summary.unknownCellIds],
      state.puzzle.board,
    );
    if (possibleTargetCellIds.length === 0) continue;

    scopes.push({
      subjectCellId: subjectFact.cellId,
      subjectPremise: subjectFact.premise,
      summary,
      possibleTargetCellIds,
    });
  }

  return scopes;
}

function intersectCellSets(cellSets: readonly (readonly CellId[])[]): readonly CellId[] {
  const [firstSet, ...remainingSets] = cellSets;
  if (firstSet === undefined) return [];

  return firstSet.filter((cellId) => remainingSets.every((cellSet) => cellSet.includes(cellId)));
}

function isUnresolvedGlobalSingletonRule(rule: RuleDefinition): rule is GlobalCountRule {
  if (!isGlobalCountRule(rule)) return false;

  const bounds = comparatorBounds(rule.count);
  return bounds.lowerBound === 1 && bounds.upperBound === 1;
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

function sortDeductions(state: KnowledgeState, deductions: readonly Deduction[]): readonly Deduction[] {
  const cellOrder = new Map(
    sortCellIds(deductions.map((deduction) => deduction.conclusion.cellId), state.puzzle.board).map(
      (cellId, index) => [cellId, index],
    ),
  );

  return [...deductions].sort((a, b) => {
    const aIndex = cellOrder.get(a.conclusion.cellId) ?? Number.MAX_SAFE_INTEGER;
    const bIndex = cellOrder.get(b.conclusion.cellId) ?? Number.MAX_SAFE_INTEGER;
    return aIndex - bIndex || a.id.localeCompare(b.id);
  });
}

function mergeDeductions(deductions: readonly Deduction[]): readonly Deduction[] {
  const byId = new Map<string, Deduction>();
  for (const deduction of deductions) {
    const existing = byId.get(deduction.id);
    if (existing === undefined) {
      byId.set(deduction.id, deduction);
      continue;
    }

    byId.set(deduction.id, {
      ...existing,
      premises: normalizeProofPremises([...existing.premises, ...deduction.premises]),
      proofNodeIds: [...new Set([...existing.proofNodeIds, ...deduction.proofNodeIds])].sort(),
    });
  }

  return [...byId.values()];
}

export function isGlobalCountRule(rule: RuleDefinition): rule is GlobalCountRule {
  return rule.type === 'globalCount';
}

export function isForEachCountRule(rule: RuleDefinition): rule is ForEachCountRule {
  return rule.type === 'forEachCount';
}
