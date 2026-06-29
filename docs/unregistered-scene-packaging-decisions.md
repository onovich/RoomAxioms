# Unregistered Scene Packaging Decisions

Date: 2026-06-29
Status: active planning record

This document records user-level product and architecture decisions for the `未登记现场 / UNREGISTERED SCENE` packaging track after Phase 34.

## Terminology

The current Phase 34 terminology direction is accepted and may continue to be refined later. The terms do not need to be treated as permanently frozen.

Accepted current terms:

- `guest` player-facing presentation: `异常区域`
- rules: `现场定则`
- board: `现场平面图`
- evidence/notes: `现场登记记录`
- submit: `提交现场登记图`

Change from Phase 34 direction:

- The current hint feature should be removed from the normal product direction.
- Future VN/gameplay support should not be framed as a generic hint system.

## Next Frontend Step

The next execution phase is not decided yet.

Open user decision:

- Option A: repair/refine the current Phase 34 packaging implementation after visual review.
- Option B: proceed to final sliced-art asset intake and polish.

Until this is decided, do not auto-dispatch a new frontend phase.

## Rule Semantics And Object Model

The current domain model is still `empty | bottle | bin | mirror | guest`, but the desired future architecture should not stay bound to those concrete object names.

Desired semantic direction:

- Cell state should move toward `empty / target / objects`.
- `objects` should be an array.
- Object types should be extensible and configured outside the core semantics.
- Existing `bottle`, `bin`, and `mirror` should become configured object types, not hard-coded semantic categories.
- Future objects from the theme, such as cameras, emergency lights, terminals, closets, stairwells, bodies, or other scene elements, should be able to enter the rule system through the object-type configuration when a domain/schema expansion phase is deliberately planned.

Important boundary:

- Do not silently add decorative sample objects as rule-bearing objects in the current frontend.
- A separate domain/schema/solver/proof/editor migration phase is required before object-type expansion becomes real gameplay semantics.

## VN Runtime Direction

VN should not be a separate floating window. It should appear like the original art direction: portraits and dialogue box overlay directly on top of the game interface.

VN scope for now:

- partner sensing of scene rules;
- success;
- failure.

Out of scope for now:

- generic hint function.

Runtime behavior:

- During gameplay, character busts remain visible with idle presentation.
- Portraits and dialogue box should become semi-transparent/frozen while the player continues interacting.
- The last displayed line may contain configured gameplay guidance, depending on the case/script, but it must be authored and checked for secrecy.
- The dialogue box should be close to the size and placement of the approved art sample.

Character set:

- protagonist bust portrait;
- assistant bust portrait.

Expression/state set:

- protagonist: normal, thinking, success, failure;
- assistant: normal / sensing-rules, success, failure.

Expression implementation:

- Expressions are separate bust image replacements, not complex facial rigs.

## Puzzle Authoring Route

The user will continue puzzle design manually.

Agent responsibility:

- Make validation tools pleasant and fast enough for manual design.
- Keep solver, proof/no-guess, uniqueness, difficulty, degeneracy, rule contribution, clone-risk, and copy diagnostics usable from the private authoring workflow.
- Use reasonable solving strategies so validation cost does not make iteration painful.

Product direction:

- Do not prioritize broad AI-generated puzzle batches.
- AI may assist with analysis, critique, repair suggestions, or small draft variants, but human design is the primary source of accepted puzzle content.

## Agent-Owned Defaults

The planner/executor may continue to handle these without repeated user approval:

- small copy cleanup that does not change core terminology or rule semantics;
- frontend implementation details such as CSS tokens, component splits, tests, and responsive breakpoints;
- secrecy boundaries for asset keys, CSS class names, VN text, normal player UI, and developer-only diagnostics;
- manifest and review workflow for final-art asset intake;
- checker validation and repair routing for completed phases.

## Pending Decision Before Next Dispatch

Before dispatching the next phase, the user should decide:

1. repair/refine the current themed frontend after visual review; or
2. proceed to final sliced-art asset intake and polish.

If the user chooses a domain/object expansion phase instead, plan it separately because it affects schema, solver, proof, authoring editor, content format, and migration.
