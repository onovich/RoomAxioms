# Phase 9 Internal Authoring Workflow And Roadmap

Status: Round 7 roadmap
Scope: internal maintainer workflow only

## Decision

Do not add a temporary CLI, visual editor, web editor, or developer web panel in Phase 9.

The smallest useful authoring support is a documented offline workflow backed by the generator package APIs that landed in this spike. A production authoring tool should come next, but it should be built deliberately around stable validation reports rather than as a one-off script.

## Maintainer Workflow For Experimental Candidates

Until a production authoring CLI exists, maintainers should treat candidate creation as a report-only workflow:

1. Choose a seed, board size, allowed kinds, guest count, and current DSL v1 rules.
2. Use `@room-axioms/generator` APIs to sample or hand-check a candidate target and initial reveal pool.
3. Keep only candidates that pass schema parsing, target rule satisfaction, initial satisfiability, proof/no-guess verification, and final guest-layout uniqueness.
4. Run reveal minimization to remove redundant initial observations only when all validation gates still pass.
5. Score the candidate with provisional difficulty metrics and keep `calibratedWithRealPlaytest` false.
6. Write the candidate evidence to an internal report or experimental path, not to the default player selector.
7. Ask planner/checker acceptance before promoting any case into `content/cases` or `apps/web/src/content/cases.ts`.

This workflow keeps generated content out of the shipped MVP until it has both mechanical validation and explicit acceptance.

## Tooling Options

| Option | Value | Cost | Phase 9 Decision |
| --- | --- | --- | --- |
| JSON templates | Low-friction authoring starting point for maintainers. | Low. | Recommend for next production phase. |
| Validation report CLI | Converts generator/schema/solver/proof output into repeatable evidence. | Medium. | Recommend as the first production tool. |
| Reveal minimization CLI mode | Makes the Round 4 prototype usable without importing package APIs by hand. | Medium. | Recommend after the validation report path. |
| Provisional difficulty report CLI mode | Helps compare candidates and detect pacing gaps. | Medium. | Recommend, with calibration caveat preserved. |
| Visual editor | Easier spatial authoring and reveal editing. | High: UI, accessibility, target secrecy, and validation UX. | Defer until CLI/report contracts are stable. |
| Developer-only web inspector | Useful for internal review of accepted experimental candidates. | Medium-high: target access and gating risk. | Defer unless a future guide scopes it tightly. |
| Public editor or UGC | Product expansion and retention potential. | Very high: moderation, storage, validation, abuse, compatibility. | Out of scope. |

## Recommended Next Production Phase

Recommended title: Phase 10 - Authoring CLI And Proof Technique Hardening.

The next phase should build a private offline authoring CLI that consumes the public APIs already used by Phase 9:

- `@room-axioms/schema` for Puzzle Schema v1 parsing and diagnostics;
- `@room-axioms/solver` for satisfiability, uniqueness, forced-cell, and bounded count evidence;
- `@room-axioms/proof` for no-guess verification and explanation-gap detection;
- `@room-axioms/generator` for sampling, filtering, reveal minimization, and provisional difficulty scoring.

Recommended commands:

- `validate <case.json>`: schema, target rules, initial satisfiability, final uniqueness, proof/no-guess, and cap status.
- `score <case.json>`: provisional internal metrics with `calibratedWithRealPlaytest: false`.
- `minimize <case.json>`: report-only reveal removal evidence without overwriting source JSON by default.
- `sample --seed <seed> --template <template.json>`: deterministic experimental candidate generation.
- `report <case.json>`: one markdown/JSON evidence bundle suitable for planner review.

The CLI should not promote content automatically. Promotion remains a planner/checker decision after validation, runtime loading, accessibility smoke, and release posture review.

## Proof And Content Priority

The best content expansion target is a mid-band pacing lane between the current low-band pre-solved cases and the dense one-wave `case-004` through `case-007` style.

Priority order:

1. Implement `LOCAL_SCOPE_INTERSECTION` in `@room-axioms/proof` with solver-backed deduction validation and stable rendering.
2. Build one or two experimental mid-band fixtures that genuinely require the new proof technique.
3. Add the authoring CLI validation/report path.
4. Use generator sampling and minimization to search variants of those fixtures.
5. Run real playtests before any public difficulty labels or calibration claims.

`LOCAL_SCOPE_DIFFERENCE` remains a strong follow-up, but it should wait until intersection has shipped with evidence.

## Explicit Deferrals

Phase 9 should not expand into:

- public level editor;
- UGC upload or sharing;
- backend, accounts, analytics, leaderboard, or daily challenge;
- breaking Puzzle Schema v1 changes;
- line, distance, visibility, or blocker rule semantics;
- public player exposure of generator, target, forced-cell, candidate-count, or solver internals.

## Risks And Unknowns

- Naive sampling can produce solver-valid puzzles that current proof templates cannot explain.
- Current MVP difficulty scores expose a pacing gap, but they are not player-calibrated.
- A visual editor may be valuable later, but building it before report contracts exist would make validation boundaries harder to enforce.
- Future generated content still needs real playtest evidence before public difficulty labels become trustworthy.

## Round 7 Outcome

Round 7 lands documentation only. That is the correct spike outcome because the repo already has package-level generator APIs and tests, while a production CLI/editor needs a focused acceptance guide and user-facing workflow review.
