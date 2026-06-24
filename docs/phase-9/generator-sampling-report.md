# Phase 9 Generator Sampling Report

Status: Round 2 prototype
Package: `@room-axioms/generator`

## Scope

Round 2 added deterministic target and observation sampling for small boards using existing Puzzle Schema v1, domain cell kinds, DSL v1 rules, solver checks, and proof preview.

No generated case was added to `content/cases` or to the default web selector.

## Prototype

Public package APIs:

- `createGeneratorSeed(seed)`
- `sampleTargetAndObservationPools(input, template?)`

Sampling behavior:

- assigns a deterministic guest set from the seed;
- fills safe cells from allowed non-guest kinds;
- samples initial reveals only from non-guest cells;
- parses the generated puzzle through schema;
- checks target rule satisfaction through the solver;
- checks initial satisfiability through the solver;
- previews initial guest-layout uniqueness;
- previews proof/no-guess completion;
- records structured rejection codes when a stage fails.

## Focused Evidence

`packages/generator/src/sampling.test.ts` covers:

- seed determinism and different-seed variation;
- non-guest initial observation pools;
- target-rule rejection when sampled guest count conflicts with rules;
- explicit search-cap rejection when solver `maxNodes` is zero.

## Known Limits

- The sampler is intentionally naive random sampling, not a production generator.
- It does not yet keep only fully passing candidates; Round 3 owns the generate-verify-filter loop.
- It does not write generated JSON artifacts.
- It supports current DSL v1 only and does not add rule semantics.
