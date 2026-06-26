# Phase 25 Authoring Editor And Live Diagnostics Workbench Goal Mode Execution Guide

Date: 2026-06-27
Status: execution guide for the executor
Phase: Phase 25 - Authoring Editor And Live Diagnostics Workbench
Round budget: 28 executor rounds; rounds 1-5 define contracts and diagnostics, rounds 6-13 build the private authoring editor shell, rounds 14-20 add live diagnostics and import/export workflows, rounds 21-24 validate authoring on real cases, rounds 25-27 are buffer/repair rounds, and round 28 is final validation and report.

## 0. Direct Goal Prompt For Executor

You are executing Phase 25 of Room Axioms: Authoring Editor And Live Diagnostics Workbench.

Read this guide, `README.md`, `Role.md`, `docs/development-plan.md`, `docs/phase-24-rule-grammar-expressiveness-expansion-final-report.md`, `docs/phase-24/`, `docs/phase-23/`, `content/novelty-claims.json`, `content/cases`, `content/experimental`, `packages/domain/src`, `packages/schema/src`, `packages/solver/src`, `packages/proof/src`, `packages/authoring/src`, `apps/web/src`, and the project workflow configs.

Phase 24 expanded the rule grammar, but it honestly blocked on content quality: the new grammar fixtures proved integration, not high-quality puzzle production. Phase 25 must turn that blocker into a maintainable human-in-the-loop authoring workflow. Build a private maintainer-facing level editor and live diagnostics workbench so a human author can edit board facts, initial reveals, rules, regions/scopes, metadata, and presentation copy while immediately seeing correctness, proof, degeneracy, clone-risk, and difficulty signals.

This is not a public player editor or UGC feature. It is a private authoring surface and diagnostics workflow for maintainers. Do not promote new cases unless they pass the existing gates and feel genuinely ready; the main deliverable is the workbench itself.

Use `$donextgoal` to execute this guide. When complete, report back to planner thread `019ef0df-a626-7181-9ca6-1cc75c1f4c47`.

## 1. Required Context

- `README.md`
- `AGENTS.md`
- `Role.md`
- `docs/development-plan.md`
- `docs/phase-24-rule-grammar-expressiveness-expansion-final-report.md`
- `docs/phase-24/hardness-probe-round-09.md`
- `docs/phase-24/rule-grammar-expansion-design.md`
- `docs/phase-23/difficulty-rubric-v2.md`
- `docs/phase-23/degeneracy-gate-design.md`
- `docs/phase-23/user-rating-intake.md`
- `docs/phase-22/mechanics-expression-design.md`
- `docs/unregistered-scene-ui-requirements.md`
- the theme-setting document whose filename starts with `docs/` and contains the Chinese project-setting title, for terminology awareness only
- `content/novelty-claims.json`
- `content/cases`
- `content/experimental`
- `packages/domain/src`
- `packages/schema/src`
- `packages/solver/src`
- `packages/proof/src`
- `packages/authoring/src`
- `packages/generator/src`
- `apps/web/src/content`
- `apps/web/src/runtime`
- `apps/web/src/logic`
- `apps/web/src/view`
- `.codex/project-ops-workflow.json`
- `.codex/project-git-workflow.json`

## 2. Scope

Required deliverables:

- A final report at `docs/phase-25-authoring-editor-live-diagnostics-final-report.md`.
- A Phase 25 evidence folder under `docs/phase-25/`.
- A private authoring workbench design document at `docs/phase-25/authoring-workbench-design.md`.
- A reusable authoring diagnostics module, preferably under `packages/authoring/src`, that can evaluate an in-memory draft puzzle without depending on React or browser APIs.
- A maintainer-only editor route or mode inside `apps/web` that is not visible to ordinary players by default and does not ship as public UGC.
- Editing controls for at least:
  - board dimensions and cell facts;
  - initial observations / opening reveals;
  - target guest layout;
  - rules, including current global, local, region, line, anchor, overlap, comparative, and conditional rule families;
  - regions/scopes used by rules;
  - title, case name, difficulty metadata, tags, and player-facing rule copy.
- Live diagnostics for at least:
  - schema validity and semantic diagnostics;
  - target satisfies rules;
  - initial satisfiability;
  - final guest-layout uniqueness;
  - no-guess / human explainability;
  - proof waves, deduction count, technique IDs, and explanation gaps;
  - candidate guest-layout count and truncation status;
  - rule contribution and redundant-rule suspects;
  - degeneracy gates, including singleton scope, direct giveaway, near giveaway, same-scope comparison, and rule-family diversity;
  - effective board / irrelevant cells;
  - clone-risk signals based on existing anti-clone fingerprints and novelty claims;
  - difficulty bucket signals with an explicit "uncalibrated" warning;
  - copy warnings for terms that rely on highlights or abstract/internal labels.
