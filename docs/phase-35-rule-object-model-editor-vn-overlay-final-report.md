# Phase 35 Final Report - Rule Object Model, Editor Grammar, And VN Overlay Repair

Status: READY_FOR_CHECK_WITH_BLOCKER
Final pushed commit: b527b15 fix: clean temporary VN portrait backgrounds
Branch: main / origin/main
Planner thread: 019ef0df-a626-7181-9ca6-1cc75c1f4c47

## Summary

Phase 35 delivered the compatibility object model, normalized target-cell editing path, initial rule-expression compile model, directional local-scope support, structured workbench cell controls, and the VN scene-overlay repair with temporary bust portraits. Existing shipped cases remain on the legacy schema/runtime path and still validate through the full project gate.

The phase is not claimed as a clean PASS because the workbench does not yet expose every requested rule form as first-class structured controls. The rule-expression layer can represent and compile/block several of those forms, but the normal maintainer UI still needs a fuller rule-expression editor before the user can author all requested spatial rules without JSON.

## Implemented

- Added `packages/domain/src/objectModel.ts` with:
  - default object registry for bottle/bin/mirror;
  - normalized cell state `{ target, objects[] }`;
  - legacy `CellKind` to normalized adapters;
  - normalized target denormalization back to legacy cases when compatible.
- Added authoring draft helpers for normalized target-cell edits and validation of legacy-compatible normalized cells.
- Exposed normalized cells in the web workbench model and added structured cell controls:
  - target checkbox;
  - object checkboxes for configured legacy objects.
- Added rule-expression AST and generated-text/compile path in authoring for:
  - selectors: target, empty, object type, any object, object group;
  - predicates: exists, none, exactly, at least, at most, all;
  - scopes: global, local, row, column, corners, edge, interior, region, line of sight;
  - safe compile to existing DSL where possible;
  - explicit block diagnostics for unsupported or not-yet-materialized forms.
- Extended domain/schema/oracle/solver/proof-compatible local scope handling for directional neighbors:
  - north, south, east, west;
  - retained orthogonal and adjacent behavior.
- Updated the workbench rule controls for directional local scopes.
- Repaired VN presentation:
  - VN overlay now renders as a non-modal scene overlay, not a separate window;
  - dialogue box is fixed at the bottom over the game scene;
  - bust portrait assets overlay the scene directly;
  - backdrop is pointer-events none, dialogue box remains interactive;
  - overlay role is `region`, not modal `dialog`.
- Copied temporary portrait assets into the web app and registered them as `userProvided`, not final/approved:
  - `avatar_10.png` -> `investigator-normal.png`
  - `avatar_11.png` -> `investigator-thinking.png`
  - `avatar_00.png` -> `dispatcher-normal.png`
  - `avatar_01.png` -> `dispatcher-sensing.png`
- Cleaned the copied temporary portraits so the sample checkerboard background is transparent in the player route.
- Removed the normal generic `HintDialog`/generic hint dock route. Proof-backed help is now only surfaced through the partner-review VN path.

## Deferred / Blocked

- Full object-model migration is deferred. Existing public puzzle schema and runtime still use legacy `CellKind`; normalized cells are an explicit compatibility/authoring layer.
- Workbench rule authoring is not yet complete for every requested rule form:
  - row/column/corner/global/region/line-of-sight forms exist in the expression model, but not all have first-class maintainer UI controls;
  - edge/interior/corner scopes require generated/materialized regions before safe legacy DSL compile;
  - `all` predicate is represented but blocked until fixed-scope expansion is safe;
  - any-object/object-group selectors are represented but blocked where legacy DSL cannot express them.
- More advanced forms remain deferred:
  - adjacency/non-adjacency between arbitrary selectors;
  - same row/column relation between selectors;
  - relative direction relation beyond local directional neighbors;
  - Manhattan distance predicates;
  - first-visible object as a high-level authoring form;
  - contaminated/lying rules.

## Validation

- `CommitAndPush.cmd -Message "feat: overlay VN dialogue on scene" ...`: PASS
  - lint PASS
  - typecheck PASS
  - test PASS
  - build PASS
  - commit `a65d3d4` pushed to `origin/main`
- `CommitAndPush.cmd -Message "fix: clean temporary VN portrait backgrounds" ...`: PASS
  - lint PASS
  - typecheck PASS
  - test PASS
  - build PASS
  - commit `b527b15` pushed to `origin/main`
- Final `Validate.cmd`: PASS
  - domain: 4 files / 26 tests PASS
  - schema: 4 files / 36 tests PASS
  - oracle: 5 files / 20 tests PASS
  - solver: 7 files / 54 tests PASS
  - proof: 9 files / 62 tests PASS
  - generator: 8 files / 15 tests PASS
  - authoring: 13 files / 121 tests PASS
  - web: 21 files / 141 tests PASS
  - build PASS
- `git diff --check`: PASS
- `StartDevServer.cmd`: PASS, served `http://127.0.0.1:5173/RoomAxioms/`
- `Smoke.cmd`: PASS
- `StopDevServer.cmd`: PASS
- Browser visual smoke:
  - local page loaded;
  - `.vn-backdrop` role `region`;
  - no `aria-modal`;
  - overlay pointer-events `none`;
  - dialogue box pointer-events `auto`, fixed bottom `0px`;
  - temporary portrait loaded from `/RoomAxioms/theme/portraits/phase-35/dispatcher-normal.png`;
  - generic Hint buttons found: `[]`;
  - screenshot confirmed portrait checkerboard background removed after `b527b15`.

## Boundary Scans

- No Phase 35 experimental cases were added to `content/cases` or `apps/web/src/content`.
- No new puzzle cases were promoted.
- `apps/web/src/view/components/Dialogs.tsx` no longer imports or renders `VNDialogueDock` or `HintDialog`.
- `VNDialogueDock` remains only as a private/tested component, not in the normal product route.
- `apps/web/src/hooks/useRoomAxiomsGame.ts` still creates a partner-review VN scene from safe proof-backed data; this is the intended reframe, not the old generic hint modal.
- Temporary portrait manifest entries are `status: 'userProvided'`, include source/license/dimensions, and say `Not final approved art`.
- Asset/dialogue secrecy tests remain in place and pass; forbidden target/candidate/forced/solver/proof terms are test fixtures or leak-detection constants, not shipped dialogue text.
- Workbench imports `@room-axioms/authoring` intentionally; normal player route does not import the generator.
- Existing shipped cases still pass web verification/runtime smoke through the full web suite.

## Recommended Next Phase

Finish the rule-expression editor as the next focused phase before more puzzle production:

- expose the expression AST in structured workbench controls for global/row/column/region/corner/edge/interior/line-of-sight rules;
- add safe generated-region materialization for positional scopes;
- add proof/authoring support diagnostics directly in the rule builder;
- then let the user manually author candidate puzzles with the richer UI.
