import { describe, expect, it } from 'vitest';

import {
  SOLVER_PACKAGE_NAME,
  countGuestLayouts,
  findForcedCells,
  findModel,
  isGuestLayoutUnique,
  isSatisfiable,
} from './index.js';
import type { SolveResult } from './index.js';

describe('@room-axioms/solver package boundary', () => {
  it('exports a stable package marker and public result types', () => {
    const result: SolveResult = {
      satisfiable: false,
      model: null,
      stats: {
        nodeCount: 0,
        propagationCount: 0,
        truncated: false,
      },
    };

    expect(SOLVER_PACKAGE_NAME).toBe('@room-axioms/solver');
    expect(result.stats.truncated).toBe(false);
  });

  it('exports the Phase 4 public solver API surface', () => {
    expect(isSatisfiable).toBeTypeOf('function');
    expect(findModel).toBeTypeOf('function');
    expect(findForcedCells).toBeTypeOf('function');
    expect(isGuestLayoutUnique).toBeTypeOf('function');
    expect(countGuestLayouts).toBeTypeOf('function');
  });
});
