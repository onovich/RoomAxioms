# Phase 9 Generator Contract

Status: Round 1 baseline
Package: `@room-axioms/generator`
Scope: internal spike only

## Package Boundary

The Phase 9 generator lives in `packages/generator` as `@room-axioms/generator`.

It may depend on:

- `@room-axioms/domain`
- `@room-axioms/schema`
- `@room-axioms/solver`
- `@room-axioms/proof`

It must not be imported by `@room-axioms/domain`, and it must not ship experimental content into the default web selector.

## Input Contract

Generator inputs are:

- deterministic seed policy using `mulberry32`;
- board size supported by Puzzle Schema v1;
- allowed cell kinds from the current domain model;
- guest count;
- current DSL v1 rules;
- initial reveal count range;
- solver/model/attempt caps;
- artifact policy.

## Output Contract

Generator outputs are:

- accepted candidates with validation-stage evidence;
- rejected candidates with structured failure codes and the failed stage;
- aggregate solver stats;
- reveal minimization reports when minimization is attempted;
- provisional difficulty scores that are explicitly uncalibrated.

## Validation Pipeline

An accepted candidate must pass all of these gates:

1. Schema parse and static diagnostics.
2. Target satisfies all current DSL v1 rules.
3. Initial observations are satisfiable.
4. Final guest layout is unique.
5. Proof/no-guess verifier passes.
6. Runtime/web loading path is compatible before any future promotion.

## Artifact Policy

Default policy is `report-only`.

Experimental JSON, if created later in the spike, must live under an experimental path and must not appear in:

- `content/cases`
- `apps/web/src/content/cases.ts`
- the player-facing default selector

Planner acceptance is required before any generated case can be promoted.

## Known Search Limits

Phase 9 is capped to small boards, current cell kinds, and current DSL v1 rules. It does not introduce a new schema version, rule semantics, public editor, backend, or UGC flow.
