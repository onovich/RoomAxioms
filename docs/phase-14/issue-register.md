# Phase 14 Issue Register

Status: Round 1 baseline

## Open Authoring Issues

### P14-001 - Difference proof lost after minimization

Source evidence:

- `content/experimental/phase-13/phase-13-local-scope-difference-001.json`
- `docs/phase-13/proof-minimization-filter.md`

Problem:

- The initial no-guess proof uses `LOCAL_SCOPE_DIFFERENCE`.
- Reveal minimization removes `B2`.
- The minimized proof remains valid but only uses `LOCAL_COUNT_SATURATED`.

Impact:

- Promoting this shape would keep a difference move only by retaining a redundant reveal.
- Phase 14 needs explicit tooling that reports required technique retention rather than relying on manual comparison of before/after proof metrics.

### P14-002 - Difference appears before proof completion

Source evidence:

- `content/experimental/phase-13/phase-13-local-scope-difference-002.json`
- `docs/phase-13/rejection-log.md`

Problem:

- The proof emits `LOCAL_SCOPE_DIFFERENCE`.
- The proof still has three `EXPLANATION_GAP` issues.
- Final guest-layout uniqueness is not reached.

Impact:

- Difference presence alone is not enough.
- Phase 14 retention evidence must be paired with no-guess and final uniqueness gates.

### P14-003 - Broad random sampling wastes attempts on invalid targets

Source evidence:

- `content/experimental/phase-13/phase-13-difference-sample-template.json`
- `docs/phase-13/search-template-smoke.md`

Problem:

- Seed `1301` accepted zero candidates after 48 attempts.
- Rejections were dominated by `TARGET_VIOLATES_RULES`.

Impact:

- Phase 14 sampling templates should bias toward known nested-scope difference geometry instead of fully broad target sampling.
- Generated output remains report-only and must not be promoted automatically.

## Closed Or Guarded Issues

- No Phase 13 candidate was shipped.
- `case-004` remains the default case.
- `case-011` remains the latest promoted shipped case.
- No new DSL, schema, solver, or proof technique is required for Phase 14 baseline work.

