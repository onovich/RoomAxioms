# Authoring Workbench Handoff To Editor Thread

Date: 2026-07-01

Owner handoff:
- Planner / architect thread keeps product design, acceptance criteria, and phase planning.
- Editor implementation thread `019f1da7-d87b-7010-aacf-27a50529092f` owns all future authoring workbench implementation.
- Executor thread `019ef271-256c-7be2-9663-e658e2378564` should no longer receive routine editor implementation tasks unless the user explicitly redirects.

## Current Product Direction

The authoring workbench is a private tool for the project owner to hand-design cases and use solver/proof diagnostics to judge whether they are playable.

The workbench should feel like a practical editor, not a JSON debugger:
- Normal workflow must not require reading or editing JSON.
- JSON is an internal/export/debug representation only.
- Rules are created through structured expression controls, then rendered into readable rule text.
- The rule logic determines the displayed text; logic and display text must not drift apart as two unrelated fields.
- The user cares about fast, understandable feedback, not solver internals.

The main player-facing product is now themed as `未登记现场 / UNREGISTERED SCENE`, but this handoff is specifically for editor/workbench work.

## Current Editor State

Relevant recent phases:
- Phase 35: object-model compatibility layer, structured rule builder, VN overlay repair.
- Phase 36: local case library, draft/published groups, async diagnostics worker, selectable diagnostic checks.
- Phase 37: major workbench UX repair, contrast repair, compact rule list, board layout changes, explicit map actions.
- Post-Phase 37 hotfix: diagnostics now use an interactive reveal model.

Latest relevant commit at handoff:
- `589a3df fix: make workbench diagnostics interactive`

Important current behavior:
- Workbench route: `http://127.0.0.1:5173/RoomAxioms/#authoring-workbench`
- Normal Board page 1 is always the editable original.
- Board pagination only appears for terminal ambiguity after interactive safe reveals, and pages are read-only `终局可能解`.
- “开局可能现场 / 可能答案范围” should not appear in normal UI.
- Diagnostics are run in a worker and must remain cancellable.
- Clone risk is intentionally an opt-in slow check, not a default diagnostic.

## Interactive Reveal Solver Semantics

Do not judge a case by static opening possibilities alone.

The accepted model is:
1. Start from initial revealed evidence.
2. Use approved proof/reasoning rules to infer safe cells and anomaly cells.
3. Whenever a cell is proven safe, assume the player investigates it and sees the real object.
4. Add that real object as a new observation.
5. Continue until the case is uniquely solved, blocked, truncated, or requires guessing.

The authoring report now exposes:
- `interactiveTrace`: proof waves, newly revealed safe observations, confirmed anomaly cells, terminal status.
- `terminalGuestLayoutExamples`: first terminal remaining layouts only when final ambiguity remains after safe reveals.

Do not reintroduce opening layout preview as a player/editor-facing concept.

## UX Rules To Preserve

Workbench normal UI must:
- Use high-contrast text on dark surfaces; avoid dark blue-on-dark gray.
- Keep Board visible without forcing vertical scrolling for ordinary 4x4/5x5 cases.
- Keep rules as the right-side core work area.
- Use a single rule list: the compact editable rule-card list.
- Show one generated rule sentence per card, not duplicate title/flavor lines that say almost the same thing.
- Use small icon/action buttons for edit/move/copy/delete.
- Put diagnostic settings in a compact top control, not a huge right sidebar.
- Hide debug/developer modules from normal workflow.
- Avoid labels like `Schema OK`, `节点`, `模型`, `候选计数`, `访客布局`, `可能答案范围`.
- Show plain verdicts such as `最终结论：唯一`, `仍有多解`, `需要猜测`, `超出上限`.
- Label empty cells as `空地`, not `无访客`.

Local case library should:
- Show left-side case list.
- Support `草稿` and `已发布`.
- Support create/save/delete/publish/retract/reload using explicit buttons.
- Avoid manual tags for now.
- Keep one normal title field; do not split title/caseName as two visible normal fields.

## Rule Editor Direction

The user wants rules authored by composing expressions, not hand-writing JSON.

