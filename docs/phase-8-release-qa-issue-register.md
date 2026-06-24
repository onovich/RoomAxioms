# Phase 8 Release QA Issue Register

Status: ready for final check
Phase: Phase 8 - Release QA And Playtest Loop
Created: 2026-06-24
Executor thread: 019ef271-256c-7be2-9663-e658e2378564
Planner/checker thread: 019ef0df-a626-7181-9ca6-1cc75c1f4c47

## Baseline

Phase 8 starts from the accepted Phase 7 MVP:

- Phase 7 acceptance: PASS.
- Phase 7 final commit: `10c62ed test: relax CI performance baseline ceiling`.
- Phase 7 final report: `docs/phase-7-mvp-content-ux-hardening-final-report.md`.
- Ten MVP cases exist in `content/cases/case-001.json` through `content/cases/case-010.json`.
- Web content loading is data-driven through `apps/web/src/content/cases.ts`.
- Existing automated release evidence includes schema/solver/proof/runtime checks, runtime smoke, conclusion secrecy checks, keyboard navigation coverage, responsive CSS hardening, and performance regression tests.

## Release QA Checklist

| Area | Required evidence | Status | Notes |
| --- | --- | --- | --- |
| Local validation | `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` through `Validate.cmd` | PASS | Final pre-report validation passed; commit wrapper re-runs this gate before push. |
| Git whitespace | `git diff --check` | PASS | Final pre-report check passed with no output. |
| Pages deployment | GitHub Pages workflow green and online URL HTTP 200 | PASS with final-post-push note | Latest pre-final run `28051820823` for `4afab7b` succeeded; online URL returned HTTP 200. Final report push run is checked after push and reported in READY_FOR_CHECK. |
| Ten-case content | Case selector lists exactly 10 cases, stable default is `case-004` | PASS | Covered by tests and Round 3 browser smoke. |
| Case validity | Schema parse, target satisfies rules, no-guess, final uniqueness, runtime ready | PASS | Final validation passed `caseVerification.test.ts` and runtime smoke. |
| Player secrecy | Player mode hides target, forced cells, solver internals, and developer-only summaries | PASS | Round 3 browser smoke selectors all 0 in player mode. |
| Hints | Player hints remain proof-backed and do not expose search traces | PASS | Final validation passed runtime/proof hint tests and player-mode smoke. |
| Keyboard | Board navigation and essential controls usable without mouse | PASS | Round 3 browser smoke confirmed `A1` + `ArrowRight` focuses `B1`. |
| Screen reader | Labels/status text do not expose private target or dev data | PASS | Round 3 DOM labels expose revealed/unknown/player state only in player mode. |
| Responsive | 1280x800, 768x1024, and 390x844 core flows remain contained | PASS | Round 3 browser smoke found no horizontal overflow; mobile evidence submit contained. |
| Developer gating | Dev inspector and target overlay stay explicit developer-only affordances | PASS | Round 3 browser smoke confirmed dev panel and target overlay are gated separately. |
| Smoke wrappers | `StartDevServer.cmd` and `Smoke.cmd` no longer fail on fixed-text mismatch, or the route is explicitly documented | PASS | `readyText` now matches stable served HTML text; Round 2 wrapper smoke passed. |
| E2E posture | Minimal Playwright setup added if feasible, otherwise deterministic fallback documented | PASS with caveat | Deterministic fallback documented in `docs/phase-8-browser-e2e-posture.md`; multi-browser Playwright remains P2. |
| Performance | Representative 4x4 player runtime P95/worst and 5x5 cap/full verification evidence recorded | PASS | Round 4 measured case-004 player P95/worst 53.73 ms, below the 100 ms product target. |
| Playtest | Protocol and feedback log template exist; no fabricated participant feedback | PASS | Protocol and empty feedback log created; 0 real sessions recorded honestly. |
| Boundaries | Domain/schema/solver/proof/web target-access boundaries remain clean | PASS | Final boundary scans passed; only expected test/dev references were found. |

## Issue Register

| ID | Priority | Status | Issue | Planned outcome |
| --- | --- | --- | --- | --- |
| QA-001 | P1 | Closed | `StartDevServer.cmd` / `Smoke.cmd` project wrapper health check expects fixed text that is not present in the served Vite HTML. | Updated project ops `readyText` to `Room Axioms`; `StartDevServer.cmd` and `Smoke.cmd` passed in Round 2. |
| QA-002 | P1 | Accepted | Multi-browser Playwright is not configured in the repo, and browser binaries are not known to be installed. | Deterministic fallback documented; no Playwright dependency added for this release-candidate phase. |
| QA-003 | P1 | Closed | Phase 7 observed representative 4x4 player runtime P95 around 102-201 ms, above the aspirational 100 ms product target but under the committed 500 ms regression ceiling. | Round 4 re-measured case-004 player runtime P95/worst at 53.73 ms; no release-blocking optimization required. |
| QA-004 | P1 | Accepted | No real target-player feedback has been collected in this executor run. | Protocol and empty feedback log template created; no fabricated participant results recorded. |
| QA-005 | P1 | Pre-final PASS | Final Pages deployment must be verified after the final report push. | Pre-final Pages run `28051820823` for `4afab7b` succeeded and URL returned HTTP 200; final report push run is reported in READY_FOR_CHECK. |
| QA-006 | P2 | Deferred | Cross-browser coverage remains narrower than the long-term PR-012 ideal if Playwright is deferred. | Documented as release caveat; deterministic fallback accepted for Phase 8. |

## Current Release Risk

No P0 release defect is known at the start of Phase 8.

The current P1 release risks are operational QA gaps rather than known gameplay correctness failures: smoke wrapper text mismatch, E2E posture, performance target evidence, and playtest protocol/readiness evidence. Gameplay correctness is already covered by the ten-case verification harness and runtime smoke from Phase 7, pending re-validation in this phase.

## Round Evidence Log

| Round | Evidence | Result |
| --- | --- | --- |
| 1 - Baseline | Guide/context read; issue register created; validation/commit/push completed as `1001fad`. | PASS |
| 2 - Smoke/deployment | `StartDevServer.cmd` PASS; `Smoke.cmd` PASS; `StopDevServer.cmd` PASS; E2E posture documented. | PASS |
| 3 - Player flow/a11y/responsive | Browser smoke PASS: default case, 10 selector options, case switch, keyboard, responsive, player secrecy, developer gating, console errors 0. | PASS |
| 4 - Performance/stability | Performance baseline PASS: case-004 player P95/worst 53.73 ms; 5x5 cap P95/worst 0.38 ms; ten-case verification P95/worst 172.17 ms; runtime stability tests cover stale/cancel/error/truncation. | PASS |
| 5 - Playtest/readiness synthesis | Playtest protocol, honest empty feedback log, and release-readiness decision created. | PASS |
| 6 - Final validation/report | Final validation, smoke, boundary scans, and pre-final Pages check passed; final report authored. | PASS with post-push Pages check to report |
