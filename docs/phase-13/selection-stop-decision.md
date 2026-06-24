# Phase 13 Selection Or Stop Decision

Status: Round 5 decision

## Decision

Stop without shipped promotion in Phase 13.

## Reviewed Candidates

- `content/experimental/phase-12/phase-12-local-scope-difference-001.json`
- `content/experimental/phase-13/phase-13-local-scope-difference-001.json`
- `content/experimental/phase-13/phase-13-local-scope-difference-002.json`
- `content/experimental/phase-13/phase-13-difference-sample-template.json` seed `1301`

## Reasoning

Phase 13 required a natural mid-band difference candidate. No reviewed candidate satisfies that gate:

- Phase 12 fixture remains valid but minimization drops `LOCAL_SCOPE_DIFFERENCE`.
- Phase 13 candidate 001 is mechanically valid and uses `LOCAL_SCOPE_DIFFERENCE` before minimization, but the minimized no-guess reveal set removes `B2` and drops `LOCAL_SCOPE_DIFFERENCE`.
- Phase 13 candidate 002 reaches a higher provisional score, but proof/no-guess fails with explanation gaps.
- The report-only sampler produced no accepted candidates for the smoke seed.

## Promotion Result

No file is copied into `content/cases`.

No app selector or runtime content wiring is changed.

`case-004` remains `DEFAULT_CASE_ID`.

Existing shipped cases remain `case-001` through `case-011`.

## Quality Gate Result

Quality gate beats case count. Promoting candidate 001 would create a shipped case whose difference move exists only because a redundant reveal is kept. Promoting candidate 002 would ship a proof/no-guess failure. Both are worse than stopping honestly.

## Follow-Up

A future phase can continue authoring natural difference content, preferably by designing hidden-subject activations where the minimized reveal set still needs both the inner and outer known scopes.

