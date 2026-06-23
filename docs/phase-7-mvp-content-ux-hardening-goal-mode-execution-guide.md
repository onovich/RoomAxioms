# Phase 7 MVP Content And UX Hardening Goal Mode Execution Guide

Date: 2026-06-23
Status: execution guide for the executor
Phase: Phase 7 - MVP Content And UX Hardening
Round budget: 10 executor rounds; rounds 1-7 are main implementation, rounds 8-9 are hardening/buffer, round 10 is final validation.

## 0. Direct Goal Prompt For Executor

You are executing Phase 7 of Room Axioms: MVP Content And UX Hardening.

Read this guide, `README.md`, `Role.md`, `docs/development-plan.md`, `docs/phase-6-web-runtime-integration-final-report.md`, `docs/room-axioms-handoff/docs/01_PRODUCT_DESIGN.md`, `docs/room-axioms-handoff/docs/02_UI_UX_DESIGN.md`, `docs/room-axioms-handoff/docs/03_TECHNICAL_DESIGN.md`, `docs/room-axioms-handoff/docs/04_ARCHITECTURE.md`, `docs/room-axioms-handoff/docs/05_CODEX_HANDOFF.md`, `docs/room-axioms-handoff/docs/06_RULE_DSL_SPEC.md`, `docs/room-axioms-handoff/docs/07_BACKLOG_AND_DECISIONS.md`, and the current `content`, `packages`, and `apps/web/src` implementation.

Within 10 executor rounds:

- Expand MVP content from the single canonical case to the first 10 playable cases.
- Every shipped case must pass schema validation, oracle/solver sanity where bounded, exact solver checks, proof/no-guess verification, final guest-layout uniqueness, and web runtime loading.
- Add content index/loading support and a simple case selection path if the app still assumes only case-004.
- Add E2E/smoke coverage for the three-engine user flows described in the handoff: rule reading, neighborhood help, marking, wrong submission secrecy, proof-backed hints, keyboard play, completion, and responsive viewports.
- Resolve the Phase 6 Playwright browser-binary gap if E2E requires it; document any environment fallback honestly.
- Harden keyboard and screen-reader behavior, responsive layout, player-facing rule copy, neighborhood terminology, and runtime status copy.
- Establish performance baselines for the target MVP scale and make cap/truncation behavior visible in developer mode without leaking solver facts to player mode.
- Keep the UI's current information architecture and visual direction stable; polish and harden, do not redesign the product.
- Validate, commit, and push each successful round before moving on.

Use `$donextgoal` to execute this guide. When complete, report back to planner thread `019ef0df-a626-7181-9ca6-1cc75c1f4c47`.

## 1. Required Context

- `README.md`
- `AGENTS.md`
- `Role.md`
- `docs/development-plan.md`
- `docs/phase-6-web-runtime-integration-final-report.md`
- `docs/phase-6-web-runtime-integration-goal-mode-execution-guide.md`
- `docs/phase-5-human-reasoning-proofs-final-report.md`
- `docs/phase-4-solver-core-final-report.md`
- `docs/room-axioms-handoff/README.md`
- `docs/room-axioms-handoff/docs/01_PRODUCT_DESIGN.md`
- `docs/room-axioms-handoff/docs/02_UI_UX_DESIGN.md`
- `docs/room-axioms-handoff/docs/03_TECHNICAL_DESIGN.md`
- `docs/room-axioms-handoff/docs/04_ARCHITECTURE.md`
- `docs/room-axioms-handoff/docs/05_CODEX_HANDOFF.md`
- `docs/room-axioms-handoff/docs/06_RULE_DSL_SPEC.md`
- `docs/room-axioms-handoff/docs/07_BACKLOG_AND_DECISIONS.md`
- `content/cases/case-004.json`
- `packages/domain/src`
- `packages/schema/src`
- `packages/solver/src`
- `packages/proof/src`
- `apps/web/src`

Phase 6 is accepted. Treat the web runtime facade as the integration boundary for player-facing analysis. Treat `@room-axioms/solver` as the exact backend and `@room-axioms/proof` as the only human explanation backend.

## 2. Scope

Phase 7 completes the MVP pre-release hardening slice of RA-011, RA-013, RA-014, RA-015, RA-018, RA-019, and RA-020. It may also finish any small RA-012 case selection work required to make the 10 cases playable.

