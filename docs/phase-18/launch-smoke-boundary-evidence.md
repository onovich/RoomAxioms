# Phase 18 Launch Smoke And Boundary Evidence

Status: Round 4 evidence recorded
Observed at: 2026-06-24 22:52-23:02 +08:00

## Validation

- Focused web runtime/content tests: PASS.
  - Command: `pnpm --filter @room-axioms/web test -- src/content/caseVerification.test.ts src/content/runtimeSmoke.test.ts src/runtime/analyzer.test.ts src/runtime/facade.test.ts`
  - Result: `11` test files passed, `73` tests passed.
- Full project validation: PASS.
  - Command: `Validate.cmd`
  - `pnpm lint`: PASS.
  - `pnpm typecheck`: PASS.
  - `pnpm test`: PASS.
  - `pnpm build`: PASS.
- Whitespace check: PASS.
  - Command: `git diff --check`.
  - Result: no whitespace errors; existing CRLF working-copy warnings only where applicable.

## Local Smoke

- Command: `StartDevServer.cmd`.
  - Result: dev server started on `http://127.0.0.1:5173/RoomAxioms/`.
- Command: `Smoke.cmd`.
  - Result: PASS; local HTTP GET to `http://127.0.0.1:5173/RoomAxioms/` succeeded.
- Command: `StopDevServer.cmd`.
  - Result: dev server process tree stopped.

## Online HTTP Smoke

- `http://blog.onovich.com/RoomAxioms/`: HTTP `200`.
- `https://onovich.github.io/RoomAxioms/`: HTTP `200`.

## GitHub Pages Run State

- `gh run list --branch main --limit 5` after Round 3 push:
  - `28107430223` for `292b526 docs: add public playtest instructions`: `in_progress` at observation time.
  - `28107289944` for `962bb11 content: clean shipped case metadata`: `completed/success`.
  - `28106941244` for `4a9c001 docs: add Phase 18 launch baseline`: `completed/success`.
- The Round 4 evidence accepts HTTP `200` as the user-facing smoke result and defers final latest-run confirmation to Round 6.

## Boundary Scans

- Player app and shipped content do not import private authoring/generator tooling:
  - Command: `rg -n "@room-axioms/(authoring|generator)|content/experimental" apps\web\src content\cases`
  - Result: no matches.
- Shipped case metadata no longer contains internal phase labels:
  - Command: `rg -n "internal-phase|Phase [0-9]|phase-[0-9]" content\cases`
  - Result: no matches.
- Domain package remains free of schema/solver/proof/oracle/generator/authoring/Zod/UI/fs dependencies:
  - Command: `rg -n "zod|react|node:fs|@room-axioms/(schema|solver|proof|oracle|generator|authoring)" packages\domain\src`
  - Result: no matches.
- Solver, proof, generator, and authoring source remain free of React/Vite/browser UI APIs:
  - Command: `rg -n "react|from .*vite|document\.|window\.|localStorage|HTMLElement|Worker" packages\solver\src packages\proof\src packages\generator\src packages\authoring\src --glob "!**/*.test.ts"`
  - Result: no matches.
- Deprecated or non-shipped rule terms remain absent:
  - Command: `rg -n "lineCount|manhattan|visibility|blocker" content\cases apps\web\src packages\domain packages\schema packages\solver packages\proof packages\generator packages\authoring`
  - Result: no matches.
- Target reads remain in existing target-access, verification, test, and performance-baseline paths:
  - Command: `rg -n "targetAccess|targetGuestCells|targetKindForDeveloperOverlay|puzzle\.target|targetLayout" apps\web\src`
  - Result: matches limited to `apps/web/src/logic/targetAccess.ts`, `apps/web/src/hooks/useRoomAxiomsGame.ts`, content verification/runtime smoke tests, analyzer/hints tests, and performance baseline.

## Secrecy Result

No player-facing import path exposes target layout, forced cells, candidate counts, generator output, authoring diagnostics, or proof internals as normal player information.
