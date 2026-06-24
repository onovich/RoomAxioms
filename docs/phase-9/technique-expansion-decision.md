# Phase 9 Technique And Content Expansion Decision Memo

Status: Round 6 decision memo
Scope: internal spike, no new shipped semantics

## Decision

Do not implement a new DSL rule, schema migration, public editor feature, or proof technique in Phase 9.

The best next production candidate is to implement and validate the already reserved proof technique ids:

- `LOCAL_SCOPE_INTERSECTION`
- `LOCAL_SCOPE_DIFFERENCE`

These are more attractive than new rule semantics because they can expand content expressiveness while keeping Puzzle Schema v1, solver constraints, web copy, and shipped cases stable.

## Current Technique Coverage

`@room-axioms/proof` currently emits:

- `GLOBAL_COUNT_SATURATED`
- `GLOBAL_COUNT_ALL_REMAINING`
- `LOCAL_COUNT_SATURATED`
- `LOCAL_COUNT_ALL_REMAINING`
- `UNIQUE_TARGET_NEIGHBOR_INTERSECTION`
- `KNOWN_SAFE_FROM_NON_GUEST_OBJECT`

Reserved but not emitted:

- `LOCAL_SCOPE_INTERSECTION`
- `LOCAL_SCOPE_DIFFERENCE`

Round 5 difficulty scoring shows a gap in the MVP pacing curve:

- `case-001` through `case-003` and `case-008` through `case-010` are currently low provisional bands because their initial observations already leave a unique guest layout.
- `case-004` through `case-007` score as high provisional bands because they rely on a dense one-wave proof with 13 deductions and 15 initial guest layouts.

The next useful content target is not just more cases; it is better mid-band proof pacing.

## Candidate Ranking

| Candidate | Scope | Value | Risk | Decision |
| --- | --- | --- | --- | --- |
| Emit `LOCAL_SCOPE_INTERSECTION` | Proof only, current DSL | Helps explain overlapping local-count scopes and unlocks mid-band content. | Medium: requires careful solver-backed validation and fixture design. | Recommend next production phase. |
| Emit `LOCAL_SCOPE_DIFFERENCE` | Proof only, current DSL | Helps derive cells from overlapping local scopes with known differences. | Medium-high: explanation text must stay human-readable. | Recommend after intersection. |
| Add `lineCount` row/column rules | Schema, solver, proof, UI copy | Strong content variety and easier authored patterns. | High: breaking DSL expansion without migration plan. | Defer. |
| Add Manhattan distance rules | Schema, solver, proof, UI copy | Strong spatial variety. | High: more UI scope visualization and edge semantics. | Defer. |
| Add visibility/line-of-sight rules | Schema, solver, proof, UI copy | Strong theme and puzzle variety. | Very high: blocker semantics and visual explanation needed. | Defer. |
| Add editor/UGC mechanics | Tool/UI/product | Would accelerate authoring later. | High: public scope and validation gates not ready. | Defer to authoring roadmap. |

## Required Tests For The Recommended Proof Expansion

Before `LOCAL_SCOPE_INTERSECTION` or `LOCAL_SCOPE_DIFFERENCE` can enter production, add:

- proof unit tests with tiny 3x3 fixtures;
- solver-backed deduction validation tests for each emitted deduction;
- no-guess verifier regression where the new technique is required and absence causes `EXPLANATION_GAP` or `GUESS_POINT`;
- negative tests proving the technique does not infer from reverse implications;
- stable proof rendering snapshots;
- at least one content fixture scored by the provisional difficulty tool;
- web runtime tests confirming hints render the proof data without exposing target or candidate internals.

## Required Tests For Future DSL Expansion

Before adding `lineCount`, distance, or visibility rules, add or update:

- `@room-axioms/domain` rule union and exhaustive handling;
- `@room-axioms/schema` Zod schema and diagnostics;
- solver constraint compilation and bounded search tests;
- oracle cross-checks for tiny fixtures when feasible;
- proof techniques and verifier regressions;
- rule-copy and scope visualization tests in web UI;
- content migration notes and compatibility policy;
- generator sampling/filter/minimization tests for the new rule kind.

## Content Expansion Notes

Near-term content expansion should target mid-band puzzles using current DSL v1:

- fewer pre-solved global-count cases;
- more one- or two-step local-count cases;
- at least one case whose proof genuinely requires local scope overlap;
- explicit rejection of generated cases that pass solver uniqueness but fail human proof coverage.

These cases should remain experimental until they pass schema, solver, proof/no-guess, final uniqueness, runtime loading, accessibility smoke, and planner acceptance.

## Phase 9 Non-Implementation Rationale

Round 6 intentionally lands no proof or DSL code. A tiny proof addition would still change accepted hint/proof behavior and deserves its own production guide with fixtures, copy review, runtime tests, and planner acceptance.

This keeps Phase 9 as an honest spike: it reports the next path without destabilizing the accepted MVP.
