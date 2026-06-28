# Phase 34 - Unregistered Scene Frontend Adaptation

Status: READY_FOR_EXECUTOR
Owner: executor
Planner thread: 019ef0df-a626-7181-9ca6-1cc75c1f4c47
Executor thread: 019ef271-256c-7be2-9663-e658e2378564
Round budget: 28 executor rounds

## Goal

Move the player-facing frontend from the abstract Room Axioms wrapper toward the approved `未登记现场 / UNREGISTERED SCENE` direction before final art slicing. This phase is a structure, terminology, component, CSS-token, manifest-slot, and responsive adaptation pass. It must make the app ready to receive final original art later without hard-pasting the sample image or changing puzzle mechanics.

The product direction is: paper accident/anomaly claim survey system, scene floorplan, record log, and partner review. The organization is `非常规赔案调查部 / Abnormal Claim Survey Division`. The player is an abnormal claim scene surveyor. Current internal puzzle semantics stay intact.

## Required Reading

Read these before implementation:

- `docs/ui-art-sample-frontend-adaptation-requirements.md`
- `docs/unregistered-scene-ui-requirements.md`
- `docs/未登记现场_项目设定与玩法对接文档.md`
- `docs/phase-31/theme-packaging-workflow.md`
- `docs/phase-32/asset-manifest-contract.md`
- `docs/phase-32/presentation-secrecy-rules.md`
- `docs/phase-33/vn-ux-contract.md`
- `docs/phase-33/asset-review-checklist.md`
- `images/samples/main-sample.png`
- `images/samples/30083e07-bdf2-4a00-9168-320b18109a96 (1).png`
- `images/samples/93d91dda-c153-438e-8916-6c90653a26a7.png`

Use `main-sample.png` as the primary visual direction. Use the Chinese/localization sample only for copy, button, shortcut, and local detail references. Use the third sample only for secondary texture/detail inspiration; do not override the primary direction's clear paper surface, blue/red accents, and line-art scene map.

## Product Decisions

- Player-facing title: `未登记现场`.
- English title: `UNREGISTERED SCENE`.
- Organization: `非常规赔案调查部 / Abnormal Claim Survey Division`.
- `guest` remains the internal/domain target kind, but player-facing copy must present it as `异常区域 / anomaly`.
- `rules` become `现场定则 / Scene Rules`.
- `board` becomes `现场平面图 / Scene Map`.
- `evidence/notes` become `现场登记记录 / Record Log`.
- `hint` becomes `搭档复核 / Partner Review`.
- `submit` becomes `提交现场登记图 / Submit Survey`.
- Current domain `CellKind` remains exactly `empty | bottle | bin | mirror | guest`.
- Sample-only objects such as emergency lights, bodies, cameras, terminals, closets, and stairwells are presentation or future-planning material only. Do not silently make them rule-bearing object kinds.

## Non-Scope

Do not implement:

- final art slicing or final asset import;
- AI-generated final art;
- hard-pasting the whole sample mockup as a background;
- new player-facing puzzle content or case promotion;
- schema/domain/solver/proof/oracle semantic changes;
- new rule-bearing cell kinds;
- public editor, UGC, backend, analytics, or daily challenge;
- broad puzzle authoring work;
- developer forced-cell, candidate, target, or proof-internal overlays in the normal player route.

## Implementation Scope

### 1. Theme Vocabulary And Copy Layer

Create or extend a presentation vocabulary layer so player-facing text can use the `未登记现场` terms without renaming domain concepts. Keep internal test/dev names stable where needed, but normal player surfaces must avoid `访客` for the hidden danger target and use `异常区域`.

Update visible labels for:

- brand and subtitle;
- case file metadata;
- scene map and coordinate language;
- scene rules;
- inspect/mark anomaly/mark safe actions;
- record log and player marks;
- partner review/hints;
- submit/reset actions;
- success/failure wording.

