export type ReviewerManifestBucket =
  | 'tutorial-or-baseline'
  | 'target-4'
  | 'super-hard-6-7'

export type ReviewerManifestDecision =
  | 'promote'
  | 'reject'
  | 'defer'

export type ReviewerManifestGateStatus =
  | 'pass'
  | 'warning'
  | 'fail'
  | 'not-run'

export interface ReviewerManifestGateEvidence {
  readonly status: ReviewerManifestGateStatus
  readonly summary: string
  readonly artifactPaths?: readonly string[]
}

export interface ReviewerManifestCase {
  readonly puzzleId: string
  readonly path: string
  readonly intendedBucket: ReviewerManifestBucket
  readonly intendedDifficulty: number
  readonly intendedPlayerExperience: string
  readonly noveltyClaim: string
  readonly reviewerNote: string
  readonly gateEvidence: {
    readonly authoringReport: ReviewerManifestGateEvidence
    readonly authoringScore: ReviewerManifestGateEvidence
    readonly degeneracy: ReviewerManifestGateEvidence
    readonly ruleFamily: ReviewerManifestGateEvidence
    readonly antiClone: ReviewerManifestGateEvidence
    readonly copyReview: ReviewerManifestGateEvidence
    readonly runtime?: ReviewerManifestGateEvidence
  }
  readonly decision: ReviewerManifestDecision
  readonly decisionReason: string
}

export interface ReviewerManifest {
  readonly schemaVersion: 1
  readonly phase: 'phase-23'
  readonly cases: readonly ReviewerManifestCase[]
}

export type ReviewerManifestIssueCode =
  | 'INVALID_SCHEMA_VERSION'
  | 'INVALID_PHASE'
  | 'DUPLICATE_CASE'
  | 'MISSING_REQUIRED_CASE'
  | 'MISSING_PLAYER_EXPERIENCE'
  | 'MISSING_NOVELTY_CLAIM'
  | 'MISSING_REVIEWER_NOTE'
  | 'MISSING_DECISION_REASON'
  | 'DIFFICULTY_OUT_OF_RANGE'
  | 'DIFFICULTY_BUCKET_MISMATCH'
  | 'PROMOTION_GATE_INCOMPLETE'

export interface ReviewerManifestIssue {
  readonly code: ReviewerManifestIssueCode
  readonly puzzleId?: string
  readonly message: string
}

export interface ReviewerManifestReport {
  readonly ok: boolean
  readonly requiredPuzzleIds: readonly string[]
  readonly promotedPuzzleIds: readonly string[]
  readonly rejectedPuzzleIds: readonly string[]
  readonly deferredPuzzleIds: readonly string[]
  readonly issues: readonly ReviewerManifestIssue[]
}

export function evaluateReviewerManifest(
  manifest: ReviewerManifest,
  requiredPuzzleIds: readonly string[] = [],
): ReviewerManifestReport {
  const issues: ReviewerManifestIssue[] = []
  const byPuzzleId = new Map<string, ReviewerManifestCase>()
  const duplicates = new Set<string>()

  if (manifest.schemaVersion !== 1) {
    issues.push({
      code: 'INVALID_SCHEMA_VERSION',
      message: 'Reviewer manifest schemaVersion must be 1.',
    })
  }

  if (manifest.phase !== 'phase-23') {
    issues.push({
      code: 'INVALID_PHASE',
      message: 'Reviewer manifest phase must be phase-23.',
    })
  }

  for (const candidate of manifest.cases) {
    if (byPuzzleId.has(candidate.puzzleId)) {
      duplicates.add(candidate.puzzleId)
      continue
    }

    byPuzzleId.set(candidate.puzzleId, candidate)
    issues.push(...caseIssues(candidate))
  }

  for (const puzzleId of duplicates) {
    issues.push({
      code: 'DUPLICATE_CASE',
      puzzleId,
      message: `Reviewer manifest has duplicate entries for ${puzzleId}.`,
    })
  }

  for (const puzzleId of requiredPuzzleIds) {
    if (!byPuzzleId.has(puzzleId)) {
      issues.push({
        code: 'MISSING_REQUIRED_CASE',
        puzzleId,
        message: `Reviewer manifest is missing required candidate ${puzzleId}.`,
      })
    }
  }

  return {
    ok: issues.length === 0,
    requiredPuzzleIds: [...requiredPuzzleIds].sort(),
    promotedPuzzleIds: casesByDecision(byPuzzleId, 'promote'),
    rejectedPuzzleIds: casesByDecision(byPuzzleId, 'reject'),
    deferredPuzzleIds: casesByDecision(byPuzzleId, 'defer'),
    issues,
  }
}

