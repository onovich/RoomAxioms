# Phase 11 Promotion Decisions

Status: Round 2 selection

## Selected For Promotion Attempt

### `phase-10-local-scope-intersection-001` -> planned `case-011`

Decision: promoted as `case-011` in Round 3.

Evidence:

- Authoring `report`: `ok: true`.
- Schema: pass, zero issues.
- Target rules: pass.
- Initial satisfiability: pass.
- Initial guest layouts: `2`, no cap pressure.
- Proof/no-guess: pass.
- Final guest cells: `A1`.
- Technique coverage: `LOCAL_SCOPE_INTERSECTION`.
- Authoring `score`: `10.36`, provisional band `3`.
- Real playtest calibration: none; difficulty remains uncalibrated.

Promotion rationale:

- It is the only available reviewed candidate with mid-band evidence.
- It exercises the accepted Phase 10 proof technique.
- It was promoted by copying the reviewed puzzle into `content/cases` with Chinese player-facing copy.
- It does not require new DSL semantics, new proof techniques, relaxed solver caps, or UI redesign.

## Rejected Or Deferred

### `phase-10-sample-001`

Decision: reject for Phase 11 shipped promotion.

Reason:

- It is report-only output and no file was written.
- It is a one-guest global-count sample.
- It has eight initial reveals, zero proof waves, zero deductions, and no mid-band proof-technique coverage.
- Promoting it would not address the Phase 9/10 mid-band pacing goal.

### Additional generated candidates

Decision: defer.

Reason:

- No additional generated candidate has been reviewed through authoring report, score, copy review, runtime loading, accessibility smoke, and planner/checker evidence.
- Phase 11 quality gate beats case count.

## Count Decision

Phase 11 has promoted one candidate.

Round 4 stop decision:

- Do not promote a second case in Phase 11.
- No second candidate has enough mid-band validation, copy review, runtime loading, and smoke evidence.
- See `docs/phase-11/additional-candidate-stop-decision.md`.
