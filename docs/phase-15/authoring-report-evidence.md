# Phase 15 Authoring Report Evidence

Status: Round 3 evidence

## Commands

```powershell
cmd /c pnpm.cmd authoring -- report content/experimental/phase-15/phase-15-retained-difference-001.json
cmd /c pnpm.cmd authoring -- report content/experimental/phase-15/phase-15-retained-difference-002.json
cmd /c pnpm.cmd authoring -- report content/experimental/phase-15/phase-15-retained-difference-003.json
cmd /c pnpm.cmd authoring -- report content/cases/case-012.json
cmd /c pnpm.cmd authoring -- score content/cases/case-012.json
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

### `phase-15-retained-difference-003`

- command: PASS;
- `ok: true`;
- recommendation: `ready-for-experimental-review`;
- schema: pass, zero issues;
- target rules: pass;
- initial satisfiable: pass;
- initial guest-layout count: `2`;
- proof noGuess: `true`;
- proof humanExplainable: `true`;
- final guest layout unique: `true`;
- final guest cells: `B3`, `C3`;
- proof issue codes: none;
- proof wave count: `1`;
- proof deduction count: `7`;
- proof technique ids: `LOCAL_COUNT_SATURATED`, `LOCAL_SCOPE_DIFFERENCE`;
- solver truncation: `false`.

### `case-012`

- command: PASS;
- `ok: true`;
- recommendation: `ready-for-experimental-review`;
- schema: pass, zero issues;
- target rules: pass;
- initial satisfiable: pass;
- initial guest-layout count: `2`;
- proof noGuess: `true`;
- proof humanExplainable: `true`;
- final guest layout unique: `true`;
- final guest cells: `B3`, `C3`;
- proof issue codes: none;
- proof technique ids: `LOCAL_COUNT_SATURATED`, `LOCAL_SCOPE_DIFFERENCE`;
- score: `12.15`;
- provisional band: `3`;
- `calibratedWithRealPlaytest: false`;
- solver truncation: `false`.

## Interpretation

Candidates 001 and 002 satisfy the baseline experimental checks but do not qualify for promotion: 001 keeps the retained difference while failing proof/final uniqueness, and 002 can be repaired into an ordinary no-guess proof only after dropping the retained difference.

Candidate 003 repairs the corridor blocker without making the initial state unique. The shipped copy `case-012` preserves the same proof shape and is eligible for promotion after retention minimization and web verification.
