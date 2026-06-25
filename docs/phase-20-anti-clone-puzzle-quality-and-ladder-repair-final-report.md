# Phase 20 Anti-Clone Puzzle Quality And Ladder Repair Final Report

Status: READY_FOR_CHECK

Planner thread: `019ef0df-a626-7181-9ca6-1cc75c1f4c47`

Executor scope: Phase 20 only.

## Summary

Phase 20 repaired the puzzle quality process before adding more content. The player-facing selector is now a smaller honest selector with:

1. `case-011`
2. `case-012`
3. `case-004`

`case-004` remains the default case.

The rejected Phase 19 selector entries are no longer player-facing:

- `case-001`
- `case-002`
- `case-003`
- `case-005`
- `case-006`

Their JSON files remain in `content/cases` for auditability, but `apps/web/src/content/cases.ts` no longer imports them.

## Implemented Gates

- Effective-board reduction: `reduceEffectiveBoard`.
- Effective-board isomorphism: `findEffectiveIsomorphicPuzzleGroups`.
- Proof-trace fingerprint and clone gate: `proofTraceFingerprint`, `findProofTraceCloneGroups`.
- Candidate-shrink signature: `candidateShrinkSignature`, `findCandidateShrinkCloneGroups`.
- Rule-impact vector: `evaluateRuleImpactVector`, `findRuleImpactCloneGroups`.
- Novelty-claim manifest: `content/novelty-claims.json`, `evaluateNoveltyClaimManifest`.
- Combined report and CLI: `pnpm authoring anti-clone ...`.

## Key Evidence

- Current 8-case selector audit: `docs/phase-20/current-selector-anti-clone-audit.md`.
- Selector repair decision: `docs/phase-20/selector-repair-decision.md`.
- Repaired selector anti-clone PASS: `docs/phase-20/repaired-selector-anti-clone-pass.md`.
- No-promotion decision: `docs/phase-20/replacement-promotion-decision.md`.
- Local smoke evidence: `docs/phase-20/final-local-smoke-evidence.md`.

Repaired selector command:

```powershell
pnpm authoring anti-clone content/cases/case-011.json content/cases/case-012.json content/cases/case-004.json --novelty-manifest content/novelty-claims.json
```

Result:

- status: `pass`
- hard failures: 0
- reviewer-blocking groups: 0
- required novelty claims accepted: `case-004`, `case-011`, `case-012`

## Validation

Local final validation:

- `git diff --check`: PASS, normal CRLF working-copy warnings only.
- `Validate.cmd`: PASS.
- `pnpm lint`: PASS.
- `pnpm typecheck`: PASS.
- `pnpm test`: PASS.
  - apps/web: 11 files, 46 tests.
  - packages/authoring: 4 files, 46 tests.
- `pnpm build`: PASS.

Smoke:

- `StartDevServer.cmd`: PASS.
- `Smoke.cmd`: PASS.
- `StopDevServer.cmd`: PASS.
- Local HTTP smoke URL: `http://127.0.0.1:5173/RoomAxioms/`.

Pages:

- Deploy Pages run `28165995221`: success.
- Online URL `http://blog.onovich.com/RoomAxioms/`: HTTP 200.

## Commits

Phase 20 implementation commits after planner guide:

- `3df8f96` docs: audit Phase 20 clone rejection
- `fba923e` feat: add effective board anti-clone reduction
- `6662891` feat: detect effective-board puzzle clones
- `a1b1a61` feat: add proof trace anti-clone fingerprint
- `e464ecf` feat: add proof trace clone gate
- `6d5e2a0` feat: add candidate shrink clone signature
- `ee0b6b8` feat: add rule impact anti-clone vector
- `7a72131` feat: add novelty claim manifest
- `6ada2c3` feat: add combined anti-clone report
- `ebbf762` docs: audit selector anti-clone failures
- `515874b` fix: demote clone cases from selector
- `34556f0` docs: record no-promotion selector decision
- `2a82480` docs: record repaired selector anti-clone pass
- `8654349` docs: record Phase 20 local smoke
- `7f8e2f3` test: relax anti-clone CLI timeout

## Boundaries

Kept:

- No Puzzle Schema v1 semantic changes.
- No solver rewrite.
- No new proof techniques.
- No public editor, UGC, backend, analytics, daily challenge, broad UI/theme/VN work, or fabricated playtest calibration.
- Generated/rejected experimental content remains out of the player selector.
- Player UI does not expose target/candidate/forced/generator/authoring internals.

Known non-blocking workspace note:

- Two unrelated untracked docs remain unstaged and were not touched by Phase 20.

## Blockers

None.

## PASS Criteria

PASS criteria are met:

- Anti-clone gates exist and are tested.
- Padded-board clone failure is covered.
- Proof-trace clone failure is covered.
- Candidate-shrink signature is covered.
- Rule-impact vector is covered.
- Novelty claim manifest is covered.
- Existing accepted cases `case-004`, `case-011`, and `case-012` are protected.
- Rejected Phase 19 cases are removed from the player selector.
- The repaired selector passes combined anti-clone review.
- Validation, smoke, push, Pages deployment, and online HTTP check passed.
