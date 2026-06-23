# Phase 8 Performance And Stability Report

Status: PASS
Phase: Phase 8 - Release QA And Playtest Loop
Date: 2026-06-24

## Measurement Command

```powershell
cmd /c pnpm.cmd --filter @room-axioms/web exec vitest run src/content/performanceBaseline.test.ts --reporter verbose
```

Result: PASS, 1 file, 3 tests.

## Runtime Performance Evidence

| Scenario | P95 | Worst | Ceiling | Result |
| --- | ---: | ---: | ---: | --- |
| `case-004` player runtime analysis | 53.73 ms | 53.73 ms | 500 ms | PASS |
| 5x5 synthetic candidate cap | 0.38 ms | 0.38 ms | 200 ms | PASS |
| Ten-case full verification batch | 172.17 ms | 172.17 ms | 2,000 ms | PASS |

The representative 4x4 player runtime met the aspirational 100 ms product target in this run:

- product target: 100 ms P95
- observed P95: 53.73 ms
- observed worst: 53.73 ms
- solver truncation: false

No Phase 8 runtime optimization is required for release readiness.

## Regression Gate

`apps/web/src/content/performanceBaseline.test.ts` now records structured performance evidence while preserving the existing regression ceilings:

- `case-004` player runtime analysis P95 <= 500 ms.
- 5x5 candidate cap P95 <= 200 ms.
- ten-case verification P95 <= 2,000 ms.

The committed ceilings remain intentionally looser than the product target to avoid release noise from shared CI variance while still preventing major regressions.

## Runtime Stability Evidence

Existing runtime tests cover the release stability behaviors required for the web runtime:

| Area | Evidence |
| --- | --- |
| Stale responses | `apps/web/src/runtime/facade.test.ts` discards out-of-order request 1 after request 2 supersedes it. |
| Cancellation | `apps/web/src/runtime/facade.test.ts` suppresses the eventual result of a canceled active request. |
| Structured errors | `apps/web/src/runtime/facade.test.ts` normalizes thrown analysis failures into `RUNTIME_ANALYSIS_FAILED`. |
| Truncation handling | `apps/web/src/runtime/analyzer.test.ts` reports `SOLVER_TRUNCATED` and does not treat truncated results as complete. |
| Player/developer split | `apps/web/src/runtime/analyzer.test.ts` keeps no-guess and forced-cell diagnostics out of player analysis, while developer verification includes them. |

## Finding

No P0/P1 performance or runtime-stability release defect was found.

Continue watching CI/shared-runner variance in future releases, but the current local release-candidate measurement is below the 100 ms player-runtime target.