- Import and export workflows:
  - import existing shipped and experimental JSON cases;
  - export a draft as JSON text or a downloaded file;
  - run authoring report on the exported draft;
  - keep exported experimental drafts out of the player selector unless deliberately promoted later.
- A small curated bad-case corpus or fixtures that demonstrate the workbench catches the user-identified problems:
  - mirror/padding clones;
  - one-rule solutions;
  - singleton sightline/edge giveaways;
  - fixed region rules that simply reveal safe cells;
  - rules whose membership can only be understood from highlight;
  - R3/R4-style overlap where machine metrics miss player-perceived redundancy.
- Focused unit tests for diagnostics and editor state transforms.
- Web tests or smoke checks proving the private workbench can load a case, edit a draft, show diagnostics, and export without affecting the player selector.
- Local smoke and online deployment evidence if web runtime files change.

Allowed planner choices:

- The workbench may live under a hash route, query flag, or developer-only UI entry. Prefer a route or flag that keeps the normal player path clean.
- Use text inputs, JSON editors, small form controls, and board interactions conservatively. The first version should optimize authoring clarity over visual polish.
- The workbench may use existing package APIs synchronously at first. Add workers only if the implementation needs cancellation/stale-result handling for responsiveness.
- Do not require perfect WYSIWYG rule authoring in the first release; structured editors plus raw JSON fallback are acceptable if diagnostics stay reliable.

## 3. Non-Scope

Do not implement these in Phase 25:

- Public editor, UGC upload/share, backend storage, accounts, cloud sync, analytics, leaderboard, daily challenge, PWA/offline authoring, GitHub Release/tagging, or server-signed content.
- Broad visual/theme/VN implementation, dialogue system, character portraits, or art pipeline integration.
- Bulk production of 20+ new cases or 10 super-hard cases.
- Fabricated playtest feedback or public difficulty calibration.
- Weakening solver/proof/schema correctness to make drafts appear valid.
- Promoting generated or experimental cases that fail Phase 23/24 gates.
- Breaking Puzzle Schema v1 compatibility for existing accepted cases without an explicit migration and full backward-compatibility tests.
- Player-facing solver internals, target layout, forced-cell/candidate diagnostics, generator diagnostics, or anti-clone internals in the normal play mode.
- Replacing the private authoring CLI; the workbench should reuse and complement it.

## 4. Architecture Principles

- `packages/authoring` is the source of truth for authoring diagnostics. `apps/web` may render diagnostics but must not duplicate solver/proof/quality-gate logic.
- `packages/domain` remains framework-free and must not import schema, solver, proof, authoring, React, Vite, browser, or filesystem APIs.
- `packages/schema` owns parse and semantic diagnostics, not UI state.
- `packages/solver` and `packages/proof` remain runtime reasoning engines, not editor state stores.
- Editor draft state should be serializable and testable without the DOM.
- Workbench diagnostics must distinguish "invalid draft", "valid but unsatisfiable", "valid but not unique", "valid but not human-explainable", "valid but degenerate", and "valid but uncalibrated".
- All diagnostics must be honest: a warning may be noisy, but it must not claim a high-quality puzzle when evidence is weak.
- UI copy should use plain Chinese and avoid internal terms such as `anchor`, `target-4`, `scopeOverlapCount`, or raw proof IDs in maintainer-facing summaries unless inside an explicit technical inspector.

## 5. Fixed Per-Round Workflow

At the start of every round:

1. Read this guide and `Role.md`.
2. Run `git status --short --branch`.
3. Choose one narrow round goal from the round plan.
4. Leave unrelated user/planner files untouched, including the existing untracked docs unless the guide explicitly requires reading them.

During implementation:

1. Implement vertical slices: diagnostics contract first, then draft model, then editor shell, then individual controls, then import/export, then smoke/evidence.
2. Keep the player-facing app stable at every step.
3. Add tests near the layer being changed.
4. If an editor interaction would require a broad redesign, record a limitation and provide a simpler structured control.
5. If diagnostics are too slow, add bounded/capped reporting and stale-result handling instead of hiding truncation.

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

## 6. Commit And Push Workflow

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

Focused validation expected during Phase 25:

```powershell
pnpm --filter @room-axioms/authoring test
pnpm --filter @room-axioms/web test -- src/content/caseVerification.test.ts src/content/runtimeSmoke.test.ts
pnpm --filter @room-axioms/web typecheck
```

Run local smoke when web runtime or routing changes:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

Do not stage unrelated untracked files.

## 7. Round Plan

Rounds 1-2: Baseline and workbench design

