import { sortCellIds } from '@room-axioms/domain';
import type { CellId, CellKind, GlobalCountRule, RuleDefinition } from '@room-axioms/domain';

import { createDeduction } from './graph.js';
import { countPremise, rulePremise, summarizeGlobalCount } from './reasoning.js';
import type { Deduction, DeductionConclusion, KnowledgeState } from './types.js';

export function deriveHumanDeductions(state: KnowledgeState): readonly Deduction[] {
  const deductions: Deduction[] = [];

  for (const rule of state.puzzle.rules) {
    if (rule.type === 'globalCount') {
      deductions.push(...deriveGlobalCountDeductions(state, rule));
    }
  }

  return sortDeductions(state, deductions);
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

export function isGlobalCountRule(rule: RuleDefinition): rule is GlobalCountRule {
  return rule.type === 'globalCount';
}
