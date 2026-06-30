# Phase 37 - Authoring Workbench Human UX Repair

Date: 2026-06-30
Status: READY_FOR_EXECUTOR
Owner: executor
Planner thread: 019ef0df-a626-7181-9ca6-1cc75c1f4c47
Executor thread: 019ef271-256c-7be2-9663-e658e2378564
Round budget: 24 executor rounds

## 0. Direct Goal Prompt For Executor

Execute Phase 37 in goal mode. Repair the private authoring workbench so it feels like a human puzzle designer's editor rather than an exposed developer/debug surface.

The user's latest decision is binding: keep the current rule-card editing list shape from the detailed edit list, because it looks useful and understandable, but make it the only rule-list surface and give it complete edit/new/delete/preview behavior. Remove the duplicate player-style rule list from the editor workflow. Continue the Phase 36 editor direction: no normal JSON authoring, no Import-first workflow, no visible schema/generated-region/proof internals, and no broad puzzle production.

This phase is a UX repair phase. It is not a rule-semantics expansion phase, not final art slicing, not public UGC, and not a content-promotion phase.

## 1. Required Reading

- `docs/phase-36-authoring-workbench-ux-async-diagnostics-final-report.md`
- `docs/phase-36-authoring-workbench-ux-async-diagnostics-goal-mode-execution-guide.md`
- `docs/phase-35-rule-object-model-editor-vn-overlay-final-report.md`
- `docs/development-plan.md`

Also inspect the current workbench at:

- `http://127.0.0.1:5173/RoomAxioms/#authoring-workbench`

The user supplied three screenshots in the planner thread showing:

- low-contrast blue labels/buttons on dark gray panels;
- left/right layout wasting horizontal space;
- duplicate rule-list confusion between a player-style rule list and an edit-card rule list.

## 2. User Feedback To Implement

The user explicitly requested:

1. Fix all unreadable blue text, including object names, case library labels, copy-as-draft, diagnostic results, disabled buttons, and similar button/link states. Audit broadly, not only the one screenshot.
2. Align the left sidebar to the left and the right diagnostics sidebar to the right so the workbench does not waste large empty margins.
3. Make map actions visible as real buttons: new map, save map, delete map, publish map, retract published map, reload map. Do not rely on a status dropdown.
4. Remove manual tags from the normal UI. Tags are not meaningful for the current product.
5. Collapse duplicate title/case-name fields into one normal case title/name field. If the underlying format still has both, sync or derive one from the other internally; do not make the user maintain two names.
6. When a cell object is selected, object type must be selected from a dropdown. The dropdown must include a `管理物体` entry.
7. The object manager must list object types and support create, delete, and edit/rename for workbench object definitions where compatible with the current compatibility model.
8. Explain or hide low-level diagnostic numbers such as nodes, models, guest layouts, and candidate count. They should not be first-screen labels. If kept, move them to technical details and rename in plain language.
9. Rule editing must be simplified:
   - show one rule list by default;
   - keep the current edit-card/list style from the detailed rule editor;
   - each rule has edit, delete, copy, move up, and move down where supported;
   - selecting a rule previews its affected scope on the board when possible, like the player view;
   - add a separate `新建规则` button;
   - clicking `新建规则` opens a create-rule dialog/sheet with rule templates and parameters;
   - clicking edit opens the same dialog/sheet prefilled for that rule.
10. Hide the explanatory internal text about `全局、行、列、已有区域、四角、边缘、内侧数量 / 可结构化创建 / generated region / schema 校验`.
11. Remove the duplicate rule-list ambiguity. Use only the edit-card rule list as the normal authoring rule list; do not show both the player-style list and the edit-card list in the normal workflow.

## 3. Product Decisions

### 3.1 Rule List Direction

Use the current detailed edit-card rule list shape as the single rule list. Preserve its useful affordances:

- rule order;
- rule card;
- edit button;
- delete button;
- copy/duplicate;
- move up/down;
- selected state.

Repair the copy and presentation:

- no `结构化编辑`;
- no `只读保留` as a normal label unless it is truly immutable and explained in plain language;
- no English diagnostic text such as `Anchor rules need dedicated...`;
- no schema/proof/generated-region details in normal labels.

If a legacy rule is not fully editable through structured controls, show a plain disabled edit state such as `暂不能编辑这种定则` and put the technical reason only in an optional details disclosure.

### 3.2 Rule Create/Edit Dialog

Add one clear authoring path:

- `新建规则` button opens a modal/sheet.
- The user chooses a rule template from a dropdown or segmented list.
- The dialog shows only parameters needed for that template.
- The dialog generates and previews the final rule sentence before saving.
- Save inserts or updates the rule.
- Cancel leaves the draft unchanged.

Template coverage in this phase should focus on the safe-to-compile forms already supported by Phase 35. Do not add new semantic rule support unless necessary for a UI bug fix.

### 3.3 Object Management

Current mechanics still run through compatibility with legacy cell kinds. The editor may present a more flexible object list, but it must stay honest:

- Built-in object types such as bottle/bin/mirror map to current supported mechanics.
- Unsupported custom object types must either be display-only metadata or blocked from rules with clear copy.
- Do not pretend that arbitrary new object types are fully supported by solver/proof if they are not.

Object manager minimum:

- list current object types;
- rename display label;
- create a local workbench object type when safe;
- delete only local/custom unused types or prevent deletion with clear reason;
- preserve shipped case compatibility.

## 4. Scope

### 4.1 Workbench Layout And Contrast

- Audit workbench CSS tokens and class usage for low-contrast blue-on-gray text.
- Replace blue-on-dark with accessible colors for labels, links, buttons, object names, case library, diagnostics, disabled states, and selected states.
- Make sidebars align to page edges or a sensible full-width tool grid.
- Keep the tool dense. Do not create marketing-style cards or a landing page.
- Verify at desktop size at minimum. Mobile/tablet smoke is useful if touched.

### 4.2 Map Case Actions

Expose explicit normal buttons:

- `新建地图`
- `保存地图`
- `删除地图`
- `发布地图`
- `撤回发布`
- `重新加载`

Rules:

- built-in templates cannot be deleted or overwritten destructively;
- saving a built-in template creates or updates a local draft copy;
- publish/retract changes local draft/published state only;
- no public backend or repository write behavior.

### 4.3 Case Metadata Simplification

- Remove tag editing from the normal UI.
- Use one case title/name field.
- If JSON requires both `title` and `caseName`, derive/sync internally and test the behavior.
- Avoid showing source/path/filename/status.

### 4.4 Cell Object Editing

- Selected cell panel must use an object-type dropdown for supported object types.
- Include `管理物体` entry.
- Keep target/anomaly and empty/safe state controls understandable.
- Avoid raw CellKind jargon in visible copy.

### 4.5 Rule Editing

- Make the edit-card rule list the only normal rule list.
- Remove the duplicate read-only/player-style rule list from normal workbench flow.
- Selecting a rule highlights or previews its affected scope on the board when possible.
- Every editable rule card supports edit/delete/copy/reorder.
- `新建规则` opens a create dialog/sheet with template and parameter controls.
- Edit reuses the create dialog/sheet with existing parameters.
- Unsupported legacy rules show plain limitations and no raw internal text.

### 4.6 Diagnostics Copy

- First-screen diagnostics should be plain summaries.
- Move low-level technical counters behind a details disclosure.
- Rename counters if shown:
  - nodes -> `求解器尝试次数`
  - models -> `可能现场数量`
  - guest layouts -> `可能异常区域分布`
  - candidate count -> `剩余候选答案`
- Do not expose answer coordinates, target layouts, forced cells, candidate layouts, proof internals, or debug-only fields in normal labels.

## 5. Non-Scope

Do not:

- add public UGC/backend storage;
- write browser-authored cases to `content/cases`;
- promote or remove shipped player cases;
- expand domain/schema/solver/proof rule semantics beyond current safe-to-compile compatibility needs;
- implement final art slicing;
- continue broad theme redesign beyond editor layout/contrast repairs;
- build another puzzle generation/content batch;
- expose raw JSON as the normal authoring path;
- weaken validation, no-guess, uniqueness, secrecy, or shipped content boundaries.

## 6. Round Plan

Budget: 24 rounds.

- Rounds 1-2: inventory current workbench UI, duplicate rule surfaces, contrast tokens, and write `docs/phase-37/workbench-ux-repair-plan.md`.
- Rounds 3-5: contrast/token repairs and side-aligned workbench layout.
- Rounds 6-8: explicit map action toolbar, remove tags/status dropdown, collapse title/caseName normal editing.
- Rounds 9-11: object dropdown and object manager with compatibility guardrails.
- Rounds 12-15: single rule edit-card list, remove duplicate rule list, selected-rule scope preview.
- Rounds 16-18: create/edit rule dialog with template/parameter flow for safe supported forms.
- Rounds 19-20: diagnostics copy/detail cleanup and low-level counter renaming/hiding.
- Rounds 21-22: browser smoke and interaction QA for authoring flows.
- Round 23: buffer repairs.
- Round 24: final validation, report, push, and route back.

