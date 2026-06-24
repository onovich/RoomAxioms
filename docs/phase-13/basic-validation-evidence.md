# Phase 13 Basic Validation Evidence

Status: Round 3 evidence

## Commands

```powershell
cmd /c pnpm.cmd authoring -- report content/experimental/phase-13/phase-13-local-scope-difference-001.json
cmd /c pnpm.cmd authoring -- report content/experimental/phase-13/phase-13-local-scope-difference-002.json
```

## Results

### Candidate 001

- command result: PASS, `ok: true`;
- schema: PASS, issue count `0`;
- target rules: PASS;
- initial satisfiable: PASS;
- initial guest layouts: `2`;
- proof/no-guess: PASS;
- technique ids include `LOCAL_SCOPE_DIFFERENCE`;
- truncation: false.

### Candidate 002

- command result: completed, `ok: false`;
- schema: PASS, issue count `0`;
- target rules: PASS;
- initial satisfiable: PASS;
- initial guest layouts: `5`;
- proof/no-guess: FAIL, explanation gaps remain;
- technique ids include `LOCAL_SCOPE_DIFFERENCE`;
- truncation: false.

## Round 3 Decision

Proceed with candidate 001 as the primary Round 4 filtering candidate. Keep candidate 002 in the rejection log unless a narrow content-only fix appears; do not expand proof or DSL scope to rescue it.

