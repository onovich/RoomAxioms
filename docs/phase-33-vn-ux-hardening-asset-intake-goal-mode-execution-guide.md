# Phase 33 VN UX Hardening And Asset Intake Goal Mode Execution Guide

Date: 2026-06-28
Status: executor-facing Phase 33 development guide
Round budget: 20 executor rounds

## 0. Direct Goal Prompt For Executor

You are the executor for `D:\WebProjects\RoomAxioms`.

Execute Phase 33: VN UX Hardening And Asset Intake.

Read this guide fully before changing files. Phase 32 added a safe theme/VN
runtime foundation. Phase 33 must make that foundation comfortable for real
players and ready for user-provided original art, without claiming final art is
complete and without changing puzzle mechanics.

Primary goal:

- Harden the VN dialogue player experience: skip, close, replay, persistence,
  reduced-motion/text-speed controls, focus return, and repeat-trigger behavior.
- Create a practical asset intake kit so the user can hand over portraits,
  expressions, backgrounds, UI frames, board/cell treatments, and sounds using
  clear names, dimensions, statuses, and review steps.
- Add a private/maintainer asset and dialogue preview surface or equivalent
  review workflow so approved art and dialogue can be inspected before entering
  the normal player route.

Return to the planner/checker thread after completion with a final report.

## 1. Required Reading

- `README.md`
- `docs/development-plan.md`
- `docs/phase-32-theme-vn-runtime-foundation-final-report.md`
- `docs/phase-32-theme-vn-runtime-foundation-goal-mode-execution-guide.md`
- `docs/phase-31/theme-packaging-workflow.md`
- `docs/unregistered-scene-ui-requirements.md` if present
- `docs/未登记现场_项目设定与玩法对接文档.md` if present
- `apps/web/src/vn`
- `apps/web/src/theme`
- Current player app state around case load/reset, hint, failure, and success

The two untracked theme/context docs may be read as context. Do not stage them
unless the user explicitly asks.

## 2. Binding Product Decisions

- VN/theme remains presentation-only.
- Hints remain proof-backed.
- Narrative and assets must not leak hidden cell contents, anomaly coordinates,
  target answers, candidates, forced cells, solver internals, proof internals,
  or failure answer facts.
- No final visual polish should be claimed until the user provides original art
  and approves it.
- No AI art generation in this phase.
- No new cases, no bulk puzzle generation, no mechanics changes, no public UGC,
  no backend, and no analytics.

## 3. Scope

### Player VN UX

Harden the runtime UX:

- player-facing setting to enable/disable VN dialogue;
- persistent skip/reduced-motion/text-speed preferences where appropriate;
- replay current case intro from a safe menu/action;
- skip all current scene lines;
- close scene and return focus to the board or previous control;
- avoid replaying first-time tutorial triggers repeatedly after reset unless
  explicitly requested;
- ensure case switch/reset clears stale dialogue and trigger state;
- optional dialogue log if low risk and testable.

### Asset Intake Kit

Create practical handoff docs and machine-readable templates:

- asset folder/naming convention;
- required dimensions/aspect ratios;
- manifest fields and allowed statuses;
- portrait/expression/background/frame/icon/sound checklist;
- approval workflow from `missing` to `placeholder` to `userProvided` to
  `approved`;
- privacy/license/source fields;
- reviewer checklist for "safe for player route";
- examples using placeholders only.

Do not import final assets unless the user has provided and approved them.

### Private Preview / Review Workflow

Add one of the following, choosing the smallest clean path:

- private workbench-adjacent preview route, or
- private section inside the existing authoring workbench, or
- CLI/report preview artifact if a UI route is too costly.

The preview should let maintainers inspect:

- manifest entries and statuses;
- missing/placeholder assets;
- dialogue scenes by trigger;
- portrait/background/frame fallback behavior;
- secrecy scan results;
- mobile/desktop layout notes where feasible.

### Dialogue Copy QA

Improve non-final dialogue copy only where safe:

- make tutorial text less mechanical;
- keep all puzzle-useful conclusions delegated to existing hint payloads;
- keep failure copy non-specific;
- keep success copy celebratory but not answer-bearing beyond existing solved
  state.

## 4. Non-Scope

- No final art package.
- No generated AI art.
- No broad player UI redesign beyond VN/theme UX hardening.
- No new puzzles or promoted cases.
- No schema/solver/proof/no-guess/uniqueness/anti-clone changes.
- No public editor/UGC/backend/analytics/daily challenge/cloud save.
- No narrative branch choices affecting puzzle state.

## 5. Architecture Boundaries

- Theme/VN settings must be UI preferences only.
- Persistent preferences must not include puzzle answers, target cells, solver
  state, or proof internals.
