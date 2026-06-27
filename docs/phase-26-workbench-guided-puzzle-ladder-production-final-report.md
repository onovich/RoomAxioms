# Phase 26 Workbench-Guided Puzzle Ladder Production Final Report

Status: READY_FOR_CHECK_WITH_BLOCKER
Guide: docs/phase-26-workbench-guided-puzzle-ladder-production-goal-mode-execution-guide.md
Final commit: e326c041fbbdbc9a787a8af2ea24b2d2169f5129

## Summary

Phase 26 used the Phase 25 private workbench and authoring CLI to attempt a stricter, workbench-guided puzzle ladder. The phase produced a high-quality rejection corpus instead of padding the player selector with weak content.

Result: `READY_FOR_CHECK_WITH_BLOCKER`. No Phase 26 candidates have been promoted. The existing player selector remains unchanged and honest: `case-004`, `case-011`, `case-013`, `case-015`, `case-012`, `case-014`, `case-017`, `case-018`, `case-020`, and `case-021`, with `case-004` still the default.

The blocker is content-production quality under strict gates, not runtime correctness. Fifteen serious candidates were authored or repaired under `content/experimental/phase-26/`, and all were rejected because they failed correctness, no-guess, final uniqueness, degeneracy, anti-clone, novelty, or proof-support gates.

## Candidate Attempt Matrix

| Candidate | Proof shape | Phase 24 grammar material | Result | Primary rejection reason |
| --- | --- | --- | --- | --- |
| C01 | Crossing overlap unlock | `scopeOverlapCount` scaffold | Rejected | Exact proof-trace clone of `case-004`; no material overlap proof technique. |
| C02 | Comparative balance fork | `comparativeCount` | Rejected | No-guess false, final non-unique, singleton comparative side, redundant rules. |
| C03 | Conditional frontier unlock | `conditionalCount` | Rejected | Delayed conditional did not activate; repair collapsed into opening unique / zero-wave shape. |
| C04 | Difference braid | Existing difference/intersection | Rejected | Difference retained, but proof/final uniqueness failed and a C4 gap remained. |
| C05 | Object-gated local saturation | Object-local proof families | Rejected | Solver truncation, proof gaps, and final non-unique guest layout. |
| C06 | Two-wave frontier | Classic local/region pressure | Rejected | Promising two-wave shape, but bottom branch stayed solver-only and final remained non-unique. |
| C07 | Grammar hybrid | `comparativeCount` | Rejected | Comparative retained, but no-guess/final uniqueness failed and search truncated. |
| C08 | Overlap repair | `scopeOverlapCount` | Rejected | Scope overlap retained only as a direct opening giveaway with hard singleton degeneracy. |
| C09 | Comparative repair | `comparativeCount` | Rejected | Non-singleton comparative retained, but final non-unique and proof gaps remained. |
| C10 | Frontier repair | Local/region proof pressure | Rejected | Better two-wave structure, but several cells remained solver-only. |
| C11 | Object gate replacement | Object-local proof families | Rejected | Opening guest layout was already unique, producing a zero-wave case. |
| C12 | Final synthesis | `comparativeCount` | Rejected | Comparative retained, but proof trace cloned C09 and object-local rules were redundant. |
| C13 | Frontier closure | Local/region proof pressure | Rejected | Local/region techniques retained, but no-guess/final uniqueness failed and rules were degenerate. |
| C14 | Comparative object bridge | `comparativeCount` | Rejected | Rule material came from opening uniqueness, singleton comparative side, and zero waves. |
| C15 | Overlap chain repair | `scopeOverlapCount` scaffold | Rejected | Non-degenerate overlap material existed, but no overlap proof technique fired and gaps remained. |

Detailed evidence is recorded in `docs/phase-26/candidate-review-log.md`.

## Promoted Cases

None.

This is intentional. The Phase 26 quality bar requires promotion only when a candidate passes schema, solver/proof/no-guess, final guest-layout uniqueness, opening ambiguity, proof-wave, degeneracy, anti-clone, novelty, copy, and selector/runtime gates. No Phase 26 candidate cleared that full gate.

## Rejected Cases And Reasons

The rejection corpus clustered into five failure families:

- Correctness blockers: candidates with final non-unique guest layouts, failed no-guess checks, or proof gaps.
- Degeneracy blockers: candidates that became opening-unique, zero-wave, singleton-pressure, direct safe-cell giveaway, or redundant-rule puzzles.
- Clone blockers: candidates whose proof trace, shrink signature, or effective play experience repeated an existing shipped or experimental candidate.
- Grammar support blockers: `scopeOverlapCount`, `comparativeCount`, and `conditionalCount` can be parsed and sometimes retained, but the current proof/authoring pipeline did not turn them into a clean, late, human-readable high-difficulty unlock.
- Copy/scope blockers: rejected candidates were kept experimental when their rule scope would depend on hidden region semantics, highlight-only meaning, or internal terminology.

The most actionable blocker is the proof/authoring bridge for derived facts and late closure. More broad authoring attempts are likely to repeat the same failure patterns until that bridge is hardened with focused fixtures.

## Workbench Diagnostics Evidence

Evidence folder: `docs/phase-26/`.

Key files:

- `docs/phase-26/puzzle-ladder-target-brief.md`
- `docs/phase-26/current-selector-audit.md`
- `docs/phase-26/authoring-workflow.md`
- `docs/phase-26/candidate-review-log.md`
- `docs/phase-26/promotion-gate-audit.md`
- `docs/phase-26/ladder-copy-review.md`
- `docs/phase-26/runtime-selector-qa.md`
- `docs/phase-26/experimental-isolation-qa.md`
- `docs/phase-26/blocker-follow-up-recommendations.md`
- `docs/phase-26/final-preflight-checklist.md`
- `docs/phase-26/final-report-evidence-matrix.md`

