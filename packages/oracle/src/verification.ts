import type { Observation, PuzzleDefinition } from '@room-axioms/domain';

import { enumerateModels } from './enumeration.js';
import { satisfiesRules } from './rules.js';
import type { OracleModel, OracleOptions, OracleVerificationReport } from './types.js';

export function targetSatisfiesRules(puzzle: PuzzleDefinition): boolean {
  return satisfiesRules(puzzle, targetModel(puzzle));
}

export function verifyPuzzleWithOracle(
  puzzle: PuzzleDefinition,
  options: OracleOptions = {},
): OracleVerificationReport {
  const targetSatisfies = targetSatisfiesRules(puzzle);
  const initialResult = enumerateModels(puzzle, initialObservations(puzzle), options);
  const issues: string[] = [];

  if (!targetSatisfies) {
    issues.push('Target assignment does not satisfy all rules.');
  }

  if (!initialResult.satisfiable) {
    issues.push('Initial observations are unsatisfiable.');
  }

  if (initialResult.truncated) {
    issues.push('Initial observation search was truncated by oracle limits.');
  }

  return {
    targetSatisfiesRules: targetSatisfies,
    initialSatisfiable: initialResult.satisfiable,
    issues,
    metrics: {
      targetSatisfiesRules: targetSatisfies,
      initialSatisfiable: initialResult.satisfiable,
      initialModelCount: initialResult.modelCount,
      initialNodeCount: initialResult.nodeCount,
      initialTruncated: initialResult.truncated,
    },
  };
}

function targetModel(puzzle: PuzzleDefinition): OracleModel {
  return { cells: puzzle.target };
}

function initialObservations(puzzle: PuzzleDefinition): readonly Observation[] {
  return puzzle.initialReveals.map((cellId) => ({
    cellId,
    kind: puzzle.target[cellId],
  }));
}
