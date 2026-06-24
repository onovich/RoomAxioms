# Phase 14 Runtime And Selector Smoke

Status: Round 10 evidence

## Scope

No shipped content or selector source was changed in Phase 14. The smoke run confirms the existing selector/runtime path still serves after authoring-tool and test-guard changes.

## Commands

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

## Results

- `StartDevServer.cmd`: PASS; started PID `20252`; health GET `http://127.0.0.1:5173/RoomAxioms/`.
- `Smoke.cmd`: PASS; dry-run local/online launchers and local HTTP GETs passed.
- `StopDevServer.cmd`: PASS; stopped the process tree rooted at PID `20252`.

## Selector Boundary

- `content/cases` remains unchanged in Phase 14.
- `apps/web/src/content/cases.ts` remains unchanged in Phase 14.
- `case-004` remains the default case.
- Phase 14 experimental candidates remain outside player selector data.

