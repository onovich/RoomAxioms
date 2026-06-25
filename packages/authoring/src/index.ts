export {
  reduceEffectiveBoard,
  type EffectiveBoardBounds,
  type EffectiveBoardReduction,
  type EffectiveBoardReductionOptions,
  type EffectiveCell,
  type EffectiveCellReason,
} from './antiClone.js'
export {
  AUTHORING_CLI_VERSION,
  AUTHORING_PACKAGE_NAME,
  type AuthoringCaseValidationReport,
  type AuthoringCliCommand,
  type AuthoringCliDiagnostic,
  type AuthoringCliOptions,
  type AuthoringCliParseError,
  type AuthoringCliParseResult,
  type AuthoringCliReport,
  type AuthoringCommandName,
  type AuthoringOutputFormat,
  type AuthoringRecommendation,
  type AuthoringSchemaIssueReport,
  type AuthoringSolverCapsReport,
  type AuthoringSolverStatsReport,
  type AuthoringTechniqueRetentionReport,
  type CasePathCommand,
  type SampleCommand,
} from './contracts.js'
export { minimizeCaseCommand, scoreCaseCommand } from './caseCommands.js'
export { commandInputPath, parseAuthoringArgs } from './parser.js'
export {
  canonicalPuzzleIsomorphismSignature,
  evaluateCoreQualityGates,
  evaluateRuleContribution,
  evaluateTechniqueRetentionGate,
  findIsomorphicPuzzleGroups,
  type BoardTransformName,
  type PuzzleIsomorphismGroup,
  type PuzzleIsomorphismSignature,
  type PuzzleTransformSignature,
  type QualityGateCaseProfile,
  type QualityGateId,
  type QualityGateInput,
  type QualityGatePolicy,
  type QualityGateReport,
  type QualityGateResult,
  type QualityGateStatus,
  type RuleContributionOptions,
  type RuleContributionReason,
  type RuleContributionReport,
  type RuleContributionResult,
  type RuleContributionStatus,
  type TechniqueRetentionGateInput,
  type TechniqueRetentionGateReport,
} from './qualityGates.js'
export { parsedCommandReport, parseErrorReport } from './reports.js'
export { runAuthoringCli, type RunAuthoringCliOptions } from './runner.js'
export { sampleCommand } from './sampleCommand.js'
export { validateCaseCommand } from './validation.js'
