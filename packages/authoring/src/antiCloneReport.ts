import type { PuzzleDefinition } from '@room-axioms/domain'

import {
  evaluateDegeneracyGates,
  evaluateRuleFamilyDiversityGate,
  findCandidateShrinkCloneGroups,
  findEffectiveIsomorphicPuzzleGroups,
  findProofTraceCloneGroups,
  findRuleImpactCloneGroups,
  type DegeneracyGateReport,
  type DegeneracyGateResult,
  type RuleFamilyDiversityReport,
} from './qualityGates.js'
import {
  evaluateNoveltyClaimManifest,
  type NoveltyClaimManifest,
  type NoveltyClaimReport,
} from './noveltyClaims.js'

export type AntiCloneReportStatus = 'pass' | 'reviewer-blocking' | 'fail'
export type AntiCloneEvidenceKind =
  | 'effective-isomorphism'
  | 'proof-trace'
  | 'candidate-shrink'
  | 'rule-impact'
  | 'degeneracy'
  | 'rule-family-diversity'

export interface AntiCloneEvidenceGroup {
  readonly kind: AntiCloneEvidenceKind
  readonly status: 'hard-fail' | 'reviewer-blocking'
  readonly puzzleIds: readonly string[]
  readonly matchKind?: string
}

export interface AntiCloneReport {
  readonly status: AntiCloneReportStatus
  readonly puzzleIds: readonly string[]
  readonly hardFailureCount: number
  readonly reviewerBlockingCount: number
  readonly evidenceGroups: readonly AntiCloneEvidenceGroup[]
  readonly degeneracy?: readonly DegeneracyGateReport[]
  readonly ruleFamilyDiversity?: readonly RuleFamilyDiversityReport[]
  readonly novelty?: NoveltyClaimReport
  readonly rejectedRequiredPuzzleIds: readonly string[]
  readonly needsReviewRequiredPuzzleIds: readonly string[]
}

export interface AntiCloneReportOptions {
  readonly noveltyManifest?: NoveltyClaimManifest
  readonly includeDegeneracy?: boolean
}

