# Phase 8 Release QA Issue Register

Status: in progress
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
| Local validation | `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` through `Validate.cmd` | Pending | Required before each successful round commit. |
| Git whitespace | `git diff --check` | Pending | CRLF working-copy warnings are acceptable when no real whitespace errors appear. |
| Pages deployment | GitHub Pages workflow green and online URL HTTP 200 | Pending | Must be checked after final pushed report commit. |
| Ten-case content | Case selector lists exactly 10 cases, stable default is `case-004` | Pending | Covered by existing tests; browser smoke to re-check release surface. |
| Case validity | Schema parse, target satisfies rules, no-guess, final uniqueness, runtime ready | Pending | Covered by `caseVerification.test.ts`. |
| Player secrecy | Player mode hides target, forced cells, solver internals, and developer-only summaries | Pending | Covered by tests and browser smoke selectors. |
| Hints | Player hints remain proof-backed and do not expose search traces | Pending | Covered by runtime/proof path; browser QA to inspect visible behavior. |
| Keyboard | Board navigation and essential controls usable without mouse | Pending | Existing test coverage plus browser smoke. |
| Screen reader | Labels/status text do not expose private target or dev data | Pending | Existing component semantics plus focused DOM review. |
| Responsive | 1280x800, 768x1024, and 390x844 core flows remain contained | Pending | Existing Phase 7 evidence; re-run focused smoke. |
| Developer gating | Dev inspector and target overlay stay explicit developer-only affordances | Pending | Boundary scan and browser smoke. |
| Smoke wrappers | `StartDevServer.cmd` and `Smoke.cmd` no longer fail on fixed-text mismatch, or the route is explicitly documented | Open | Known Phase 7 release issue QA-001. |
| E2E posture | Minimal Playwright setup added if feasible, otherwise deterministic fallback documented | Open | Known Phase 7 release issue QA-002. |
| Performance | Representative 4x4 player runtime P95/worst and 5x5 cap/full verification evidence recorded | Pending | Existing tests provide regression gates; Phase 8 records measured values. |
| Playtest | Protocol and feedback log template exist; no fabricated participant feedback | Pending | Required Phase 8 release research artifact. |
| Boundaries | Domain/schema/solver/proof/web target-access boundaries remain clean | Pending | Final boundary scans required. |

## Issue Register

| ID | Priority | Status | Issue | Planned outcome |
| --- | --- | --- | --- | --- |
| QA-001 | P1 | Open | `StartDevServer.cmd` / `Smoke.cmd` project wrapper health check expects fixed text that is not present in the served Vite HTML. | Prefer updating project ops `readyText` to user-observable HTML text and verify wrappers. |
| QA-002 | P1 | Open | Multi-browser Playwright is not configured in the repo, and browser binaries are not known to be installed. | Add minimal setup only if feasible without destabilizing release; otherwise document deterministic HTTP/in-app browser fallback. |
| QA-003 | P1 | Open | Phase 7 observed representative 4x4 player runtime P95 around 102-201 ms, above the aspirational 100 ms product target but under the committed 500 ms regression ceiling. | Re-measure Phase 8 values; fix a narrow bottleneck only if release-blocking. |
| QA-004 | P1 | Open | No real target-player feedback has been collected in this executor run. | Create protocol and empty feedback log template; record absence honestly. |
| QA-005 | P1 | Pending | Final Pages deployment must be verified after the final report push. | Use `gh run` and HTTP 200 check after final commit. |
| QA-006 | P2 | Pending | Cross-browser coverage remains narrower than the long-term PR-012 ideal if Playwright is deferred. | Document as release caveat if deterministic fallback remains the chosen posture. |

## Current Release Risk

No P0 release defect is known at the start of Phase 8.

The current P1 release risks are operational QA gaps rather than known gameplay correctness failures: smoke wrapper text mismatch, E2E posture, performance target evidence, and playtest protocol/readiness evidence. Gameplay correctness is already covered by the ten-case verification harness and runtime smoke from Phase 7, pending re-validation in this phase.

## Round Evidence Log

| Round | Evidence | Result |
| --- | --- | --- |
| 1 - Baseline | Guide/context read; issue register created. | In progress |
| 2 - Smoke/deployment | Pending. | Pending |
| 3 - Player flow/a11y/responsive | Pending. | Pending |
| 4 - Performance/stability | Pending. | Pending |
| 5 - Playtest/readiness synthesis | Pending. | Pending |
| 6 - Final validation/report | Pending. | Pending |
