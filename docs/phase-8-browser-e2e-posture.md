# Phase 8 Browser And E2E Posture

Status: accepted release-candidate fallback
Phase: Phase 8 - Release QA And Playtest Loop
Created: 2026-06-24

## Decision

Phase 8 does not add a new Playwright dependency or multi-browser browser-binary install to the release candidate.

The release QA gate uses deterministic coverage already present in the repo:

- Unit and integration tests under Vitest for domain, schema, oracle, solver, proof, and web runtime.
- `apps/web/src/content/caseVerification.test.ts` for all ten MVP cases through schema, solver, proof, no-guess, final uniqueness, and runtime loading.
- `apps/web/src/content/runtimeSmoke.test.ts` for player/developer runtime separation, player-mode secrecy, and conclusion secrecy.
- `apps/web/src/content/performanceBaseline.test.ts` for runtime and verification regression ceilings.
- Project ops `StartDevServer.cmd` and `Smoke.cmd` for local HTTP health checks.
- Focused browser smoke using the in-app browser when interactive DOM checks are needed.

## Why Playwright Is Deferred

The repo does not currently have:

- a direct `@playwright/test` dependency,
- a `playwright.config.*` file,
- committed browser installation workflow,
- a root `e2e` script,
- existing multi-browser tests to migrate.

Adding those during release QA would make the release gate depend on browser downloads and a new CI posture rather than hardening the already accepted MVP surface. That is useful future work, but not the narrowest Phase 8 release-candidate path.

## Deterministic Fallback

For this phase, browser confidence is established by combining:

1. Static production build through Vite.
2. HTTP checks against `/RoomAxioms/`.
3. The project smoke wrapper, now checking stable user-observable HTML text.
4. In-app browser smoke for rendered app behavior, including default case, case selector, board shape, keyboard focus movement, responsive containment, console errors, and player-mode leak selectors.

## Deferred Issue

Track full Chromium/Firefox/WebKit Playwright coverage as a P2 release follow-up unless a Phase 8 smoke run exposes a P0/P1 browser-specific defect.