Rule text must remain generated from rule semantics, exact, and fair. Flavor text cannot carry hidden clues or replace logical wording.

### 2. Sample-Ready Layout Shell

Refactor or wrap the player view around stable scene layout classes:

- `scene-shell`
- `scene-topbar`
- `scene-brand`
- `scene-case-file`
- `scene-progress`
- `scene-actions`
- `scene-rules-panel`
- `scene-map-panel`
- `scene-record-panel`
- `scene-vn-dock`

The desktop layout should read as a paper survey workstation:

- topbar: brand, case file title/location, progress counters, partner review, reset;
- left: scene rules;
- center: scene map;
- right: record log, marks, submit;
- bottom or lower layer: partner review VN dock when active.

Add an inspection/progress counter that does not expose hidden target or forced-cell data. It may use revealed/inspected cells and player marks only.

### 3. CSS Token Layer

Add a `未登记现场` token layer without requiring final art:

```css
:root {
  --scene-paper: #f4ecdc;
  --scene-paper-aged: #eadfc9;
  --scene-ink: #0d2544;
  --scene-ink-soft: #49617a;
  --scene-red: #a83a33;
  --scene-green: #477d55;
  --scene-line: rgba(13, 37, 68, 0.72);
  --scene-faint-line: rgba(13, 37, 68, 0.28);
  --scene-shadow: rgba(13, 37, 68, 0.18);
}
```

Apply these through component CSS rather than one-off colors. The UI should work with placeholder textures disabled.

### 4. Scene Map Layering

Refactor the board rendering into explicit presentation layers:

- coordinate labels;
- floorplan base;
- decorative wall/door/stair/line layer;
- cell interaction hit targets;
- revealed object icon/label layer;
- player mark overlay;
- rule/hint highlight overlay;
- developer-only overlay, gated away from normal players.

Support rectangular boards from 3x3 through 6x6 without fixed pixel assumptions. The display mapping for current `CellKind` must be safe and theme-aware, but must not introduce new rule-bearing kinds.

### 5. Rule Cards And Mini Diagrams

Update rule cards to match the paper-file direction:

- two-digit or badge-like rule number;
- exact generated text;
- optional compact scope diagram slot based only on public rule semantics;
- optional count dots/glyphs when safe;
- clear selected state;
- no summary line that merely repeats the rule in unreadable fragments.

The mini diagram is a visualization of already-readable text, not an extra hidden clue.

### 6. Record Log And Submit Panel

Rework the right panel into:

- `现场登记记录`: revealed facts;
- `我的标注`: anomaly/safe marks;
- `提交现场登记图`: final submit action.

Wrong/incomplete submissions must not leak true answers. Maintain existing secrecy checks.

### 7. Partner Review VN Dock

Keep the Phase 32/33 full VN overlay for intro/outro and blocking scenes, but add or prepare an inline/docked partner review mode for gameplay hints and tutorial beats. It should feel like a partner review note rather than a modal interruption.

Requirements:

- no answer coordinates, target layout, candidate, forced-cell, or solver/proof internal leakage in dialogue or asset keys;
- hints still wrap proof-backed hint payloads only;
- respects VN preferences, reduced motion, text speed, replay, and focus return;
- mobile layout may collapse portraits or use compact text-only dock.

### 8. Asset Manifest Slots

Extend the theme asset manifest and review helpers for future art slots:

- `logoMark`
- `paperTexture`
- `panelFrame`
- `topbarFrame`
- `ruleCardFrame`
- `boardFrame`
- `boardGridTexture`
- `cellUnknownTexture`
- `cellMarkedAnomalyOverlay`
- `cellMarkedSafeOverlay`
- `scopeHighlightOverlay`
- `objectIcon`
- `characterPortrait`
- `characterExpression`
- `dialogueFrame`
- `buttonFrame`
- `background`

Use placeholder-safe fallbacks. Asset keys and file/class names must not encode answers or hidden mechanics.

