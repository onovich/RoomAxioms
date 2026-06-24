# Phase 8 Release QA And Playtest Loop Final Report

Status: READY_FOR_CHECK
Guide: `docs/phase-8-release-qa-playtest-loop-goal-mode-execution-guide.md`
Phase: Phase 8 - Release QA And Playtest Loop
Date: 2026-06-24
Executor thread: 019ef271-256c-7be2-9663-e658e2378564
Planner/checker thread: 019ef0df-a626-7181-9ca6-1cc75c1f4c47

## Summary

Phase 8 validated the 10-case MVP as a release candidate, fixed the project smoke fixed-text mismatch, documented the browser/E2E posture, ran focused local/browser QA, recorded performance and stability evidence, prepared a real playtest protocol and honest empty feedback log, and produced a release-readiness decision.

No P0 release defect was found. P1 findings are either closed or explicitly accepted as release caveats. P2 full multi-browser Playwright coverage is deferred.

## Files Changed By Category

- Smoke/release tooling: `.codex/project-ops-workflow.json`.
- Automated performance evidence: `apps/web/src/content/performanceBaseline.test.ts`.
- Release QA docs: `docs/phase-8-release-qa-issue-register.md`, `docs/phase-8-browser-e2e-posture.md`, `docs/phase-8-browser-smoke-report.md`, `docs/phase-8-performance-stability-report.md`.
- Playtest/readiness docs: `docs/phase-8-playtest-protocol.md`, `docs/phase-8-playtest-feedback-log.md`, `docs/phase-8-release-readiness-decision.md`.
- Final report: `docs/phase-8-release-qa-playtest-loop-final-report.md`.

## Release QA Checklist

| Area | Result | Evidence |
| --- | --- | --- |
| Local validation | PASS | `Validate.cmd` passed lint, typecheck, test, build before final report. |
| Git whitespace | PASS | `git diff --check` passed with no output before final report. |
| Smoke wrapper | PASS | `StartDevServer.cmd`, `Smoke.cmd`, and `StopDevServer.cmd` passed. |
| Ten-case loading | PASS | Tests and browser smoke confirm 10 selector options and default `case-004`. |
| Case validity | PASS | `caseVerification.test.ts` verifies schema, rules, no-guess, final uniqueness, runtime readiness. |
| Player secrecy | PASS | Browser smoke found `.dev-safe`, `.dev-guest`, `.target-spoiler` all 0 in player mode. |
| Hints | PASS | Runtime/proof-backed hint tests pass; no solver-search traces are exposed in player mode. |
| Keyboard | PASS | Browser smoke confirmed `A1` + `ArrowRight` focuses `B1`. |
| Screen reader labels | PASS | Browser smoke observed public-state labels only. |
| Responsive | PASS | 1280 desktop, 768 tablet, and 390 mobile checks found no horizontal overflow; mobile evidence submit is contained. |
| Developer gating | PASS | Dev panel appears only after dev toggle; target spoilers require a second explicit target toggle. |
| Performance | PASS | `case-004` player P95/worst 53.73 ms, below 100 ms product target. |
| Playtest protocol | PASS | Protocol and empty feedback log exist; no participant results fabricated. |

## P0/P1/P2 Issue Register

| Issue | Priority | Outcome |
| --- | --- | --- |
| QA-001 smoke fixed-text mismatch | P1 | Closed by changing ops `readyText` to `Room Axioms`; wrapper smoke passed. |
| QA-002 Playwright not configured | P1 | Accepted with deterministic fallback; no new Playwright dependency added in Phase 8. |
| QA-003 100 ms runtime target | P1 | Closed; local Phase 8 measurement met the 100 ms target. |
| QA-004 no real playtest feedback yet | P1 | Accepted; protocol/log prepared and absence recorded honestly. |
| QA-005 final Pages deployment | P1 | Pre-final run succeeded; final report push run is checked after this commit and reported in READY_FOR_CHECK. |
| QA-006 full multi-browser coverage | P2 | Deferred. |

## Smoke And Browser Results

Local smoke:

- `StartDevServer.cmd`: PASS.
- `Smoke.cmd`: PASS.
- `StopDevServer.cmd`: PASS.
- Fixed-text mismatch: fixed.

Browser smoke:

- Default case: `case-004`.
- Selector options: 10.
- Case switch: `case-001`, 3x3 board, 9 cells.
- Default board: 4x4, 16 cells.
- Player leak selectors: 0.
- Keyboard: `A1` + `ArrowRight` -> `B1`.
- Responsive: 768x1024 and 390x844 without horizontal overflow.
- Developer gating: target overlay remains hidden until explicit target toggle.
- Console errors: 0.

Detailed evidence: `docs/phase-8-browser-smoke-report.md`.

## GitHub Pages Release

Pre-final report Pages check:

- Latest run: `28051820823`.
- Commit: `4afab7b83dfad595f263c5a66a898cbab2f844f8`.
- Title: `docs: add Phase 8 playtest readiness`.
- Status: completed/success.
- URL check: `https://onovich.github.io/RoomAxioms/` returned HTTP 200.

