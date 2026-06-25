# Phase 23 Target Candidate Production - Round 09

Round: 9
Decision: no target 4/5 candidate is promotable from the inherited experimental pool or the current player selector under the Phase 23 gates.

## Scope

This round rechecked inherited experimental candidates and the current shipped selector with the Phase 23 difficulty review, degeneracy gates, and anti-clone gate. The goal was to find any existing candidate that could honestly enter the target 4/5 promotion queue before authoring new content.

## Generator Sampling Carryover

Fresh Phase 23 sampling smoke was run before this audit:

| Seed | Template | Attempts | Accepted | Main rejection |
| --- | --- | ---: | ---: | --- |
| 2301 | `content/experimental/phase-19/phase-19-mixed-4x4-template.json` | 128 | 0 | `TARGET_VIOLATES_RULES` |
| 2302 | `content/experimental/phase-21/templates/s7-intersection-difference-template.json` | 224 | 0 | `TARGET_VIOLATES_RULES` |
| 2303 | `content/experimental/phase-21/templates/s2-delayed-intersection-template.json` | 192 | 0 | `TARGET_VIOLATES_RULES` |

Total bounded attempts: 544.
Accepted candidates: 0.

Interpretation: the existing random sampler still fails before proof/uniqueness gates on rule-heavy templates because sampled targets usually do not satisfy the fixed rule set. This matches the Phase 21 generator-capability evidence and keeps manual/proof-skeleton authoring as the only viable promotion path for this phase unless a narrow smarter sampler is added later.

## Candidate Audit

Focused command shape:

```powershell
cmd /c pnpm.cmd --filter @room-axioms/authoring --silent exec node dist/cli.js report <absolute-case-path>
```

| Candidate | Ready | Target 4 pass | Bucket | Waves | Deductions | Effective unknowns | Material families | Degeneracy | Main target-4 blockers |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- | --- |
| `phase-19-intersection-wide-001` | yes | no | baseline | 1 | 5 | 7 | 1 | pass | too few unknowns, waves, deductions, families, unlocks; redundant rule |
| `phase-19-local-count-compact-001` | yes | no | baseline | 1 | 6 | 9 | 2 | pass | too few unknowns, waves, deductions, families, unlocks, shared-variable overlap |
| `phase-19-local-count-wide-001` | yes | no | baseline | 1 | 7 | 8 | 2 | pass | too few unknowns, waves, deductions, families, unlocks, shared overlap; redundant rule |
| `phase-19-local-count-wide-002` | yes | no | baseline | 1 | 6 | 9 | 2 | pass | too few unknowns, waves, deductions, families, unlocks, shared-variable overlap |
| `phase-19-mixed-wide-001` | yes | no | baseline | 1 | 13 | 13 | 2 | pass | only one proof wave, too few material families, no frontier unlock |
| `phase-21-s2-intersection-001` | yes | no | baseline | 1 | 3 | 5 | 1 | pass | too few unknowns, waves, deductions, families, unlocks |
| `phase-21-s3-difference-001` | yes | no | baseline | 1 | 8 | 8 | 1 | pass | too few unknowns, waves, material families, unlocks |
| `phase-10-local-scope-intersection-001` | yes | no | baseline | 1 | 5 | 7 | 1 | pass | too few unknowns, waves, deductions, families, unlocks |
| `phase-12-local-scope-difference-001` | yes | no | baseline | 1 | 3 | 5 | 1 | pass | too few unknowns, waves, deductions, families, unlocks |
| `phase-13-local-scope-difference-001` | yes | no | baseline | 1 | 3 | 5 | 2 | pass | too few unknowns, waves, deductions, families, unlocks |
| `phase-13-local-scope-difference-002` | no | no | baseline | 2 | 3 | 8 | 2 | pass | proof repair required; still too small for target 4 |
| `phase-14-local-scope-difference-001` | no | no | baseline | 1 | 1 | 3 | 2 | pass | proof repair required; too small |
| `phase-14-local-scope-difference-002` | yes | no | baseline | 0 | 0 | 2 | 2 | pass | zero-wave closure; redundant rule |
| `phase-14-local-scope-difference-003` | yes | no | baseline | 0 | 0 | 2 | 1 | pass | zero-wave closure; redundant rules |
| `phase-15-retained-difference-001` | no | no | baseline | 1 | 1 | 3 | 1 | pass | proof repair required; redundant rules |
| `phase-15-retained-difference-002` | no | no | baseline | 1 | 6 | 7 | 2 | pass | proof repair required; too small |
| `phase-15-retained-difference-003` | yes | no | baseline | 1 | 7 | 7 | 2 | pass | too few unknowns, waves, deductions, families, unlocks |

## Current Selector Recheck

| Shipped case | Target 4 pass | Degeneracy | Rule family status | Note |
| --- | --- | --- | --- | --- |
| `case-004` | no | pass | pass, 2 families | useful baseline, not target 4 |
| `case-011` | no | pass | fail, 1 family | useful baseline, not target 4 |
| `case-012` | no | pass | pass, 2 families | useful baseline, not target 4 |
| `case-013` | no | pass | fail, 1 family | baseline only under Phase 23 gates |
| `case-014` | no | pass | fail, 1 family | baseline only under Phase 23 gates |
| `case-015` | no | fail | pass, 4 families | direct/singleton giveaway risk; must not count as hard content |
| `case-017` | no | fail | pass, 4 families | direct/singleton giveaway risk; must not count as hard content |
| `case-018` | no | fail | pass, 3 families | direct/singleton giveaway risk; must not count as hard content |
| `case-020` | no | fail | pass, 4 families | direct/singleton giveaway risk; must not count as hard content |

The anti-clone command with `--include-degeneracy` found no pairwise, proof-trace, shrink-signature, or rule-impact clone groups in this mixed set, but it failed overall because the degeneracy and material-family gates correctly blocked several cases.

## Outcome

- Promoted target 4/5 cases this round: 0.
- Rejected/deferred target candidates this round: 17 inherited experimental candidates plus 9 shipped-selector rechecks.
- Current player-facing cases that should be treated as baseline or quarantined from hard-content claims: all current selector cases, with special attention to `case-015`, `case-017`, `case-018`, and `case-020` because they fail degeneracy.
- Next production step: author new candidates from proof skeletons with at least two proof waves, at least 10 effective unknowns, at least three material rule families, and at least one frontier unlock. Existing random templates should not be promoted without target-aware construction.

## Round 09 Self-Checks

Debug self-check:

- Smallest candidate tested: inherited single-case reports and current selector reports.
- Standard validation covered: schema, target rules, initial satisfiability, proof/no-guess, final uniqueness, difficulty review.
- Anti-clone report covered: yes, including degeneracy and rule-family gates.
- Novelty claim covered: no new candidate received a novelty claim this round.
- Proof/no-guess path covered: yes through authoring reports.
- Rejected prior candidates stayed out of player selector: yes.
- Generator/authoring rejection evidence recorded: yes.
- Runtime/player secrecy checked: no runtime change.
- Regression risk: docs-only evidence update.

Architecture self-check:

- Domain/schema/solver/proof boundaries unchanged.
- Authoring and generator evidence remains private maintainer documentation.
- No new DSL semantics, proof techniques, schema migration, public editor, backend, analytics, or broad UI/theme work.
- Experimental/rejected candidates remain out of `content/cases` and out of the player selector.
- Target access and developer-only data exposure unchanged.
- Unrelated untracked docs were left untouched.
