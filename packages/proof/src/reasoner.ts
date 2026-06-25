import { sortCellIds } from '@room-axioms/domain';
import type {
  CellId,
  CellKind,
  AnchorCountRule,
  AnchorDefinition,
  ForEachCountRule,
  GlobalCountRule,
  LineCountRule,
  RegionCountRule,
  RuleDefinition,
} from '@room-axioms/domain';

import { createDeduction, normalizeProofPremises } from './graph.js';
import {
  comparatorBounds,
  anchorScopePremise,
  countPremise,
  createKnowledgeIndex,
  lineScopePremise,
  rulePremise,
  regionScopePremise,
  scopePremise,
  summarizeForEachScope,
  summarizeAnchorScope,
  summarizeGlobalCount,
  summarizeLineCount,
  summarizeRegionCount,
} from './reasoning.js';
import type { Deduction, DeductionConclusion, KnowledgeState, ProofPremise } from './types.js';

export function deriveHumanDeductions(state: KnowledgeState): readonly Deduction[] {
  const baseDeductions: Deduction[] = [];

  for (const rule of state.puzzle.rules) {
    if (rule.type === 'globalCount') {
      baseDeductions.push(...deriveGlobalCountDeductions(state, rule));
    } else if (rule.type === 'regionCount') {
      baseDeductions.push(...deriveRegionCountDeductions(state, rule));
    } else if (rule.type === 'lineCount') {
      baseDeductions.push(...deriveLineCountDeductions(state, rule));
    } else if (rule.type === 'anchorCount') {
      baseDeductions.push(...deriveAnchorCountDeductions(state, rule));
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
    } else if (rule.type === 'anchorCount') {
      derivedLocalDeductions.push(
        ...deriveAnchorCountDeductions(state, rule, intersectionDeductions),
      );
    }
  }

  const objectDeductions = mergeDeductions([
    ...baseDeductions,
    ...intersectionDeductions,
    ...derivedLocalDeductions,
  ]);
  const localScopeIntersectionDeductions = deriveLocalScopeIntersectionDeductions(
    state,
    objectDeductions,
  );
  const localScopeDifferenceDeductions = deriveLocalScopeDifferenceDeductions(
    state,
    objectDeductions,
  );
  const safeFromObjectDeductions = deriveKnownSafeFromObjectDeductions(state, objectDeductions);
  const deductions = mergeDeductions([
    ...objectDeductions,
    ...localScopeIntersectionDeductions,
    ...localScopeDifferenceDeductions,
    ...safeFromObjectDeductions,
  ]);

  return sortDeductions(state, mergeDeductions(deductions));
}

export function deriveLocalScopeIntersectionDeductions(
  state: KnowledgeState,
  objectDeductions: readonly Deduction[] = [],
): readonly Deduction[] {
  const scopes = localTargetScopes(state, objectDeductions)
    .filter((scope) => scope.rule.target === 'guest')
    .filter((scope) => scope.remainingCapacity !== null)
    .filter((scope) => scope.remainingCapacity !== null && scope.remainingCapacity >= 0);
  const deductions: Deduction[] = [];

  for (const consumer of scopes) {
    if (consumer.remainingCapacity === null || consumer.remainingCapacity <= 0) continue;

    for (const provider of scopes) {
      if (sameLocalScope(consumer, provider)) continue;
      if (provider.remainingRequired <= 0) continue;

      const sharedUnknown = intersectCellSets([consumer.summary.unknownCellIds, provider.summary.unknownCellIds]);
      if (sharedUnknown.length === 0) continue;

      const providerOnlyUnknown = subtractCellIds(
        state,
        provider.summary.unknownCellIds,
        consumer.summary.unknownCellIds,
      );
      const consumerOnlyUnknown = subtractCellIds(
        state,
        consumer.summary.unknownCellIds,
        provider.summary.unknownCellIds,
      );
      if (consumerOnlyUnknown.length === 0) continue;

      const providerForcedSharedGuests = Math.max(
        0,
        provider.remainingRequired - providerOnlyUnknown.length,
      );
      if (providerForcedSharedGuests <= 0) continue;
      if (providerForcedSharedGuests < consumer.remainingCapacity) continue;

      const premises = localScopeIntersectionPremises({
        consumer,
        provider,
        sharedUnknown,
        providerOnlyUnknown,
        providerForcedSharedGuests,
      });

      for (const cellId of consumerOnlyUnknown) {
        deductions.push(createDeduction({
          technique: 'LOCAL_SCOPE_INTERSECTION',
          conclusion: { kind: 'safe', cellId },
          ruleIds: [consumer.rule.id, provider.rule.id],
          premises,
        }));
      }
    }
  }

  return sortDeductions(state, mergeDeductions(deductions));
}