The final report commit necessarily triggers a later Pages run; that post-push run and HTTP 200 check are reported in the executor READY_FOR_CHECK message.

## Playtest Protocol And Feedback

- Protocol: `docs/phase-8-playtest-protocol.md`.
- Feedback log: `docs/phase-8-playtest-feedback-log.md`.
- Real sessions recorded during this executor run: 0.
- Fabricated participant results: none.

The protocol is ready for 5 to 10 real participants and includes participant criteria, session script, required observations, post-session questions, and severity triage.

## Performance Findings

Measured with:

```powershell
cmd /c pnpm.cmd --filter @room-axioms/web exec vitest run src/content/performanceBaseline.test.ts --reporter verbose
```

Results:

- `case-004` player runtime: P95 53.73 ms, worst 53.73 ms, no truncation.
- 5x5 candidate cap: P95 0.38 ms, worst 0.38 ms, no truncation.
- Ten-case full verification: P95 172.17 ms, worst 172.17 ms.

The 100 ms P95 product target is met in this local release-candidate measurement.

## Fixes And Accepted Caveats

Fixes:

- Project smoke health text now checks actual served HTML text instead of Vite console text.
- Performance baseline tests now print structured P95/worst evidence.

Accepted caveats:

- Full Chromium/Firefox/WebKit Playwright coverage is deferred to P2.
- Real target-player feedback has not yet been collected; the prepared log is intentionally empty.
- Final-report-commit Pages deployment is verified after the final commit exists and reported back to planner.

## Validation

Final pre-report validation:

- `pnpm lint`: PASS.
- `pnpm typecheck`: PASS.
- `pnpm test`: PASS.
- `pnpm build`: PASS.
- `git diff --check`: PASS.
- `StartDevServer.cmd`: PASS.
- `Smoke.cmd`: PASS.
- `StopDevServer.cmd`: PASS.

The final report commit uses `CommitAndPush.cmd`, which reruns lint, typecheck, test, and build before committing and pushing.

## Boundary Scans

Domain:

- `rg "@room-axioms/" packages/domain/src`: no matches.
- `rg "zod" packages/domain/src`: no matches.
- `rg "react" packages/domain/src`: no matches.
- `rg "node:" packages/domain/src`: no matches.
- `rg "from 'fs'" packages/domain/src`: no matches.
- `rg "vite" packages/domain/src`: only `vitest` imports in tests.

Solver/proof:

- `rg "react" packages/solver/src packages/proof/src`: no matches.
- `rg "from 'vite'" packages/solver/src packages/proof/src`: no matches.
- `rg "window" packages/solver/src packages/proof/src`: no matches.
- `rg "localStorage" packages/solver/src packages/proof/src`: no matches.
- `rg "document" packages/solver/src packages/proof/src`: only the word `documented` in a solver test name.
- `rg "@room-axioms/oracle" packages/solver/src packages/proof/src`: solver tests only.

Web target access:

- Target reads remain limited to `targetAccess`, verification/test helpers, inspection settlement, conclusion checking, and explicit developer overlay.
- Player marks are used for UI notes and final conclusion checking, not as solver/proof observations.

Boundary result: PASS.

## Release Readiness Decision

Release candidate is ready for planner check.

This decision means the MVP can proceed to planner acceptance and real participant playtesting. It does not claim that real playtest results already exist.

## Commits

- `3e77d8b docs: record Phase 8 dispatch`
- `1001fad docs: add Phase 8 QA baseline`
- `c6d9bbc chore: harden release smoke gate`
- `a5899ae docs: record Phase 8 browser smoke`
- `639dd4b test: record Phase 8 performance evidence`
- `4afab7b docs: add Phase 8 playtest readiness`

The final report commit hash is reported after push in the READY_FOR_CHECK message.

## PASS Criteria

- Final report exists: PASS.
- Validation passes: PASS.
- Pages green/HTTP 200: PASS pre-final; final-report push check reported in READY_FOR_CHECK.
- Smoke fixed-text mismatch fixed: PASS.
- Release QA checklist covers required flows: PASS.
- P0 findings fixed: PASS, none found.
- P1 findings fixed or accepted: PASS.
- P2 findings deferred: PASS.
- Playtest protocol and feedback log exist: PASS.
- Performance evidence recorded and 100 ms status documented: PASS.
- Boundaries clean: PASS.
- Player mode secrecy preserved: PASS.
- No deferred generator/editor/new DSL/backend/broad redesign scope entered: PASS.
- Working tree clean after final push: pending final commit check.

## Phase 9 Notes

- Run the real 5 to 10 participant playtest and fill `docs/phase-8-playtest-feedback-log.md` only with real observations.
- Decide whether Phase 9 should add full Playwright multi-browser coverage before broader public distribution.
- Continue monitoring Pages runs after final report commits.
