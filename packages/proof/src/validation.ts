import { allCells, sortCellIds } from '@room-axioms/domain';
import { findForcedCells, isSatisfiable } from '@room-axioms/solver';
import type { CellId, CellKind } from '@room-axioms/domain';
import type { SolverOptions, SolverStats } from '@room-axioms/solver';

import type {
  Deduction,
  DeductionValidationResult,
  ExplanationGapReport,
  KnowledgeState,
  VerificationIssue,
} from './types.js';

export function verifyDeduction(
  state: KnowledgeState,
  deduction: Deduction,
  options: SolverOptions = {},
): DeductionValidationResult {
  const input = { puzzle: state.puzzle, observations: state.observations };
  const issues: VerificationIssue[] = [];
  let stats = zeroStats();

  if (!allCells(state.puzzle.board).includes(deduction.conclusion.cellId)) {
    return validationResult(deduction, [
      invalidDeductionIssue(deduction, `Deduction references unknown cell ${deduction.conclusion.cellId}.`),
    ], stats);
  }

  if (deduction.conclusion.kind === 'object' && !state.puzzle.allowedKinds.includes(deduction.conclusion.object)) {
    return validationResult(deduction, [
      invalidDeductionIssue(
        deduction,
        `Deduction references disallowed object ${deduction.conclusion.object}.`,
      ),
    ], stats);
  }

  const base = isSatisfiable(input, [], options);
  stats = combineStats(stats, base.stats);
  if (base.stats.truncated) {
    return validationResult(deduction, [solverTruncatedIssue(deduction)], stats);
  }
  if (!base.satisfiable) {
    return validationResult(deduction, [{
      code: 'CONTRADICTION',
      message: 'Current observations are not satisfiable.',
      cellIds: [deduction.conclusion.cellId],
      deductionIds: [deduction.id],
    }], stats);
  }

  switch (deduction.conclusion.kind) {
    case 'safe':
      return validateSafeDeduction(state, deduction, options, stats, issues);
    case 'guest':
      return validateGuestDeduction(state, deduction, options, stats, issues);
    case 'object':
      return validateObjectDeduction(state, deduction, options, stats, issues);
  }
}

export function findExplanationGaps(
  state: KnowledgeState,
  deductions: readonly Deduction[],
  options: SolverOptions = {},
): ExplanationGapReport {
  const input = { puzzle: state.puzzle, observations: state.observations };
  const forced = findForcedCells(input, options);
  const validationResults = deductions.map((deduction) => verifyDeduction(state, deduction, options));
  const issues = validationResults.flatMap((result) => result.issues);
  let stats = combineStats(
    forced.stats,
    validationResults.reduce((current, result) => combineStats(current, result.stats), zeroStats()),
  );

  if (forced.stats.truncated) {
    issues.push({
      code: 'SOLVER_TRUNCATED',
      message: 'Forced-cell query truncated before explanation gaps could be checked.',
    });
  }

  const explainedSafe = explainedCells(state, validationResults, deductions, 'safe');
  const explainedGuests = explainedCells(state, validationResults, deductions, 'guest');

  if (!forced.stats.truncated) {
    for (const cellId of forced.safe) {
      if (explainedSafe.includes(cellId)) continue;
      issues.push({
        code: 'EXPLANATION_GAP',
        message: `Solver proves ${cellId} is safe, but no valid human deduction explains it.`,
        cellIds: [cellId],
      });
    }

    for (const cellId of forced.guests) {
      if (explainedGuests.includes(cellId)) continue;
      issues.push({
        code: 'EXPLANATION_GAP',
        message: `Solver proves ${cellId} is a guest, but no valid human deduction explains it.`,
        cellIds: [cellId],
      });
    }
  }

  return {
    forcedSafe: forced.safe,
    forcedGuests: forced.guests,
    explainedSafe,
    explainedGuests,
    validationResults,
    issues,
    stats,
  };
}

function validateSafeDeduction(
  state: KnowledgeState,
  deduction: Deduction,
  options: SolverOptions,
  initialStats: SolverStats,
  issues: VerificationIssue[],
): DeductionValidationResult {
  const result = isSatisfiable(
    { puzzle: state.puzzle, observations: state.observations },
    [{ kind: 'cellIs', cellId: deduction.conclusion.cellId, value: 'guest' }],
    options,
  );
  const stats = combineStats(initialStats, result.stats);
  if (result.stats.truncated) return validationResult(deduction, [solverTruncatedIssue(deduction)], stats);
  if (result.satisfiable) {
    issues.push(invalidDeductionIssue(
      deduction,
      `${deduction.conclusion.cellId} can still be a guest.`,
    ));
  }

  return validationResult(deduction, issues, stats);
}

