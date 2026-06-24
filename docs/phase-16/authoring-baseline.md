# Phase 16 Case-012 Authoring Baseline

Status: Round 1 evidence

## Commands

```powershell
cmd /c pnpm.cmd authoring -- report content/cases/case-012.json
cmd /c pnpm.cmd authoring -- score content/cases/case-012.json
cmd /c pnpm.cmd authoring -- minimize content/cases/case-012.json --require-technique LOCAL_SCOPE_DIFFERENCE
```

## Report Evidence

- command: PASS;
- `ok: true`;
- schema issue count: `0`;
- target rules satisfy: `true`;
- initial satisfiable: `true`;
- initial guest-layout count: `2`;
- proof noGuess: `true`;
- proof humanExplainable: `true`;
- final guest layout unique: `true`;
- final guest cells: `B3`, `C3`;
- issue codes: none;
- wave count: `1`;
- deduction count: `7`;
- technique ids: `LOCAL_COUNT_SATURATED`, `LOCAL_SCOPE_DIFFERENCE`;
- solver truncation: `false`.

## Score Evidence

- command: PASS;
- `ok: true`;
- score: `12.15`;
- provisional band: `3`;
- `calibratedWithRealPlaytest: false`;
- board cells: `12`;
- unknown cell count: `7`;
- reveal count: `5`;
- candidate guest layouts: `2`;
- proof wave count: `1`;
- deduction count: `7`;
- technique count: `2`;
- solver truncation: `false`.

## Minimization And Technique Retention

- command: PASS;
- `ok: true`;
- diagnostic: `TECHNIQUE_RETENTION_PASS`;
- before cells: `A1`, `B1`, `C1`, `B2`, `D2`;
- after cells: `A1`, `B1`, `C1`, `B2`, `D2`;
- removed cells: none;
- preserved techniques: `LOCAL_COUNT_SATURATED`, `LOCAL_SCOPE_DIFFERENCE`;
- missing required techniques: none;
- required techniques retained: `true`;
- proof after minimization remains no-guess, human-explainable, and guest-layout unique.

## Round 1 Decision

Case-012 remains release-candidate material for Phase 16 QA. No P0/P1 defect was found in the authoring baseline, and no shipped mechanics changed.
