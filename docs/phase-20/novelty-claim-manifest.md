# Phase 20 Novelty-Claim Manifest

Round: 8

Phase 20 adds `content/novelty-claims.json` as a private authoring manifest. It does not change Puzzle Schema v1 and is not loaded by the player runtime.

Each claim records:

- `puzzleId`;
- `status`: `accepted`, `rejected`, or `needs-review`;
- a concise novelty statement;
- reviewer evidence, with optional gate evidence tags.

`evaluateNoveltyClaimManifest(manifest, requiredPuzzleIds)` validates required claims, duplicate entries, non-empty novelty text, and reviewer evidence.

## Current Claims

Accepted baselines:

- `case-004`: mixed cleaning-chain baseline.
- `case-011`: local-scope intersection baseline.
- `case-012`: retained local-scope difference baseline.

Rejected Phase 19 suspects:

- `case-001`
- `case-002`
- `case-003`
- `case-005`
- `case-006`

These rejected claims intentionally do not pretend to establish novelty. They preserve the user's rejection evidence so later selector repair can demote the cases honestly.