function validateGuestDeduction(
  state: KnowledgeState,
  deduction: Deduction,
  options: SolverOptions,
  initialStats: SolverStats,
  issues: VerificationIssue[],
): DeductionValidationResult {
  const result = isSatisfiable(
    { puzzle: state.puzzle, observations: state.observations },
    [{ kind: 'cellIsNot', cellId: deduction.conclusion.cellId, value: 'guest' }],
    options,
  );
  const stats = combineStats(initialStats, result.stats);
  if (result.stats.truncated) return validationResult(deduction, [solverTruncatedIssue(deduction)], stats);
  if (result.satisfiable) {
    issues.push(invalidDeductionIssue(
      deduction,
      `${deduction.conclusion.cellId} can still be non-guest.`,
    ));
  }

  return validationResult(deduction, issues, stats);
}

function validateObjectDeduction(
  state: KnowledgeState,
  deduction: Deduction,
  options: SolverOptions,
  initialStats: SolverStats,
  issues: VerificationIssue[],
): DeductionValidationResult {
  if (deduction.conclusion.kind !== 'object') {
    return validationResult(deduction, [
      invalidDeductionIssue(deduction, 'Expected an object deduction.'),
    ], initialStats);
  }

  const possibleAlternatives: CellKind[] = [];
  let stats = initialStats;

  for (const kind of state.puzzle.allowedKinds) {
    if (kind === deduction.conclusion.object) continue;

    const result = isSatisfiable(
      { puzzle: state.puzzle, observations: state.observations },
      [{ kind: 'cellIs', cellId: deduction.conclusion.cellId, value: kind }],
      options,
    );
    stats = combineStats(stats, result.stats);
    if (result.stats.truncated) return validationResult(deduction, [solverTruncatedIssue(deduction)], stats);
    if (result.satisfiable) possibleAlternatives.push(kind);
  }

  if (possibleAlternatives.length > 0) {
    issues.push(invalidDeductionIssue(
      deduction,
      `${deduction.conclusion.cellId} can still be ${possibleAlternatives.join(', ')}.`,
    ));
  }

  return validationResult(deduction, issues, stats);
}

function explainedCells(
  state: KnowledgeState,
  validationResults: readonly DeductionValidationResult[],
  deductions: readonly Deduction[],
  kind: 'safe' | 'guest',
): readonly CellId[] {
  const validIds = new Set(
    validationResults
      .filter((result) => result.valid)
      .map((result) => result.deductionId),
  );
  const cells = deductions
    .filter((deduction) => validIds.has(deduction.id))
    .filter((deduction) => deduction.conclusion.kind === kind)
    .map((deduction) => deduction.conclusion.cellId);

  return sortCellIds(new Set(cells), state.puzzle.board);
}

function validationResult(
  deduction: Deduction,
  issues: readonly VerificationIssue[],
  stats: SolverStats,
): DeductionValidationResult {
  return {
    deductionId: deduction.id,
    valid: issues.length === 0,
    issues,
    stats,
  };
}

function invalidDeductionIssue(deduction: Deduction, message: string): VerificationIssue {
  return {
    code: 'INVALID_DEDUCTION',
    message,
    cellIds: [deduction.conclusion.cellId],
    deductionIds: [deduction.id],
  };
}

function solverTruncatedIssue(deduction: Deduction): VerificationIssue {
  return {
    code: 'SOLVER_TRUNCATED',
    message: 'Solver validation truncated before this deduction could be confirmed.',
    cellIds: [deduction.conclusion.cellId],
    deductionIds: [deduction.id],
  };
}

function zeroStats(): SolverStats {
  return {
    nodeCount: 0,
    propagationCount: 0,
    truncated: false,
  };
}

function combineStats(left: SolverStats, right: SolverStats): SolverStats {
  return {
    nodeCount: left.nodeCount + right.nodeCount,
    propagationCount: left.propagationCount + right.propagationCount,
    truncated: left.truncated || right.truncated,
  };
}