- Preview/review tooling must stay private/maintainer-facing.
- Player route may use approved manifest/dialogue data, but not generator or
  Node-only authoring CLI internals.
- Asset manifest remains the source for presentation assets. Components should
  not hard-code final asset assumptions.

## 6. Per-Round Fixed Workflow

Every round response must include:

- Round goal
- Completed work
- Debug self-check
- Architecture self-check
- Validation commands and results
- Commit hash and push result
- Next round goal
- Whether a buffer round was consumed

Progression rules:

- If validation fails, do not commit, do not push, and do not start the next
  round.
- If commit fails, do not start the next round.
- If push fails, do not start the next round.
- Do not stage unrelated untracked files.

## 7. Round Plan

Rounds 1-2: inventory and UX contract

- Audit current VN trigger behavior in actual app state.
- Document the desired replay/skip/preferences/focus behavior under
  `docs/phase-33/`.

Rounds 3-6: player VN controls and persistence

- Add settings/preferences for VN enable, reduced motion, and text speed where
  feasible.
- Add skip/replay/close behavior and focus return.
- Ensure reset/case switch clears stale dialogue safely.
- Add tests for preference and trigger behavior.

Rounds 7-10: asset intake kit

- Add asset naming and manifest template docs.
- Add machine-readable placeholder manifest example if useful.
- Add validator or tests for status transitions and required fields.
- Add reviewer checklist for safe player-route approval.

Rounds 11-14: private preview/review surface

- Implement a private preview surface in the workbench or a similarly gated
  route/report.
- Show manifest status, missing placeholders, dialogue trigger list, selected
  scene preview, and leakage scan results.
- Keep it out of normal player route.

Rounds 15-17: dialogue copy and QA

- Polish safe non-final dialogue copy.
- Add secrecy tests for the polished copy.
- Add focused tests for hint/failure/success wrappers.

Rounds 18-19: responsive/accessibility/browser smoke

- Verify desktop and mobile layout.
- Verify keyboard flow and focus return.
- Attempt system browser or available browser smoke. If browser binaries remain
  unavailable, document the deterministic fallback.

Round 20: final validation and report

- Run full validation, local smoke, boundary scans, final report, commit, and
  push.

## 8. Debug Self-Check

Each round must ask:

- Can the player skip, close, or replay dialogue without breaking puzzle state?
- Does focus return somewhere sensible?
- Does reset/case switch clear stale dialogue?
- Are preferences harmless and free of puzzle facts?
- Can asset fallback render cleanly when files are missing?
- Can any text, asset key, or trigger timing leak answers?

## 9. Architecture Self-Check

Each round must ask:

- Did presentation code avoid mutating puzzle mechanics?
- Did private preview code stay out of normal player route?
- Did player runtime avoid generator and Node-only authoring imports?
- Did the asset manifest remain the asset source of truth?
- Did the phase avoid final-art claims without approved art?
- Were unrelated untracked docs and user changes left alone?

## 10. Validation Matrix

Required by final report:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `git diff --check`
- Focused VN settings/trigger tests.
- Focused asset manifest/intake tests.
- Focused preview/review tests if a UI preview is added.
- Local `StartDevServer.cmd`, `Smoke.cmd`, and `StopDevServer.cmd`.
- Browser smoke if available, otherwise documented deterministic fallback.
- Boundary scan for no generator imports, no Node-only authoring CLI imports in
  player route, and no answer leakage in dialogue/asset data.

Use project wrappers where appropriate:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

## 11. PASS Criteria

- VN dialogue can be disabled, skipped, and replayed through player-safe UI.
- Dialogue state resets cleanly on case switch/reset.
- Focus and keyboard behavior are covered by tests or smoke evidence.
- Asset intake kit exists and is specific enough for the user/art AI to supply
  portraits, expressions, backgrounds, frames, board/cell assets, and sounds.
- Private preview/review workflow exists or an explicit low-risk alternative is
  documented and tested.
- Dialogue copy and asset metadata pass secrecy scans.
- No final art or AI-generated art is introduced.
- No puzzle mechanics or cases are changed.
- Full validation and local smoke pass.
- Final report exists and is pushed.

## 12. Final Report Template

Create:

`docs/phase-33-vn-ux-hardening-asset-intake-final-report.md`

Include:

- final status;
- final commit;
- VN UX controls completed;
- preference/reset/focus evidence;
- asset intake deliverables;
- private preview/review deliverables;
- dialogue copy changes and secrecy evidence;
- validation commands and results;
- smoke/browser evidence;
- boundary scans;
- remaining asset gaps;
- recommended Phase 34: either user-art import/visual polish, manual puzzle QA,
  or further dialogue/content polish depending on available inputs.
