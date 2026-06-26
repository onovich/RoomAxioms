# Phase 25 Bad-Case Diagnostics Corpus

Status: Round 3 diagnostics-contract evidence.
Guide: `docs/phase-25-authoring-editor-live-diagnostics-goal-mode-execution-guide.md`

This corpus is private authoring-workbench evidence. It is not shipped content, not
player selector data, and not a promotion queue. The current executable coverage
lives in `packages/authoring/src/diagnostics.test.ts` so the workbench can later
render the same source-of-truth diagnostics from `@room-axioms/authoring`.

## Covered Failure Modes

| Failure mode | Evidence fixture | Expected diagnostic signal |
| --- | --- | --- |
| Valid draft baseline | `content/experimental/phase-10/phase-10-local-scope-intersection-001.json` | `valid-ready-for-private-review`; quality report includes effective board, degeneracy, rule contribution, rule-family diversity, and uncalibrated difficulty warning. |
| Invalid JSON-like draft | in-memory `{ id: "broken-draft" }` | `invalid-draft`; schema issue count is surfaced without filesystem access. |
| Highlight-dependent scope copy | in-memory mutation of `content/experimental/phase-24/phase-24-overlap-cross-001.json` | `COPY_INTERNAL_TERM` and `COPY_SCOPE_NEEDS_EXPLICIT_TEXT`; status becomes `valid-review-needed`. |
| Padding clone | in-memory 3x3 one-rule draft compared against a 4x3 right-padded variant | clone risk `fail` with hard failures; status becomes `valid-review-needed`. |
| Singleton / direct safe-cell giveaway | in-memory `phase-25-singleton-region-giveaway` | degeneracy `fail` with `singleton-effective-scope` and `direct-count-giveaway`; copy warning `COPY_DIRECT_SAFE_GIVEAWAY`. |
| One-rule solution | in-memory `phase-25-one-rule-solution` | rule-family diversity records `single-material-family`; difficulty remains explicitly uncalibrated and target-4 threshold does not pass. |
| R3/R4-style duplicate contribution | in-memory duplicate of the Phase 10 fixture's first rule | rule contribution warning marks the duplicate rule `redundant`; status becomes `valid-review-needed`. |
| Candidate-count truncation | Phase 10 fixture with `candidateLayoutCap: 1` | performance warning `initial-layout-count-capped`; recommendation becomes `raise-caps-or-simplify`. |

## Notes

- The corpus intentionally uses in-memory drafts where a tiny fixture is clearer
  than a checked-in experimental JSON file.
- The diagnostics are conservative. A warning is not a final rejection; it is a
  maintainer review prompt.
- Subjective fun and novelty remain reviewer judgments. Phase 25 must make that
  uncertainty visible instead of presenting heuristic scores as playtest truth.
