# Phase 35 Implementation Plan

Date: 2026-06-29
Status: ROUND_1_PLAN

## Scope Snapshot

Phase 35 has two implementation tracks:

1. Rule/object model and maintainer authoring workflow.
2. VN overlay and presentation repair for the Unregistered Scene packaging.

The phase must not promote new cases, run broad puzzle generation, weaken correctness gates, import final art, or expose answer-bearing internals to normal players. Existing shipped cases must keep working through explicit compatibility.

## Current Inventory

### Domain And Rules

- `packages/domain` still exposes legacy `CellKind` values: `empty`, `bottle`, `bin`, `mirror`, and `guest`.
- Existing rule families already cover global counts, per-subject local counts, region counts, static row/column line counts, ray line counts, record sets, overlap counts, comparative counts, and conditional counts.
- The current model can represent many Phase 35 rule ideas, but object semantics are still hard-coded and cell state cannot yet express `target + objects[]`.
- Directional local scopes and authoring-level object selectors need explicit support or explicit block diagnostics.

### Schema, Solver, Oracle, Proof

- Schema currently parses the shipped rule DSL and keeps board size constrained to the current production range.
- Oracle and solver can evaluate the existing DSL families, including row/column/ray line counts and Phase 24 count-comparison forms.
- Proof support is narrower than solver support. Any newly authorable form must either be proof-backed or blocked from promotion by authoring diagnostics.

### Authoring Workbench

- The workbench can import/export JSON and edit many shipped-case fields.
- Rule-builder support exists for several rule families, but normal rule creation is still tied too closely to concrete JSON-shaped rules.
- Cell editing is legacy-kind based instead of target/object-array based.
- Raw JSON may remain as debug/export, but it cannot remain the normal authoring path for the user-requested workflow.

### VN And Presentation

- Phase 34/33 infrastructure already has theme asset contracts, dialogue scene contracts, VN UX preferences, and secrecy guidance.
- The Phase 35 target presentation is closer to the local art sample: portraits and dialogue should overlay the game scene directly, not appear as a separate VN window.
- The specified sample busts may be copied into tracked web assets as temporary user-provided placeholders, but must not be marked as approved final art.
- Generic normal-player hint UX must be removed or reframed into partner rule-sensing and success/failure scenes.

## Implementation Strategy

### Round Group A: Object Model Compatibility

- Add a typed object registry and normalized cell adapter without breaking the existing shipped content schema.
- Keep legacy `CellKind` as a compatibility surface.
- Convert legacy cells as:
  - `guest` -> `target: true`, `objects: []`
  - `empty` -> `target: false`, `objects: []`
  - `bottle/bin/mirror` -> `target: false`, `objects: [id]`
- Add tests proving shipped cases can normalize and denormalize safely where legacy representation is still possible.

### Round Group B: Rule Expression Model

- Introduce an authoring-oriented rule expression AST separate from display text.
- Support selectors for target, empty, object type, any object, and object groups.
- Support scopes for local neighbor/ring, directional local, row, column, corners, regions, global, edge/interior, and ray visibility where feasible.
- Generate plain Chinese logical sentences from the expression.
- Compile supported expressions to the existing DSL or newly added narrow DSL extensions.
- Return explicit diagnostics for unsupported solver/proof/editor forms instead of silently accepting them.

### Round Group C: Core Rule Support

- Prefer compiling to existing DSL families for low-risk forms:
  - global counts;
  - row/column counts;
  - region/listed-cell counts;
  - ray visibility counts;
  - overlap/comparative/conditional forms already implemented.
- Add narrow core support only when necessary for required authoring forms, with schema/solver/oracle tests before workbench exposure.
- Treat proof as a gate: unsupported proof forms can be authorable for experimentation only if promotion diagnostics block them clearly.

### Round Group D: Workbench UX

- Add object registry controls for draft-time object metadata.
- Replace legacy-only cell editing with target plus object-array controls, while writing back through compatibility adapters.
- Add structured rule-expression controls for the required forms.
- Keep generated rule text live and derived from logic.
- Move raw JSON to an explicit debug/export area.
- Keep validation manual/debounced enough to stay usable.

### Round Group E: VN Overlay And Hint Reframe

- Copy the four specified temporary busts into tracked web assets.
- Register them in the theme manifest as temporary/user-provided, not approved final art.
- Repair VN layout so portraits and dialogue overlay the scene directly.
- Remove normal generic hint dialog/button language from player-facing gameplay.
- Preserve proof-backed internals only behind developer/workbench gates or safe partner rule-sensing presentation.

## Risk Controls

- Do not migrate shipped case JSON in bulk.
- Do not introduce new player-facing cases.
- Keep each new authorable rule form covered by tests or a clear unsupported diagnostic.
- Keep player secrecy scans focused on VN text, visible UI copy, asset keys, CSS class names, and normal runtime imports.
- Keep unrelated local context files and raw sample images out of commits except copied temporary portrait assets in the web app.

## Round 1 Gate

This round is intentionally documentation-only:

- Record the implementation route and current boundary decisions.
- Validate the doc diff and commit it before touching runtime code.
- Next round starts object registry and normalized cell compatibility tests.
