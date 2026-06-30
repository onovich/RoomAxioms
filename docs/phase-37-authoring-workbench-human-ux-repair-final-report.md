# Phase 37 Final Report - Authoring Workbench Human UX Repair

Status: READY_FOR_CHECK_WITH_BLOCKER
Branch: main / origin/main
Planner thread: 019ef0df-a626-7181-9ca6-1cc75c1f4c47

## Summary

Phase 37 repaired the private authoring workbench toward a human puzzle-design editor. The normal flow now uses explicit map buttons, a wider side-aligned layout, one case-title field, an object dropdown with object-manager path, one editable rule-card list, rule create/edit dialog flow, selected-rule board preview, and plainer diagnostics copy.

No shipped puzzle content was promoted, removed, or changed. Normal player routes remain untouched.

## Final Commits

- `6f94651` docs: plan Phase 37 workbench repair
- `7daa895` fix: repair workbench layout metadata and diagnostics copy
- `aef93ea` feat: add workbench object dropdown manager
- `9fe2525` feat: consolidate workbench rule editing
- `cdd27f4` fix: simplify workbench diagnostics copy
- final docs commit: this report update

## Layout And Contrast

- Workbench shell now uses the available page width instead of staying narrowly centered.
- Side columns are fixed tool-width ranges and the board column gets the remaining space.
- Case-library selected states, disabled buttons, and diagnostic details use higher-contrast colors instead of blue-on-gray surfaces.
- The layout remains dense and tool-like.

## Map Actions

The normal toolbar exposes explicit map actions:

- `新建地图`
- `保存地图`
- `发布地图`
- `撤回发布`
- `重新加载`
- `删除地图`

No status dropdown is used for map state changes.

## Case Metadata

- Normal UI now has one `案件标题` field.
- Saving syncs that title into both `title` and `caseName`.
- Manual tag editing and status dropdown are removed from the normal UI.
- Existing tags/status are preserved internally to avoid corrupting legacy schema data.

## Object Editing And Manager

- Selected-cell editing now uses a single `格子内容` dropdown.
- The dropdown includes `管理物体...`.
- The object manager lists built-in object definitions and supports display-name rename.
- The object manager can create/delete local object definitions with guardrails.
- Important correction from user feedback: the UI no longer claims custom objects are only notes or cannot be used by rules. The product direction is that rules should apply to any defined object.

## Object Semantics Blocker

The remaining blocker is architectural, not copy-only:

- Current checked-in schema/solver/proof compatibility still compiles puzzle targets and rule targets through legacy `CellKind` / `allowedKinds`.
- Newly defined arbitrary objects are not yet fully persisted into Puzzle Schema v1 or accepted by solver/proof rule targets.
- Therefore, arbitrary object rule semantics are not honestly complete in Phase 37.

Recommended follow-up: a focused object-schema/rule-target migration phase that changes the source-of-truth puzzle model from fixed `CellKind` targets to object definitions usable by schema, solver, proof, diagnostics, and the workbench.

## Rule Editing

- The duplicate player-style read-only rule list was removed from the normal workbench.
- The detailed edit-card list is now the only normal rule list.
- Rule cards support:
  - select;
  - edit;
  - copy;
  - delete;
  - move up;
  - move down.
- `新建规则` opens a dialog with supported templates.
- Edit opens a dialog reusing the existing structured rule controls and rule-copy editor.
- Unsupported legacy forms are described plainly and do not expose raw generated-region/schema/proof text in the normal list.

## Rule Scope Preview

Selecting a rule now computes a preview cell set where the rule has materializable scope:

- global rules preview the whole board;
- for-each rules preview subject cells plus their local scope;
- region rules preview region cells;
- line/ray rules preview materialized line cells;
- overlap/comparative/conditional count rules preview their referenced scopes.

Rules that do not have a safe materialized scope show no board preview rather than leaking solver/proof internals.

## Diagnostics Cleanup

- Low-level diagnostic caps are behind `高级诊断范围`.
- Caps are renamed in plain Chinese:
  - `求解器尝试次数`
  - `可能现场数量`
  - `可能异常区域分布`
  - `剩余候选答案`
- Overview details no longer expose final answer coordinates, raw caps strings, nodes, or propagation counts.
- Diagnostic item codes and refs are hidden behind `技术细节`.
- Overflow copy no longer tells normal authors to export JSON or use CLI.

## Validation

Per-round commit wrapper validation passed for all implementation checkpoints:

- `CommitAndPush.cmd -Message "docs: plan Phase 37 workbench repair" ...`: PASS
- `CommitAndPush.cmd -Message "fix: repair workbench layout metadata and diagnostics copy" ...`: PASS
- `CommitAndPush.cmd -Message "feat: add workbench object dropdown manager" ...`: PASS
- `CommitAndPush.cmd -Message "feat: consolidate workbench rule editing" ...`: PASS
- `CommitAndPush.cmd -Message "fix: simplify workbench diagnostics copy" ...`: PASS

Focused validation:

- `pnpm --filter @room-axioms/web typecheck`: PASS
- `pnpm --filter @room-axioms/web test -- src/workbench/AuthoringWorkbenchScreen.test.tsx`: PASS
- `pnpm --filter @room-axioms/web test -- src/workbench/workbench.test.ts src/workbench/AuthoringWorkbenchScreen.test.tsx`: PASS
- `git diff --check`: PASS

Smoke:

- `StartDevServer.cmd`: PASS
- `Smoke.cmd`: PASS
- `StopDevServer.cmd`: PASS

Browser automation:

- Attempted Playwright DOM smoke against `http://127.0.0.1:5173/RoomAxioms/#authoring-workbench`.
- Browser automation unavailable because the local Playwright browser executable is not installed.
- Deterministic fallback used: React static DOM tests, project smoke HTTP checks, and boundary scans.

## Boundary Scans

- `git diff --name-only 77c50f0..HEAD -- content/cases apps/web/src/content`: no output; no shipped content or player selector changes.
- `git grep -n -E "@room-axioms/(authoring|generator)|workbench" -- apps/web/src/view apps/web/src/hooks apps/web/src/logic apps/web/src/runtime apps/web/src/vn apps/web/src/theme`: no output; normal player routes did not gain workbench/debug imports.
- Normal workbench scan found no old duplicate `workbench-rule-card` list.
- Normal workbench scan found no old object copy saying custom objects are only notes or cannot be used in rules.
- Normal workbench scan found no normal metadata controls for manual tags/status/caseName.
- Normal workbench scan found no first-screen low-level `节点`, `模型`, or `候选计数` labels.
- Known unrelated untracked docs/images were left untouched.

## Blockers / Caveats

- BLOCKER: arbitrary object rule semantics are not complete. The UI copy now follows the product direction, but current schema/solver/proof compatibility still needs an object-model migration before any object can be used honestly in rules.
- Browser automation could not run because Playwright browsers are missing locally. Project smoke and static DOM tests passed.

## Recommended Next Phase

Run a focused object model migration phase: make object definitions a first-class puzzle schema concept and allow rule targets to reference arbitrary object ids across schema, solver, proof, diagnostics, and the workbench.
