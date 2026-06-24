# Phase 17 Release Smoke And Boundary Evidence

Status: Round 4 evidence
Date: 2026-06-24

## Full Validation

Command:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd
```

Result: PASS.

- lint: PASS.
- typecheck: PASS.
- test: PASS.
- build: PASS.

Package test counts from this run:

- domain: 3 files, 12 tests.
- schema: 4 files, 24 tests.
- oracle: 5 files, 18 tests.
- solver: 7 files, 39 tests.
- proof: 9 files, 46 tests.
- generator: 8 files, 15 tests.
- web: 11 files, 72 tests.
- authoring: 1 file, 13 tests.

`git diff --check`: PASS.

## Focused Web Evidence

Command:

```powershell
cmd /c pnpm.cmd --filter @room-axioms/web test -- src/content/caseVerification.test.ts src/content/runtimeSmoke.test.ts src/runtime/analyzer.test.ts src/runtime/facade.test.ts
```

Result: PASS, 11 files and 72 tests. The web test workspace runs the complete web test set while honoring the focused command surface.

Coverage represented by these tests:

- shipped case order and `case-004` default;
- no experimental case ids in the selector;
- all shipped cases pass public verification checks;
- runtime player/developer analysis;
- stale/cancel facade behavior;
- wrong/incomplete submission secrecy.

## Local Smoke

Commands:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

Results:

- dev server: PASS, health URL `http://127.0.0.1:5173/RoomAxioms/`.
- smoke wrapper: PASS.
- stop dev server: PASS.

## Browser Smoke

Tooling:

- Playwright package was available.
- Bundled Playwright browsers were not installed.
- Used system Chrome at `C:\Program Files\Google\Chrome\Application\chrome.exe`.

Desktop viewport `1366x768`:

- default selector value: `case-004`;
- selector option count: 12;
- selector order: `case-001` through `case-012`;
- selected `case-012`;
- selected label: `案卷 12 · 走廊缺口`;
- case-012 copy visible: PASS;
- rule copy visible: PASS;
- board cell buttons: 12;
- keyboard Tab focus reached a button;
- console errors: none.

Mobile viewport `390x844`:

- default selector value: `case-004`;
- selector option count: 12;
- selector order: `case-001` through `case-012`;
- selected `case-012`;
- selected label: `案卷 12 · 走廊缺口`;
- case-012 copy visible: PASS;
- board cell buttons: 12;
- keyboard Tab focus reached a button;
- console errors: none.

Mobile tabs:

- `规则` tab shows all case-012 rule titles: PASS.
- `棋盘` tab shows board cells including `A1` and `D3`: PASS.
- console errors: none.

## Online HTTP Smoke

- `http://blog.onovich.com/RoomAxioms/`: HTTP `200`.
- `https://onovich.github.io/RoomAxioms/`: HTTP `200`.

## Boundary Scans

Authoring/generator imports:

```powershell
rg -n '@room-axioms/(authoring|generator)' apps\web\src content\cases
```

Result: PASS, no matches.

Experimental/private content references:

```powershell
rg -n 'content/experimental|phase-12|phase-13|phase-14|phase-15|phase-16|phase-17' apps\web\src content\cases --glob '!**/*.test.ts'
```

Result: non-blocking metadata note. The only match is `content/cases/case-012.json` metadata author value `internal-phase-15`. No player-facing app code imports experimental content, and shipped case ids remain `case-001` through `case-012`.

Domain package boundary:

```powershell
rg -n 'zod|react|node:fs|@room-axioms/(schema|solver|proof|oracle|generator|authoring)' packages\domain
```

Result: PASS, no matches.

Solver/proof/generator/authoring browser boundary:

```powershell
rg -n 'react|from .*vite|document\.|window\.|localStorage|HTMLElement|Worker' packages\solver\src packages\proof\src packages\generator\src packages\authoring\src --glob '!**/*.test.ts'
```

Result: PASS, no matches.

Forbidden new DSL terms:

```powershell
rg -n 'lineCount|manhattan|visibility|blocker' content\cases apps\web\src packages\domain packages\schema packages\solver packages\proof packages\generator packages\authoring
```

Result: PASS, no matches.

Target access scan:

```powershell
rg -n 'targetAccess|targetGuestCells|targetKindForDeveloperOverlay|puzzle\.target|targetLayout' apps\web\src
```

Result: PASS with expected existing matches only:

- `apps/web/src/logic/targetAccess.ts`;
- `apps/web/src/hooks/useRoomAxiomsGame.ts` for conclusion checking and developer overlay;
- `apps/web/src/content/caseVerification.ts`;
- tests and performance baseline files.

## Decision

No P0/P1 release blocker was found in Round 4. The current release candidate can proceed to the buffer/final report rounds.
