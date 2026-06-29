# Phase 36 - Authoring Workbench UX And Async Diagnostics

Date: 2026-06-30
Status: READY_FOR_EXECUTOR
Owner: executor
Planner thread: 019ef0df-a626-7181-9ca6-1cc75c1f4c47
Executor thread: 019ef271-256c-7be2-9663-e658e2378564
Round budget: 32 executor rounds

## 0. Direct Goal Prompt For Executor

Execute Phase 36 in goal mode. Convert the private authoring workbench from a developer-facing import/debug surface into a practical puzzle-authoring tool for the user. The user should be able to choose cases from a left case list, create a new case, save, delete local authored cases, publish/retract local cases, edit rules/cells, and run selected diagnostics asynchronously without freezing the page.

This phase is about authoring UX, local case management, and asynchronous diagnostics. It is not a rule-semantics expansion phase, not a puzzle-production phase, and not final art slicing.

## 1. Required Reading

- `docs/phase-35-rule-object-model-editor-vn-overlay-final-report.md`
- `docs/phase-35-rule-object-model-editor-vn-overlay-goal-mode-execution-guide.md`
- `docs/unregistered-scene-packaging-decisions.md`
- `docs/minesweeper_generation_methods.md`
- `docs/development-plan.md`

The `minesweeper_generation_methods.md` document is reference material for diagnostic design. Do not implement a broad random generator from it. Use its relevant lessons: modular checks, no-guess solver verification, CSP/SAT-style correctness checks, difficulty scoring, and Las-Vegas-style generate-then-validate only as future optional assistant tooling.

## 2. User Feedback To Implement

The user explicitly requested these workbench changes:

1. Do not show the Import section.
2. Show the case list on the left and allow direct case selection, not selection through an import dropdown.
3. Support creating a new case and saving.
4. Support deleting existing authored cases.
5. Distinguish cases as `草稿` and `已发布`; do not use the `实验` category. Support publish and retract inside the editor.
6. Fix low-contrast blue text on gray backgrounds.
7. Do not show these developer/internal sections in the normal authoring UI:
   - source
   - path
   - filename
   - status
   - Manifest
   - Placeholders
   - Pending
   - Approved
   - Dialogue scenes
   - Review issues
   - Debug / export: rules JSON
   - 区域 / 参照物
   - export
8. While diagnostics are running, the diagnostic button needs a progress bar and should become a cancel-diagnostics button.
9. Diagnostics must be asynchronous and must not freeze the page.
10. Diagnostics must provide checkboxes for which checks to run. Each option must use plain language to explain what it checks.

## 3. Product/Architecture Decisions

### 3.1 Local Authoring Library

Because the web app is static, the normal browser workbench must not pretend it can directly write repository JSON files. Implement a private browser-local authoring library.

Required behavior:

- Store user-authored cases in browser-local storage, preferably IndexedDB; localStorage is acceptable only if IndexedDB is too costly for this phase.
- Cases have exactly two authoring states: `草稿` and `已发布`.
- Built-in shipped cases can appear in the left list as read-only templates or reference cases.
- Editing a built-in case should create or prompt a local draft copy rather than mutating shipped content.
- Deleting is allowed for local authored cases. For built-in shipped cases, do not physically delete repository content; either disallow deletion with clear copy or implement local hide only if it is simple and safe.
- Publishing means moving a local authored case into the local `已发布` list and making it available to authoring preview flows. It does not mean committing to `content/cases` or public release.
- Retracting means moving a local published case back to `草稿`.
- Save must persist the current local draft/published case without requiring JSON import/export.

### 3.2 Simplified UI Surface

The normal workbench should be a planning/editing surface, not a debug report wall.

Hide developer-only sections from the ordinary authoring UI. If some debug/export details remain useful for maintainers, put them behind an explicit small developer/debug disclosure, default closed, and keep them out of the primary workflow.

### 3.3 Async Diagnostics

Diagnostics must be task-based and cancellable.

Required behavior:

- A diagnostic run is created from selected checkboxes.
- The run does not block typing, scrolling, or basic UI interaction.
- The main diagnostic button becomes `取消诊断` while running.
- Show a progress bar and current step label.
- Support cancellation and show a cancelled state.
- Show partial results for completed checks when cancellation happens.
- If web workers are already available/reasonable, use a worker-backed path. If not, chunk execution through async yielding and document why a worker was deferred.
- Cache or reuse results where safe so repeated checks on unchanged drafts are not painfully slow.

