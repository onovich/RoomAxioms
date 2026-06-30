# Phase 37 Final Report - Authoring Workbench Human UX Repair

Status: READY_FOR_CHECK_WITH_BLOCKER
Branch: main / origin/main
Planner thread: 019ef0df-a626-7181-9ca6-1cc75c1f4c47

## Summary

Phase 37 repaired the private authoring workbench toward a human puzzle-design editor. The normal flow now uses explicit map buttons, a wider side-aligned layout, one case-title field, an object dropdown with object-manager path, one editable rule-card list, rule create/edit dialog flow, selected-rule board preview, and plainer diagnostics copy.

No shipped puzzle content was promoted, removed, or changed. Normal player routes remain untouched.

Checker repair update: the residual normal rule-card support labels `结构化编辑` and `只读保留` were removed from the rendered workbench UI. Editable rules no longer show a support badge, because the edit button already communicates that action. Unsupported legacy rules use the plain limitation copy `暂不能编辑这种定则`.

Contrast repair update: the normal workbench CSS was re-audited after checker feedback. The workbench no longer uses the old blue `info` tokens or the known low-contrast blue foreground values on normal workbench surfaces.

Post-acceptance repair update: user review revoked the earlier Phase 37 acceptance. The latest repair covers five visible blockers together: actual rendered contrast, diagnostics responsiveness, board/layout priority, rule-card density and duplicate rule text, and empty-cell labeling.

Information-architecture repair update: checker recheck found remaining normal-UI structure issues after `abdb635`. The latest repair keeps the visual/diagnostic fixes and additionally removes the global map-action toolbar, moves `新建地图` into the Library header, moves save/delete/reload/publish/retract into the Board header, moves title/difficulty into the top title area, removes the standalone `案件信息` / notes form, removes the long Library explanatory note, removes normal `Schema OK`, removes the normal `开发者调试` module, and removes the rule-list explanatory hint.

Diagnostics performance repair update: user testing found that diagnostics could still sit at 0% for minutes even when only one lightweight option such as copy clarity was selected. The root cause was architectural: the workbench UI filtered the final display by selected options, but the worker always ran the full `evaluateWorkbenchDiagnostics` suite first. The latest repair passes selected diagnostic ids into the browser worker and authoring package, so lightweight checks such as copy clarity and degeneracy no longer trigger the full solver/proof/anti-clone pipeline. Heavy checks still run in the worker, while future solver-level optimization should follow the research-thread recommendation: frontier/component decomposition, cached materialized constraints, incremental proof prefixes, and separate fast/normal/full diagnostic tiers.

## Final Commits

- `6f94651` docs: plan Phase 37 workbench repair
- `7daa895` fix: repair workbench layout metadata and diagnostics copy
- `aef93ea` feat: add workbench object dropdown manager
- `9fe2525` feat: consolidate workbench rule editing
- `cdd27f4` fix: simplify workbench diagnostics copy
- final docs commit: this report update
- final checker repair commit: this report update removes residual internal rule-card labels
- final information-architecture repair commit: this report update

## Layout And Contrast

- Workbench shell now uses the available page width instead of staying narrowly centered.
- Side columns are fixed tool-width ranges and the board column gets the remaining space.
- Case-library selected states, disabled buttons, and diagnostic details use higher-contrast colors instead of blue-on-gray surfaces.
- The layout remains dense and tool-like.
- Re-audited normal workbench surfaces include object labels in cells, case library notes/items/statuses, copy-as-draft status copy, selected/revealed cells, rule-card labels/actions/selected states, metadata and rule-edit labels, diagnostic status/progress/overview/groups/details, and legacy rule-card fallback styles.
- Replaced workbench blue foreground/status usage with workbench-local tokens:
  - `--workbench-ink: #f4efe3`
  - `--workbench-muted: #c9c7bc`
  - `--workbench-faint: #9da49f`
  - `--workbench-note: #f0d9a2`
  - `--workbench-note-soft: #332b1d`
  - `--workbench-note-border: #9f7c3a`
  - `--workbench-selected: #2f3324`
  - `--workbench-selected-border: #b8c27a`