function caseIssues(candidate: ReviewerManifestCase): ReviewerManifestIssue[] {
  const issues: ReviewerManifestIssue[] = []

  if (candidate.intendedPlayerExperience.trim().length === 0) {
    issues.push(issue('MISSING_PLAYER_EXPERIENCE', candidate.puzzleId, 'Candidate must describe the intended player experience.'))
  }
  if (candidate.noveltyClaim.trim().length === 0) {
    issues.push(issue('MISSING_NOVELTY_CLAIM', candidate.puzzleId, 'Candidate must include a qualitative novelty claim.'))
  }
  if (candidate.reviewerNote.trim().length === 0) {
    issues.push(issue('MISSING_REVIEWER_NOTE', candidate.puzzleId, 'Candidate must include reviewer notes.'))
  }
  if (candidate.decisionReason.trim().length === 0) {
    issues.push(issue('MISSING_DECISION_REASON', candidate.puzzleId, 'Candidate must explain the decision.'))
  }
  if (candidate.intendedDifficulty < 1 || candidate.intendedDifficulty > 7) {
    issues.push(issue('DIFFICULTY_OUT_OF_RANGE', candidate.puzzleId, 'Intended difficulty must be between 1 and 7.'))
  }
  if (!difficultyFitsBucket(candidate.intendedDifficulty, candidate.intendedBucket)) {
    issues.push(issue(
      'DIFFICULTY_BUCKET_MISMATCH',
      candidate.puzzleId,
      `${candidate.puzzleId} intended difficulty does not match ${candidate.intendedBucket}.`,
    ))
  }
  if (candidate.decision === 'promote') {
    for (const gate of requiredPromotionGates(candidate)) {
      if (gate.status !== 'pass') {
        issues.push(issue(
          'PROMOTION_GATE_INCOMPLETE',
          candidate.puzzleId,
          `${candidate.puzzleId} cannot be promoted until ${gate.name} is pass.`,
        ))
      }
    }
  }

  return issues
}

function difficultyFitsBucket(difficulty: number, bucket: ReviewerManifestBucket): boolean {
  if (bucket === 'target-4') return difficulty >= 3.5 && difficulty <= 5
  if (bucket === 'super-hard-6-7') return difficulty >= 6 && difficulty <= 7

  return difficulty >= 1 && difficulty < 4
}

function requiredPromotionGates(candidate: ReviewerManifestCase): readonly {
  readonly name: string
  readonly status: ReviewerManifestGateStatus
}[] {
  return [
    { name: 'authoringReport', status: candidate.gateEvidence.authoringReport.status },
    { name: 'authoringScore', status: candidate.gateEvidence.authoringScore.status },
    { name: 'degeneracy', status: candidate.gateEvidence.degeneracy.status },
    { name: 'ruleFamily', status: candidate.gateEvidence.ruleFamily.status },
    { name: 'antiClone', status: candidate.gateEvidence.antiClone.status },
    { name: 'copyReview', status: candidate.gateEvidence.copyReview.status },
  ]
}

function issue(
  code: ReviewerManifestIssueCode,
  puzzleId: string,
  message: string,
): ReviewerManifestIssue {
  return { code, puzzleId, message }
}

function casesByDecision(
  cases: ReadonlyMap<string, ReviewerManifestCase>,
  decision: ReviewerManifestDecision,
): readonly string[] {
  return [...cases.values()]
    .filter((candidate) => candidate.decision === decision)
    .map((candidate) => candidate.puzzleId)
    .sort()
}
