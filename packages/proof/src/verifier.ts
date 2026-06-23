import { allCells, sortCellIds } from '@room-axioms/domain';
import { isGuestLayoutUnique, isSatisfiable } from '@room-axioms/solver';
import type { CellId, Observation, PuzzleDefinition } from '@room-axioms/domain';
import type { SolverOptions, SolverStats } from '@room-axioms/solver';

import { deriveHumanDeductions } from './reasoner.js';
import { findExplanationGaps } from './validation.js';
import type {
  Deduction,
  KnowledgeState,
  VerificationIssue,
  VerificationMetrics,
  VerificationOptions,
  VerificationReport,
  VerificationWave,
} from './types.js';

export function verifyNoGuess(
  puzzle: PuzzleDefinition,
  options: VerificationOptions = {},
): VerificationReport {
  const solverOptions = options.solver ?? {};
  const maxWaves = options.maxWaves ?? 20;
  const waves: VerificationWave[] = [];
  const issues: VerificationIssue[] = [];
  let observations = targetObservationsForCells(puzzle, puzzle.initialReveals, issues);
  const targetCheck = checkTargetSatisfiesRules(puzzle, solverOptions);
  issues.push(...targetCheck.issues);

  const initialSatisfiable = isSatisfiable({ puzzle, observations }, [], solverOptions);
  if (initialSatisfiable.stats.truncated) {
    issues.push({
      code: 'SOLVER_TRUNCATED',
      message: 'Initial satisfiability check truncated.',
    });
  } else if (!initialSatisfiable.satisfiable) {
    issues.push({
      code: 'CONTRADICTION',
      message: 'Initial observations are not satisfiable.',
      cellIds: observations.map((observation) => observation.cellId),
    });
  }

  const seenStates = new Set<string>();
  let guestLayoutUniqueAtEnd = false;
  let finalGuestCells: readonly CellId[] | null = null;

  if (issues.length === 0) {
    for (let waveIndex = 0; waveIndex < maxWaves; waveIndex += 1) {
      const state: KnowledgeState = { puzzle, observations };
      const stateKey = observationStateKey(puzzle, observations);
      if (seenStates.has(stateKey)) {
        issues.push({
          code: 'NON_PROGRESS',
          message: 'Verifier reached a repeated observation state.',
          waveIndex,
        });
        break;
      }
      seenStates.add(stateKey);

      const uniqueBefore = isGuestLayoutUnique(state, solverOptions);
      if (uniqueBefore.stats.truncated) {
        issues.push({
          code: 'SOLVER_TRUNCATED',
          message: 'Guest-layout uniqueness check truncated.',
          waveIndex,
        });
        break;
      }
      if (uniqueBefore.unique) {
        guestLayoutUniqueAtEnd = true;
        finalGuestCells = uniqueBefore.guestCells;
        break;
      }

      const wave = runVerificationWave(state, waveIndex, solverOptions);
      const additions = [...wave.confirmedGuests, ...wave.revealed.map((observation) => observation.cellId)];
      if (wave.issues.length === 0 && additions.length === 0) {
        const issue = {
          code: 'GUESS_POINT',
          message: 'No valid human deduction can advance the current state.',
          waveIndex,
        } satisfies VerificationIssue;
        waves.push({ ...wave, issues: [issue] });
        issues.push(issue);
        break;
      }

      waves.push(wave);
      issues.push(...wave.issues);
      if (wave.issues.length > 0) break;

      observations = mergeObservations(puzzle, observations, [...wave.revealed, ...guestObservations(wave.confirmedGuests)]);

      const uniqueAfter = isGuestLayoutUnique({ puzzle, observations }, solverOptions);
      if (uniqueAfter.stats.truncated) {
        issues.push({
          code: 'SOLVER_TRUNCATED',
          message: 'Guest-layout uniqueness check truncated after a proof wave.',
          waveIndex,
        });
        break;
      }
      if (uniqueAfter.unique) {
        guestLayoutUniqueAtEnd = true;
        finalGuestCells = uniqueAfter.guestCells;
        break;
      }
    }
  }

  if (issues.length === 0 && !guestLayoutUniqueAtEnd) {
    issues.push({
      code: 'NON_PROGRESS',
      message: `Verifier did not reach a unique guest layout within ${maxWaves} waves.`,
    });
  }

  const noGuess = issues.length === 0 && targetCheck.satisfiesRules && guestLayoutUniqueAtEnd;

  return {
    satisfiable: initialSatisfiable.satisfiable && !initialSatisfiable.stats.truncated,
    targetSatisfiesRules: targetCheck.satisfiesRules,
    guestLayoutUniqueAtEnd,
    finalGuestCells,
    noGuess,
    humanExplainable: noGuess,
    waves,
    issues,
    metrics: verificationMetrics(waves),
  };
}

