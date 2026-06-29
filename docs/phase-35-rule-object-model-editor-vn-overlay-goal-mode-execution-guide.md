# Phase 35 - Rule Object Model, Editor Grammar, And VN Overlay Repair

Date: 2026-06-29
Status: READY_FOR_EXECUTOR
Owner: executor
Planner thread: 019ef0df-a626-7181-9ca6-1cc75c1f4c47
Executor thread: 019ef271-256c-7be2-9663-e658e2378564
Round budget: 40 executor rounds

## 0. Direct Goal Prompt For Executor

Execute Phase 35 in goal mode. Prioritize the user's manual puzzle-authoring workflow: upgrade rule semantics and the private rule-expression builder so the user can configure richer rules without editing raw JSON, then repair the current `未登记现场` presentation so the VN portraits/dialogue overlay the game scene like the art sample instead of appearing as a separate window.

This phase has two tracks:

1. Primary track: rule/object model and authoring editor support.
2. Secondary track: Phase 34 visual repair for VN overlay, temporary bust portraits, and removal of generic hint UX.

Do not run broad AI puzzle generation. Do not promote new cases. Keep existing shipped cases working through compatibility adapters.

## 1. Required Reading

- `docs/unregistered-scene-packaging-decisions.md`
- `docs/phase-34-unregistered-scene-frontend-adaptation-final-report.md`
- `docs/phase-34-unregistered-scene-frontend-adaptation-goal-mode-execution-guide.md`
- `docs/phase-31/theme-packaging-workflow.md`
- `docs/phase-32/asset-manifest-contract.md`
- `docs/phase-32/presentation-secrecy-rules.md`
- `docs/phase-33/vn-ux-contract.md`
- `docs/ui-art-sample-frontend-adaptation-requirements.md`
- `docs/unregistered-scene-ui-requirements.md`
- `docs/未登记现场_项目设定与玩法对接文档.md`
- `images/samples/main-sample.png`
- `images/samples/avatar_10.png`
- `images/samples/avatar_11.png`
- `images/samples/avatar_00.png`
- `images/samples/avatar_01.png`

Temporary portrait mapping:

- `avatar_10.png`: protagonist normal
- `avatar_11.png`: protagonist thinking
- `avatar_00.png`: assistant normal
- `avatar_01.png`: assistant sensing rules
- protagonist success/failure: temporarily fall back to protagonist normal
- assistant success/failure: temporarily fall back to assistant normal

The four temporary bust images may be copied into the web app's tracked asset location and referenced through the theme asset manifest as `userProvided` or clearly temporary placeholders. Do not mark them as approved final art.

## 2. Product Decisions To Implement

### 2.1 Hints And VN

- Remove the normal product direction of a generic Hint feature.
- Do not expose a "hint" button or hint dialog in normal gameplay.
- VN scope for now is:
  - partner sensing scene rules;
  - success;
  - failure.
- VN must appear directly over the game scene, similar to the art sample.
- During gameplay, bust portraits and dialogue should remain visible in a semi-transparent/frozen state while the player continues interacting.
- Do not create a separate modal/window frame for the normal VN dock.
- Dialogue text may include configured guidance, but must pass secrecy review.

### 2.2 Rule Semantics And Object Model

The project should move away from hard-coding `empty | bottle | bin | mirror | guest` as the long-term semantic model.

Target semantic direction:

- `empty`: no target and no configured objects in the cell.
- `target`: the hidden dangerous/anomaly state.
- `objects[]`: zero or more configured object type ids in the cell.

Existing `bottle`, `bin`, and `mirror` should become configured object types. Future object types should be configurable without changing the core semantics.

Backward compatibility is required:

- Existing shipped content must keep loading.
- Existing shipped cases must still pass schema, solver, proof/no-guess, web runtime, and smoke checks.
- If a full content migration is too risky in this phase, implement a normalized compatibility layer that accepts legacy cells and exposes the new authoring model, then record the remaining migration boundary honestly.

## 3. Rule Grammar To Support

The user wants at least these authorable rule forms:

1. Around each A, the left/right/up/down/surrounding/orthogonal-neighbor scope has B, has no B, at least one B, exactly N B, at most N B, or all cells are B.
2. In A's left/right/up/down line of sight, B is reachable; also support the negative form where no B is visible in that direction.
3. B is in row N.
4. B is in one of the four corners.
5. B is in column M.

Add these strongly recommended baseline forms when feasible in this phase:

- global total count for a target/object/empty selector;
- edge / non-edge / interior position scopes;
- named rectangular or listed regions, with counts;
- adjacency and non-adjacency between selectors;
- same row / same column relation;
- direction-above/below/left-of/right-of relation that does not require adjacency;
- Manhattan distance exactly/at most/at least N, if implementation cost is acceptable;
- first-visible object in a direction, if line-of-sight support is already being touched;
- area count comparison, reusing or extending existing comparative count support;
- conditional count activation, only if it can reuse existing Phase 24 conditional support without destabilizing proof.