- Removed normal workbench use of old low-contrast blue tokens and values including `var(--info)`, `var(--info-soft)`, `#173042`, `#5885a6`, `#dcefff`, `#3a5d78`, `#c6dbec`, `#101719`, `#4f7895`, `#e5f5ff`, and `#243238`.

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
- Editable rule cards do not show an internal support badge.
- Unsupported rule cards use `暂不能编辑这种定则` instead of `只读保留`.
- Focused tests assert the normal rendered workbench HTML does not contain `结构化编辑` or `只读保留`.
- Focused tests assert the `.authoring-workbench` CSS section does not use the old low-contrast blue workbench tokens or known blue foreground/status colors.

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

## Post-Acceptance Repair Evidence

This repair addresses the user-reported Phase 37 acceptance blockers:

- Visible contrast:
  - `.authoring-workbench` now sets the normal foreground to `--workbench-ink` instead of inheriting the app body's dark scene ink.
  - Explicit high-contrast foregrounds were added for case-library buttons, `复制当前为草稿`, board content labels, selected/revealed/anomaly cell text, workbench status values, diagnostics cards/controls, and rule-card actions.
  - System Edge computed-style audit confirmed representative values: `复制当前为草稿` `rgb(244, 239, 227)`, board cell `空地` `rgb(244, 239, 227)`, initial label `rgb(240, 217, 162)`, status value `未修改` `rgb(244, 239, 227)`, and rule-card action icons `rgb(240, 238, 231)`.
- Diagnostics freeze:
  - The old async flow still made one large synchronous `evaluateWorkbenchDiagnostics(...)` call before meaningful yielding.
  - Browser diagnostics now run the core evaluation in `diagnosticsWorker.ts`; cancellation terminates the worker.
  - Production build emits a separate `diagnosticsWorker-*.js` asset.
  - Edge audit clicked `运行诊断`, observed `取消诊断` after 100 ms, confirmed it was enabled, clicked cancel, and saw the control return to `运行诊断`.
- Layout priority:
  - Diagnostics moved out of the permanent right sidebar into a compact top strip.
  - `诊断设置` and `诊断结果` are disclosure panels instead of a full sidebar.
  - The right sidebar now starts with rule editing.
  - The board uses a responsive max size derived from board width; the default 4x4 board rendered about `317 x 317` px and stayed within a 1440x1000 viewport.
  - Cell facts were made one-column compact below the board.
- Rule-card density and duplicate text:
  - Rule actions are a compact icon strip.
  - Edit is a pencil icon, not a large text button.
  - Normal cards show one primary generated rule sentence only and no longer render generated title plus generated flavor as two near-duplicate sentences.
- Cell content labeling:
  - Workbench board empty cells display `空地`.
  - Target/anomaly cells display `异常区域`.
  - Object cells continue to display labels such as `酒瓶`, `垃圾桶`, and `镜子`.
  - `无访客` is no longer used as a normal board content label.
- Remaining information architecture:
  - The top global map-action toolbar was removed as a map-control area.
  - Library header now owns `新建地图`; copy-current remains as a compact icon action next to it.
  - Board header now owns save, publish/retract, reload, and delete actions.
  - Title and difficulty now live in the top title area, with an edit button that opens compact title/difficulty controls.
  - The old `案件信息` section, notes field, Library explanatory note, normal `Schema OK`, normal `开发者调试`, raw JSON/debug export controls, and rule-list hint sentence are absent from normal workbench markup.

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
- Checker repair focused rerun `pnpm --filter @room-axioms/web test src/workbench/AuthoringWorkbenchScreen.test.tsx`: PASS, 1 file / 6 tests.
- Checker repair full `Validate.cmd`: PASS; lint PASS, typecheck PASS, tests PASS including authoring 13 files / 122 tests and web 24 files / 158 tests, build PASS.
- Post-acceptance focused checks:
  - `pnpm --filter @room-axioms/web typecheck`: PASS.
  - `pnpm --filter @room-axioms/web test src/workbench/AuthoringWorkbenchScreen.test.tsx src/workbench/asyncDiagnostics.test.ts src/workbench/workbenchContrast.test.js`: PASS, 3 files / 15 tests.
  - `pnpm --filter @room-axioms/web build`: PASS, including emitted `diagnosticsWorker-*.js`.
  - Final `Validate.cmd`: PASS; lint PASS, typecheck PASS, tests PASS including authoring 13 files / 122 tests and web 25 files / 163 tests, build PASS.
  - Information-architecture focused rerun `pnpm --filter @room-axioms/web typecheck`: PASS.
  - Information-architecture focused rerun `pnpm --filter @room-axioms/web test src/workbench/AuthoringWorkbenchScreen.test.tsx src/workbench/asyncDiagnostics.test.ts src/workbench/workbenchContrast.test.js`: PASS, 3 files / 16 tests.
  - Information-architecture full `Validate.cmd`: PASS; lint PASS, typecheck PASS, tests PASS including authoring 13 files / 122 tests and web 25 files / 164 tests, build PASS.
  - Diagnostics performance focused rerun `pnpm --filter @room-axioms/authoring typecheck`: PASS.
  - Diagnostics performance focused rerun `pnpm --filter @room-axioms/authoring test -- src/diagnostics.test.ts src/diagnosticsEntry.test.ts`: PASS, authoring suite 13 files / 124 tests.
  - Diagnostics performance focused rerun `pnpm --filter @room-axioms/web typecheck`: PASS.
  - Diagnostics performance focused rerun `pnpm --filter @room-axioms/web test -- src/workbench/asyncDiagnostics.test.ts`: PASS, web suite 25 files / 165 tests.
  - Diagnostics performance `git diff --check`: PASS.

