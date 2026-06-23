import { describe, expect, it } from 'vitest';
import type { CellKind, PuzzleDefinition } from '@room-axioms/domain';

import {
  cloneDomains,
  containsKind,
  createInitialDomains,
  domainSize,
  intersectMask,
  kindsInMask,
  maskForKinds,
  removeKind,
  setCellDomain,
  singletonKind,
  singletonMask,
} from './bitset.js';

const puzzle = makePuzzle({
  width: 2,
  height: 2,
  allowedKinds: ['empty', 'guest', 'bottle'],
});

describe('bitmask domains', () => {
  it('creates domains from puzzle allowed kinds', () => {
    const domains = createInitialDomains(puzzle);

    expect(kindsInMask(domains.A1, puzzle.allowedKinds)).toEqual(['empty', 'guest', 'bottle']);
    expect(domainSize(domains.A1)).toBe(3);
  });

  it('supports singleton, contains, remove, and intersect operations', () => {
    const guest = singletonMask('guest');
    const emptyOrGuest = maskForKinds(['empty', 'guest']);

    expect(containsKind(emptyOrGuest, 'empty')).toBe(true);
    expect(containsKind(emptyOrGuest, 'bottle')).toBe(false);
    expect(removeKind(emptyOrGuest, 'empty')).toBe(guest);
    expect(intersectMask(emptyOrGuest, maskForKinds(['guest', 'bottle']))).toBe(guest);
    expect(singletonKind(guest)).toBe('guest');
    expect(singletonKind(emptyOrGuest)).toBeNull();
  });

  it('clones and updates domains without mutating the original object', () => {
    const domains = createInitialDomains(puzzle);
    const updated = setCellDomain(domains, 'A1', singletonMask('guest'));
    const cloned = cloneDomains(updated);

    cloned.A1 = singletonMask('empty');

    expect(singletonKind(domains.A1)).toBeNull();
    expect(singletonKind(updated.A1)).toBe('guest');
    expect(singletonKind(cloned.A1)).toBe('empty');
  });
});

function makePuzzle(input: {
  readonly width: number;
  readonly height: number;
  readonly allowedKinds: readonly CellKind[];
}): PuzzleDefinition {
  return {
    schemaVersion: 1,
    id: 'solver-bitset-test',
    title: 'Solver Bitset Test',
    board: { width: input.width, height: input.height },
    allowedKinds: input.allowedKinds,
    rules: [],
    initialReveals: [],
    target: {},
    metadata: {
      difficulty: 1,
      tags: ['solver-test'],
      status: 'draft',
    },
  };
}
