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
  countPremise,
  createKnowledgeIndex,
  rulePremise,
  scopePremise,
  summarizeForEachScope,
  summarizeGlobalCount,
} from './reasoning.js';
import type { Deduction, DeductionConclusion, KnowledgeState, ProofPremise } from './types.js';

export function deriveHumanDeductions(state: KnowledgeState): readonly Deduction[] {
  const deductions: Deduction[] = [];

  for (const rule of state.puzzle.rules) {
    if (rule.type === 'globalCount') {
      deductions.push(...deriveGlobalCountDeductions(state, rule));
    } else if (rule.type === 'forEachCount') {
      deductions.push(...deriveLocalCountDeductions(state, rule));
    }
  }

  deductions.push(...deriveKnownSafeFromObjectDeductions(state, deductions));

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
): readonly Deduction[] {
  const index = createKnowledgeIndex(state);
  const deductions: Deduction[] = [];

  for (const subjectCellId of index.knownCellIds) {
    const subject = index.observationsByCell.get(subjectCellId);
    if (subject?.kind !== rule.subject) continue;

    const summary = summarizeForEachScope(state, rule, subjectCellId);
    const premises = [
      rulePremise(rule),
      {
        kind: 'observation',
        label: `${subjectCellId} is ${rule.subject}`,
        cellIds: [subjectCellId],
      } satisfies ProofPremise,
      scopePremise(rule, subjectCellId, summary.scopeCellIds),
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
