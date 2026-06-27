# Phase 31 Rule Expression Builder And Theme Packaging Workflow Goal Mode Execution Guide

Date: 2026-06-28
Status: executor-facing Phase 31 development guide
Round budget: 22 executor rounds

## 0. Direct Goal Prompt For Executor

You are the executor for `D:\WebProjects\RoomAxioms`.

Execute Phase 31: Rule Expression Builder And Theme Packaging Workflow.

Read this guide fully before changing files. This phase pivots the project away
from broad AI puzzle-production attempts and toward a human-authoring workflow
plus theme-packaging preparation. Use `$donextgoal` goal-mode discipline:
finish narrow rounds, validate, commit, push, and report each round.

Primary goal:

- Build a private maintainer-facing rule expression builder in the authoring
  workbench so authors compose rule logic through structured controls instead
  of hand-editing rules JSON.
- Make rule logic the source of truth for display copy. Generated readable text
  must come from the structured rule expression. Raw JSON is import/export and
  debug/storage only, not the normal authoring interface.
- Prepare a theme packaging and visual-novel dialogue workflow for the
  "未登记现场" wrapper, including asset intake, implementation phases, and
  boundaries that prevent narrative UI from leaking puzzle answers.

Return to the planner/checker thread after completion with a final report.

## 1. Required Reading

- `README.md`
- `docs/development-plan.md`
- `docs/phase-25-authoring-editor-live-diagnostics-final-report.md`
- `docs/phase-30-non-singleton-overlap-proof-bridge-final-report.md`
- `docs/unregistered-scene-ui-requirements.md` if present
- `docs/未登记现场_项目设定与玩法对接文档.md` if present
- Current workbench source under `apps/web/src/workbench`
- Authoring source under `packages/authoring/src`
- Rule/domain/schema source under `packages/domain/src` and `packages/schema/src`

Leave unrelated untracked docs untouched unless this guide explicitly needs to
reference them. If a referenced untracked doc already exists, read it as context
but do not stage it unless the user or planner explicitly asks.

## 2. Product Decisions Already Made

Treat these as binding:

- The current private workbench is usable as a maintainer diagnostic tool, but
  its rule editing is not yet good enough for human puzzle design because it
  exposes JSON too directly.
- Rule editing has two linked parts: logical meaning and displayed text.
  Logical meaning determines displayed text. They are not independent fields.
- Authors should compose rule expressions with controls. They should not read
  or write rule JSON for normal authoring.
- JSON remains useful as export, import, storage, fixtures, and debug evidence.
  It must not be the primary rule authoring surface.
- Different languages may generate rule text with different word order and
  templates. Implement Chinese copy now, and leave a clean path for later
  multilingual templates.
- Do not run another broad AI-generated puzzle batch in this phase.
- Manual puzzle design by the user is now the intended content-production path.
  Solver, proof, scoring, anti-clone, degeneracy, and copy diagnostics should
  help evaluate human drafts.
- Theme/VN packaging can proceed in parallel with manual puzzle design, but
  final art-driven visual implementation should wait for user-provided original
  art and design references.

## 3. Scope

### Rule Expression Builder

Add an author-facing rule builder to the private workbench:

- Rule list with add, remove, duplicate, reorder, select.
- Rule expression editor using typed controls rather than raw JSON:
  - rule family selector;
  - subject object/material selector;
  - comparator selector;
  - count input;
  - scope selector;
  - anchor/source selector where relevant;
  - target scope/object selectors for overlap, comparative, and conditional
    rules where supported.
- Generated Chinese preview text derived from the rule expression.
- Generated short label derived from the same expression, or an explicitly
  marked maintainer label that cannot contradict the generated rule meaning.
- Validation and diagnostics update from the structured rule draft.
- Import existing cases into editable structured expressions where supported.
- Export the draft as schema-valid JSON.
- Keep raw JSON view behind an explicit debug/export affordance. It may exist,
  but it must not be the first or only way to edit rules.

Supported MVP rule families should include the shipped and current authoring
families where feasible:

- `globalCount`
- local `forEachCount` over 上下左右邻格 and 周围一圈
- `regionCount`
- `scopeOverlapCount`
- `comparativeCount`
- `conditionalCount`

If a rule family is too complex for full editing in this phase, add an honest
unsupported state with read-only generated text and diagnostics. Do not silently
round-trip it through lossy JSON edits.

### Rule Text Generation

Create or formalize a rule text generation layer:

- One structured rule expression produces one readable Chinese sentence.
- Avoid internal jargon in player/author-facing copy.
- Prefer plain wording such as:
  - `酒瓶的上下左右邻格，必有 1 个垃圾桶`
  - `访客不在酒瓶的上下左右邻格`
  - `镜子周围一圈，没有访客`
- Do not depend on hidden highlight membership to complete the meaning of the
  sentence. Highlight can visualize text meaning, not add missing text meaning.
- Avoid deprecated/confusing terms recorded in previous audits, including
  `安全区`, `空区`, `空房`, `侧翼`, `锚点`, `清扫点`, and `已确认清扫点`, unless a
  new user-approved theme term replaces them with precise wording.

### Theme Packaging Workflow

Prepare docs and lightweight scaffolding for the "未登记现场" theme wrapper:

- Asset intake checklist for user-provided art and design:
  - main background/key visual;
  - room/board surface treatment;
  - object icons or illustrated tokens;
  - character half-body portraits;
  - expression variants;
  - dialogue box/UI frame references;
  - case selector and evidence-panel visual references;
  - typography/color notes.
- Visual-novel dialogue system plan:
  - character portrait slots;
  - expression/state changes;
  - text box;
  - speaker name;
  - line advance;
  - optional log/skip/autoplay only if cheap and non-disruptive;
  - scene/case intro and result dialogue hooks.