Defer unless low-risk:

- contaminated/lying rules;
- complex between-A-and-B path rules;
- multi-clause boolean formulas beyond the editor's ability to explain clearly.

## 4. Implementation Scope

### 4.1 Object Type Registry And Normalized Cells

Add a small, typed object type registry and normalized cell model.

Requirements:

- Default registry includes legacy object types for bottle, bin, and mirror.
- Registry has display labels/icons/categories suitable for `未登记现场`.
- Authoring can add/edit object type metadata in memory for drafts.
- A normalized cell can contain `target` plus `objects[]`.
- Legacy `CellKind` content converts into normalized form:
  - `guest` -> target true, no object;
  - `empty` -> no target, no object;
  - `bottle/bin/mirror` -> object array with that object id.
- Existing runtime can still render legacy-compatible cases.

If a full domain type replacement is too risky, keep the old public types stable and add explicit normalized adapters plus authoring/editor support. Do not do a hidden partial migration that leaves packages disagreeing about the source of truth.

### 4.2 Rule Expression AST

Introduce or extend a rule-expression model that can express:

- selector: target, empty, object type, any object, or configured object group;
- subject selector: object type or target where applicable;
- scope: local direction, surrounding ring, orthogonal neighbors, row, column, corners, edge, interior, named region, line-of-sight direction, same row/column, relative direction, distance;
- predicate/count: exists, none, exactly N, at least N, at most N, all;
- polarity: positive/negative where it reads naturally;
- presentation text generated from logic, not hand-written JSON.

Keep the expression AST separate from display text. Display text must be generated from the expression and remain editable only through safe presentation metadata such as title/flavor, not by rewriting the core logical sentence.

### 4.3 Schema, Solver, Oracle, Proof

For every rule form implemented as authorable:

- schema parses it and produces useful diagnostics;
- solver can evaluate satisfiability/uniqueness/forced facts;
- oracle can evaluate small fixtures when applicable;
- proof either explains the rule or clearly flags unsupported proof semantics before content promotion;
- authoring report distinguishes unsupported-proof from invalid-rule and solver truncation.

Do not allow the editor to create a rule that schema accepts but solver cannot reason about unless it is explicitly marked experimental and blocked from promotion.

### 4.4 Authoring Workbench

Make the workbench usable for the user's manual design process.

Required workbench improvements:

- no normal rule creation through raw JSON;
- add/edit/remove configured object types for a draft, at least for maintainer workflow;
- edit every cell's target flag and object array through UI controls;
- create/remove/reorder/edit rules through structured expression controls;
- include the user-requested rule forms in the rule builder;
- generated Chinese rule sentence updates live from the expression;
- mini preview of affected public scope where possible;
- validation panel clearly shows schema, solver, uniqueness, no-guess proof, proof support, rule contribution, degeneracy, clone-risk, and performance/cap status;
- avoid expensive validation on every keystroke; use debounced/manual run or cached incremental validation.

Raw JSON may remain as export/import/debug, but it must not be the normal authoring path.

### 4.5 VN Overlay Repair

Repair the current Phase 34 VN presentation:

- remove separate modal/window styling for normal gameplay VN;
- display protagonist and assistant busts directly over the scene, following the art sample layout as closely as possible;
- display dialogue box directly over the scene at approximately sample size/position;
- keep busts/dialogue semi-transparent and frozen during gameplay when no active line is advancing;
- align mismatched temporary portrait sizes by CSS or manifest metadata so heads line up visually;
- use `avatar_10`, `avatar_11`, `avatar_00`, `avatar_01` as temporary assets;
- retain accessibility and keyboard support;
- success/failure can use fallback normal portraits until final art exists;
- no VN text or asset key may leak answers, coordinates, candidates, forced cells, target layout, solver/proof internals, or hidden object truth.

### 4.6 Remove Generic Hint UX

Normal player route should no longer present the feature as generic hints.

Allowed:

- developer/maintainer diagnostics may still expose proof/hint internals behind dev/workbench gates;
- partner rule-sensing VN can be triggered by safe configured events;
- success/failure scenes can use VN.

Disallowed:

- a normal "Hint" button/dialog/dock promising solution help;
- proof-backed hint payloads shown as player-facing hint mechanics unless reframed and explicitly configured as partner sensing without answer leakage.

## 5. Non-Scope

Do not:

- generate or promote new puzzle cases;
- run broad AI puzzle production;
- implement public editor/UGC/backend/analytics/daily challenge;
- claim temporary portrait images are final art;
- import final sliced UI art;
- implement lying/contaminated rules unless the simpler grammar and editor work is complete and low-risk;
- remove existing shipped cases;
- weaken correctness, no-guess, uniqueness, or secrecy gates.

## 6. Round Plan

