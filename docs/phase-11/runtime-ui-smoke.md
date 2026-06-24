# Phase 11 Runtime And UI Smoke Evidence

Status: Round 7 evidence

## Deterministic Test Smoke

Command:

```powershell
pnpm --filter @room-axioms/web test -- src/content/caseVerification.test.ts src/content/runtimeSmoke.test.ts src/view/components/BoardPanel.test.ts src/runtime/analyzer.test.ts src/logic/hints.test.ts
```

Result:

- PASS.
- Selector summaries include `case-011` and preserve `case-004` as the default case.
- Selector summaries expose only `id`, `title`, `caseName`, `difficulty`, `tags`, and `board`; they do not expose target layout, rules, initial reveals, forced cells, no-guess details, generator data, or authoring data.
- Runtime smoke analyzes every shipped case in player and developer modes.
- `case-011` hint compatibility is covered through runtime analyzer tests.
- Board keyboard navigation keeps arrow-key focus within board bounds and leaves Enter/Space behavior to buttons.
- Hint creation tests cover player-readable hint formatting.

## Local Dev Smoke

Commands:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

Result:

- PASS.
- Dev server started on `http://127.0.0.1:5173/RoomAxioms/`.
- `Smoke.cmd` returned HTTP success for `/RoomAxioms/`.
- Server process tree was stopped cleanly.

## Responsive And Mobile Posture

Deterministic evidence:

- `MobileTabs` remains case-agnostic and driven by `game.mobilePanel`.
- `RoomAxiomsScreen` passes `caseSummaries` into `TopBar`, so adding `case-011` only expands the selector data.
- No promoted case adds board dimensions beyond the existing responsive 3x3 and 4x4 surfaces.
- `case-011` is 3x3 and uses the same board interaction path as existing 3x3 cases.

## Dialog And Submit Posture

Deterministic evidence:

- `runtimeSmoke.test.ts` still verifies incomplete and incorrect submissions do not reveal target guest cells.
- Hint dialog data comes from public proof-backed `RuntimeHint`, not from target layout or authoring reports.
- Developer target overlay and forced-cell styling remain gated behind `game.devMode`.
