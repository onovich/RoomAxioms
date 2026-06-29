# Phase 36 Final Report - Authoring Workbench UX And Async Diagnostics

Status: READY_FOR_CHECK
Branch: main / origin/main
Planner thread: 019ef0df-a626-7181-9ca6-1cc75c1f4c47

## Summary

Phase 36 converted the private workbench from an import/debug-first surface into a practical manual authoring tool. The workbench now has a left case library, browser-local draft/published cases, create/save/delete/publish/retract actions, simplified normal UI, higher-contrast workbench controls, selectable diagnostics, async progress, cancellation, partial-result handling, and methodology notes from the Minesweeper generation reference.

No shipped cases were promoted, removed, or rewritten. The normal player route remains unchanged.

## Final Commits

- `81c5693` docs: plan Phase 36 workbench UX
- `2f25bc1` feat: add workbench local case library
- `1da3957` feat: wire workbench case library UI
- `db46a9e` feat: add selectable async workbench diagnostics
- `28e0432` fix: clean workbench debug labels
- final docs commit: this report update

## Case Library Behavior

- Left library groups local authored cases into exactly `草稿` and `已发布`.
- Built-in shipped cases appear as immutable `内置模板`.
- The old `实验` taxonomy is not used in the visible normal case list.
- Creating a new case copies the default built-in structure into a local draft.
- Saving a built-in case creates a local draft copy instead of mutating shipped content.
- Deleting is allowed only for local authored cases and requires confirmation.
- Publishing moves a local case into local `已发布`; it does not commit to `content/cases`.
- Retracting moves a local published case back to local `草稿`.

## Persistence Decision

The workbench uses IndexedDB when available through `createBrowserLocalCaseStore()`. Tests use a memory store with the same typed interface.

Stored records include:

- local id;
- version;
- `draft` / `published` state;
- title and optional case name;
- serialized puzzle JSON;
- created/updated timestamps;
- source marker for new cases or built-in template copies.

The storage layer is private to the browser workbench and does not write repository JSON.

## Diagnostics

Selectable checks:

- `能不能成立`
- `答案是不是唯一`
- `能不能不靠猜解开`
- `每条规则有没有用`
- `有没有白送答案`
- `有没有太像旧案例`
- `大概难度`
- `文案是否清晰`
- `会不会太慢`

Implementation:

- `apps/web/src/workbench/asyncDiagnostics.ts` defines plain-language options and a chunked async runner.
- The runner accepts selected check ids, draft snapshot, caps, comparison puzzles, progress callback, and `AbortSignal`.
- The workbench button becomes `取消诊断` while running.
- A progress bar shows current step and percent.
- Cancellation keeps completed partial results when available.
- Request ids still guard stale/superseded result application.

Worker migration is deferred and documented in `docs/phase-36/diagnostic-methodology.md`.

## UI Cleanup

Removed from the ordinary workbench path:

- Import dropdown;
- primary raw draft JSON panel;
- primary export JSON button;
- source/path/filename/status summary;
- manifest/placeholders/pending/approved/dialogue/review panels;
- rules JSON debug editor;
- region/anchor JSON editor;
- normal export preview.

The remaining debug details are behind a default-closed `开发者调试` disclosure and are not the normal authoring path.

## Methodology

`docs/phase-36/diagnostic-methodology.md` records the Minesweeper comparison:

- keep modular validation;
- keep no-guess and uniqueness checks;
- keep CSP-like correctness checks;
- keep difficulty as uncalibrated signals;
- do not implement broad random generation in this phase.

## Validation

Per-round wrapper validation passed on every pushed checkpoint:

- `CommitAndPush.cmd -Message "docs: plan Phase 36 workbench UX" ...`: PASS
- `CommitAndPush.cmd -Message "feat: add workbench local case library" ...`: PASS
- `CommitAndPush.cmd -Message "feat: wire workbench case library UI" ...`: PASS
- `CommitAndPush.cmd -Message "feat: add selectable async workbench diagnostics" ...`: PASS

Focused checks run during implementation:

- `pnpm --filter @room-axioms/web typecheck`: PASS
- `pnpm --filter @room-axioms/web lint`: PASS
- `pnpm --filter @room-axioms/web test -- src/workbench/localCaseLibrary.test.ts`: PASS
- `pnpm --filter @room-axioms/web test -- src/workbench/AuthoringWorkbenchScreen.test.tsx src/workbench/localCaseLibrary.test.ts src/workbench/workbench.test.ts`: PASS
- `pnpm --filter @room-axioms/web test -- src/workbench/asyncDiagnostics.test.ts src/workbench/AuthoringWorkbenchScreen.test.tsx src/workbench/workbench.test.ts`: PASS

Final validation matrix:

- `Validate.cmd`: PASS
  - lint PASS
  - typecheck PASS
  - test PASS
    - domain: 4 files / 26 tests PASS
    - schema: 4 files / 36 tests PASS
    - oracle: 5 files / 20 tests PASS
    - solver: 7 files / 54 tests PASS
    - proof: 9 files / 62 tests PASS
    - generator: 8 files / 15 tests PASS
    - authoring: 13 files / 122 tests PASS
    - web: 24 files / 153 tests PASS
  - build PASS
- `git diff --check`: PASS
- `StartDevServer.cmd`: PASS
- `Smoke.cmd`: PASS
- `StopDevServer.cmd`: PASS
- `CommitAndPush.cmd -Message "fix: clean workbench debug labels" ...`: PASS
  - lint PASS
  - typecheck PASS
  - test PASS
  - build PASS
  - commit `28e0432` pushed to `origin/main`

## Boundary Scans

Final scans:

- `git diff --name-only 7048a67..HEAD -- content/cases apps/web/src/content`: no output; no shipped content or player selector changes.
- `git grep -n -E "@room-axioms/(authoring|generator)" -- apps/web/src/view apps/web/src/hooks apps/web/src/logic apps/web/src/runtime apps/web/src/vn apps/web/src/theme`: no output; normal player route did not gain authoring/generator imports.
- Workbench taxonomy scan for `实验`: only test/report assertions; not a visible normal category.
- Diagnostic label scan for `solver`, `CSP`, `proof DAG`, `candidateGuestLayouts`, `forced`, and `target layout` in the workbench option/UI files: no output.
- `public UGC/backend` scan only hits docs that explicitly state those features are not implemented, plus historical package documentation; no app/backend implementation was added.
- Debug/import/export labels were moved out of the normal workflow and old labels were cleaned from the visible workbench headings.

## Blockers / Caveats

- Async diagnostics are chunked in the browser rather than worker-backed. The core authoring diagnostic evaluation remains a synchronous package API during its central step, but progress, cancellation, selected display, stale-run protection, and partial-result handling are now present.
- Browser-local authored cases are private to the current browser. There is still no public UGC/backend, by design.
- Difficulty remains uncalibrated until real playtest evidence exists.

## Recommended Next Phase

If the user approves the UX direction, the next focused improvement should be a worker-backed diagnostics runtime or a targeted visual/manual authoring QA pass, not broad random generation or case promotion.
