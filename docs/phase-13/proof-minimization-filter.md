# Phase 13 Proof And Minimization Filter

Status: Round 4 evidence

## Commands

```powershell
cmd /c pnpm.cmd authoring -- report content/experimental/phase-13/phase-13-local-scope-difference-001.json
cmd /c pnpm.cmd authoring -- score content/experimental/phase-13/phase-13-local-scope-difference-001.json
cmd /c pnpm.cmd authoring -- minimize content/experimental/phase-13/phase-13-local-scope-difference-001.json
cmd /c pnpm.cmd authoring -- score content/experimental/phase-13/phase-13-local-scope-difference-002.json
cmd /c pnpm.cmd authoring -- minimize content/experimental/phase-13/phase-13-local-scope-difference-002.json
```

## Candidate 001

Report result:

- `ok: true`;
- schema issue count: `0`;
- target rules satisfy: `true`;
- initial satisfiable: `true`;
- initial guest layouts: `2`;
- final guest cells: `B3`, `C3`;
- proof no-guess: `true`;
- wave count: `1`;
- deduction count: `3`;
- technique ids: `LOCAL_COUNT_SATURATED`, `LOCAL_SCOPE_DIFFERENCE`;
- truncation: `false`.

Score result:

- `ok: true`;
- score: `9.65`;
- provisional band: `2`;
- calibrated with real playtest: `false`;
- solver truncated: `false`.

Minimize result:

- `ok: true`;
- before cells: `A1`, `B1`, `C1`, `B2`;
- after cells: `A1`, `B1`, `C1`;
- removed cell: `B2`;
- proof before technique ids: `LOCAL_COUNT_SATURATED`, `LOCAL_SCOPE_DIFFERENCE`;
- proof after technique ids: `LOCAL_COUNT_SATURATED`;
- source file was not modified.

Filter decision:

- reject for shipped promotion;
- reason: the minimized no-guess reveal set drops `LOCAL_SCOPE_DIFFERENCE`, so the difference move depends on a redundant accepted reveal;
- secondary reason: score remains provisional band `2`, below the Phase 11 mid-band pacing target.

## Candidate 002

Score result:

- `ok: true`;
- score: `14.02`;
- provisional band: `4`;
- calibrated with real playtest: `false`;
- initial guest layouts: `5`;
- proof no-guess: `false`;
- issue codes: `EXPLANATION_GAP`, `EXPLANATION_GAP`, `EXPLANATION_GAP`;
- technique ids: `LOCAL_COUNT_SATURATED`, `LOCAL_SCOPE_DIFFERENCE`;
- truncation: `false`.

Minimize result:

- `ok: false`;
- before cells: `A1`, `B1`, `C1`, `B2`;
- after cells: `A1`, `B1`, `C1`, `B2`;
- all cells retained as `required-for-proof`;
- proof remains non-no-guess and does not reach final guest-layout uniqueness.

Filter decision:

- reject for shipped promotion;
- reason: proof/no-guess fails and minimization cannot produce a valid accepted reveal set;
- do not patch proof or add techniques to rescue this candidate.

## Round 4 Outcome

No Phase 13 candidate currently qualifies for shipped promotion. Candidate 001 remains useful as a compact technique-retention rejection fixture; candidate 002 remains useful as a high-band proof-gap rejection fixture.

