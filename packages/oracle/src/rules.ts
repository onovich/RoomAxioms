import { allCells, assertNever, neighbors, regionCells } from '@room-axioms/domain';
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
