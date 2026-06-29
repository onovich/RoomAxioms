# Phase 35 Final Report - Rule Object Model, Editor Grammar, And VN Overlay Repair

Status: READY_FOR_CHECK
Final pushed repair implementation commit: 17041ab feat: complete workbench rule form controls
Previous final-report commit observed by checker: 00a3471 docs: report Phase 35 completion
Branch: main / origin/main
Planner thread: 019ef0df-a626-7181-9ca6-1cc75c1f4c47

## Summary

Phase 35 delivered the compatibility object model, normalized target-cell editing path, rule-expression compile model, directional local-scope support, structured workbench cell controls, and the VN scene-overlay repair with temporary bust portraits. Existing shipped cases remain on the legacy schema/runtime path and still validate through the full project gate.

The checker repair is complete. The workbench now exposes first-class structured controls for the user-requested authoring forms that can safely compile to the current DSL, and it shows first-class diagnostics for forms that remain unsupported instead of leaving them reachable only through raw JSON/model internals.

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
- Added workbench rule-expression creation controls for:
  - global count over target/empty/object selectors;
  - local directional, orthogonal, and surrounding count rules;
  - row and column constraints;
  - four-corner constraints;
  - existing-region count rules;
  - generated edge and interior count rules;
  - positive line-of-sight reachability;
  - negative line-of-sight reachability.
- Added live line/ray rule controls for row, column, ray origin, ray direction, target selector, and count comparator.
- Added first-class workbench coverage diagnostics so unsupported rule forms are blocked visibly in the authoring UI instead of silently requiring raw JSON.
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
- The requested Phase 35 repair forms are now either authorable through structured controls or explicitly blocked in the workbench. The intentionally blocked forms are:
  - `all` / "全部都是" predicate, because safe fixed-scope expansion is not guaranteed for every selectable scope;
  - any-object and object-group selectors where the legacy DSL cannot express them without a schema migration;
  - distance, first-visible object, arbitrary same-line relations, and arbitrary relative-position relations, which need new schema/proof support rather than UI-only controls.
- More advanced forms remain deferred:
  - adjacency/non-adjacency between arbitrary selectors;
  - same row/column relation between selectors;
  - relative direction relation beyond local directional neighbors;
  - Manhattan distance predicates;
  - first-visible object as a high-level authoring form;
  - contaminated/lying rules.

## Validation

- `CommitAndPush.cmd -Message "feat: complete workbench rule form controls" ...`: PASS
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
    - web: 21 files / 142 tests PASS
  - build PASS
  - commit `17041ab` pushed to `origin/main`
- Focused workbench/authoring repair tests:
  - `pnpm --filter @room-axioms/authoring typecheck`: PASS
  - `pnpm --filter @room-axioms/web typecheck`: PASS
  - `pnpm --filter @room-axioms/authoring test -- src/ruleBuilder.test.ts`: PASS
  - `pnpm --filter @room-axioms/web test -- src/workbench/workbench.test.ts src/workbench/authoringTrial.test.ts`: PASS

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

## Rule-Builder Coverage After Repair

Authorable through structured workbench controls:

- global count for target, empty, and legacy object selectors;
- local directional, orthogonal, and surrounding count rules with none, exists, exactly, at-least, and at-most semantics;
- row N and column M constraints;
- four-corner constraints through generated materialized corner regions;
- existing-region count constraints;
- edge and interior constraints through generated materialized regions;
- line-of-sight positive reachability through ray line-count rules;
- line-of-sight negative reachability through ray line-count rules.

First-class blocked in the workbench:

- `all` predicate / "全部都是", because it needs safe fixed-scope expansion before it can be compiled honestly;
- object groups and any-object selectors where legacy `CellKind` cannot express them;
- arbitrary distance, first-visible, same-line relation, and relative-direction relation rules, because they need schema/proof support before UI authoring would be honest.

## Recommended Next Phase

The next phase can build on this private workbench path instead of raw JSON editing. Recommended follow-ups are schema/proof support for the intentionally blocked high-level rule families, then user-guided manual puzzle authoring with the richer UI.
