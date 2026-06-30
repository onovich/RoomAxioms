# Phase 37 Workbench UX Repair Plan

Status: Round 1 inventory and repair plan
Workspace: D:\WebProjects\RoomAxioms

## Inventory Findings

- The workbench already has the Phase 36 local case library and explicit create/save/publish/retract/reload/delete actions, but button labels are shortened and should use map-specific labels.
- The layout still centers the three-column shell with a max width, leaving wide empty margins on large screens.
- The normal diagnostics sidebar still shows technical caps on the first screen.
- The normal editor shows two rule surfaces:
  - a player-style read-only rule summary list;
  - the detailed edit-card rule-builder list the user preferred.
- The rule-builder list already has select/copy/delete/move controls, but editing is inline and create is a select action rather than a dedicated create/edit dialog.
- Rule selection currently sets selected rule state, but the board does not preview the selected rule scope.
- Metadata editing still exposes separate title and case-name fields, manual tags, and a status dropdown.
- Cell editing still uses a target checkbox plus object checkboxes instead of a single object-type dropdown with a manager path.
- Object definitions are implicit legacy kinds only; the UI needs an honest workbench object manager that allows local display-label changes and blocks unsafe deletion/unsupported custom semantics.
- Several visible labels still use developer terms such as Schema OK, diagnostics caps, nodes/models/candidate counts, JSON, and detailed diagnostics codes.

## Repair Order

1. Contrast and layout:
   - make `.workbench-shell` use the page width more directly;
   - strengthen workbench link/button/label colors and disabled states;
   - add focused tests for token/class presence where practical.
2. Map actions and metadata:
   - rename top actions to new/save/delete/publish/retract/reload map;
   - remove status dropdown and manual tags from normal metadata UI;
   - sync one title field to both `title` and `caseName` internally.
3. Object editing:
   - replace selected-cell checkboxes with one object dropdown;
   - include a `管理物体` option;
   - add an object manager panel/dialog with list, create, rename, delete guardrails;
   - keep legacy object compatibility honest.
4. Rule editing:
   - remove the duplicate player-style rule summary list from normal UI;
   - keep the detailed edit-card list as the only rule list;
   - move rule controls into a create/edit dialog;
   - add a dedicated `新建规则` button;
   - add edit/delete/copy/reorder buttons on each card;
   - preview selected-rule scope on the board where the rule has materializable cells.
5. Diagnostics cleanup:
   - move caps and technical counters behind details;
   - rename low-level counters in plain Chinese;
   - hide internal codes/refs from first-screen summaries where possible.
6. QA and report:
   - focused workbench tests for user-visible controls and removed duplicate surfaces;
   - browser smoke for direct workbench route;
   - final validation and boundary scans.

## Non-Scope Guardrails

- No shipped case promotion, deletion, or selector change.
- No public UGC/backend storage.
- No new puzzle rule semantics beyond existing Phase 35 safe-to-compile forms.
- No final art slicing or broad visual redesign.
- No raw JSON as the normal authoring path.
- Existing unrelated untracked docs/images remain untouched.

## Initial Validation Targets

- `pnpm --filter @room-axioms/web typecheck`
- `pnpm --filter @room-axioms/web test -- src/workbench/AuthoringWorkbenchScreen.test.tsx`
- `git diff --check`
- Final full matrix per guide after implementation.