function runVerificationWave(
  state: KnowledgeState,
  waveIndex: number,
  solverOptions: SolverOptions,
): VerificationWave {
  const deductions = deriveHumanDeductions(state);
  const gapReport = findExplanationGaps(state, deductions, solverOptions);
  const issues = [...gapReport.issues];
  const validDeductionIds = new Set(
    gapReport.validationResults
      .filter((result) => result.valid)
      .map((result) => result.deductionId),
  );
  const revealed: Observation[] = [];
  const confirmedGuests: CellId[] = [];
  const observedCells = new Set(state.observations.map((observation) => observation.cellId));

  if (issues.length === 0) {
    for (const deduction of deductions) {
      if (!validDeductionIds.has(deduction.id)) continue;

      if (deduction.conclusion.kind === 'guest') {
        if (!observedCells.has(deduction.conclusion.cellId)) confirmedGuests.push(deduction.conclusion.cellId);
      } else if (deduction.conclusion.kind === 'safe') {
        const observation = targetObservationForSafeCell(state.puzzle, deduction.conclusion.cellId, waveIndex, issues);
        if (observation !== null && !observedCells.has(observation.cellId)) revealed.push(observation);
      }
    }
  }

  return {
    index: waveIndex,
    observations: state.observations,
    deductions,
    revealed: uniqueObservations(state.puzzle, revealed),
    confirmedGuests: sortCellIds(new Set(confirmedGuests), state.puzzle.board),
    issues,
    solverStats: gapReport.stats,
  };
}

interface TargetCheck {
  readonly satisfiesRules: boolean;
  readonly issues: readonly VerificationIssue[];
  readonly stats: SolverStats;
}

function checkTargetSatisfiesRules(puzzle: PuzzleDefinition, options: SolverOptions): TargetCheck {
  const issues: VerificationIssue[] = [];
  const observations = targetObservationsForCells(puzzle, allCells(puzzle.board), issues);
  if (issues.length > 0) return { satisfiesRules: false, issues, stats: zeroStats() };

  const result = isSatisfiable({ puzzle, observations }, [], options);
  if (result.stats.truncated) {
    issues.push({
      code: 'SOLVER_TRUNCATED',
      message: 'Target satisfaction check truncated.',
    });
  } else if (!result.satisfiable) {
    issues.push({
      code: 'TARGET_VIOLATES_RULE',
      message: 'Puzzle target does not satisfy the rule set.',
    });
  }

  return {
    satisfiesRules: result.satisfiable && !result.stats.truncated,
    issues,
    stats: result.stats,
  };
}

function targetObservationsForCells(
  puzzle: PuzzleDefinition,
  cellIds: readonly CellId[],
  issues: VerificationIssue[],
): readonly Observation[] {
  const observations: Observation[] = [];

  for (const cellId of cellIds) {
    const kind = puzzle.target[cellId];
    if (kind === undefined || !puzzle.allowedKinds.includes(kind)) {
      issues.push({
        code: 'TARGET_VIOLATES_RULE',
        message: `Puzzle target is missing an allowed value for ${cellId}.`,
        cellIds: [cellId],
      });
      continue;
    }

    observations.push({ cellId, kind });
  }

  return uniqueObservations(puzzle, observations);
}

function targetObservationForSafeCell(
  puzzle: PuzzleDefinition,
  cellId: CellId,
  waveIndex: number,
  issues: VerificationIssue[],
): Observation | null {
  const kind = puzzle.target[cellId];
  if (kind === undefined || !puzzle.allowedKinds.includes(kind)) {
    issues.push({
      code: 'TARGET_VIOLATES_RULE',
      message: `Puzzle target is missing an allowed value for ${cellId}.`,
      cellIds: [cellId],
      waveIndex,
    });
    return null;
  }

  if (kind === 'guest') {
    issues.push({
      code: 'TARGET_VIOLATES_RULE',
      message: `Cell ${cellId} was proved safe but the target marks it as guest.`,
      cellIds: [cellId],
      waveIndex,
    });
    return null;
  }

  return { cellId, kind };
}

function mergeObservations(
  puzzle: PuzzleDefinition,
  current: readonly Observation[],
  additions: readonly Observation[],
): readonly Observation[] {
  return uniqueObservations(puzzle, [...current, ...additions]);
}

function uniqueObservations(
  puzzle: PuzzleDefinition,
  observations: readonly Observation[],
): readonly Observation[] {
  const byCell = new Map<CellId, Observation>();
  for (const observation of observations) byCell.set(observation.cellId, observation);

  return sortCellIds(byCell.keys(), puzzle.board)
    .map((cellId) => byCell.get(cellId))
    .filter(isDefined);
}

function guestObservations(cellIds: readonly CellId[]): readonly Observation[] {
  return cellIds.map((cellId) => ({ cellId, kind: 'guest' }));
}

function observationStateKey(
  puzzle: PuzzleDefinition,
  observations: readonly Observation[],
): string {
  return uniqueObservations(puzzle, observations)
    .map((observation) => `${observation.cellId}:${observation.kind}`)
    .join('|');
}

function verificationMetrics(waves: readonly VerificationWave[]): VerificationMetrics {
  const techniqueIds = new Set<Deduction['technique']>();
  let deductionCount = 0;
  let revealedSafeCount = 0;
  let confirmedGuestCount = 0;

  for (const wave of waves) {
    deductionCount += wave.deductions.length;
    revealedSafeCount += wave.revealed.length;
    confirmedGuestCount += wave.confirmedGuests.length;
    for (const deduction of wave.deductions) techniqueIds.add(deduction.technique);
  }

  return {
    waveCount: waves.length,
    deductionCount,
    revealedSafeCount,
    confirmedGuestCount,
    techniqueIds: [...techniqueIds].sort(),
  };
}

function zeroStats(): SolverStats {
  return {
    nodeCount: 0,
    propagationCount: 0,
    truncated: false,
  };
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}