## 4. Diagnostic Options

At minimum expose these selectable checks with plain-language Chinese labels/descriptions:

- `能不能成立`: checks whether the current case has at least one valid solution.
- `答案是不是唯一`: checks whether the anomaly/target layout is uniquely determined.
- `能不能不靠猜解开`: checks whether the proof/human-reasoning path can finish without guessing.
- `每条定则有没有用`: checks whether each rule contributes to narrowing the solution.
- `有没有白送答案`: checks for degeneracy such as singleton sightlines, direct edge giveaways, over-revealed starts, or rules that are equivalent to directly telling the answer.
- `有没有太像旧案卷`: checks clone/novelty risk against shipped and local published cases.
- `大概难度`: computes provisional difficulty signals such as proof waves, deduction count, branching, reveals, and candidate shrink.
- `文案是否清楚`: checks rule/case text for banned legacy terms, ambiguous wording, or unsupported hidden-highlighting reliance.
- `会不会太慢`: checks caps, truncation, elapsed time, and whether expensive diagnostics should be narrowed.

The labels may be polished, but they must stay human-readable and not use internal terms such as `solver`, `CSP`, `proof DAG`, `candidateGuestLayouts`, or `truncated` as primary labels. Internal details may appear in an expanded technical detail area.

## 5. Implementation Scope

### 5.1 Workbench Layout

Create a workbench layout with:

- left column: case library grouped into `草稿` and `已发布`, plus built-in templates/reference cases if needed;
- top/toolbar: new case, save, delete, publish/retract, duplicate/template actions;
- center: map/cell/rule editing;
- right or bottom: selected diagnostics and result summary;
- no Import panel in the normal flow.

Keep the layout dense and tool-like. Do not build a landing page.

### 5.2 Case Library Model

Add typed model/helpers for:

- local case id;
- title/case name;
- draft/published state;
- last saved timestamp;
- source marker internal to the model only, not shown as primary UI copy;
- migration/version field for future compatibility;
- serialization/deserialization and validation.

Tests must cover create/save/delete/publish/retract and built-in template copy behavior.

### 5.3 Saving And Data Safety

Saving should:

- validate enough to avoid corrupting local stored data;
- preserve the current draft even if full puzzle diagnostics fail;
- show success/error states in plain language;
- avoid losing unsaved changes when switching cases;
- warn or auto-save before destructive actions.

Deletion should:

- require a confirmation for local authored cases;
- never delete shipped repository cases.

### 5.4 Async Diagnostic Runner

Implement a diagnostic runner abstraction:

- accepts draft puzzle and selected diagnostic ids;
- runs each diagnostic as a task with progress events;
- supports cancellation;
- returns structured results and partial results;
- separates UI state from diagnostic logic;
- keeps expensive schema/solver/proof/anti-clone checks out of synchronous render paths.

If a worker is used:

- keep worker payload serializable;
- map errors to plain user-facing messages;
- test stale/cancelled/superseded runs.

If chunked async is used:

- yield between steps;
- ensure UI remains responsive enough;
- document future worker migration.

### 5.5 UI Cleanup And Contrast

Remove or hide from the normal authoring UI:

- Import controls;
- source/path/filename/status labels;
- Manifest/asset review panels;
- placeholder/pending/approved asset lists;
- dialogue scene/review issue panels;
- debug/export rules JSON;
- region/reference panels;
- export controls.

Fix blue-on-gray contrast. Use the Phase 34/35 theme tokens or new authoring tokens with sufficient contrast. Add a visual or test assertion where practical.

### 5.6 Minesweeper Methodology Notes

Record in `docs/phase-36/diagnostic-methodology.md` how the minesweeper methodology applies:

- Our current approach already uses CSP-like solver, oracle, HumanReasoner/no-guess proof, authoring score, anti-clone gates, and generate-then-filter experiments.
- Unlike Minesweeper, our rule space is author-defined and expandable, so pure random generation performs poorly.
- The useful takeaway is modular validation and difficulty checks, not broad random puzzle generation.
- The UI should let the user choose targeted diagnostics, mirroring an industrial pipeline of quick checks first and expensive checks later.

## 6. Non-Scope

Do not:

- implement public UGC or backend storage;
- commit locally authored browser cases into `content/cases`;
- promote new puzzle cases;
- expand rule semantics beyond what Phase 35 already supports;
- implement broad AI/random puzzle generation;
- expose raw JSON as the normal editing path;
- remove shipped cases from the repository;
- import final art assets or continue visual redesign beyond editor usability fixes;
- weaken solver/proof/no-guess/uniqueness/secrecy correctness.

