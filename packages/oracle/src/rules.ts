import { allCells, assertNever, lineCells, neighbors, rayCells, regionCells } from '@room-axioms/domain';
import type {
  CellId,
  CellKind,
  Comparator,
  PuzzleDefinition,
  RuleDefinition,
} from '@room-axioms/domain';

import type { OracleModel, RuleEvaluation } from './types.js';

export function evaluateRule(
  rule: RuleDefinition,
  puzzle: PuzzleDefinition,
  model: OracleModel,
): RuleEvaluation {
  switch (rule.type) {
    case 'globalCount': {
      const actual = countCells(allCells(puzzle.board), rule.target, model);

      return {
        ruleId: rule.id,
        satisfied: compareCount(actual, rule.count),
        actual,
      };
    }

    case 'forEachCount': {
      const actual = allCells(puzzle.board)
        .filter((cellId) => model.cells[cellId] === rule.subject)
        .map((cellId) => countCells(neighbors(cellId, rule.scope.kind, puzzle.board), rule.target, model));

      return {
        ruleId: rule.id,
        satisfied: actual.every((count) => compareCount(count, rule.count)),
        actual,
      };
    }

    case 'anchorCount': {
      const anchor = puzzle.anchors?.find((candidate) => candidate.id === rule.anchorId);
      if (anchor === undefined) {
        throw new Error(`Rule ${rule.id} references unknown anchor ${rule.anchorId}.`);
      }

      const actual = allCells(puzzle.board)
        .filter((cellId) => model.cells[cellId] === anchor.subject)
        .map((cellId) => countCells(anchorScopeCells(rule, cellId, puzzle), rule.target, model));

      return {
        ruleId: rule.id,
        satisfied: actual.every((count) => compareCount(count, rule.count)),
        actual,
      };
    }

    case 'regionCount': {
      const region = puzzle.regions?.find((candidate) => candidate.id === rule.regionId);
      if (region === undefined) {
        throw new Error(`Rule ${rule.id} references unknown region ${rule.regionId}.`);
      }

      const actual = countCells(regionCells(region, puzzle.board), rule.target, model);

      return {
        ruleId: rule.id,
        satisfied: compareCount(actual, rule.count),
        actual,
      };
    }

    case 'lineCount': {
      const actual = countCells(lineScopeCells(rule, puzzle, model), rule.target, model);

      return {
        ruleId: rule.id,
        satisfied: compareCount(actual, rule.count),
        actual,
      };
    }

    case 'recordSet':
      throw new Error(`Record-set rule ${rule.id} must be expanded before oracle evaluation.`);

    default:
      return assertNever(rule);
  }
}

export function satisfiesRules(puzzle: PuzzleDefinition, model: OracleModel): boolean {
  return puzzle.rules.every((rule) => evaluateRule(rule, puzzle, model).satisfied);
}

function countCells(cells: readonly CellId[], target: CellKind, model: OracleModel): number {
  return cells.filter((cellId) => model.cells[cellId] === target).length;
}

function lineScopeCells(
  rule: Extract<RuleDefinition, { readonly type: 'lineCount' }>,
  puzzle: PuzzleDefinition,
  model: OracleModel,
): readonly CellId[] {
  switch (rule.scope.kind) {
    case 'row':
    case 'column':
      return lineCells(rule.scope, puzzle.board);
    case 'ray':
      break;
  }

  if (rule.origin === undefined) {
    throw new Error(`Rule ${rule.id} must include origin for a ray scope.`);
  }

  const blockerKinds = new Set(rule.scope.stopAtKinds ?? []);
  const visible: CellId[] = [];

  for (const cellId of rayCells(rule.origin, rule.scope.direction, puzzle.board)) {
    if (blockerKinds.has(model.cells[cellId])) break;
    visible.push(cellId);
  }

  return visible;
}

function anchorScopeCells(
  rule: Extract<RuleDefinition, { readonly type: 'anchorCount' }>,
  cellId: CellId,
  puzzle: PuzzleDefinition,
): readonly CellId[] {
  if (rule.scope.kind === 'orthogonal' || rule.scope.kind === 'adjacent') {
    return neighbors(cellId, rule.scope.kind, puzzle.board);
  }

  throw new Error(`Rule ${rule.id} uses unsupported anchor scope ${rule.scope.kind}.`);
}

function compareCount(actual: number, comparator: Comparator): boolean {
  switch (comparator.op) {
    case 'eq':
      return actual === comparator.value;
    case 'gte':
      return actual >= comparator.value;
    case 'lte':
      return actual <= comparator.value;
    default:
      return assertNever(comparator);
  }
}
