# Phase 32 Theme VN Runtime Foundation Goal Mode Execution Guide

Date: 2026-06-28
Status: executor-facing Phase 32 development guide
Round budget: 24 executor rounds

## 0. Direct Goal Prompt For Executor

You are the executor for `D:\WebProjects\RoomAxioms`.

Execute Phase 32: Theme VN Runtime Foundation.

Read this guide fully before changing files. This phase follows the Phase 31
rule-expression builder and theme packaging work. Its job is to build a safe,
asset-ready presentation foundation for the "Unregistered Scene" wrapper and a
visual-novel dialogue runtime. It must not change puzzle mechanics, promote new
cases, or pretend final art is complete before the user provides original art
and design references.

Primary goal:

- Add a browser-safe theme/VN runtime foundation: dialogue data contracts,
  dialogue renderer shell, trigger integration, asset manifest handling, and
  secrecy tests.
- Keep the system ready for user-provided original art: character portraits,
  expression variants, board treatment, icons, dialogue box, and background
  assets should be referenced through manifest keys and placeholder-safe
  fallbacks.
- Start a careful terminology/presentation pass only where the text is already
  user-approved and does not affect rule semantics or puzzle answers.

Return to the planner/checker thread after completion with a final report.

## 1. Required Reading

- `README.md`
- `docs/development-plan.md`
- `docs/phase-31-rule-expression-builder-theme-packaging-final-report.md`
- `docs/phase-31/theme-packaging-workflow.md`
- `docs/unregistered-scene-ui-requirements.md` if present
- `docs/未登记现场_项目设定与玩法对接文档.md` if present
- `apps/web/src` player runtime, view, and workbench route boundaries
- `packages/authoring/src/themePackage.ts`
- Existing hint, conclusion, failure, and success UI code

The two untracked theme/context docs may be read as context. Do not stage them
unless the user explicitly asks.

## 2. Binding Product Decisions

- The core puzzle remains Room Axioms mechanically: public fixed rules, fixed
  hidden cells, safe investigations, anomaly marking, proof-backed hints, and
  unique final guest layout.
- The theme wrapper is "未登记现场": an insurance/anomaly scene investigation
  framing.
- Narrative, portraits, sound, background, and UI styling must never reveal
  hidden cell contents, anomaly coordinates, solver candidates, forced cells,
  proof internals, or target answers.
- Failure presentation must not identify which submitted cell was wrong unless
  existing player-facing logic already reveals that.
- Hint dialogue may wrap an existing proof-backed hint, but may not invent a
  hint or jump beyond the proof result.
- The visual style should be asset-ready, not final. Use placeholder-safe
  rendering and manifest keys until the user provides original art.
- Do not run AI bulk puzzle generation. Manual puzzle authoring remains the
  content-production path.

## 3. Scope

### Theme Asset Manifest

Add an asset manifest layer for presentation assets:

- character portrait ids and expressions;
- background ids;
- dialogue box/frame ids;
- board/cell/icon theme ids;
- source/status metadata such as `missing`, `placeholder`, `userProvided`, or
  `approved`;
- browser-safe lookup helpers that return placeholder-safe fallbacks.

The manifest may live in `apps/web/src/theme` or a browser-safe package/module.
It must not depend on filesystem APIs.

### VN Dialogue Data

Add dialogue scene contracts and sample non-final scenes:

- `caseIntro`
- `firstRuleSelect`
- `firstSafeInspect`
- `firstAnomalyMark`
- `hint`
- `failure`
- `success`

Dialogue scene data must be presentation-only. It must not mutate puzzle,
rules, observations, marks, target, candidates, solver state, or proof state.

### VN Dialogue Renderer

Add a reusable visual-novel dialogue overlay:

- speaker name;
- dialogue text;
- optional left/right/center portrait slot;
- expression key;
- background key;
- click/Enter/Space to advance;
- skip/close affordance;
- optional log if low risk;
- accessible labels and focus behavior;
- mobile layout that does not make text unreadable.

No final half-body art is required in this phase. Missing assets should render
as restrained placeholders or be omitted cleanly.

### Trigger Integration

Integrate dialogue triggers conservatively:

- case intro may appear once per case load if enabled;
- first rule select, first safe inspect, and first anomaly mark may be tracked
  as tutorial triggers;
- hint dialogue must wrap existing hint result after the hint is available;
- failure and success dialogue may wrap existing modal/result flows without
  weakening secrecy.

The player must remain able to play without dialogue deadlocks. Dialogue state
must be reset correctly when switching cases or resetting the case.

### Secrecy And QA

Add tests and scans for:

- forbidden leakage terms in dialogue data;
- target coordinates or target answer facts in normal dialogue data;
- solver/proof/candidate/forced-cell internals;
- failure text that exposes exact wrong cells;
- hint dialogue requiring an existing proof-backed hint payload.

## 4. Non-Scope

- No final art import unless the user provides approved assets during the phase.
- No generated AI art.
- No broad visual redesign claiming final theme completion.
- No new puzzles or promoted cases.
- No public UGC/editor/backend/analytics/daily challenge/cloud save.
- No mechanics, schema, solver, proof, no-guess, uniqueness, anti-clone, or
  degeneracy changes unless needed only for tests around presentation secrecy.