Smoke:

- `StartDevServer.cmd`: PASS
- `Smoke.cmd`: PASS
- `StopDevServer.cmd`: PASS
- Checker repair smoke rerun after contrast repair:
  - `StartDevServer.cmd`: PASS, local dev server responded at `http://127.0.0.1:5173/RoomAxioms/`.
  - `Smoke.cmd`: PASS.
  - `StopDevServer.cmd`: PASS.
- Post-acceptance repair smoke:
  - `StartDevServer.cmd`: PASS, local dev server responded at `http://127.0.0.1:5173/RoomAxioms/`.
  - `Smoke.cmd`: PASS.
  - `StopDevServer.cmd`: PASS.
- Information-architecture repair smoke:
  - `StartDevServer.cmd`: PASS, local dev server responded at `http://127.0.0.1:5173/RoomAxioms/`.
  - `Smoke.cmd`: PASS.
  - `StopDevServer.cmd`: PASS.

Browser automation:

- Attempted Playwright DOM smoke against `http://127.0.0.1:5173/RoomAxioms/#authoring-workbench`.
- Browser automation unavailable because the local Playwright browser executable is not installed.
- Deterministic fallback used: React static DOM tests, project smoke HTTP checks, and boundary scans.
- Checker repair browser/screenshot attempt after contrast repair also failed for the same local environment reason: Playwright reported the Chromium headless shell executable missing under `C:\Users\Administrator\AppData\Local\ms-playwright\chromium_headless_shell-1200\...`.
- Deterministic contrast fallback is now stronger than before: the focused workbench test imports `App.css` as raw text and asserts the `.authoring-workbench` CSS section does not use the old low-contrast blue tokens or color values.
- Post-acceptance browser audit used the installed system Edge channel successfully after the default Playwright Chromium cache miss. It loaded `/RoomAxioms/#authoring-workbench`, emitted screenshot evidence during executor run, checked computed styles for user-reported surfaces, confirmed no `无访客` / `结构化编辑` / `只读保留` in rendered body text, confirmed the rule editor is the right panel, confirmed diagnostics are in the top strip, and confirmed run/cancel remains clickable while diagnostics are running.
- Final Edge rerun after the compact cell-editor CSS patch confirmed: `复制当前为草稿` renders `rgb(244, 239, 227)` on `rgb(21, 26, 26)`; the first empty cell label is `空地` with `rgb(244, 239, 227)`; `未修改` status value is `rgb(244, 239, 227)`; rule action buttons are `26 x 26` icon buttons; board rendered `317 x 317` px with bottom at `661` in a `1440 x 1000` viewport; the right rule panel starts at x `902`; diagnostics top strip height is `74`; the run button changed to enabled `取消诊断` after 100 ms and returned to `运行诊断` after cancel.
- Information-architecture Edge rerun confirmed: `.case-library-actions` contains `新建地图` and `复制当前为草稿`; `.board-actions` contains save, publish/retract, reload, and delete; `.workbench-title-row` contains title plus difficulty; `.top-actions` and `.metadata-editor` are absent; body text contains none of `Schema OK`, `开发者调试`, `案件信息`, the old rule-list hint, the old Library explanatory note, `备注`, `草稿 JSON`, `Rules JSON`, or `下载当前草稿`.

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
