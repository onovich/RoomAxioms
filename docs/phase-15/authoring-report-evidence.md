# Phase 15 Authoring Report Evidence

Status: Round 3 evidence

## Commands

```powershell
cmd /c pnpm.cmd authoring -- report content/experimental/phase-15/phase-15-retained-difference-001.json
cmd /c pnpm.cmd authoring -- report content/experimental/phase-15/phase-15-retained-difference-002.json
```

## Results

### `phase-15-retained-difference-001`

- command: PASS;
- `ok: false`;
- recommendation: `repair-proof`;
- schema: pass, zero issues;
- target rules: pass;
- initial satisfiable: pass;
- initial guest-layout count: `2`;
- proof issue codes: `EXPLANATION_GAP`, `EXPLANATION_GAP`;
- proof technique ids: `LOCAL_SCOPE_DIFFERENCE`;
- solver truncation: `false`.

### `phase-15-retained-difference-002`

- command: PASS;
- `ok: false`;
- recommendation: `repair-proof`;
- schema: pass, zero issues;
- target rules: pass;
- initial satisfiable: pass;
- initial guest-layout count: `3`;
- proof issue codes: `EXPLANATION_GAP`;
- proof technique ids: `LOCAL_COUNT_SATURATED`, `LOCAL_SCOPE_DIFFERENCE`;
- solver truncation: `false`.

## Interpretation

Both candidates satisfy the baseline experimental checks: schema, target rules, initial satisfiability, bounded initial guest layouts, and no truncation. Neither qualifies for promotion from report evidence because both still fail proof/no-guess and final guest-layout uniqueness.
