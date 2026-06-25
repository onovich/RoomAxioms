# Phase 19 Runtime Secrecy And Smoke Evidence

Status: Round 12 evidence recorded

## Focused Runtime Verification

- `pnpm --filter @room-axioms/web test -- caseVerification runtimeSmoke`: PASS.
- Result observed: `11` web test files passed, `61` tests passed.
- Coverage includes:
  - all selector cases load and analyze in player and developer modes;
  - player mode does not receive proof/no-guess developer output;
  - wrong and incomplete submissions do not serialize target guest cells;
  - shipped case and rule presentation copy stays Chinese/plain;
  - every selector case keeps opening ambiguity greater than 1, nonzero proof waves, and nonzero deductions.

## Boundary Scans

Commands run:

```text
rg "@room-axioms/(generator|authoring)|content/experimental|phase-19" apps/web/src -g "!*.test.ts" -n
rg "@room-axioms/(schema|solver|oracle|proof|generator|authoring)|zod|react|vite|node:|fs" packages/domain/src -g "!*.test.ts" -n
rg "react|vite|apps/web|document|window" packages/solver/src packages/proof/src packages/generator/src packages/authoring/src -g "!*.test.ts" -n
```

Results:

- web player/runtime source imports no authoring/generator package, no experimental content path, and no Phase 19 candidate ids;
- domain source remains schema/solver/oracle/proof/generator/authoring/Zod/UI/fs-free;
- solver/proof/generator/authoring production source remains independent of React/Vite/web app/browser globals.

## Local Smoke

- `StartDevServer.cmd`: PASS, started PID `30576` at `http://127.0.0.1:5173/RoomAxioms/`.
- `Smoke.cmd`: PASS, including dry-run launchers and HTTP GET checks against `http://127.0.0.1:5173/RoomAxioms/`.
- `StopDevServer.cmd`: PASS, stopped the process tree rooted at PID `30576`.

## Notes

- `case-004` remains the default case.
- Experimental candidates remain report-only unless copied into `content/cases` and imported from `apps/web/src/content/cases.ts`.
- Developer-only target overlay and forced-cell diagnostics remain behind existing developer controls; player mode is covered by runtime smoke and target-secrecy tests.
