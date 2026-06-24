# Phase 12 Authoring Score And Minimize Evidence

Status: Round 8 evidence

## Score Evidence

Command:

```powershell
pnpm authoring -- score content/experimental/phase-12/phase-12-local-scope-difference-001.json
```

Result:

- `ok: true`;
- recommendation: `ready-for-experimental-review`;
- score: `9.73`;
- provisional band: `2`;
- `calibratedWithRealPlaytest: false`;
- candidate guest layouts: `2`;
- proof wave count: `1`;
- deduction count: `3`;
- technique ids: `LOCAL_SCOPE_DIFFERENCE`, `LOCAL_SCOPE_INTERSECTION`;
- solver truncated: `false`.

## Minimize Evidence

Command:

```powershell
pnpm authoring -- minimize content/experimental/phase-12/phase-12-local-scope-difference-001.json
```

Result:

- `ok: true`;
- before cells: `A1`, `B1`, `C1`, `B2`;
- proposed after cells: `A1`, `B2`;
- source file was not modified.

Decision:

- Do not adopt the proposed `A1`, `B2` minimized reveal set for Phase 12.
- Reason: the minimized proof remains no-guess, but it removes `LOCAL_SCOPE_DIFFERENCE` from the technique ids and becomes an intersection-only proof. This phase is specifically validating difference coverage.

## Generator Regression

`packages/generator/src/phase12Experimental.test.ts` keeps the fixture private and mechanically validated:

- schema parse passes;
- target rules satisfy;
- initial state is satisfiable;
- initial guest layouts count is `2`;
- no-guess proof passes with final guests `C2`, `B3`;
- score remains uncalibrated;
- minimization is report-only and rejected for promotion because it drops difference coverage.

