# Phase 24 Rule Grammar Expressiveness Expansion Final Report

Status: READY_FOR_CHECK_WITH_BLOCKER
Guide: docs/phase-24-rule-grammar-expressiveness-expansion-goal-mode-execution-guide.md
Final commit: pending final report commit; executor route message records the pushed hash.

## Summary

Phase 24 implemented three additive grammar families end to end:

- `scopeOverlapCount`
- `comparativeCount`
- `conditionalCount`

The implementation spans domain types, schema validation and diagnostics, oracle checks,
solver constraints and propagation, proof techniques, authoring parser and quality
gates, web rule text, runtime highlighting, and hint titles.

The phase should not be accepted as full PASS yet. The new grammar is usable and
tested, but the three Phase 24 experimental cases are compact grammar fixtures rather
than non-degenerate difficulty candidates. The hardness probe did not exceed the
`case-021` or `case-004` proof-depth baseline.

## Implemented Grammar Variants

### scopeOverlapCount

Implemented for derived overlap scopes between two named scopes, including
intersection, union, left-only, and right-only semantics.

Evidence:

- `packages/domain/src/types.ts`
- `packages/schema/src/puzzleSchema.ts`
- `packages/oracle/src/rules.ts`
- `packages/solver/src/constraints.ts`
- `packages/proof/src/reasoner.ts`
- `packages/authoring/src/qualityGates.ts`
- `apps/web/src/logic/scopeText.ts`
- `content/experimental/phase-24/phase-24-overlap-cross-001.json`

### comparativeCount

Implemented for count comparison between two public scopes with conservative
proof-backed deductions where one side is publicly fixed and the comparison can be
resolved without narrating solver search.

Evidence:

- `packages/domain/src/types.ts`
- `packages/schema/src/puzzleSchema.ts`
- `packages/oracle/src/rules.ts`
- `packages/solver/src/constraints.ts`
- `packages/proof/src/reasoner.ts`
- `packages/authoring/src/qualityGates.ts`
- `apps/web/src/logic/scopeText.ts`
- `content/experimental/phase-24/phase-24-comparative-balance-001.json`

### conditionalCount

Implemented for a public count condition activating a second public count clause.
Solver/oracle semantics handle the conditional exactly; proof support covers the
activated saturated and all-remaining cases.

Evidence:

- `packages/domain/src/types.ts`
- `packages/schema/src/puzzleSchema.ts`
- `packages/oracle/src/rules.ts`
- `packages/solver/src/constraints.ts`
- `packages/proof/src/reasoner.ts`
- `packages/authoring/src/qualityGates.ts`
- `apps/web/src/logic/scopeText.ts`
- `content/experimental/phase-24/phase-24-conditional-frontier-001.json`

## Skipped Or Deferred Variants

`recordContamination` remains design-level only. The guide allowed deferring it if
the three higher-priority grammar families consumed the phase. It should not become
player-facing until it has a verifier-backed design, readable copy, authoring gates,
and non-degenerate case evidence.

## Experimental Case Evidence

Focused authoring reports were rerun for all three Phase 24 experimental cases:

| Case | Grammar family | Report result | Key caveat |
| --- | --- | --- | --- |
| `phase-24-overlap-cross-001.json` | `scopeOverlapCount` | PASS | `initialGuestLayouts = 1`, `proofWaveCount = 0`, degeneracy warning |
| `phase-24-comparative-balance-001.json` | `comparativeCount` | PASS | `initialGuestLayouts = 1`, `proofWaveCount = 0` |
| `phase-24-conditional-frontier-001.json` | `conditionalCount` | PASS | `initialGuestLayouts = 1`, `proofWaveCount = 0` |

These cases prove schema/solver/proof/authoring integration. They do not prove a
new high-difficulty content method.

## Hardness Probe Result

`docs/phase-24/hardness-probe-round-09.md` records the required hardness attempt.

Baseline comparison:

- `case-004`: `initialGuestLayouts = 15`, `proofWaveCount = 1`,
  `deductionCount = 13`
- Phase 24 experimental cases: `initialGuestLayouts = 1`, `proofWaveCount = 0`,
  `deductionCount = 0`

Result: the hardness probe did not exceed `case-021` or `case-004`. Full PASS should
remain blocked until a Phase 24 grammar case has opening ambiguity, at least one
proof wave, Phase 24 grammar technique usage in proof metrics, no degeneracy failure,
and no redundant-rule blocker.

## Authoring And Degeneracy Evidence

Implemented authoring/parser support includes the new proof technique IDs:

- `SCOPE_OVERLAP_COUNT_SATURATED`
- `SCOPE_OVERLAP_COUNT_ALL_REMAINING`
- `CONDITIONAL_COUNT_SATURATED`
- `CONDITIONAL_COUNT_ALL_REMAINING`
- `COMPARATIVE_COUNT_SATURATED`
- `COMPARATIVE_COUNT_ALL_REMAINING`

Degeneracy gates now inspect:

- derived overlap scopes for `scopeOverlapCount`
- condition and consequence scopes for `conditionalCount`
- left and right scopes for `comparativeCount`
- trivial same-scope comparisons

Focused command results:

- `pnpm --filter @room-axioms/authoring test`: PASS, 5 files / 65 tests
- `pnpm authoring -- report content\experimental\phase-24\phase-24-overlap-cross-001.json`: PASS
- `pnpm authoring -- report content\experimental\phase-24\phase-24-comparative-balance-001.json`: PASS
- `pnpm authoring -- report content\experimental\phase-24\phase-24-conditional-frontier-001.json`: PASS

