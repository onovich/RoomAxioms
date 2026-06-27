# Phase 25 Real-Case Workbench QA

Status: Round 22 evidence.
Guide: `docs/phase-25-authoring-editor-live-diagnostics-goal-mode-execution-guide.md`

This document records private authoring-workbench diagnostics against selected
real shipped cases and representative rejected/experimental cases. It is
authoring evidence only; it does not promote or demote player-facing content.

Executable coverage lives in `apps/web/src/workbench/realCaseQa.test.ts`.

## Shipped Case QA

| Case | Player difficulty | Correctness / proof | Workbench status | Key QA signal |
| --- | ---: | --- | --- | --- |
| `case-004` | 2 | PASS: schema, target rules, initial satisfiable, no-guess proof, final uniqueness | `valid-review-needed` | Quality is a warning because the rule-family gate sees only two material families; copy warnings still flag internal/abstract wording for maintainer review. |
| `case-011` | 3 | PASS: schema, target rules, initial satisfiable, no-guess proof, final uniqueness | `valid-review-needed` | Quality fails the authoring gate because the puzzle is intentionally a single material family (`LOCAL_SCOPE_INTERSECTION`). This is acceptable as shipped baseline content, but the workbench should not call it high-difficulty production material. |
| `case-012` | 3 | PASS: schema, target rules, initial satisfiable, no-guess proof, final uniqueness | `valid-review-needed` | Quality gates pass, but copy warnings still require maintainer review. Difficulty remains uncalibrated baseline. |
| `case-021` | 3 | PASS: schema, target rules, initial satisfiable, no-guess proof, final uniqueness | `valid-review-needed` | Machine difficulty heuristic still reaches `target-4`, but player-facing metadata remains difficulty 3 per user review. Workbench copy warnings flag direct safe-cell giveaway wording for explicit maintainer review. |

Important interpretation: `valid-review-needed` is not a correctness failure. It
means the case is mechanically valid but should not be presented as newly
accepted high-quality content without human review of copy, perceived
redundancy, or difficulty.

## Rejected / Experimental QA

| Fixture | Source | Expected workbench signal |
| --- | --- | --- |
| `phase-23-probe-022` | `content/experimental/phase-23/rejected/phase-23-probe-022-double-row-anchor-chain.json` | Private workbench import only; `valid-not-unique`, `repair-proof`, human-proof group `fail`, `noGuess=false`, final uniqueness `false`. |
| `phase-25-singleton-region-giveaway` | `content/experimental/phase-25/phase-25-singleton-region-giveaway.json` | `valid-degenerate`; quality group `fail`; singleton/direct-giveaway/copy-scope warnings remain visible. |
| `phase-25-one-rule-solution` | `content/experimental/phase-25/phase-25-one-rule-solution.json` | `valid-review-needed`; quality group `fail`; zero proof waves, zero deductions, one material family, target-4 threshold false. |
| `phase-25-one-rule-solution-padded` | `content/experimental/phase-25/phase-25-one-rule-solution-padded.json` | `valid-review-needed` plus clone-risk `fail` when compared against the unpadded one-rule fixture. |

## Performance Note

A one-off all-library clone-risk comparison probe was too expensive for the
regular web test loop. Round 22 therefore keeps routine QA bounded:

- shipped baseline cases run correctness, proof, quality, copy, difficulty, and
  performance diagnostics without clone comparisons;
- clone-risk regression uses the explicit one-rule / padded-one-rule fixture
  pair;
- broader cross-library clone sweeps remain a private authoring/CLI workflow
  rather than an always-on browser test.

## Boundary Notes

- `phase-23-probe-022` and all Phase 25 bad-case fixtures are imported only
  through `apps/web/src/workbench/caseLibrary.ts`.
- `apps/web/src/content/cases.ts` and the normal player selector remain
  unchanged.
- The workbench renders diagnostics from `@room-axioms/authoring`; the web test
  asserts the displayed summary states without duplicating solver/proof logic in
  the UI layer.