Budget: 40 rounds total.

- Rounds 1-3: inventory current rule/domain/editor/VN state; document migration plan in `docs/phase-35/`.
- Rounds 4-7: object registry and normalized cell adapters with legacy compatibility tests.
- Rounds 8-12: rule-expression AST for selectors, scopes, predicates, and generated Chinese text.
- Rounds 13-17: schema/oracle/solver support for required local, row, column, corner, global, and region/edge/interior rules.
- Rounds 18-21: line-of-sight, adjacency/same-line/relative-direction support where feasible; mark unsupported forms honestly.
- Rounds 22-24: proof/authoring diagnostics for new rule forms; no unsupported authorable rule may silently pass promotion gates.
- Rounds 25-30: workbench UI for object registry, cell target/object-array editing, structured rule controls, live generated text, and validation performance controls.
- Rounds 31-34: VN overlay repair, temporary portrait asset intake, generic hint UX removal/reframe, and player secrecy checks.
- Rounds 35-37: integration QA on shipped cases, workbench fixtures, editor import/export, and responsive smoke.
- Rounds 38-39: buffer repairs for performance, proof gaps, or UI regressions.
- Round 40: full validation, final report, push, and route back to planner/checker.

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
- Keep unrelated untracked files out of commits unless explicitly required by this guide.

## 8. Debug Self-Check

Every round must ask:

- Can the change be explained with the smallest puzzle/editor fixture?
- Does the rule expression generate the expected Chinese text from logic?
- Does schema, solver, proof, authoring, and web agree on the same source of truth?
- Are unsupported rule forms blocked early with a clear diagnostic?
- Does validation stay fast enough for manual authoring?
- Did any player route gain access to target/candidate/forced/proof internals?
- If VN changed, can the player still interact without modal obstruction?

## 9. Architecture Self-Check

Every round must ask:

- Is the object registry/configuration separate from hard-coded core semantics?
- Are legacy cases supported by explicit adapters rather than hidden assumptions?
- Is generated rule text derived from rule expressions instead of freeform JSON?
- Does solver/proof support match what the editor allows?
- Did the phase avoid dragging in final art, public UGC, or new case promotion?
- Are temporary assets clearly marked as temporary/user-provided, not final approved art?

## 10. Validation Matrix

Final validation must include:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
git diff --check
```

Also run focused checks for:

- domain rule/object adapters;
- schema parse/diagnostics;
- solver/oracle rule satisfaction fixtures;
- proof/authoring diagnostics;
- workbench object/cell/rule editing;
- generated Chinese rule text;
- VN overlay and temporary portrait manifest;
- player secrecy scans;
- shipped-case runtime smoke.

If browser automation is available, run desktop/mobile visual smoke for:

- main gameplay route;
- workbench route;
- VN overlay active and frozen states.

If unavailable, document deterministic HTTP/test fallback.

## 11. Boundary Scans

Final report must include scans showing:

- no broad AI-generated cases or Phase 35 experimental cases in `content/cases` or player selector;
- no `@room-axioms/authoring` or generator imports in normal player runtime;
- no answer coordinates, target layout, candidate, forced, solver/proof internals in normal player UI, VN text, asset names, or CSS class names;
- generic hint button/dialog/dock is absent from normal product route;
- temporary portrait assets are not marked final/approved;
- existing shipped cases still pass legacy compatibility;
- editor-created rules cannot silently bypass solver/proof support.

## 12. PASS Criteria

Phase 35 passes when:

- the object registry/normalized cell compatibility layer exists and supports legacy shipped cases;
- the rule-expression builder can author the user's required rule forms without raw JSON editing;
- generated Chinese rule text follows logic and remains readable;
- schema/solver/oracle/proof/authoring support or block diagnostics are consistent for authorable rules;
- the workbench can edit cell target/object arrays and run useful validation without painful performance;
- normal generic hint UX is removed or fully reframed out of the player route;
- VN portraits/dialogue overlay the scene like the art direction, using the specified temporary bust images with reasonable alignment;
- shipped cases still load/play/pass validation;
- full validation, smoke, push, and final report pass.

If the full object-model migration cannot be completed safely, the phase may still pass only if:

- a robust compatibility/normalized authoring layer is implemented;
- all shipped cases remain valid;
- unsupported migration work is explicitly documented with concrete blockers;
- the editor still materially improves the user's manual rule configuration workflow.

## 13. Final Report Template

Final report must include:

- status: READY_FOR_CHECK / READY_FOR_CHECK_WITH_BLOCKER;
- final commit and pushed branch;
- implemented rule forms;
- deferred rule forms and why;
- object model migration status;
- workbench authoring workflow evidence;
- VN overlay evidence and temporary asset mapping;
- generic hint removal/reframe evidence;
- validation commands and results;
- smoke/Pages evidence if web changed;
- boundary scans;
- blockers/caveats;
- recommended next phase.