export function deriveLocalScopeDifferenceDeductions(
  state: KnowledgeState,
  objectDeductions: readonly Deduction[] = [],
): readonly Deduction[] {
  const scopes = localTargetScopes(state, objectDeductions)
    .filter((scope) => scope.rule.target === 'guest')
    .filter((scope) => scope.remainingCapacity !== null)
    .filter((scope) => scope.remainingCapacity !== null && scope.remainingCapacity >= 0);
  const deductions: Deduction[] = [];

  for (const outer of scopes) {
    if (outer.remainingRequired <= 0) continue;

    for (const inner of scopes) {
      if (sameLocalScope(outer, inner)) continue;
      if (inner.remainingCapacity === null || inner.remainingCapacity < 0) continue;
      if (inner.summary.unknownCellIds.length === 0) continue;
      if (!isSubset(inner.summary.unknownCellIds, outer.summary.unknownCellIds)) continue;

      const differenceUnknown = subtractCellIds(
        state,
        outer.summary.unknownCellIds,
        inner.summary.unknownCellIds,
      );
      if (differenceUnknown.length === 0) continue;

      const differenceRequired = outer.remainingRequired - inner.remainingCapacity;
      if (differenceRequired <= 0) continue;
      if (differenceRequired !== differenceUnknown.length) continue;

      const premises = localScopeDifferencePremises({
        outer,
        inner,
        differenceUnknown,
        differenceRequired,
      });

      for (const cellId of differenceUnknown) {
        deductions.push(createDeduction({
          technique: 'LOCAL_SCOPE_DIFFERENCE',
          conclusion: { kind: 'guest', cellId },
          ruleIds: [outer.rule.id, inner.rule.id],
          premises,
        }));
      }
    }
  }

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

export function deriveRegionCountDeductions(
  state: KnowledgeState,
  rule: RegionCountRule,
): readonly Deduction[] {
  const summary = summarizeRegionCount(state, rule);
  const premises = [rulePremise(rule), regionScopePremise(rule, summary.scopeCellIds), countPremise(summary)];
  const deductions: Deduction[] = [];
  const upperBound = summary.bounds.upperBound;

  if (
    rule.target === 'guest' &&
    upperBound !== null &&
    summary.knownTargetCellIds.length === upperBound
  ) {
    for (const cellId of summary.unknownCellIds) {
      deductions.push(createDeduction({
        technique: 'REGION_COUNT_SATURATED',
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
        technique: 'REGION_COUNT_ALL_REMAINING',
        conclusion: targetConclusion(cellId, rule.target),
        ruleIds: [rule.id],
        premises,
      }));
    }
  }

  return sortDeductions(state, deductions);
}

export function deriveLineCountDeductions(
  state: KnowledgeState,
  rule: LineCountRule,
): readonly Deduction[] {
  const summary = summarizeLineCount(state, rule);
  const premises = [rulePremise(rule), lineScopePremise(rule, summary.scopeCellIds), countPremise(summary)];
  const deductions: Deduction[] = [];
  const upperBound = summary.bounds.upperBound;

  if (
    rule.target === 'guest' &&
    upperBound !== null &&
    summary.knownTargetCellIds.length === upperBound
  ) {
    for (const cellId of summary.unknownCellIds) {
      deductions.push(createDeduction({
        technique: 'LINE_COUNT_SATURATED',
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
        technique: 'LINE_COUNT_ALL_REMAINING',
        conclusion: targetConclusion(cellId, rule.target),
        ruleIds: [rule.id],
        premises,
      }));
    }
  }

  return sortDeductions(state, deductions);
}

export function deriveAnchorCountDeductions(
  state: KnowledgeState,
  rule: AnchorCountRule,
  objectDeductions: readonly Deduction[] = [],
): readonly Deduction[] {
  const anchor = anchorForRule(state, rule);
  const deductions: Deduction[] = [];

  for (const anchorFact of knownSubjectFacts(state, anchor.subject, objectDeductions)) {
    const summary = summarizeAnchorScope(state, rule, anchorFact.cellId);
    const premises = [
      rulePremise(rule),
      anchorFact.premise,
      anchorScopePremise(rule, anchorFact.cellId, summary.scopeCellIds),
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
          technique: 'ANCHOR_COUNT_SATURATED',
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
          technique: 'ANCHOR_COUNT_ALL_REMAINING',
          conclusion: targetConclusion(cellId, rule.target),
          ruleIds: [rule.id],
          premises,
        }));
      }
    }
  }

  return sortDeductions(state, mergeDeductions(deductions));
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

