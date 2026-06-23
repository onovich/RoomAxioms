import { targetSatisfiesRules } from '@room-axioms/oracle';
import { assertPuzzleDefinition } from '@room-axioms/schema';
import { describe, expect, it } from 'vitest';
import type { CellId, Observation, PuzzleDefinition } from '@room-axioms/domain';
import case004Fixture from '../../../content/cases/case-004.json' with { type: 'json' };

import { countGuestLayouts, findForcedCells, findModel, isGuestLayoutUnique } from './queries.js';

const FULL_CASE004_BUDGET = { maxNodes: 200_000, maxModels: 200_000 } as const;

describe('case-004 solver regression', () => {
  it('loads the canonical fixture through schema and verifies the target rules', () => {
    const puzzle = loadCase004();

    expect(puzzle.id).toBe('case-004');
    expect(targetSatisfiesRules(puzzle)).toBe(true);
  });

  it('finds a bounded model for the initial observations', () => {
    const puzzle = loadCase004();
    const initial = initialObservations(puzzle);
    const result = findModel({ puzzle, observations: initial }, [], FULL_CASE004_BUDGET);

    expect(result.satisfiable).toBe(true);
    expect(result.model).not.toBeNull();
    expect(result.stats).toEqual({
      nodeCount: 11,
      propagationCount: 96,
      truncated: false,
    });
  });

  it('reports stable bounded forced-cell conclusions from the initial observations', () => {
    const puzzle = loadCase004();
    const result = findForcedCells(
      { puzzle, observations: initialObservations(puzzle) },
      FULL_CASE004_BUDGET,
    );

    expect(result.safe).toEqual(['A1', 'C1', 'B2', 'D2', 'A3', 'B3', 'C3']);
    expect(result.guests).toEqual([]);
    expect(result.stats).toEqual({
      nodeCount: 149,
      propagationCount: 1306,
      truncated: false,
    });
  });

  it('tracks the documented 15 to 5 to 2 to 1 guest-layout shrink snapshots', () => {
    const puzzle = loadCase004();
    const initial = initialObservations(puzzle);
    const afterC1 = [...initial, observationFromTarget(puzzle, 'C1')];
    const afterA3 = [...afterC1, observationFromTarget(puzzle, 'A3')];
    const afterC3 = [...afterA3, observationFromTarget(puzzle, 'C3')];

    expect(countGuestLayouts({ puzzle, observations: initial }, 20, FULL_CASE004_BUDGET)).toEqual({
      count: 15,
      stats: {
        nodeCount: 1842,
        propagationCount: 14789,
        truncated: false,
      },
    });
    expect(countGuestLayouts({ puzzle, observations: afterC1 }, 20, FULL_CASE004_BUDGET)).toEqual({
      count: 5,
      stats: {
        nodeCount: 519,
        propagationCount: 4265,
        truncated: false,
      },
    });
    expect(countGuestLayouts({ puzzle, observations: afterA3 }, 20, FULL_CASE004_BUDGET)).toEqual({
      count: 2,
      stats: {
        nodeCount: 135,
        propagationCount: 1095,
        truncated: false,
      },
    });
    expect(countGuestLayouts({ puzzle, observations: afterC3 }, 20, FULL_CASE004_BUDGET)).toEqual({
      count: 1,
      stats: {
        nodeCount: 60,
        propagationCount: 459,
        truncated: false,
      },
    });
  });

  it('reports case-004 layout caps honestly', () => {
    const puzzle = loadCase004();
    const result = countGuestLayouts(
      { puzzle, observations: initialObservations(puzzle) },
      3,
      FULL_CASE004_BUDGET,
    );

    expect(result.count).toBe(3);
    expect(result.greaterThan).toBe(3);
    expect(result.stats.truncated).toBe(false);
  });

  it('confirms guest-layout uniqueness after the final mirror observation', () => {
    const puzzle = loadCase004();
    const afterC3 = [
      ...initialObservations(puzzle),
      observationFromTarget(puzzle, 'C1'),
      observationFromTarget(puzzle, 'A3'),
      observationFromTarget(puzzle, 'C3'),
    ];
    const result = isGuestLayoutUnique({ puzzle, observations: afterC3 }, FULL_CASE004_BUDGET);

    expect(result).toEqual({
      unique: true,
      guestCells: ['D1', 'B4'],
      stats: {
        nodeCount: 60,
        propagationCount: 459,
        truncated: false,
      },
    });
  });
});

function loadCase004(): PuzzleDefinition {
  return assertPuzzleDefinition(case004Fixture);
}

function initialObservations(puzzle: PuzzleDefinition): readonly Observation[] {
  return puzzle.initialReveals.map((cellId) => observationFromTarget(puzzle, cellId));
}

function observationFromTarget(puzzle: PuzzleDefinition, cellId: CellId): Observation {
  return {
    cellId,
    kind: puzzle.target[cellId],
  };
}