Selector anti-clone scan was also rerun:

- Command: `pnpm authoring -- anti-clone content\cases\case-004.json content\cases\case-011.json content\cases\case-013.json content\cases\case-015.json content\cases\case-012.json content\cases\case-014.json content\cases\case-017.json content\cases\case-018.json content\cases\case-020.json content\cases\case-021.json --novelty-manifest content\novelty-claims.json --include-degeneracy`
- Result: FAIL
- Reason: existing selector cases still include known baseline/sample quality caveats,
  including singleton-effective-scope degeneracy in `case-015`, `case-017`,
  `case-018`, `case-020`, and single-material-family failures in `case-011`,
  `case-013`, and `case-014`.

This is a blocker/caveat for release-quality ladder claims, not evidence of a Phase
24 parser or solver failure.

## Runtime Copy And Selector Policy

Web runtime and copy support exists for all implemented Phase 24 rule families:

- `apps/web/src/logic/scopeText.ts`
- `apps/web/src/logic/hints.ts`
- `apps/web/src/hooks/useRoomAxiomsGame.ts`

Selector policy:

- No Phase 24 experimental cases were promoted.
- `case-004` remains the default case.
- `case-021` remains shipped but is downgraded to difficulty 3 / baseline after user
  review.
- Web tests assert that no selector entry is presented as `target-4` or `super-hard`.

## Validation Evidence

Focused validation:

- `pnpm --filter @room-axioms/domain test`: PASS, 3 files / 20 tests
- `pnpm --filter @room-axioms/schema test`: PASS, 4 files / 35 tests
- `pnpm --filter @room-axioms/solver test`: PASS, 7 files / 53 tests
- `pnpm --filter @room-axioms/proof test`: PASS, 9 files / 54 tests
- `pnpm --filter @room-axioms/authoring test`: PASS, 5 files / 65 tests
- `pnpm --filter @room-axioms/web test -- src/content/caseVerification.test.ts src/content/runtimeSmoke.test.ts src/runtime/analyzer.test.ts src/runtime/facade.test.ts`: PASS, 11 files / 76 tests

Full validation:

- `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd`: PASS before this report
- Final report commit reruns the same wrapper validation.

## Smoke / Pages Evidence

Local smoke:

- `StartDevServer.cmd`: PASS, dev server started on `http://127.0.0.1:5173/RoomAxioms/`
- `Smoke.cmd`: PASS, HTTP GET local app returned successfully
- `StopDevServer.cmd`: PASS

Online evidence before final report commit:

- `https://onovich.github.io/RoomAxioms/`: HTTP 200
- Online HTML referenced `assets/index-BI0gq-GI.js`

One direct asset fetch attempt for that JS bundle failed with a transient remote
connection error, so the final route message should treat Pages asset inspection as
planner/checker follow-up evidence after the final push.

## Boundary Scans

Domain boundary:

- Scan for schema, Zod, oracle, solver, proof, React, Vite, or app imports inside
  `packages/domain/src` found only `vitest` imports in domain tests.

Experimental content boundary:

- Scan found no Phase 24 experimental fixture imported by `apps/web/src` or
  `content/cases`.

Player secrecy:

- Target/candidate/forced-cell terms exist in runtime contracts, tests, developer
  inspector, and the `game.devMode` gated panel.
- `EvidencePanel` renders solver diagnostics, forced cells, and target overlay only
  inside `game.devMode`.
- Runtime smoke tests continue to assert that wrong or incomplete submissions do not
  reveal target guest cells.

Scope boundary:

- No public editor, UGC, backend, analytics, daily challenge, broad theme/VN work,
  fabricated playtest calibration, or breaking migration was introduced.

## Blockers Or Caveats

Full Phase 24 PASS is blocked by content-quality evidence, not by code validation:

1. The required three experimental Phase 24 cases are integration fixtures, but not
   non-degenerate high-difficulty puzzles.
2. The hardness probe did not exceed `case-021` or `case-004`.
3. Selector anti-clone with degeneracy checks still fails because existing baseline
   selector cases include known quality caveats.
4. `recordContamination` is deferred to design/internal evidence only.

Recommended next step: use the implemented grammar families as inputs to a smaller,
review-heavy content production loop that starts from proof skeletons and requires
opening ambiguity plus at least one real proof wave before a candidate can count as
high-tier evidence.

## PASS Criteria Status

| Criterion | Status |
| --- | --- |
| Final report exists | PASS |
| Grammar design doc exists | PASS |
| At least three grammar capabilities implemented end to end | PASS |
| Existing cases remain parseable and valid | PASS by focused web/content tests and full validation |
| At least three experimental Phase 24 cases exist | PASS |
| Experimental cases demonstrate non-degenerate reasoning | BLOCKED |
| Hardness probe attempted and recorded | PASS |
| Hardness probe exceeds baseline | BLOCKED |
| New rendering/copy support exists | PASS |
| Authoring reports/gates understand new families | PASS |
| No Phase 24 experimental case promoted without gates | PASS |
| Player UI avoids solver/target internals outside dev mode | PASS |
| Non-scope avoided | PASS |
| Full validation and diff checks pass | PASS before report; final commit reruns |

