# Phase 12 Acceptance Checklist

Status: Round 1 baseline

## Proof Technique Gate

- `LOCAL_SCOPE_DIFFERENCE` semantics are documented before emission changes.
- Positive tests cover the smallest nested local-scope difference pattern.
- Negative tests cover reverse implication, hidden-target dependence, unsupported overlap, and intersection-only cases.
- Solver-backed validation confirms every emitted difference deduction is entailed.
- No-guess verifier regression proves difference can advance a proof wave without treating solver search as explanation.
- Stable renderer output includes public proof parents and no hidden data.

## Content Gate

- Experimental Phase 12 fixtures live under `content/experimental/phase-12/`.
- Experimental fixtures are not imported by `content/cases` or `apps/web/src/content/cases.ts`.
- Authoring `report`, `score`, and `minimize` evidence is recorded for experimental candidates.
- At most one case may be promoted to shipped content in this phase.
- A promoted case must pass the Phase 11 promotion checklist before import.
- `case-004` remains the default case.
- Difficulty scoring remains explicitly uncalibrated without real playtest feedback.

## Boundary Gate

- `LOCAL_SCOPE_DIFFERENCE` remains proof-side only.
- Puzzle Schema v1 and DSL v1 stay unchanged.
- Domain remains free of schema, solver, oracle, proof, generator, authoring, Zod, React, Vite, browser, and Node filesystem dependencies.
- Solver, proof, generator, and authoring stay independent of player-facing React UI code.
- Authoring tooling is not imported by player-facing web code or shipped content.
- Player UI does not expose target layouts, candidate counts, forced cells, generator data, authoring diagnostics, or solver internals.

## Final Gate

- Full validation passes: lint, typecheck, test, build, and `git diff --check`.
- Focused proof and authoring tests pass.
- Local smoke passes if shipped content or web selector files change.
- Final report exists at `docs/phase-12-local-scope-difference-content-expansion-final-report.md`.
- Working tree is clean and the final commit is pushed.

