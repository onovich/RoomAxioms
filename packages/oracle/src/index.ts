export const ORACLE_PACKAGE_NAME = '@room-axioms/oracle' as const;

export { enumerateModels } from './enumeration.js';
export { evaluateRule, satisfiesRules } from './rules.js';
export { targetSatisfiesRules, verifyPuzzleWithOracle } from './verification.js';

export type {
  CellAssignment,
  OracleModel,
  OracleOptions,
  OracleSearchResult,
  OracleVerificationReport,
  RuleEvaluation,
} from './types.js';