Required deliverables:

- Ten checked-in case JSON files under `content/cases`, including existing case-004.
- A content index or equivalent loader that lets the web app enumerate and load those cases without hard-coding only case-004.
- Case metadata sufficient for selection, display title, difficulty notes, and validation/report snapshots.
- Tests proving every case:
  - parses through `@room-axioms/schema`;
  - has a complete target board;
  - target satisfies rules;
  - initial state is satisfiable;
  - final guest layout is unique;
  - passes proof/no-guess verification;
  - can be consumed by the web runtime analyzer without target leakage into ordinary UI components.
- Regression snapshots or compact reports for candidate guest-layout counts, forced cells, proof waves, final guest cells, and technique coverage.
- E2E or equivalent browser smoke coverage for:
  - app loads and case selector works;
  - rules and neighborhood explanation are reachable;
  - player marking and undo/cycle behavior work;
  - wrong submission does not reveal the exact answer;
  - hint displays proof-backed content;
  - keyboard-only flow can perform the main actions;
  - responsive viewports 1280x800, 768x1024, and 390x844 do not overlap core controls or hide essential actions.
- Browser engine coverage for Chromium, Firefox, and WebKit when Playwright browsers are available. If a local browser binary is missing, install/restore it through the project toolchain when feasible; if environment policy blocks this, record the blocker and provide a deterministic HTTP/manual fallback.
- Keyboard and screen-reader hardening for cells, rule cards, dialogs, status updates, tool controls, tabs, and case selection.
- Rule-copy revision focusing on one-way implications, orthogonal/adjacent semantics, edge/corner behavior, and avoiding "周围八格" ambiguity.
- Performance baseline for MVP scale:
  - normal runtime analysis P95 target under 100 ms for representative states;
  - candidate counting cap behavior under 200 ms where applicable;
  - full case verification P95 under 2 s in Node where feasible.
- Final report at `docs/phase-7-mvp-content-ux-hardening-final-report.md`.

## 3. Non-Scope

Do not implement these in Phase 7:

- Generator v1, random puzzle production, minimization tools, or difficulty auto-scoring beyond reporting metrics already produced by solver/proof.
- Internal level editor, UGC, authoring UI, or new content DSL semantics.
- New rule families, new scope kinds, new object kinds, or changes to Puzzle Schema v1 unless a discovered content bug makes a narrow backward-compatible fix necessary.
- Broad visual redesign, landing page, new art direction, full illustration set, audio, animation system, or story campaign.
- Remote backend, server signing, leaderboard, daily challenge, PWA/offline mode, or analytics.
- Player-facing forced-cell overlays, target overlays, solver internals, or candidate counts outside explicit developer mode.
- Letting player marks become solver/proof facts.
- Rewriting solver/proof/domain internals unless a Phase 7 validation bug proves they are incorrect.

## 4. Fixed Per-Round Workflow

At the start of every round:

1. Read this guide and `Role.md`.
2. Run `git status --short --branch`.
3. Choose one narrow round goal from the plan below.
4. Check for unrelated user changes and leave them alone.

During implementation:

1. Prefer data-driven content and reusable verification helpers over case-specific app branches.
2. Keep all case JSON parseable by the schema package; do not loosen validation just to accept one case.
3. Keep target reads behind the existing `apps/web/src/logic/targetAccess.ts` boundary or explicit verification/test code.
4. Use solver/proof public APIs only; do not depend on package internals or search traces.
5. Keep player mode free of exact answer, forced-cell, candidate-count, and target overlay data.
6. Keep UI changes scoped to content selection, accessibility, responsive stability, copy clarity, and runtime/error polish.
7. When adding E2E, make selectors stable and meaningful; prefer accessible roles/names where the UI supports them.
8. Record performance numbers as repeatable tests or scripts, not as one-off anecdotes.

Every round reply must include:

- round goal
- completed work
- Debug self-check
- architecture self-check
- validation commands and results
- commit hash and push result
- next round goal
- whether a buffer round was consumed

Progression rules:

- If validation fails, do not commit, do not push, and do not move to the next round.
- If validation passes but commit fails, do not move to the next round.
- If commit succeeds but push fails, do not move to the next round.
- Only after push succeeds may the executor continue.

## 5. Commit And Push Workflow

Prefer the project GitFlow wrapper:

