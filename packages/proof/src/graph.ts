import { sortCellIds } from '@room-axioms/domain';
import type { Observation, PuzzleDefinition, RuleDefinition } from '@room-axioms/domain';

import {
  buildDeductionId,
  conclusionCellId,
  conclusionKey,
  derivedNodeId,
  factNodeId,
  ruleNodeId,
} from './ids.js';
import type {
  Deduction,
  DeductionInput,
  KnowledgeState,
  ProofGraph,
  ProofNode,
  ProofPremise,
} from './types.js';

export function createDeduction(input: DeductionInput): Deduction {
  const ruleIds = uniqueSorted(input.ruleIds ?? []);
  const id = buildDeductionId(input.technique, input.conclusion, ruleIds);

  return {
    id,
    conclusion: input.conclusion,
    ruleIds,
    premises: normalizeProofPremises(input.premises ?? []),
    technique: input.technique,
    proofNodeIds: [derivedNodeId({ id })],
  };
}

export function buildProofGraph(state: KnowledgeState, deductions: readonly Deduction[]): ProofGraph {
  const nodes = new Map<string, ProofNode>();
  const referencedRuleIds = new Set<string>();

  for (const deduction of deductions) {
    for (const ruleId of deduction.ruleIds) referencedRuleIds.add(ruleId);
    for (const premise of deduction.premises) {
      for (const ruleId of premise.ruleIds ?? []) referencedRuleIds.add(ruleId);
    }
  }

  for (const observation of sortObservations(state.puzzle, state.observations)) {
    addNode(nodes, {
      id: factNodeId(observation.cellId, observation.kind),
      kind: 'fact',
      label: `${observation.cellId} is ${observation.kind}`,
      parents: [],
    });
  }

  for (const rule of state.puzzle.rules.filter((rule) => referencedRuleIds.has(rule.id))) {
    addNode(nodes, {
      id: ruleNodeId(rule.id),
      kind: 'rule',
      label: ruleLabel(rule),
      parents: [],
    });
  }

  for (const deduction of sortDeductions(state.puzzle, deductions)) {
    const parents = parentNodeIds(state, deduction);
    addNode(nodes, {
      id: deduction.proofNodeIds[0] ?? derivedNodeId(deduction),
      kind: 'derived',
      label: `${deduction.technique}: ${conclusionLabel(deduction.conclusion)}`,
      parents,
    });
  }

  const sortedNodes = [...nodes.values()].sort(compareNodes);
  const rootIds = sortedNodes
    .filter((node) => node.parents.length === 0)
    .map((node) => node.id);

  return {
    nodes: sortedNodes,
    rootIds,
  };
}

export function normalizeProofPremises(premises: readonly ProofPremise[]): readonly ProofPremise[] {
  const byKey = new Map<string, ProofPremise>();

  for (const premise of premises) {
    const normalized = {
      ...premise,
      ...(premise.cellIds === undefined ? {} : { cellIds: uniqueSorted(premise.cellIds) }),
      ...(premise.ruleIds === undefined ? {} : { ruleIds: uniqueSorted(premise.ruleIds) }),
    };
    byKey.set(premiseKey(normalized), normalized);
  }

  return [...byKey.values()].sort((a, b) => premiseKey(a).localeCompare(premiseKey(b)));
}

function parentNodeIds(state: KnowledgeState, deduction: Deduction): readonly string[] {
  const parents = new Set<string>();
  const observationsByCell = new Map(state.observations.map((observation) => [observation.cellId, observation]));

  for (const ruleId of deduction.ruleIds) parents.add(ruleNodeId(ruleId));

  for (const premise of deduction.premises) {
    for (const ruleId of premise.ruleIds ?? []) parents.add(ruleNodeId(ruleId));

    if (premise.kind === 'observation') {
      for (const cellId of premise.cellIds ?? []) {
        const observation = observationsByCell.get(cellId);
        if (observation !== undefined) parents.add(factNodeId(observation.cellId, observation.kind));
      }
    } else if (premise.kind === 'derived' && premise.label.startsWith('deduction:')) {
      parents.add(derivedNodeId({ id: premise.label }));
    }
  }

  return [...parents].sort();
}

function sortObservations(
  puzzle: PuzzleDefinition,
  observations: readonly Observation[],
): readonly Observation[] {
  const byCell = new Map(observations.map((observation) => [observation.cellId, observation]));
  return sortCellIds(byCell.keys(), puzzle.board).map((cellId) => byCell.get(cellId)).filter(isObservation);
}

function sortDeductions(puzzle: PuzzleDefinition, deductions: readonly Deduction[]): readonly Deduction[] {
  const cellOrder = new Map(sortCellIds(deductions.map((deduction) => conclusionCellId(deduction.conclusion)), puzzle.board).map((cellId, index) => [cellId, index]));

  return [...deductions].sort((a, b) => {
    const aIndex = cellOrder.get(conclusionCellId(a.conclusion)) ?? Number.MAX_SAFE_INTEGER;
    const bIndex = cellOrder.get(conclusionCellId(b.conclusion)) ?? Number.MAX_SAFE_INTEGER;
    return aIndex - bIndex || a.id.localeCompare(b.id);
  });
}

function addNode(nodes: Map<string, ProofNode>, node: ProofNode): void {
  const existing = nodes.get(node.id);
  if (existing === undefined) {
    nodes.set(node.id, node);
    return;
  }

  const parents = uniqueSorted([...existing.parents, ...node.parents]);
  nodes.set(node.id, { ...existing, parents });
}

function compareNodes(a: ProofNode, b: ProofNode): number {
  return nodeKindRank(a.kind) - nodeKindRank(b.kind) || a.id.localeCompare(b.id);
}

function nodeKindRank(kind: ProofNode['kind']): number {
  switch (kind) {
    case 'fact':
      return 0;
    case 'rule':
      return 1;
    case 'derived':
      return 2;
  }
}

function conclusionLabel(conclusion: Deduction['conclusion']): string {
  switch (conclusion.kind) {
    case 'safe':
      return `${conclusion.cellId} is safe`;
    case 'guest':
      return `${conclusion.cellId} is guest`;
    case 'object':
      return `${conclusion.cellId} is ${conclusion.object}`;
  }
}

function ruleLabel(rule: RuleDefinition): string {
  return `${rule.id}: ${rule.presentation.title}`;
}

function premiseKey(premise: ProofPremise): string {
  return [
    premise.kind,
    premise.label,
    (premise.cellIds ?? []).join('+'),
    (premise.ruleIds ?? []).join('+'),
  ].join(':');
}

function uniqueSorted(values: readonly string[]): readonly string[] {
  const unique = [...new Set(values)];
  unique.sort();
  return unique;
}

function isObservation(value: Observation | undefined): value is Observation {
  return value !== undefined;
}

export { conclusionKey, derivedNodeId, factNodeId, ruleNodeId };
