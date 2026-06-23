export const PROOF_PACKAGE_NAME = '@room-axioms/proof' as const;

export {
  buildDeductionId,
  conclusionKey,
  derivedNodeId,
  factNodeId,
  ruleNodeId,
  stableIdList,
} from './ids.js';
export {
  buildProofGraph,
  createDeduction,
  normalizeProofPremises,
} from './graph.js';

export type {
  Deduction,
  DeductionConclusion,
  DeductionInput,
  KnowledgeState,
  ProofGraph,
  ProofNode,
  ProofPremise,
  TechniqueId,
  VerificationIssue,
  VerificationIssueCode,
  VerificationMetrics,
  VerificationOptions,
  VerificationReport,
  VerificationWave,
} from './types.js';
