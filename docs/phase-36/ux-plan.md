# Phase 36 UX Plan - Authoring Workbench And Async Diagnostics

Status: implementation plan
Date: 2026-06-30

## Current Inventory

- `apps/web/src/workbench/AuthoringWorkbenchScreen.tsx` is the main private workbench UI.
- `apps/web/src/workbench/model.ts` owns draft parsing, schema-validated patch helpers, diagnostics projection, and rule-builder entry points.
- `apps/web/src/workbench/caseLibrary.ts` exposes shipped cases and selected experimental fixtures as read-only imports.
- Existing workbench tests already cover route privacy, draft patching, metadata/rule edits, rule-builder creation, and full authoring diagnostics.

The current UI is still developer-shaped:

- the top bar has a case import dropdown;
- the first column is a raw draft JSON editor;
- export/source/path/status, theme/VN review, rules JSON, and region/anchor JSON remain visible in normal flow;
- diagnostics run as one full synchronous analysis wrapped in `setTimeout`;
- diagnostics have no selectable checklist, progress, cancellation, or partial results.

## Target User Flow

1. Choose a case from a left library grouped by `草稿`, `已发布`, and immutable built-in templates.
2. Create a new local authored case or copy a built-in case into a local draft.
3. Edit board, cells, metadata, and structured rules without touching raw JSON.
4. Save the current local case to browser-local storage.
5. Publish/retract local cases between the two local authoring states.
6. Delete only local authored cases with confirmation.
7. Select diagnostic checks, run them asynchronously, watch progress, cancel if needed, and keep partial results.

## Local Library Decision

Use IndexedDB for browser persistence, with an in-memory fallback for tests and unsupported environments. The storage layer will be private to the workbench and will not write `content/cases`.

Model fields:

- local id, title, case name;
- `draft` or `published` state;
- version and timestamps;
- serialized puzzle JSON;
- source marker internal to the model, not primary UI copy;
- optional template source id when copied from a built-in case.

Built-in cases stay immutable. Editing or saving a built-in case creates a local draft copy.

## Diagnostics Decision

Add a selected-check model and chunked async runner for this phase. A Web Worker is deferred because the current workbench diagnostics call many package APIs that are already bundled in the app and the immediate blocker is UI responsiveness/cancellation, not cross-thread isolation.

The runner will:

- accept selected diagnostic ids and a draft snapshot;
- yield between steps with `setTimeout(0)`;
- expose progress percentage and current step label;
- accept an abort signal;
- preserve completed partial results on cancellation;
- discard stale/superseded completions by run id.

The selected checks will map honestly onto existing authoring diagnostics. Some checks share the same underlying full diagnostic report, but users can choose which results to display and which expensive groups to request.

## Normal UI Cleanup

Remove from ordinary workbench flow:

- Import panel and case import dropdown;
- raw draft JSON as primary editor;
- export JSON button;
- source/path/filename/status summary;
- manifest/placeholders/pending/approved/dialogue/review panels;
- rules JSON debug editor;
- region/anchor JSON editor.

If a maintainer-only debug escape hatch is needed later, it must be default-closed and outside the normal authoring path. Phase 36 will avoid keeping those sections in the main UI.

## Contrast Repair

Keep links/buttons on dark gray surfaces at high contrast. In particular, avoid low-contrast blue text on gray backgrounds by using theme tokens with a light foreground for informational chips and selected states.

## Non-Scope Guard

- No public UGC or backend.
- No shipped case promotion.
- No new rule semantics beyond Phase 35.
- No broad generation from the Minesweeper notes.
- No final art import or VN redesign.
