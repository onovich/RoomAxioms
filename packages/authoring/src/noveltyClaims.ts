export type NoveltyClaimStatus = 'accepted' | 'rejected' | 'needs-review'

export interface NoveltyClaimEvidence {
  readonly reviewerNote: string
  readonly gateEvidence?: readonly string[]
}

export interface NoveltyClaim {
  readonly puzzleId: string
  readonly status: NoveltyClaimStatus
  readonly novelty: string
  readonly evidence: NoveltyClaimEvidence
}

export interface NoveltyClaimManifest {
  readonly schemaVersion: 1
  readonly claims: readonly NoveltyClaim[]
}

export type NoveltyClaimIssueCode =
  | 'INVALID_SCHEMA_VERSION'
  | 'DUPLICATE_CLAIM'
  | 'MISSING_REQUIRED_CLAIM'
  | 'MISSING_NOVELTY'
  | 'MISSING_REVIEWER_EVIDENCE'

export interface NoveltyClaimIssue {
  readonly code: NoveltyClaimIssueCode
  readonly puzzleId?: string
  readonly message: string
}

export interface NoveltyClaimReport {
  readonly ok: boolean
  readonly requiredPuzzleIds: readonly string[]
  readonly acceptedPuzzleIds: readonly string[]
  readonly rejectedPuzzleIds: readonly string[]
  readonly needsReviewPuzzleIds: readonly string[]
  readonly issues: readonly NoveltyClaimIssue[]
}

export function evaluateNoveltyClaimManifest(
  manifest: NoveltyClaimManifest,
  requiredPuzzleIds: readonly string[],
): NoveltyClaimReport {
  const issues: NoveltyClaimIssue[] = []
  const byPuzzleId = new Map<string, NoveltyClaim>()
  const duplicates = new Set<string>()

  if (manifest.schemaVersion !== 1) {
    issues.push({
      code: 'INVALID_SCHEMA_VERSION',
      message: 'Novelty claim manifest schemaVersion must be 1.',
    })
  }

  for (const claim of manifest.claims) {
    if (byPuzzleId.has(claim.puzzleId)) {
      duplicates.add(claim.puzzleId)
      continue
    }

    byPuzzleId.set(claim.puzzleId, claim)
  }

  for (const puzzleId of duplicates) {
    issues.push({
      code: 'DUPLICATE_CLAIM',
      puzzleId,
      message: `Novelty claim manifest has duplicate entries for ${puzzleId}.`,
    })
  }

  for (const puzzleId of requiredPuzzleIds) {
    if (!byPuzzleId.has(puzzleId)) {
      issues.push({
        code: 'MISSING_REQUIRED_CLAIM',
        puzzleId,
        message: `Missing novelty claim for required puzzle ${puzzleId}.`,
      })
    }
  }

  for (const claim of byPuzzleId.values()) {
    if (claim.novelty.trim().length === 0) {
      issues.push({
        code: 'MISSING_NOVELTY',
        puzzleId: claim.puzzleId,
        message: `${claim.puzzleId} must include a novelty claim, even when rejected.`,
      })
    }

    if (claim.evidence.reviewerNote.trim().length === 0) {
      issues.push({
        code: 'MISSING_REVIEWER_EVIDENCE',
        puzzleId: claim.puzzleId,
        message: `${claim.puzzleId} must include reviewer evidence.`,
      })
    }
  }

  return {
    ok: issues.length === 0,
    requiredPuzzleIds: [...requiredPuzzleIds].sort(),
    acceptedPuzzleIds: claimsByStatus(byPuzzleId, 'accepted'),
    rejectedPuzzleIds: claimsByStatus(byPuzzleId, 'rejected'),
    needsReviewPuzzleIds: claimsByStatus(byPuzzleId, 'needs-review'),
    issues,
  }
}

function claimsByStatus(
  claims: ReadonlyMap<string, NoveltyClaim>,
  status: NoveltyClaimStatus,
): readonly string[] {
  return [...claims.values()]
    .filter((claim) => claim.status === status)
    .map((claim) => claim.puzzleId)
    .sort()
}