```powershell
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\Status.cmd
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\CommitAndPush.cmd -Message "<message>" -Paths <phase-relevant paths>
```

Minimum validation before every successful round commit:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
```

For web/E2E rounds, also run the project smoke workflow and Playwright/E2E command when available:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

If the Playwright browser binaries are missing, first try the repo-supported install/restore command. If network or environment policy blocks it, document the blocker and keep deterministic HTTP/manual smoke in the report.

Do not stage unrelated files, `apps/web/dist`, `node_modules`, coverage output, Playwright reports, traces, caches, screenshots, local port logs, or generated browser binaries.

## 6. Round Plan

### Round 1 - Content Inventory And Verification Harness

Goal:

- Audit current content, schema, solver, proof, and web loader assumptions.
- Add or refine a content verification helper/test suite that can run all cases through schema, target rule satisfaction, satisfiability, final uniqueness, no-guess proof verification, and runtime analyzer loading.
- Establish the case report shape used by later rounds.

Architecture self-check:

- Verification consumes public package APIs.
- Case target access stays in content verification/test code, not ordinary UI components.

### Round 2 - Cases 001-003

Goal:

- Add three early/easier cases that teach global count, orthogonal/adjacent counts, one-way implication language, and safe first deductions.
- Ensure each case has meaningful metadata and proof/no-guess verification.
- Add compact snapshots for candidate shrinkage, proof waves, and final guest cells.

Architecture self-check:

- New cases use Puzzle Schema v1 without custom code paths.
- No new rule DSL semantics are introduced.

### Round 3 - Cases 005-007

Goal:

- Add three medium cases that vary board shape pressure, edge/corner scope behavior, and proof techniques.
- Reuse case-004 as the established baseline without rewriting its semantics.
- Extend verification snapshots and technique coverage checks.

Architecture self-check:

- Content quality is proven by solver/proof results, not by handwritten UI branches.
- No hidden target data is added to public UI state.

### Round 4 - Cases 008-010 And Content Index

Goal:

- Add the remaining three MVP cases.
- Create or complete the content index/manifest and web loading path for all 10 cases.
- Add selection-state tests and default-case behavior.

Architecture self-check:

- Web case selection is data-driven.
- The app can still load a single static Pages bundle without backend calls.

### Round 5 - Web Case Selection And Player Flow Polish

Goal:

- Add the minimal case selection UI needed for 10 cases.
- Preserve the current investigation screen as the main experience.
- Add clear locked/available/completed/metadata states only when the data exists locally.
- Ensure reset, conclusion, hints, and developer mode all react correctly to case changes.

Architecture self-check:

- Case selection does not become a marketing/landing page.
- Runtime facade is recreated or reset cleanly on case changes.

### Round 6 - Keyboard And Screen Reader Hardening

Goal:

- Implement or repair arrow-key board focus, Enter/Space action, F/S/I/H shortcuts, Esc dialog close, rule focus, tabs, and dialog focus behavior.
- Add accessible names for board cells, revealed objects, marks, rule cards, tool controls, status, dialogs, and case selection.
- Add tests or E2E assertions for keyboard-only main flow.

Architecture self-check:

- Accessibility metadata describes public player knowledge only.
- Developer-only data remains hidden from player-mode screen-reader output.

### Round 7 - Responsive Layout And Rule Copy Revision

Goal:

- Harden 1280x800, 768x1024, and 390x844 layouts.
- Ensure board, rules, evidence, tools, dialogs, mobile tabs, and developer panel do not overlap or resize unpredictably.
- Revise rule and status copy for one-way implications, orthogonal/adjacent definitions, edge/corner counts, proof hints, wrong submissions, and runtime statuses.

Architecture self-check:

- Copy clarifies mechanics without introducing new mechanics.
- Responsive changes remain layout polish, not a broad visual redesign.

### Round 8 - E2E And Browser Smoke

Goal:

- Add Playwright or equivalent E2E coverage for the required main flows.
- Run Chromium, Firefox, and WebKit when local browsers are available.
- Resolve the Phase 6 missing-browser-binary gap if feasible.
- Capture and document deterministic fallback smoke if a browser engine cannot run in this environment.

Architecture self-check:

- E2E uses user-observable behavior and accessible selectors.
- Test artifacts are ignored and not committed unless intentionally documented fixtures.

### Round 9 - Performance Baseline And Hardening Buffer

Goal:

- Add repeatable performance baseline scripts/tests for representative 4x4 and 5x5 states.
- Record P95 or deterministic benchmark stats for runtime analysis, candidate counts, and full verification.
- Fix any content, layout, E2E, accessibility, or cap/truncation regressions found in rounds 1-8.

Architecture self-check:

- Performance measurements do not couple web UI to solver internals.
- Cap/truncation reporting stays honest and does not leak player answers.

### Round 10 - Final Validation And Handoff Report

Goal:

- Run full validation and smoke/E2E where feasible.
- Confirm all 10 cases pass verification gates.
- Confirm branch is clean after push.
- Produce final executor report back to planner.

Required commands:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
git status --short --branch
```

