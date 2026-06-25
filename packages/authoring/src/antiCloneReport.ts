import type { PuzzleDefinition } from '@room-axioms/domain'

import {
  findCandidateShrinkCloneGroups,
  findEffectiveIsomorphicPuzzleGroups,
  findProofTraceCloneGroups,
  findRuleImpactCloneGroups,
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
  readonly novelty?: NoveltyClaimReport
  readonly rejectedRequiredPuzzleIds: readonly string[]
  readonly needsReviewRequiredPuzzleIds: readonly string[]
}

export interface AntiCloneReportOptions {
  readonly noveltyManifest?: NoveltyClaimManifest
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
  const noveltyIssueCount = novelty?.issues.length ?? 0
  const hardFailureCount =
    effectiveIsomorphismGroups.length +
    proofTraceHardFailures.length +
    noveltyIssueCount +
    rejectedRequiredPuzzleIds.length
  const reviewerBlockingCount =
    proofTraceReviewerBlocks.length +
    candidateShrinkCloneGroups.length +
    ruleImpactCloneGroups.length +
    needsReviewRequiredPuzzleIds.length
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
    ...(novelty === undefined ? {} : { novelty }),
    rejectedRequiredPuzzleIds,
    needsReviewRequiredPuzzleIds,
  }
}
