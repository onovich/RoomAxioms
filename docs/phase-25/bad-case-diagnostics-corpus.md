# Phase 25 Bad-Case Diagnostics Corpus

Status: Round 21 workbench-import evidence.
Guide: `docs/phase-25-authoring-editor-live-diagnostics-goal-mode-execution-guide.md`

This corpus is private authoring-workbench evidence. It is not shipped content, not
player selector data, and not a promotion queue. Executable coverage lives in
`packages/authoring/src/diagnostics.test.ts` and
`apps/web/src/workbench/workbench.test.ts` so the web workbench renders the same
source-of-truth diagnostics from `@room-axioms/authoring`.

## Covered Failure Modes

| Failure mode | Evidence fixture | Expected diagnostic signal |
| --- | --- | --- |
| Valid draft baseline | `content/experimental/phase-10/phase-10-local-scope-intersection-001.json` | `valid-ready-for-private-review`; quality report includes effective board, degeneracy, rule contribution, rule-family diversity, and uncalibrated difficulty warning. |
| Invalid JSON-like draft | in-memory `{ id: "broken-draft" }` | `invalid-draft`; schema issue count is surfaced without filesystem access. |
| Highlight-dependent scope copy | in-memory mutation of `content/experimental/phase-24/phase-24-overlap-cross-001.json` | `COPY_INTERNAL_TERM` and `COPY_SCOPE_NEEDS_EXPLICIT_TEXT`; status becomes `valid-review-needed`. |
| Padding clone | in-memory 3x3 one-rule draft compared against a 4x3 right-padded variant | clone risk `fail` with hard failures; status becomes `valid-review-needed`. |
| Singleton / direct safe-cell giveaway | `content/experimental/phase-25/phase-25-singleton-region-giveaway.json` | workbench-importable fixture; degeneracy `fail` with `singleton-effective-scope` and `direct-count-giveaway`; copy warnings include `COPY_INTERNAL_TERM`, `COPY_SCOPE_NEEDS_EXPLICIT_TEXT`, and `COPY_DIRECT_SAFE_GIVEAWAY`. |
| One-rule solution | `content/experimental/phase-25/phase-25-one-rule-solution.json` | workbench-importable fixture; rule-family diversity records `single-material-family`; difficulty remains explicitly uncalibrated and target-4 threshold does not pass. |
| Padded one-rule clone | `content/experimental/phase-25/phase-25-one-rule-solution-padded.json` compared against `phase-25-one-rule-solution` | workbench-importable fixture; anti-clone comparison reports clone-risk `fail` with hard failures. |
| R3/R4-style duplicate contribution | in-memory duplicate of the Phase 10 fixture's first rule | rule contribution warning marks the duplicate rule `redundant`; status becomes `valid-review-needed`. |
| Candidate-count truncation | Phase 10 fixture with `candidateLayoutCap: 1` | performance warning `initial-layout-count-capped`; recommendation becomes `raise-caps-or-simplify`. |

## Workbench Import Status

- The three checked-in Phase 25 fixtures are loaded through
  `apps/web/src/workbench/caseLibrary.ts` as `experimental` entries.
- `apps/web/src/workbench/workbench.test.ts` confirms they remain absent from
  `apps/web/src/content/cases.ts` / the normal player selector.
- Workbench diagnostics now pass comparison puzzles from the private workbench
  library into `@room-axioms/authoring`, so clone-risk can be visible in the
  maintainer surface instead of always showing "not run".

## Notes

- The corpus still uses in-memory drafts where a tiny mutation is clearer than a
  checked-in experimental JSON file.
- The diagnostics are conservative. A warning is not a final rejection; it is a
  maintainer review prompt.
- Subjective fun and novelty remain reviewer judgments. Phase 25 must make that
  uncertainty visible instead of presenting heuristic scores as playtest truth.