export function evaluateAntiCloneReport(
  puzzles: readonly PuzzleDefinition[],
  options: AntiCloneReportOptions = {},
): AntiCloneReport {
  const puzzleIds = puzzles.map((puzzle) => puzzle.id).sort()
  const effectiveIsomorphismGroups = findEffectiveIsomorphicPuzzleGroups(puzzles)
  const proofTraceCloneGroups = findProofTraceCloneGroups(puzzles)
  const candidateShrinkCloneGroups = findCandidateShrinkCloneGroups(puzzles)
  const ruleImpactCloneGroups = findRuleImpactCloneGroups(puzzles)
  const novelty = options.noveltyManifest === undefined
    ? undefined
    : evaluateNoveltyClaimManifest(options.noveltyManifest, puzzleIds)
  const rejectedRequiredPuzzleIds = novelty === undefined
    ? []
    : puzzleIds.filter((puzzleId) => novelty.rejectedPuzzleIds.includes(puzzleId))
  const needsReviewRequiredPuzzleIds = novelty === undefined
    ? []
    : puzzleIds.filter((puzzleId) => novelty.needsReviewPuzzleIds.includes(puzzleId))
  const proofTraceHardFailures = proofTraceCloneGroups
    .filter((group) => group.status === 'hard-fail')
  const proofTraceReviewerBlocks = proofTraceCloneGroups
    .filter((group) => group.status === 'reviewer-blocking')
  const degeneracyReports = options.includeDegeneracy === true
    ? puzzles.map((puzzle) => evaluateDegeneracyGates(puzzle))
    : []
  const degeneracyHardFailures = degeneracyFindings(degeneracyReports, 'fail')
  const degeneracyReviewerBlocks = degeneracyFindings(degeneracyReports, 'warning')
  const ruleFamilyDiversityReports = options.includeDegeneracy === true
    ? puzzles.map((puzzle) => evaluateRuleFamilyDiversityGate(puzzle))
    : []
  const ruleFamilyHardFailures = ruleFamilyDiversityReports
    .filter((report) => report.status === 'fail')
  const ruleFamilyReviewerBlocks = ruleFamilyDiversityReports
    .filter((report) => report.status === 'warning')
  const noveltyIssueCount = novelty?.issues.length ?? 0
  const hardFailureCount =
    effectiveIsomorphismGroups.length +
    proofTraceHardFailures.length +
    noveltyIssueCount +
    rejectedRequiredPuzzleIds.length +
    degeneracyHardFailures.length +
    ruleFamilyHardFailures.length
  const reviewerBlockingCount =
    proofTraceReviewerBlocks.length +
    candidateShrinkCloneGroups.length +
    ruleImpactCloneGroups.length +
    needsReviewRequiredPuzzleIds.length +
    degeneracyReviewerBlocks.length +
    ruleFamilyReviewerBlocks.length
  const evidenceGroups: AntiCloneEvidenceGroup[] = [
    ...effectiveIsomorphismGroups.map((group) => ({
      kind: 'effective-isomorphism' as const,
      status: 'hard-fail' as const,
      puzzleIds: group.puzzleIds,
    })),
    ...proofTraceCloneGroups.map((group) => ({
      kind: 'proof-trace' as const,
      status: group.status,
      matchKind: group.matchKind,
      puzzleIds: group.puzzleIds,
    })),
    ...candidateShrinkCloneGroups.map((group) => ({
      kind: 'candidate-shrink' as const,
      status: 'reviewer-blocking' as const,
      puzzleIds: group.puzzleIds,
    })),
    ...ruleImpactCloneGroups.map((group) => ({
      kind: 'rule-impact' as const,
      status: 'reviewer-blocking' as const,
      puzzleIds: group.puzzleIds,
    })),
    ...degeneracyEvidenceGroups(degeneracyHardFailures, 'hard-fail'),
    ...degeneracyEvidenceGroups(degeneracyReviewerBlocks, 'reviewer-blocking'),
    ...ruleFamilyEvidenceGroups(ruleFamilyHardFailures, 'hard-fail'),
    ...ruleFamilyEvidenceGroups(ruleFamilyReviewerBlocks, 'reviewer-blocking'),
  ]

  return {
    status: hardFailureCount > 0
      ? 'fail'
      : reviewerBlockingCount > 0
        ? 'reviewer-blocking'
        : 'pass',
    puzzleIds,
    hardFailureCount,
    reviewerBlockingCount,
    evidenceGroups,
    ...(options.includeDegeneracy === true ? { degeneracy: degeneracyReports } : {}),
    ...(options.includeDegeneracy === true ? { ruleFamilyDiversity: ruleFamilyDiversityReports } : {}),
    ...(novelty === undefined ? {} : { novelty }),
    rejectedRequiredPuzzleIds,
    needsReviewRequiredPuzzleIds,
  }
}

interface DegeneracyFinding {
  readonly report: DegeneracyGateReport
  readonly result: DegeneracyGateResult
}

function degeneracyFindings(
  reports: readonly DegeneracyGateReport[],
  status: DegeneracyGateResult['status'],
): DegeneracyFinding[] {
  return reports.flatMap((report) => report.results
    .filter((result) => result.status === status)
    .map((result) => ({ report, result })))
}

function degeneracyEvidenceGroups(
  findings: readonly DegeneracyFinding[],
  status: AntiCloneEvidenceGroup['status'],
): AntiCloneEvidenceGroup[] {
  return findings.map(({ report, result }) => ({
    kind: 'degeneracy',
    status,
    puzzleIds: [report.puzzleId],
    matchKind: [
      result.scopeKind,
      result.ruleId,
      ...result.reasons,
    ].join(':'),
  }))
}

function ruleFamilyEvidenceGroups(
  reports: readonly RuleFamilyDiversityReport[],
  status: AntiCloneEvidenceGroup['status'],
): AntiCloneEvidenceGroup[] {
  return reports.map((report) => ({
    kind: 'rule-family-diversity',
    status,
    puzzleIds: [report.puzzleId],
    matchKind: report.reasons.join(':'),
  }))
}