Run web smoke and E2E when feasible:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

Final report must include:

- files changed by category
- case list and content index summary
- per-case validation matrix
- proof/no-guess and final uniqueness summary
- E2E/browser smoke results
- keyboard/screen-reader changes
- responsive viewport results
- rule-copy revisions
- performance baseline results
- tests added
- boundary scans
- commit hashes
- push status
- PASS criteria status
- blockers or notes for Phase 8 Release QA And Playtest Loop

## 7. PASS Criteria

Phase 7 passes only when all are true:

- Ten MVP cases exist and are loadable from the app.
- Every case parses through schema and has a complete valid target board.
- Every case's target satisfies all rules.
- Every case's initial state is satisfiable.
- Every case has a unique final guest layout.
- Every case passes proof/no-guess verification or has a documented blocker that is routed for repair before PASS.
- The web runtime can analyze every case without app-specific hard-coded case branches.
- Case selection is data-driven and works in the static GitHub Pages app.
- Keyboard-only main flow is covered and usable.
- Screen-reader/accessibility labels do not expose target, forced-cell, candidate-count, or developer-only data in player mode.
- Responsive layouts at 1280x800, 768x1024, and 390x844 keep core controls visible and non-overlapping.
- Rule copy and status copy clarify one-way implications and neighborhood semantics.
- E2E or deterministic browser/manual smoke covers main flows; missing browser engines have concrete environment evidence.
- Performance baselines are recorded for representative MVP states and meet the target budget or report concrete findings.
- Domain remains schema/solver/proof/oracle/Zod/UI/fs-free.
- Solver/proof packages remain independent of React/Vite/browser UI code.
- Target reads remain limited to `targetAccess`, verification, and tests.
- Player marks are not sent as solver/proof facts.
- No generator, editor, new DSL semantics, remote backend, broad redesign, or deferred scope entered this phase.
- GitHub Pages workflow remains green after final push.
- Working tree is clean.

## 8. Debug Self-Check Template

Use this every round:

```text
Debug self-check:
- Smallest case or user flow tested:
- Success path covered:
- Failure/error/empty/stale/truncated path covered:
- Content verification checked:
- Runtime analysis checked:
- Accessibility/keyboard checked:
- Responsive or E2E smoke needed this round: yes/no, why:
- Regression risk:
```

## 9. Architecture Self-Check Template

Use this every round:

```text
Architecture self-check:
- Domain remains the source of truth for puzzle/rule/board types:
- Schema remains the content contract:
- Solver remains exact backend:
- Proof remains human explanation backend:
- Web runtime consumes public solver/proof APIs only:
- UI did not duplicate solver/proof semantics:
- Target access stayed behind the narrow app boundary:
- Player marks stayed out of solver/proof facts:
- Developer-only data stayed gated:
- Deferred generator/editor/new DSL/backend scope avoided:
- Unrelated files left untouched:
```

## 10. Final Report Template

```markdown
# Phase 7 MVP Content And UX Hardening Final Report

Status: READY_FOR_CHECK
Guide: `docs/phase-7-mvp-content-ux-hardening-goal-mode-execution-guide.md`
Phase: Phase 7 - MVP Content And UX Hardening

## Summary
## Files Changed By Category
## Case List And Content Index
## Per-Case Validation Matrix
## Proof And No-Guess Verification
## Web Runtime Integration
## Keyboard And Screen Reader
## Responsive Layout
## Rule Copy
## E2E And Smoke
## Performance Baseline
## Tests Added
## Boundary Scans
## Commits
## PASS Criteria
## Phase 8 Notes
```
