import type { CellId, CellKind } from '@room-axioms/domain';

import type { Deduction, DeductionConclusion, TechniqueId } from './types.js';

export function conclusionKey(conclusion: DeductionConclusion): string {
  switch (conclusion.kind) {
    case 'safe':
      return `safe:${conclusion.cellId}`;
    case 'guest':
      return `guest:${conclusion.cellId}`;
    case 'object':
      return `object:${conclusion.cellId}:${conclusion.object}`;
  }
}

export function conclusionCellId(conclusion: DeductionConclusion): CellId {
  return conclusion.cellId;
}

export function buildDeductionId(
  technique: TechniqueId,
  conclusion: DeductionConclusion,
  ruleIds: readonly string[] = [],
): string {
  return `deduction:${technique}:${conclusionKey(conclusion)}:${stableIdList(ruleIds)}`;
}

export function factNodeId(cellId: CellId, kind: CellKind): string {
  return `fact:${cellId}:${kind}`;
}

export function ruleNodeId(ruleId: string): string {
  return `rule:${ruleId}`;
}

export function derivedNodeId(deduction: Pick<Deduction, 'id'>): string {
  return `derived:${deduction.id}`;
}

export function stableIdList(values: readonly string[]): string {
  const unique = [...new Set(values)];
  unique.sort();
  return unique.length === 0 ? 'none' : unique.join('+');
}
