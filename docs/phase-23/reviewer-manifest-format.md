# Phase 23 Reviewer Manifest Format

Date: 2026-06-26
Status: Round 8 private authoring format

## Purpose

The reviewer manifest is private Phase 23 evidence. It records why a candidate is promoted, rejected, or deferred without changing Puzzle Schema v1 or exposing authoring internals in the player UI.

The TypeScript contract and evaluator live in `packages/authoring/src/reviewerManifest.ts`.

## Shape

```json
{
  "schemaVersion": 1,
  "phase": "phase-23",
  "cases": [
    {
      "puzzleId": "phase-23-target-001",
      "path": "content/experimental/phase-23/phase-23-target-001.json",
      "intendedBucket": "target-4",
      "intendedDifficulty": 4,
      "intendedPlayerExperience": "One paragraph describing the intended player experience.",
      "noveltyClaim": "Why this is not a clone, mirror, padding, or label swap.",
      "reviewerNote": "Private reviewer context; not playtest calibration.",
      "gateEvidence": {
        "authoringReport": { "status": "pass", "summary": "report ok true" },
        "authoringScore": { "status": "pass", "summary": "score present, calibratedWithRealPlaytest false" },
        "degeneracy": { "status": "pass", "summary": "no singleton/direct giveaway findings" },
        "ruleFamily": { "status": "pass", "summary": "three material rule families" },
        "antiClone": { "status": "pass", "summary": "no anti-clone evidence groups" },
        "copyReview": { "status": "pass", "summary": "player-facing copy reviewed" },
        "runtime": { "status": "pass", "summary": "focused web runtime smoke passed" }
      },
      "decision": "promote",
      "decisionReason": "All required gates passed and the intended hard turn is documented."
    }
  ]
}
```

## Rules

- `schemaVersion` must be `1`.
- `phase` must be `phase-23`.
- `intendedBucket` is `tutorial-or-baseline`, `target-4`, or `super-hard-6-7`.
- `intendedDifficulty` is a private intended score from 1 to 7.
- `target-4` must use intended difficulty 3.5 through 5.
- `super-hard-6-7` must use intended difficulty 6 through 7.
- `tutorial-or-baseline` must stay below 4 and cannot count toward Phase 23 quotas.
- Promotion requires pass evidence for authoring report, authoring score, degeneracy, rule family, anti-clone, and copy review.
- Rejected and deferred candidates still need novelty, player-experience, reviewer-note, and decision-reason text.

## Evaluator

Use `evaluateReviewerManifest(manifest, requiredPuzzleIds)` from `@room-axioms/authoring` in tests or private scripts. It returns:

- promoted, rejected, and deferred ids;
- duplicate or missing required candidate issues;
- difficulty bucket mismatch issues;
- promotion gate incompleteness issues.

The manifest is not a shipped content contract and must not be loaded by the player UI.
