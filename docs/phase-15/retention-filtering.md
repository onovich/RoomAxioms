# Phase 15 Retention And Proof Filtering

Status: Round 4 evidence

## Commands

```powershell
cmd /c pnpm.cmd authoring -- score content/experimental/phase-15/phase-15-retained-difference-001.json
cmd /c pnpm.cmd authoring -- minimize content/experimental/phase-15/phase-15-retained-difference-001.json --require-technique LOCAL_SCOPE_DIFFERENCE
cmd /c pnpm.cmd authoring -- score content/experimental/phase-15/phase-15-retained-difference-002.json
cmd /c pnpm.cmd authoring -- minimize content/experimental/phase-15/phase-15-retained-difference-002.json --require-technique LOCAL_SCOPE_DIFFERENCE
```

## Candidate 001

Score evidence:

- command: PASS;
- `ok: true`;
- score: `7.77`;
- provisional band: `2`;
- `calibratedWithRealPlaytest: false`;
- candidate guest layouts: `2`;
- proof wave count: `1`;
- deduction count: `1`;
- technique ids: `LOCAL_SCOPE_DIFFERENCE`;
- solver truncation: `false`.

Minimization evidence:

- command: PASS;
- `ok: false`;
- before cells: `A1`, `B1`, `C1`, `B2`;
- after cells: `A1`, `B1`, `C1`, `B2`;
- diagnostic: `TECHNIQUE_RETENTION_PASS`;
- required techniques retained: `true`;
- proof remains blocked by explanation gaps for `A3` and `C3`;
- final guest layout is not unique.

Filter classification:

- retained-difference proof-completion failure.

Repair implication:

- keep as a compact retained-difference regression fixture;
- do not promote unless existing templates can explain the forced safe cells and final uniqueness.

## Candidate 002

Score evidence:

- command: PASS;
- `ok: true`;
- score: `12.69`;
- provisional band: `3`;
- `calibratedWithRealPlaytest: false`;
- candidate guest layouts: `3`;
- proof wave count: `1`;
- deduction count: `6`;
- technique ids: `LOCAL_COUNT_SATURATED`, `LOCAL_SCOPE_DIFFERENCE`;
- solver truncation: `false`.

Minimization evidence:

- command: PASS;
- `ok: true`;
- before cells: `A1`, `B1`, `C1`, `B2`;
- after cells: `A1`, `B1`, `C1`;
- removed cell: `B2`;
- diagnostic: `TECHNIQUE_RETENTION_FAILED`;
- missing required technique: `LOCAL_SCOPE_DIFFERENCE`;
- proof after minimization is no-guess and final-unique, but uses only `LOCAL_COUNT_SATURATED`.

Filter classification:

- stronger ordinary proof after minimization, but rejected for retained-difference promotion because the minimized proof drops the required technique.

Repair implication:

- candidate 002 is the Round 5 repair target only if the repair can make `B2` or an equivalent outer-subject reveal necessary without recreating proof gaps;
- if the repair merely keeps decorative reveals or makes the initial layout unique, reject it.

## Round 4 Outcome

No candidate passes all Phase 15 gates.

- Candidate 001 passes technique retention but fails proof/no-guess/final uniqueness.
- Candidate 002 approaches a valid no-guess proof but fails the Phase 15 retention gate after minimization.

Round 5 should attempt one focused repair of candidate 002. Quality gate remains stricter than promotion pressure.