- No narrative text that serves as an extra clue.

## 5. Architecture Boundaries

- Dialogue and theme modules are presentation-only.
- Hints remain owned by the existing proof-backed hint pipeline.
- Workbench/authoring helpers may validate theme package metadata, but player
  runtime must not import Node-only authoring CLI code.
- Player route must not import generator internals.
- Target reads remain limited to existing verification, conclusion checking,
  test, and explicit developer-only boundaries.
- The normal player route can include the dialogue renderer only if secrecy,
  accessibility, reset, skip, and smoke tests are in place.

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

Rounds 1-3: inventory and foundation contract

- Map current player UI places for intro, hint, success, failure, and tutorial
  triggers.
- Define theme asset manifest and VN scene contracts.
- Add docs under `docs/phase-32/` for runtime foundation, asset manifest, and
  secrecy rules.

Rounds 4-7: theme asset manifest and checks

- Implement browser-safe manifest types/helpers.
- Add placeholder-safe fallback behavior.
- Add tests for missing/placeholder/user-provided status.
- Extend authoring-side theme package checks only if browser-safe boundaries
  remain clean.

Rounds 8-13: dialogue data and renderer

- Implement dialogue scene data fixtures with non-final copy.
- Implement dialogue overlay renderer with keyboard/click advance, skip/close,
  focus behavior, and mobile-safe layout.
- Add unit/component tests where the current test stack supports it.

Rounds 14-17: trigger integration

- Wire case intro and first-interaction tutorial triggers.
- Wire hint dialogue to existing proof-backed hint payloads.
- Wire failure/success dialogue wrappers without answer leakage.
- Reset dialogue state on case switch/reset.

Rounds 18-19: terminology and presentation pass

- Apply safe, user-approved theme terminology to headings/labels where low
  risk.
- Do not rewrite generated rule logic unless it passes existing rule text
  generation tests.
- Keep developer/workbench terminology clear and not over-themed.

Rounds 20-22: smoke, accessibility, responsive, and secrecy hardening

- Browser smoke for desktop and mobile.
- Console-error scan.
- Keyboard flow through dialogue and back to board.
- Player secrecy tests for dialogue/hint/failure/success.

Rounds 23-24: buffer and final report

- Use round 23 for final fixes if needed.
- Round 24 runs full validation, smoke, boundary scans, final report, commit,
  and push.

## 8. Debug Self-Check

Each round must ask:

- Can a player understand or skip the dialogue without losing required puzzle
  information?
- Does the dialogue have a clean empty/missing-asset state?
- Does every trigger reset correctly on case switch and reset?
- Does hint dialogue wait for an existing proof-backed hint?
- Can any dialogue, portrait, background, or sound cue be used to infer an
  anomaly coordinate?
- If UI changed, is there repeatable smoke or test coverage?

## 9. Architecture Self-Check

Each round must ask:

- Did presentation code avoid mutating puzzle, solver, proof, target, or marks
  outside existing player interactions?
- Did theme/VN code avoid importing generator or Node-only authoring internals?
- Did player route secrecy remain intact?
- Did the phase avoid final-art claims without approved assets?
- Were unrelated untracked docs and user changes left alone?

## 10. Validation Matrix

Required by final report:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `git diff --check`
- Focused theme/VN tests.
- Focused player runtime tests for hint/failure/success secrecy.
- Local `StartDevServer.cmd`, `Smoke.cmd`, and `StopDevServer.cmd`.
- Browser smoke for normal player route on desktop and mobile if tooling is
  available; otherwise document the deterministic fallback.
- Boundary scan proving no generator imports, no Node-only authoring CLI imports
  in player runtime, and no target/candidate/forced leakage in dialogue data.

Use project wrappers where appropriate:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

## 11. PASS Criteria

- Theme asset manifest exists with placeholder-safe fallback behavior.
- VN dialogue scene contract exists and includes non-final sample scenes for
  the required trigger categories.
- Dialogue renderer supports text, speaker, optional portraits/background keys,
  advance, skip/close, focus behavior, and mobile-safe layout.
- Trigger integration covers at least case intro, one first-interaction tutorial,
  hint wrapper, success wrapper, and failure wrapper.
- Dialogue and theme code are covered by secrecy tests.
- No dialogue text or asset key leaks target coordinates, hidden object kinds,
  candidates, forced cells, proof internals, or answer facts.
- Hints remain proof-backed.
- No new cases are promoted.
- No final visual redesign is claimed without user-provided approved art.
- Full validation and local smoke pass.
- Final report exists and is pushed.

## 12. Final Report Template

Create:

`docs/phase-32-theme-vn-runtime-foundation-final-report.md`

Include:

- final status;
- final commit;
- implemented manifest/dialogue/runtime features;
- trigger coverage;
- secrecy test evidence;
- accessibility/responsive/smoke evidence;
- validation commands and results;
- boundary scans;
- known art placeholders and asset gaps;
- whether Phase 33 should prioritize importing user-provided art, visual polish,
  dialogue content expansion, or manual puzzle QA.
