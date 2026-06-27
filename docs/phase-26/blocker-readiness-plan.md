# Phase 26 Blocker Readiness Plan

Status: Round 22 evidence.
Guide: `docs/phase-26-workbench-guided-puzzle-ladder-production-goal-mode-execution-guide.md`

## Purpose

Round 22 converts the Round 21 ladder/copy review into a blocker-ready QA plan.
The current evidence supports keeping the public selector stable while Phase 26
continues toward final validation. No Phase 26 candidate is promoted, reordered
into the selector, or used as a replacement in this round.

This is not a declaration that the phase is finished. It records the current
decision threshold: unless a later QA or buffer round finds a narrow, genuinely
promotable repair, the honest completion state should be
`READY_FOR_CHECK_WITH_BLOCKER`, not padded content.

## Current Decision

The player-facing selector remains the 10-case ladder loaded by
`apps/web/src/content/cases.ts`:

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

`DEFAULT_CASE_ID` remains `case-004`.

The order is intentionally unchanged. Existing web tests encode this stable
order, and Phase 26 has not produced a superior accepted case or a stronger
evidence-based ordering. Reordering without accepted content would be cosmetic
and would risk implying a difficulty calibration the phase does not have.

## Promotion Readiness

Phase 26 currently has 15 serious candidate attempts:

- C01-C12: first and second authoring batches.
- C13-C15: focused repairs of the strongest promotion-pass near misses.

Promotion count: 0.

The rejection corpus is strong enough to explain the blocker path:

- scope-overlap candidates split between direct opening-observation giveaways
  and non-degenerate scopes that never become proof techniques;
- comparative candidates can fire Phase 24 techniques, but either stop at proof
  gaps, become proof-trace clones, or collapse into singleton/opening-unique
  repairs;
- conditional candidates still cannot use delayed safe/object deductions as
  proof-visible condition activators;
- two-wave/frontier candidates can produce a real first unlock, but late closure
  remains solver-only or degenerates into direct safe-cell rules;
- object-gated repairs can make object rules material, but the tested closing
  pressure over-constrains the opening.

Under the guide, this supports the accepted blocker condition if fewer than four
cases pass strict gates by final reporting.

## PASS Criteria Matrix At Round 22

| Criterion | Round 22 status | Evidence / next step |
| --- | --- | --- |
| Final report exists | Pending | Write `docs/phase-26-workbench-guided-puzzle-ladder-production-final-report.md` in the final rounds. |
| At least 12 serious candidates attempted | Met | 15 recorded in `docs/phase-26/candidate-review-log.md`. |
| At least 4 cases promoted, or blocker evidence provided | Blocker route likely | 0 promoted; rejection evidence recorded in candidate log, promotion audit, and this plan. |
| Promoted cases pass full gates | Not applicable yet | No Phase 26 promoted cases. |
| Phase 24 grammar materially used, or blocker documented | Blocker evidence met | `scopeOverlapCount`, `comparativeCount`, and `conditionalCount` failures are documented across C01-C15. |
| Player selector is honest and excludes rejected/experimental content | Met so far | Selector unchanged; boundary scan required again in QA/final rounds. |
| No public editor/UGC/backend/theme/VN scope added | Met so far | Round 22 is docs-only. |
| Full validation passes | Required per round/final | Run validation for this round and again in final rounds. |
| Local smoke/Pages evidence | Pending final | Needed after final push; local smoke in QA/final rounds. |

## QA Plan For Remaining Rounds

Rounds 23-24 should verify the player runtime rather than author more content by
default:

- focused case verification and runtime smoke;
- selector-order and default-case assertions;
- secrecy checks for wrong submissions and developer-only analysis surfaces;
- scan that `p26-c*` and `phase-26` candidates are absent from player-facing web
  content;
- confirmation that historical rejected cases remain unselected.

Round 23 runtime and selector QA is recorded in
`docs/phase-26/runtime-selector-qa.md`. It found no player-facing runtime or
selector defect and left the selector unchanged.

Round 24 experimental/rejected isolation QA is recorded in
`docs/phase-26/experimental-isolation-qa.md`. It hardens the selector tests for
`p26-*` and `case-019` exclusions and confirms Phase 26 candidates remain
outside player-facing web paths.

Rounds 25-27 should be treated as repair/buffer rounds:

- fix only concrete QA failures;
- promote a candidate only if it passes all strict gates and has a human-readable
  novelty claim;
- otherwise prepare final blocker evidence and do not force weak content.

Rounds 28-32 should produce the final report, run the full validation matrix,
record local smoke and Pages evidence, and send `READY_FOR_CHECK_WITH_BLOCKER`
if promotion count remains below four.

## Round 22 Architecture Decision

No source code, shipped case JSON, selector order, default case, or novelty
manifest is changed in Round 22.

This preserves the project boundary: diagnostics and candidate evidence stay in
authoring/docs, while the player selector only exposes cases that have already
passed release gates. Rejected Phase 26 experiments remain private under
`content/experimental/phase-26`.
