# Phase 13 Phase 12 Baseline Evidence

Status: Round 1 evidence

## Candidate

Reviewed existing Phase 12 fixture:

```text
content/experimental/phase-12/phase-12-local-scope-difference-001.json
```

## Authoring Report

Command:

```powershell
cmd /c pnpm.cmd authoring -- report content/experimental/phase-12/phase-12-local-scope-difference-001.json
```

Result:

- `ok: true`;
- schema issue count: `0`;
- target rules satisfy: `true`;
- initial satisfiable: `true`;
- initial guest layouts: `2`;
- truncation: `false`;
- proof no-guess: `true`;
- proof human explainable: `true`;
- final guest cells: `C2`, `B3`;
- proof wave count: `1`;
- deduction count: `3`;
- technique ids: `LOCAL_SCOPE_DIFFERENCE`, `LOCAL_SCOPE_INTERSECTION`.

## Authoring Score

Command:

```powershell
cmd /c pnpm.cmd authoring -- score content/experimental/phase-12/phase-12-local-scope-difference-001.json
```

Result:

- `ok: true`;
- score: `9.73`;
- provisional band: `2`;
- calibrated with real playtest: `false`;
- candidate guest layouts: `2`;
- solver truncated: `false`.

## Authoring Minimize

Command:

```powershell
cmd /c pnpm.cmd authoring -- minimize content/experimental/phase-12/phase-12-local-scope-difference-001.json
```

Result:

- `ok: true`;
- before cells: `A1`, `B1`, `C1`, `B2`;
- proposed after cells: `A1`, `B2`;
- source file was not modified;
- proof before technique ids: `LOCAL_SCOPE_DIFFERENCE`, `LOCAL_SCOPE_INTERSECTION`;
- proof after technique ids: `LOCAL_SCOPE_INTERSECTION`.

## Phase 13 Baseline Decision

Do not promote this Phase 12 fixture in Phase 13.

Reason:

- it remains mechanically valid as an experimental proof fixture;
- score remains provisional band `2`, below the Phase 11 mid-band pacing target;
- minimization preserves no-guess and uniqueness but drops `LOCAL_SCOPE_DIFFERENCE`;
- retaining difference would require keeping redundant reveals, which fails the Phase 13 natural-difference requirement.