- Puzzle secrecy boundary:
  - narrative can introduce tone, tutorial, and emotional context;
  - narrative must not reveal target cells, hidden objects, solver candidates,
    proof-only internals, or target answer facts;
  - hints must remain proof-backed.
- Implementation split for later phases once art arrives.

## 4. Non-Scope

- Do not add public UGC.
- Do not ship a public editor.
- Do not implement a broad visual redesign without user art/design approval.
- Do not produce bulk AI-generated puzzles.
- Do not promote new cases.
- Do not weaken schema, solver, proof, no-guess, uniqueness, degeneracy,
  anti-clone, or secrecy gates.
- Do not make JSON the authoring source of truth.
- Do not add backend, analytics, daily challenge, account system, or cloud save.

## 5. Architecture Boundaries

- Domain/schema remain source-of-truth for rule data shapes.
- Text generation may live in a shared authoring/workbench-safe layer, but web
  UI must not duplicate solver/proof semantics.
- Workbench can depend on authoring/browser-safe helpers where the project
  already allows it. Keep Node filesystem-only CLI code out of browser runtime.
- Player-facing app must not import generator/authoring internals outside the
  existing private workbench route.
- Raw JSON export/import must preserve schema compatibility.
- Generated display text must be deterministic for a given rule expression.

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

Rounds 1-3: inventory and contract

- Map current workbench editing surfaces and rule data flow.
- Define the structured builder contract and supported/unsupported rule matrix.
- Add docs under `docs/phase-31/` for rule expression contract, text generation,
  and theme packaging workflow.

Rounds 4-8: rule text generation and parsing bridge

- Implement deterministic Chinese text generation for supported rule families.
- Add tests for plain-language wording and forbidden/deprecated terms.
- Add import conversion from existing rule JSON to builder model.
- Add export conversion from builder model back to schema-valid JSON.

Rounds 9-14: workbench UI builder

- Add rule list controls: add, remove, duplicate, reorder, select.
- Add expression controls for MVP rule families.
- Show generated sentence preview and validation state.
- Move raw JSON rule editing behind an explicit debug/export surface.
- Add UI tests for editing representative rules and preserving diagnostics.

Rounds 15-17: diagnostics integration and real-case QA

- Verify current shipped cases can be imported and displayed without misleading
  or lossy rule text for supported families.
- Add unsupported-family states where necessary.
- Run workbench QA against `case-004`, `case-011`, `case-012`, and `case-021`.

Rounds 18-19: theme/VN workflow docs and scaffolding

- Finalize asset intake checklist.
- Finalize visual-novel dialogue implementation plan.
- Add any minimal route/type scaffolding only if it helps future implementation
  and does not imply final art or final theme UI is complete.

Rounds 20-21: buffer fixes

- Use for validation failures, copy issues, import/export edge cases, or browser
  workbench regressions.

Round 22: final validation and report

- Run full validation, local smoke, relevant workbench/browser smoke, boundary
  scans, and final report.

## 8. Debug Self-Check

Each round must ask:

- Can the current rule edit be explained from the structured expression without
  looking at JSON?
- Does generated text still match the actual rule object after import/export?
- Are unsupported families explicit rather than lossy?
- Do diagnostics update when the author edits a rule?
- If UI changed, was a repeatable workbench smoke or unit test added?
- Are empty/error/stale states visible in the workbench?

## 9. Architecture Self-Check

Each round must ask:

- Does rule logic remain source-of-truth and generated text remain derived?
- Did the workbench avoid duplicating solver/proof semantics?
- Did browser-safe helpers stay separate from Node-only authoring CLI code?
- Did the player route stay unaffected unless intentionally touched?
- Did the phase avoid puzzle promotion, public UGC, and broad theme redesign?
- Were unrelated untracked docs and user changes left alone?

## 10. Validation Matrix

Required by final report:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `git diff --check`
- Focused workbench tests.
- Focused rule text/builder import-export tests.
- Local `StartDevServer.cmd`, `Smoke.cmd`, and `StopDevServer.cmd`.
- Browser or DOM smoke for `http://127.0.0.1:5173/RoomAxioms/#authoring-workbench`.
- Boundary scan proving no new public player dependency on authoring/generator
  internals outside the private workbench route.

Use project wrappers where appropriate:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

## 11. PASS Criteria

- Private workbench offers a structured rule expression builder for the MVP rule
  families, or the final report clearly identifies any unsupported family with
  non-lossy read-only handling.
- Authors can add, remove, duplicate, reorder, and edit supported rules without
  hand-writing JSON.
- Generated Chinese rule text is derived from rule logic and covered by tests.
- Raw JSON is not the primary rule-editing UI.
- Import/export preserves schema-valid drafts.
- Workbench diagnostics still run after rule edits.
- Theme packaging docs define asset intake, VN dialogue module requirements,
  secrecy boundaries, and future implementation phases.
- No new shipped cases are promoted.
- No public editor/UGC/backend/analytics/daily challenge/broad art redesign is
  added.
- Full validation and local smoke pass.
- Final report exists and is pushed.

## 12. Final Report Template

Create:

`docs/phase-31-rule-expression-builder-theme-packaging-workflow-final-report.md`

Include:

- final status;
- final commit;
- rule builder features completed;
- supported and unsupported rule families;
- generated copy examples;
- import/export evidence;
- diagnostics/workbench QA evidence;
- theme/VN packaging deliverables;
- validation commands and results;
- smoke and Pages evidence if deployment runs;
- boundary scans;
- blockers or caveats;
- whether Phase 32 should prioritize theme implementation, further editor
  usability, or manual-puzzle QA support.