### 9. Responsive Strategy

Desktop should show rules, map, and record panels together. Tablet may collapse side panels into tabs. Mobile should preserve a usable rules/map/record flow, hide or crop portraits when needed, and avoid horizontal overflow.

Validate at minimum:

- desktop around 1366x768 or 1440x900;
- tablet around 768x1024;
- mobile around 390x844.

## Round Plan

1. Read required docs/images, inventory current web structure, and create `docs/phase-34/implementation-notes.md`.
2. Define vocabulary/copy plan and secrecy scan plan.
3. Implement presentation vocabulary and update player-facing labels.
4. Add tests for vocabulary mapping, especially `guest` -> anomaly in player copy.
5. Introduce CSS tokens and base shell classes.
6. Refactor topbar/brand/case/progress/action layout.
7. Verify player flow still loads all shipped cases.
8. Refactor board into scene-map layers.
9. Add floorplan placeholder lines and safe theme object mapping.
10. Add board responsive sizing for 3x3 through 6x6.
11. Add map-layer tests and dev-overlay gating tests.
12. Update rule card structure and selected state.
13. Add mini diagram slots for supported public scopes.
14. Add rule-card tests ensuring diagrams do not add hidden information.
15. Rework record/log/marks/submit panel structure.
16. Recheck wrong/incomplete submission secrecy.
17. Add partner review VN dock data/rendering path.
18. Integrate dock into hint/tutorial flow without breaking full overlay scenes.
19. Add VN dock preference/focus/reduced-motion tests.
20. Extend theme asset manifest slots and review helpers.
21. Add manifest leakage tests for new slot names.
22. Desktop visual QA and CSS cleanup.
23. Tablet responsive QA and fixes.
24. Mobile responsive QA and fixes.
25. Browser/local smoke; capture evidence in `docs/phase-34/`.
26. Boundary scans for player route, asset keys, CSS classes, and dialogue text.
27. Full validation, build, and Pages smoke if shipped web files changed.
28. Final report, commit, push, and route back to planner/checker.

## Validation

Each meaningful implementation round must run focused tests for the touched package. The final round must run:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
git diff --check
```

If browser tooling is available, run a manual or automated smoke over desktop/tablet/mobile and record evidence. If browser binaries are missing, document the deterministic fallback and do not claim full browser coverage.

## Boundary Scans

Final report must include scans showing:

- no `@room-axioms/authoring` or `@room-axioms/generator` imports in the normal player route;
- no `content/experimental` imports in shipped player content;
- no answer coordinates, hidden target layout, candidate, forced-cell, or solver/proof internals in VN dialogue, asset manifest keys, CSS class names, theme docs used by runtime, or player copy;
- no new rule-bearing `CellKind` values;
- normal player route does not expose developer forced-cell overlays;
- rule text remains generated from logic and stays readable without relying on hover/highlight.

## PASS Criteria

Phase 34 passes when:

- the player-facing app presents as `未登记现场 / UNREGISTERED SCENE` using the approved terminology;
- current shipped cases remain selectable and playable;
- puzzle mechanics, schema, solver, oracle, proof, and content semantics are unchanged;
- `guest` is no longer presented to players as `访客` in normal gameplay and is mapped to `异常区域`;
- scene layout, CSS tokens, map layers, rule card mini diagram slots, record panel, partner review dock, and asset manifest slots exist with placeholder-safe behavior;
- desktop/tablet/mobile layouts have no obvious overflow or blocking overlap;
- player secrecy and developer overlay gating remain intact;
- full validation, smoke, and final push pass;
- a final report records evidence, caveats, and any art-intake follow-up tasks.

## Expected Follow-Up

After Phase 34, the likely follow-up is an art-intake replacement phase using approved sliced assets. A separate domain/schema expansion phase is needed only if the user decides that sample objects such as cameras, terminals, emergency lights, or bodies should become real rule-bearing puzzle objects.