## 7. Round Plan

Budget: 32 rounds.

- Rounds 1-2: inventory current workbench UI/state and create `docs/phase-36/ux-plan.md`.
- Rounds 3-5: local case library model, persistence, migration/version tests.
- Rounds 6-8: left case list, draft/published grouping, built-in template copy flow.
- Rounds 9-11: create/save/delete/publish/retract UI with confirmations and unsaved-change handling.
- Rounds 12-14: remove/hide import/debug/manifest/export/developer panels from normal UI; fix contrast.
- Rounds 15-18: diagnostic option model, plain-language labels/descriptions, selected-check UI.
- Rounds 19-23: async diagnostic runner with progress, cancellation, partial results, stale-run handling.
- Rounds 24-26: wire diagnostics to existing schema/solver/proof/authoring/clone/difficulty/copy/performance checks.
- Rounds 27-28: methodology doc and UX smoke fixtures.
- Rounds 29-30: browser/local smoke and responsive checks for editor.
- Round 31: buffer repairs.
- Round 32: final validation, report, push, and route back.

## 8. Per-Round Gate

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

## 9. Debug Self-Check

Every round must ask:

- Can the user author a case without touching raw JSON?
- Can the user tell what is draft vs published?
- Can switching, saving, deleting, publishing, and retracting be explained without source/path/status jargon?
- Are diagnostics responsive and cancellable?
- Are expensive checks only run when selected?
- Are error/cancel/stale/partial-result states visible?
- Did normal player routes remain untouched?

## 10. Architecture Self-Check

Every round must ask:

- Is local authoring storage clearly separate from shipped content?
- Did built-in cases stay immutable unless copied into local drafts?
- Does diagnostic logic stay outside render paths?
- Are worker/chunked async boundaries serializable and cancellable?
- Do UI labels avoid internal solver/proof jargon?
- Did the phase avoid public UGC, backend, case promotion, and new rule semantics?

## 11. Validation Matrix

Final validation must include:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
git diff --check
```

Also run focused tests for:

- local case library create/save/delete/publish/retract;
- built-in template copy behavior;
- unsaved-change handling;
- diagnostic option selection;
- async progress/cancellation/partial results;
- stale/superseded diagnostic runs;
- workbench contrast or class/token checks;
- no normal UI import/debug/export/manifest panels;
- shipped player route untouched.

If browser automation is available, run visual/DOM smoke for:

- workbench opens directly;
- left case list visible;
- no Import section visible;
- create/save/publish/retract/delete flows;
- diagnostic run shows progress and cancel;
- UI remains responsive during diagnostics.

If browser automation is unavailable, document deterministic fallback.

## 12. Boundary Scans

Final report must include scans showing:

- no new content/cases promotions;
- no public UGC/backend/storage service;
- no `@room-axioms/authoring` or debug workbench imports in the normal player route;
- raw JSON/export/debug UI absent from normal workbench mode;
- old `实验` category not visible in workbench case taxonomy;
- diagnostics do not expose answer coordinates, target layout, forced cells, candidate layouts, or proof internals in normal user-facing labels.

## 13. PASS Criteria

Phase 36 passes when:

- the normal workbench no longer shows the Import section;
- left case list exists with `草稿` and `已发布`;
- user can create, save, delete local authored cases, publish, and retract;
- shipped built-in cases are not destructively deleted or mutated;
- requested developer/debug panels are removed or hidden from the normal workflow;
- contrast issue for blue text on gray backgrounds is fixed;
- diagnostics have selectable plain-language checks;
- diagnostic runs are asynchronous, show progress, can be cancelled, and do not freeze the page;
- selected checks map to existing validation capabilities honestly;
- `docs/phase-36/diagnostic-methodology.md` records the Minesweeper-methodology comparison;
- full validation, smoke, final report, and push pass.

## 14. Final Report Template

Final report must include:

- status: READY_FOR_CHECK / READY_FOR_CHECK_WITH_BLOCKER;
- final commit and pushed branch;
- case library behavior;
- persistence backend decision;
- draft/published behavior;
- diagnostics options list;
- async/cancel implementation;
- removed/hidden UI sections;
- Minesweeper methodology takeaway;
- validation commands and results;
- smoke/Pages evidence if web changed;
- boundary scans;
- blockers/caveats;
- recommended next phase.
