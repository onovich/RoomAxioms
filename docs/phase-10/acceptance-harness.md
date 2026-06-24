# Phase 10 Acceptance Harness And Risk Register

Status: Round 1 baseline
Scope: Phase 10 - Authoring CLI And Proof Technique Hardening

## Acceptance Checklist

Phase 10 is ready for planner check only when all of these are true:

- `LOCAL_SCOPE_INTERSECTION` is emitted by `@room-axioms/proof` from public observations, public rules, and prior human deductions only.
- The new technique has positive unit tests, negative unit tests, solver-backed deduction validation, no-guess verifier regression coverage, and stable proof rendering.
- Existing MVP cases `case-001` through `case-010` remain valid, and `case-004` remains the default web case.
- Experimental mid-band fixtures are validated through schema, solver, proof/no-guess, uniqueness, and provisional difficulty scoring.
- Experimental fixtures stay out of `content/cases` and `apps/web/src/content/cases.ts`.
- The private authoring CLI supports `validate`, `score`, `minimize`, `sample`, and `report`, or any deferral is explicit in the final report.
- CLI output records solver caps/truncation status and never silently promotes content.
- Difficulty scores remain uncalibrated unless real playtest evidence exists.
- Domain remains free of schema, solver, proof, oracle, generator, authoring, Zod, UI, browser, and filesystem dependencies.
- Solver, proof, and generator remain independent of React, Vite, browser UI code, and authoring internals.
- Authoring tooling is not imported by `apps/web`, shipped content, domain, schema, solver, proof, or generator.
- No public editor, UGC, backend, analytics, daily challenge, broad redesign, breaking schema migration, or new shipped DSL rule enters the phase.

## Package Boundary Decisions

Proof work stays in `packages/proof`.

Private authoring work should live in a new private workspace package:

```text
packages/authoring
```

Allowed authoring dependencies:

- `@room-axioms/domain`
- `@room-axioms/schema`
- `@room-axioms/solver`
- `@room-axioms/proof`
- `@room-axioms/generator`

Forbidden authoring relationships:

- `apps/web` must not import `@room-axioms/authoring`.
- `content/cases` must not import or depend on authoring artifacts.
- `@room-axioms/domain`, `@room-axioms/schema`, `@room-axioms/solver`, `@room-axioms/proof`, and `@room-axioms/generator` must not import `@room-axioms/authoring`.

The authoring package is a private Node-side maintainer tool, not a player runtime feature.

## Smallest Intersection Fixture Candidate

The smallest useful fixture should be a 3x3 board using Puzzle Schema v1 and current `forEachCount` DSL semantics.

Round 2 should formalize this before code changes, but the candidate shape is:

- two or more known local-rule subjects;
- each subject creates a local target scope with unresolved candidates;
- overlapping scopes imply a safe or target conclusion by comparing the target requirement over the shared portion and non-shared portions;
- the conclusion is not derivable by existing global saturation, local saturation, all-remaining, or `UNIQUE_TARGET_NEIGHBOR_INTERSECTION` alone;
- no target layout access is needed to emit the deduction.

Negative fixture requirements:

- no deduction from reverse implication such as "a guest near a mirror implies a mirror rule subject";
- no deduction when overlap is suggestive but not logically forced;
- no deduction when the apparent result depends on hidden target values;
- no deduction when the supported result is really a `LOCAL_SCOPE_DIFFERENCE` pattern deferred out of Phase 10.

## Risk Register

| ID | Risk | Impact | Mitigation |
| --- | --- | --- | --- |
| P10-R1 | Intersection semantics accidentally duplicate solver search narration. | High | Define human template first, then validate with solver by contradiction. |
| P10-R2 | The technique infers from reverse implication. | High | Add explicit negative fixtures before implementation. |
| P10-R3 | Proof ordering changes destabilize MVP hints. | Medium | Keep deterministic ordering and document any intentional snapshot changes. |
| P10-R4 | Experimental fixtures leak into default content. | High | Store fixtures under an experimental path and scan `apps/web/src/content/cases.ts`. |
| P10-R5 | CLI rewrites source cases or hides cap failures. | High | Make commands report-only by default and include cap/truncation fields. |
| P10-R6 | Difficulty scores look player-calibrated. | Medium | Preserve `calibratedWithRealPlaytest: false` in CLI reports and docs. |
| P10-R7 | Authoring package becomes a transitive runtime dependency. | Medium | Boundary scans before final report and no imports from web/runtime packages. |

## Round 1 Decision

Round 1 creates documentation only. Implementation starts after Round 2 defines exact `LOCAL_SCOPE_INTERSECTION` semantics and fixtures.
