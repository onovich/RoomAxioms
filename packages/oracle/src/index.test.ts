import { describe, expect, it } from 'vitest';

import {
  ORACLE_PACKAGE_NAME,
  enumerateModels,
  evaluateRule,
  satisfiesRules,
  targetSatisfiesRules,
  verifyPuzzleWithOracle,
} from './index.js';
import type { OracleSearchResult } from './index.js';

describe('@room-axioms/oracle package boundary', () => {
  it('exports a stable package marker and public result types', () => {
    const result: OracleSearchResult = {
      satisfiable: false,
      models: [],
      modelCount: 0,
      nodeCount: 0,
      truncated: false,
    };

    expect(ORACLE_PACKAGE_NAME).toBe('@room-axioms/oracle');
    expect(result.truncated).toBe(false);
  });

  it('exports the Phase 3 public oracle API', () => {
    expect(enumerateModels).toBeTypeOf('function');
    expect(evaluateRule).toBeTypeOf('function');
    expect(satisfiesRules).toBeTypeOf('function');
    expect(targetSatisfiesRules).toBeTypeOf('function');
    expect(verifyPuzzleWithOracle).toBeTypeOf('function');
  });
});