function anchorForRule(state: KnowledgeState, rule: AnchorCountRule): AnchorDefinition {
  const anchor = state.puzzle.anchors?.find((candidate) => candidate.id === rule.anchorId);
  if (anchor === undefined) {
    throw new Error(`Rule ${rule.id} references unknown anchor ${rule.anchorId}.`);
  }

  return anchor;
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

interface LocalTargetScope {
  readonly rule: ForEachCountRule;
  readonly subjectCellId: CellId;
  readonly subjectPremise: ProofPremise;
  readonly summary: ReturnType<typeof summarizeForEachScope>;
  readonly remainingRequired: number;
  readonly remainingCapacity: number | null;
}

function localTargetScopes(
  state: KnowledgeState,
  objectDeductions: readonly Deduction[],
): readonly LocalTargetScope[] {
  const scopes: LocalTargetScope[] = [];

  for (const rule of state.puzzle.rules.filter(isForEachCountRule)) {
    for (const subjectFact of knownSubjectFacts(state, rule.subject, objectDeductions)) {
      const summary = summarizeForEachScope(state, rule, subjectFact.cellId);
      const upperBound = summary.bounds.upperBound;

      scopes.push({
        rule,
        subjectCellId: subjectFact.cellId,
        subjectPremise: subjectFact.premise,
        summary,
        remainingRequired: summary.bounds.lowerBound - summary.knownTargetCellIds.length,
        remainingCapacity: upperBound === null ? null : upperBound - summary.knownTargetCellIds.length,
      });
    }
  }

  return scopes;
}

function sameLocalScope(left: LocalTargetScope, right: LocalTargetScope): boolean {
  return left.rule.id === right.rule.id && left.subjectCellId === right.subjectCellId;
}

function localScopeIntersectionPremises(input: {
  readonly consumer: LocalTargetScope;
  readonly provider: LocalTargetScope;
  readonly sharedUnknown: readonly CellId[];
  readonly providerOnlyUnknown: readonly CellId[];
  readonly providerForcedSharedGuests: number;
}): readonly ProofPremise[] {
  const { consumer, provider } = input;

  return [
    rulePremise(consumer.rule),
    consumer.subjectPremise,
    scopePremise(consumer.rule, consumer.subjectCellId, consumer.summary.scopeCellIds),
    countPremise(consumer.summary),
    rulePremise(provider.rule),
    provider.subjectPremise,
    scopePremise(provider.rule, provider.subjectCellId, provider.summary.scopeCellIds),
    countPremise(provider.summary),
    {
      kind: 'scope',
      label: [
        `${consumer.subjectCellId}/${provider.subjectCellId} shared unknown cells`,
        input.sharedUnknown.join(', '),
      ].join(': '),
      cellIds: input.sharedUnknown,
      ruleIds: [consumer.rule.id, provider.rule.id],
    },
    {
      kind: 'count',
      label: [
        `${provider.subjectCellId} needs ${provider.remainingRequired} remaining guest cells`,
        `${input.providerOnlyUnknown.length} provider-only unknown cells`,
        `at least ${input.providerForcedSharedGuests} shared guest cell(s)`,
      ].join('; '),
      cellIds: [...input.providerOnlyUnknown, ...input.sharedUnknown],
      ruleIds: [provider.rule.id],
    },
    {
      kind: 'count',
      label: [
        `${consumer.subjectCellId} has remaining guest capacity ${consumer.remainingCapacity ?? 'unbounded'}`,
        'shared guest requirement consumes that capacity',
      ].join('; '),
      cellIds: consumer.summary.scopeCellIds,
      ruleIds: [consumer.rule.id, provider.rule.id],
    },
  ];
}

function localScopeDifferencePremises(input: {
  readonly outer: LocalTargetScope;
  readonly inner: LocalTargetScope;
  readonly differenceUnknown: readonly CellId[];
  readonly differenceRequired: number;
}): readonly ProofPremise[] {
  const { outer, inner } = input;

  return [
    rulePremise(outer.rule),
    outer.subjectPremise,
    scopePremise(outer.rule, outer.subjectCellId, outer.summary.scopeCellIds),
    countPremise(outer.summary),
    rulePremise(inner.rule),
    inner.subjectPremise,
    scopePremise(inner.rule, inner.subjectCellId, inner.summary.scopeCellIds),
    countPremise(inner.summary),
    {
      kind: 'scope',
      label: [
        `${inner.subjectCellId} unknown cells are contained in ${outer.subjectCellId}`,
        inner.summary.unknownCellIds.join(', '),
      ].join(': '),
      cellIds: inner.summary.unknownCellIds,
      ruleIds: [outer.rule.id, inner.rule.id],
    },
    {
      kind: 'scope',
      label: [
        `${outer.subjectCellId}/${inner.subjectCellId} difference unknown cells`,
        input.differenceUnknown.join(', '),
      ].join(': '),
      cellIds: input.differenceUnknown,
      ruleIds: [outer.rule.id, inner.rule.id],
    },
    {
      kind: 'count',
      label: [
        `${outer.subjectCellId} needs ${outer.remainingRequired} remaining guest cells`,
        `${inner.subjectCellId} can contain at most ${inner.remainingCapacity ?? 'unbounded'}`,
        `${input.differenceRequired} extra guest cell(s) must be in the difference`,
      ].join('; '),
      cellIds: outer.summary.scopeCellIds,
      ruleIds: [outer.rule.id, inner.rule.id],
    },
  ];
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

function subtractCellIds(
  state: KnowledgeState,
  left: readonly CellId[],
  right: readonly CellId[],
): readonly CellId[] {
  const rightSet = new Set(right);
  return sortCellIds(left.filter((cellId) => !rightSet.has(cellId)), state.puzzle.board);
}

function isSubset(left: readonly CellId[], right: readonly CellId[]): boolean {
  return left.every((cellId) => right.includes(cellId));
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

export function isRegionCountRule(rule: RuleDefinition): rule is RegionCountRule {
  return rule.type === 'regionCount';
}

export function isLineCountRule(rule: RuleDefinition): rule is LineCountRule {
  return rule.type === 'lineCount';
}

export function isAnchorCountRule(rule: RuleDefinition): rule is AnchorCountRule {
  return rule.type === 'anchorCount';
}
