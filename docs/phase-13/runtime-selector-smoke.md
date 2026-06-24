# Phase 13 Runtime Selector Smoke

Status: Round 8 evidence

## Scope

No Phase 13 case was promoted. Round 8 therefore verifies that the existing player/runtime path still loads, that selector content remains static and unchanged, and that no experimental Phase 13 content entered player-facing routes.

## Commands

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

## Results

Start dev server:

- PASS;
- started dev server PID `23992`;
- health GET `http://127.0.0.1:5173/RoomAxioms/` passed.

Smoke:

- PASS;
- `StartLocalTest.ps1 -DryRun` passed;
- `OpenOnlineTest.ps1 -DryRun` passed;
- local HTTP GET checks for `http://127.0.0.1:5173/RoomAxioms/` passed.

Stop dev server:

- PASS;
- stopped process tree rooted at PID `23992`.

## Selector Boundary

Round 6 added a regression guard proving:

- shipped case count remains `11`;
- shipped ids remain `case-001` through `case-011`;
- `DEFAULT_CASE_ID` remains `case-004`;
- `phase-13-` ids are absent from both `contentCases` and `caseSummaries`.

## Accessibility And Player-Secrecy Notes

Phase 13 did not change UI layout, keyboard handling, mobile tabs, or accessibility markup. Existing runtime/content smoke continues to cover player-mode secrecy:

- player mode does not expose no-guess proof internals;
- player mode does not expose forced/candidate diagnostics;
- developer diagnostics remain developer-mode only.