Already authorable or partially authorable:
- Global count.
- Local directional/orthogonal/surrounding counts.
- Row and column count constraints.
- Corner/edge/interior/generated region counts.
- Existing region counts.
- Line-of-sight exists / none via ray lineCount.

Known architectural blocker:
- The current semantic core still mostly uses legacy `CellKind`: `empty | bottle | bin | mirror | guest`.
- The intended future model is `empty / target / objects[]`, with object types configured externally.
- Any defined object should eventually be usable in cells and rules.
- Do not hide this limitation with misleading copy like “custom objects are notes only.”
- Until the migration is complete, unsupported object/rule forms must show clear diagnostics.

The planner should separately design a domain/schema/solver/proof migration before implementation expands arbitrary object rules deeply.

## Diagnostics And Performance Guidance

Diagnostics must be responsive:
- Keep core diagnostics in a worker.
- Keep cancel working by terminating the worker.
- Avoid expensive checks by default.
- Clone risk stays default-off.
- Terminal ambiguity examples should enumerate at most 4 layouts.
- Do not enumerate opening layouts for UI preview.
- If a diagnostic check is expensive, make it selectable and explain it in plain language.

Diagnostic results should answer:
- Can the draft exist without contradiction?
- Can the final anomaly layout be uniquely determined after interactive safe reveals?
- Can a human solve it without guessing?
- Which safe cells become newly visible during the proof?
- If still ambiguous, what are the first few terminal remaining solutions?

## Files Worth Reading First

Primary editor files:
- `apps/web/src/workbench/AuthoringWorkbenchScreen.tsx`
- `apps/web/src/workbench/model.ts`
- `apps/web/src/workbench/asyncDiagnostics.ts`
- `apps/web/src/workbench/diagnosticsWorker.ts`
- `apps/web/src/workbench/localCaseLibrary.ts`
- `apps/web/src/workbench/caseLibrary.ts`

Authoring/proof support:
- `packages/authoring/src/diagnostics.ts`
- `packages/authoring/src/contracts.ts`
- `packages/authoring/src/ruleBuilder.ts`
- `packages/proof/src/verifier.ts`
- `packages/proof/src/reasoner.ts`
- `packages/solver/src/queries.ts`

Recent reports:
- `docs/phase-35-rule-object-model-editor-vn-overlay-final-report.md`
- `docs/phase-36-authoring-workbench-ux-async-diagnostics-final-report.md`
- `docs/phase-37-authoring-workbench-human-ux-repair-final-report.md`

## Validation Expectations

For editor changes, run at minimum:
- `cmd /c pnpm.cmd --filter @room-axioms/web typecheck`
- `cmd /c pnpm.cmd --filter @room-axioms/web test -- src/workbench/workbench.test.ts src/workbench/AuthoringWorkbenchScreen.test.tsx src/workbench/asyncDiagnostics.test.ts`
- `cmd /c pnpm.cmd --filter @room-axioms/authoring typecheck`
- Relevant authoring tests, usually `src/diagnostics.test.ts` and/or `src/ruleBuilder.test.ts`

Before commit/push, use project wrapper:
- `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd`
- `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd`
- `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd`
- `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd`
- `C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\CommitAndPush.cmd`

Known unrelated untracked context files should be left alone unless explicitly requested:
- `docs/minesweeper_generation_methods.md`
- `docs/ui-art-sample-frontend-adaptation-requirements.md`
- `docs/unregistered-scene-cover-art-brief.md`
- `docs/unregistered-scene-cover-no-ui-generation-prompt.md`
- `docs/unregistered-scene-ui-requirements.md`
- `docs/未登记现场_项目设定与玩法对接文档.md`
- `images/`
- `tmp/`

## Immediate Suggested Next Editor Focus

The next editor implementation should not start broad refactors. Recommended first checks:
1. Open the workbench in browser and manually inspect contrast, layout, and diagnostics responsiveness.
2. Confirm the new interactive diagnostics copy is clear to the user.
3. Confirm Board terminal solution pagination only appears after terminal ambiguity.
4. Continue improving rule-builder usability, but do not expand arbitrary object semantics until a planner-approved schema/domain migration exists.

