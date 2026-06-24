# Phase 13 Quality Gate

Status: Round 1 baseline

## Goal

Phase 13 may promote at most one shipped case if the case is a natural mid-band `LOCAL_SCOPE_DIFFERENCE` puzzle. Quality beats case count.

## Required Promotion Gate

A Phase 13 promotion candidate must pass all of these gates:

- schema parse passes with zero issues;
- target satisfies every rule;
- initial observations are satisfiable;
- initial guest layout count is bounded and not truncated;
- final guest layout is unique;
- no-guess proof passes;
- accepted reveal set keeps `LOCAL_SCOPE_DIFFERENCE`;
- authoring `report` returns `ok: true`;
- authoring `score` remains `calibratedWithRealPlaytest: false`;
- authoring `minimize` either preserves `LOCAL_SCOPE_DIFFERENCE` or the candidate is not promoted;
- copy is plain Chinese and player-readable;
- web runtime/player path stays secret and stable;
- `case-004` remains default;
- existing shipped cases, including `case-011`, remain valid.

## Promotion Rejection Conditions

Reject or stop instead of promoting when:

- the minimized reveal set drops `LOCAL_SCOPE_DIFFERENCE`;
- difference appears only because redundant reveals were kept;
- candidate score is below the Phase 11 mid-band pacing target without a clear pacing reason;
- solver caps are hit or truncation appears;
- proof/no-guess fails or requires a guess;
- case copy exposes target, candidates, forced cells, generator output, or authoring diagnostics;
- promotion requires new DSL/schema/proof/solver semantics.

## Non-Scope Guard

Phase 13 must not add:

- new proof techniques, including safe-cell difference semantics;
- new shipped DSL rule kinds;
- Puzzle Schema v1 changes;
- solver rewrite or SAT/WASM backend;
- public editor, UGC, backend, analytics, daily challenge, or broad redesign;
- player exposure of target layouts, candidate counts, forced cells, generator internals, or authoring diagnostics.