Workbench and CLI diagnostics were used as rejection evidence, not as a license to promote borderline content. The current conclusion is that the workbench is useful: it exposed weak candidates early and prevented selector padding.

## Ladder Ordering And Copy Review

The player selector remains unchanged:

1. `case-004`
2. `case-011`
3. `case-013`
4. `case-015`
5. `case-012`
6. `case-014`
7. `case-017`
8. `case-018`
9. `case-020`
10. `case-021`

`case-004` remains the default. `case-021` remains a difficulty-3 baseline entry after prior user review. No Phase 26 experimental IDs, rejected candidates, internal phase labels, or target-4/super-hard tier labels are present in the player selector.

Known caveat: this is an honest selector, not the desired improved 6-10 case ladder. Phase 26 did not produce enough strong replacements to justify selector changes.

## Validation Evidence

Round-level validation passed after each committed Phase 26 round. Final validation evidence:

- `rg "p26-c|phase-26" apps\web\src\workbench apps\web\src\content apps\web\src\view apps\web\src\runtime apps\web\src\logic content\cases -n`: PASS, no matches.
- `rg "case-001|case-002|case-003|case-005|case-006|case-007|case-008|case-009|case-010|case-019" apps\web\src -n`: PASS, matches only the selector-isolation assertions in `apps\web\src\content\caseVerification.test.ts`.
- `git diff --check`: PASS.
- `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd`: PASS; lint, typecheck, test, and build passed.

Focused package evidence from the final rounds:

- `cmd /c pnpm.cmd --filter @room-axioms/web test -- src/content/caseVerification.test.ts src/content/runtimeSmoke.test.ts`: PASS, 14 files / 113 tests.
- `cmd /c pnpm.cmd --filter @room-axioms/authoring test`: PASS, 8 files / 86 tests.

## Smoke / Pages Evidence

Local smoke evidence:

- Round 23 selector/runtime QA: `StartDevServer.cmd`, `Smoke.cmd`, and `StopDevServer.cmd` passed.
- Final local smoke: `StartDevServer.cmd` PASS, `Smoke.cmd` PASS, `StopDevServer.cmd` PASS.

Pages evidence:

- Deploy Pages run `28293650451` completed with conclusion `success` for commit `a2a7f1095cb843c693881de1ed65a05aafd79985`.
- `https://onovich.github.io/RoomAxioms/`: HTTP 200, served `assets/index-B1CzZQsr.js`; JS contains `case-004` and `case-021`.
- `http://blog.onovich.com/RoomAxioms/`: HTTP 200, served `assets/index-B1CzZQsr.js`; JS contains `case-004` and `case-021`.

The executor completion-routing message should report the terminal commit and any successor Pages run triggered by the terminal report update.

## Boundary Scans

Round 23 and Round 24 scans found no Phase 26 experimental candidates in the player-facing selector/runtime path. The focused selector tests also assert that rejected IDs and internal Phase 26 IDs stay out of `contentCases`.

Final boundary scan evidence:

- Phase 26 experimental/internal ID scan across `apps\web\src\workbench`, `apps\web\src\content`, `apps\web\src\view`, `apps\web\src\runtime`, `apps\web\src\logic`, and `content\cases`: PASS, no matches.
- Historical rejected-case ID scan across `apps\web\src`: PASS, matches only test assertions that keep rejected cases out of `contentCases`.

## Blockers Or Caveats

Blocker: strict Phase 26 gates prevented four honest promotions.

This blocker is accepted by the guide when backed by a serious rejection corpus and concrete follow-up recommendations. The corpus now has 15 serious attempts, and the follow-up recommendation is to harden proof/authoring fixtures before another broad content batch:

- Add focused fixtures for derived-fact reuse in `scopeOverlapCount` cases.
- Add comparative late-closure fixtures that do not collapse to singleton or opening-unique pressure.
- Add conditional activation fixtures where the condition becomes true through human-visible deductions.
- Target weak shipped-case replacements only after those proof fixtures pass.
- Keep difficulty labels human-reviewed instead of relying on uncalibrated score bands.

## PASS Criteria Matrix

| Criterion | Status | Evidence |
| --- | --- | --- |
| Final report exists | PASS | This file. |
| At least 12 serious candidates attempted | PASS | 15 candidates recorded in `docs/phase-26/candidate-review-log.md`. |
| Four promotions or accepted blocker | READY_FOR_CHECK_WITH_BLOCKER | No promotions; strong rejection corpus and blocker recommendations recorded. |
| Promoted cases pass full gates | N/A | No promoted cases. |
| Phase 24 grammar materially used, or blocker documented | PASS via blocker route | C01, C02, C03, C07, C08, C09, C12, C14, and C15 attempted grammar material but failed strict gates. |
| Player selector honest and excludes rejected/experimental content | PASS | Selector unchanged; tests and scans cover rejected/internal IDs. |
| No public UGC/editor/backend/analytics/theme/VN scope added | PASS | Phase 26 changes are content/evidence/test/docs only. |
| Full validation passes | PASS | `Validate.cmd` passed. |
| Local smoke passes | PASS | Final `StartDevServer.cmd`, `Smoke.cmd`, and `StopDevServer.cmd` passed. |
| Pages deployment evidence recorded | PASS | Deploy Pages run `28293650451` succeeded; both online URLs returned HTTP 200 with the expected JS asset. |