## 7. Per-Round Gate

Every round response must include:

- round goal;
- completed work;
- Debug self-check;
- architecture self-check;
- validation commands and results;
- commit hash and push result;
- next round goal;
- whether a buffer round was consumed.

Progression rules:

- If validation fails, do not commit/push and do not proceed.
- If validation passes but commit fails, do not proceed.
- If commit succeeds but push fails, do not proceed.
- Keep unrelated untracked docs/images out of commits unless this guide explicitly asks for a derived docs artifact.

## 8. Debug Self-Check

Every round must ask:

- Can the user perform the intended authoring action without touching JSON?
- Is the visible copy understandable to a puzzle designer rather than a developer?
- Is there only one normal rule list?
- Can the user see how to create/edit/delete/reorder a rule?
- Can the user preview a rule's affected cells when possible?
- Did contrast improve for every relevant blue-on-gray surface?
- Are unsupported legacy forms blocked clearly rather than exposed as internals?

## 9. Architecture Self-Check

Every round must ask:

- Did shipped content remain immutable unless copied into local workbench storage?
- Did normal player routes remain free of workbench/debug imports?
- Did the editor avoid duplicating solver/schema/proof semantics in UI code?
- Did object-manager UI stay honest about what the current compatibility model supports?
- Did the phase avoid deferred schema/domain migration and public UGC scope?
- Were unrelated files and untracked user assets left alone?

## 10. Validation Matrix

Final validation must include:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
git diff --check
```

Also run focused tests for:

- workbench contrast/token assertions where practical;
- map action toolbar button presence and states;
- built-in template save/delete/publish/retract guardrails;
- single case title/name sync or derivation;
- object dropdown and object manager create/rename/delete guardrails;
- single rule-list rendering;
- rule create/edit/delete/copy/reorder;
- selected-rule scope preview;
- create/edit dialog template parameters;
- diagnostic counter plain-language detail behavior;
- absence of duplicate player-style rule list in normal workbench.

If browser automation is available, run visual/DOM smoke for:

- workbench opens directly;
- sidebars align better on desktop;
- blue-on-gray text is readable;
- rule list appears once;
- new/edit rule dialog opens and can be cancelled;
- object dropdown and object manager open;
- map action buttons are visible.

If browser automation is unavailable, document deterministic fallback.

## 11. Boundary Scans

Final report must include scans showing:

- no content/cases promotions or deletions;
- no public UGC/backend/storage service;
- no workbench/debug imports in normal player routes;
- no raw JSON/export/import-first controls in the normal authoring path;
- no duplicate normal rule list;
- no visible schema/generated-region/proof/solver internal copy in normal workbench labels;
- no answer coordinates, target layout, forced cells, candidate layouts, or proof internals exposed in normal labels.

## 12. PASS Criteria

Phase 37 passes when:

- low-contrast blue text/buttons are comprehensively repaired;
- left/right workbench layout wastes less space and aligns sidebars sensibly;
- map actions are explicit buttons: new/save/delete/publish/retract/reload;
- normal UI no longer uses status dropdown or manual tags;
- normal UI has one case title/name field;
- selected cell object editing uses a dropdown with a `管理物体` path;
- object manager supports list/create/rename/delete with compatibility guardrails;
- there is exactly one normal rule list, using the edit-card list form the user preferred;
- rule cards support edit/delete/copy/reorder where possible;
- selecting a rule previews scope on the board when possible;
- new/edit rule dialog creates or updates supported rules through templates and parameters;
- internal generated-region/schema/proof text is hidden from normal UI;
- diagnostic low-level counters are hidden or renamed in plain language details;
- full validation, focused tests, smoke, final report, and push pass.

## 13. Final Report Template

Final report must include:

- status: READY_FOR_CHECK / READY_FOR_CHECK_WITH_BLOCKER;
- final commit and pushed branch;
- summary of contrast/layout repairs;
- map action toolbar behavior;
- case metadata simplification behavior;
- object dropdown/manager behavior and guardrails;
- rule-list consolidation decision and implementation;
- rule create/edit dialog coverage;
- diagnostics copy/detail cleanup;
- validation commands and results;
- browser/visual smoke evidence;
- boundary scans;
- blockers/caveats;
- recommended next phase.
