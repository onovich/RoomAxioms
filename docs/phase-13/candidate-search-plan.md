# Phase 13 Candidate Search Plan

Status: Round 2 plan

## Search Objective

Find a natural mid-band `LOCAL_SCOPE_DIFFERENCE` candidate. A candidate is natural only if the accepted or minimized reveal set still uses `LOCAL_SCOPE_DIFFERENCE`; a redundant-reveal technique demo is not enough for shipped promotion.

## Hand-Authoring Template

Start from the accepted Phase 12 geometry, then vary only content-level choices:

- board: prefer 3x3 or 4x3;
- outer rule: known subject with a larger local guest scope, usually `orthogonal` or `adjacent`;
- inner rule: known subject whose unknown guest scope is contained in the outer unknown scope;
- difference cells: one or two cells, all forced guest by the extra guest requirement;
- supporting rule: optional intersection/saturation rule that creates public safe deductions without replacing the difference move;
- reveal target: minimal or near-minimal reveals that still make both subjects publicly known and preserve `LOCAL_SCOPE_DIFFERENCE`.

Candidate sketch:

```text
outerRemainingRequired - innerRemainingCapacity == differenceUnknown.length
innerUnknown subset outerUnknown
differenceUnknown is non-empty
```

The preferred Phase 13 candidate should need at least one more public deduction than the Phase 12 fixture and score near provisional band `3`.

## Generator Sampling Template

The report-only template lives at:

```text
content/experimental/phase-13/phase-13-difference-sample-template.json
```

It uses the current generator contract:

- deterministic `mulberry32` seed through the authoring CLI;
- `artifactPolicy: report-only`;
- no files written from `sample`;
- no automatic promotion to shipped content.

Because the current generator samples target layouts and reveal pools without explicit proof-technique targeting, generator output is only a broad discovery aid. Any accepted sample still needs hand review, authoring report/score/minimize evidence, and technique-retention checking.

## Seed And Cap Policy

Initial sampling pass:

- seeds: `1301` through `1312`;
- template: `content/experimental/phase-13/phase-13-difference-sample-template.json`;
- cap per seed: `maxAttempts 48`, `maxAccepted 3`;
- solver caps: `maxNodes 20000`, `maxModels 20000`, `maxGuestLayouts 100`;
- stop early if three reviewed candidates fail retention for the same reason.

Escalation policy:

- do not raise solver caps to make a candidate pass;
- do not keep redundant reveals solely to retain `LOCAL_SCOPE_DIFFERENCE`;
- do not write generated candidates directly into `content/cases`;
- copy a generated candidate into `content/experimental/phase-13/` only after it has a useful proof shape worth reviewing.

## Rejection Categories

- `schema-invalid`: JSON or Puzzle Schema v1 parse failed.
- `target-rules-fail`: target does not satisfy rules.
- `initial-unsat`: initial observations are unsatisfiable.
- `truncated`: any solver/proof/generator cap was hit.
- `no-guess-fail`: proof requires a guess or leaves an explanation gap.
- `not-difference`: no `LOCAL_SCOPE_DIFFERENCE` in accepted proof.
- `drops-difference-on-minimize`: minimization remains valid but removes difference.
- `low-band`: score is below the mid-band pacing target without a product reason.
- `copy-not-ready`: copy is not player-readable Chinese.
- `scope-creep`: candidate requires new DSL, schema, solver, proof technique, or UI exposure.