- Audit current authoring CLI, quality gates, runtime analyzer, case loading, and web state boundaries.
- Write `docs/phase-25/authoring-workbench-design.md`.
- Define the private route/mode and editor architecture.

Rounds 3-5: Diagnostics contract

- Add an in-memory authoring diagnostics API in `packages/authoring`.
- Include correctness, proof, degeneracy, anti-clone, copy-warning, and difficulty signals.
- Add fixtures for valid, invalid, degenerate, clone-like, and copy-problem drafts.

Rounds 6-8: Draft model and import/export

- Define serializable editor draft state and conversion to/from Puzzle Schema v1 JSON.
- Support importing shipped/experimental cases.
- Support exporting draft JSON without touching `content/cases`.

Rounds 9-11: Private workbench shell

- Add the private web entry, route, or flag.
- Build editor layout with case import, board preview, rule list, diagnostics panel, and export panel.
- Ensure normal player selector and default case remain unchanged.

Rounds 12-13: Board and observation editing

- Implement board dimensions/cell facts, target guests, and initial observation controls.
- Add validation for unsafe transitions and stale diagnostics.

Rounds 14-16: Rule and scope editing

- Implement structured editing for core rule families, including region/line/anchor/overlap/comparative/conditional rules.
- Provide raw JSON fallback for unsupported fields.
- Keep rule copy plain and warn on abstract/internal labels.

Rounds 17-20: Live diagnostics UX

- Show grouped status: blocking errors, correctness, human proof, degeneracy, clone risk, difficulty, copy warnings, and performance/truncation.
- Make diagnostics update from draft edits with request state, stale-result handling, and caps.
- Add tests for failure, empty, stale, and truncation states.

Rounds 21-22: Bad-case corpus and real-case QA

- Add private bad-case fixtures or docs showing the workbench catches known failure modes.
- Run the workbench diagnostics against case-004, case-011, case-012, case-021, and representative rejected/experimental cases.

Rounds 23-24: Authoring trial

- Use the workbench to attempt one repaired or new experimental draft.
- Do not promote it unless it passes gates and is genuinely stronger.
- Record what the workbench made easier or still failed to reveal.

Rounds 25-27: Buffer and hardening

- Fix editor state bugs, copy issues, performance caps, or smoke failures.
- Improve tests and docs.
- Keep scope from expanding into public UGC or broad visual redesign.

Round 28: Final validation and report

- Run full validation, focused tests, local smoke, Pages evidence if web changed, boundary scans, and final report.
- Produce `docs/phase-25-authoring-editor-live-diagnostics-final-report.md`.

## 8. PASS Criteria

Phase 25 passes only if all are true:

- Final report exists at `docs/phase-25-authoring-editor-live-diagnostics-final-report.md`.
- Private workbench route/mode exists and is not exposed as a public UGC/editor feature in normal player flow.
- Authoring diagnostics API can evaluate in-memory drafts without React/browser dependencies.
- Workbench can import an existing case, edit at least board facts, observations, rules/scopes, metadata/copy, and export JSON.
- Live diagnostics show schema, satisfiability, uniqueness, no-guess/proof, degeneracy, clone-risk, rule contribution, copy-warning, difficulty, and truncation/cap signals.
- Workbench catches the known failure modes from user feedback: clone/padding, one-rule solution, singleton giveaway, highlight-dependent region semantics, and player-perceived redundant rules where possible.
- Existing player selector, default case, and shipped cases remain stable unless a deliberate gated content change is separately justified.
- Existing package boundaries remain clean.
- Full validation passes: lint, typecheck, test, build, and `git diff --check`.
- Local smoke passes if web runtime/routing changes.
- Pages deployment evidence is recorded after final push if the web app changed.

Accepted blocker condition:

- If the workbench is implemented and validated but still cannot automatically grade subjective fun/novelty, Phase 25 may pass with a documented limitation as long as the tool makes that uncertainty visible rather than hiding it.

## 9. Final Report Template

Create `docs/phase-25-authoring-editor-live-diagnostics-final-report.md` with:

```markdown
# Phase 25 Authoring Editor And Live Diagnostics Final Report

Status: READY_FOR_CHECK or READY_FOR_CHECK_WITH_BLOCKER
Guide: docs/phase-25-authoring-editor-live-diagnostics-goal-mode-execution-guide.md
Final commit: <hash>

## Summary
## Implemented Workbench Surface
## Diagnostics API
## Import / Export Workflow
## Known Bad-Case Coverage
## Real Case QA
## Validation Evidence
## Smoke / Pages Evidence
## Boundary Scans
## Blockers Or Caveats
## PASS Criteria Matrix
```

Report honestly if a diagnostic remains heuristic, noisy, or subjective.
