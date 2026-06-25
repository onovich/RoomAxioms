# Phase 23 Target Candidate Production - Round 12

Round: 12
Decision: reject/defer the double-row anchor-chain probe; no promotion this round.

## Attempted Skeleton

Working label: `phase-23-probe-022`

Goal:

- Avoid a direct continuation of `case-021` by using two bottom row-count rules as the final pressure instead of one region plus global guest count.
- Keep a recognizable hard turn: the opening mirror intersection should expose a bin-anchor chain, and the chain should unlock row-level guest counts.
- Preserve target-4 requirements: no redundant rules, no degeneracy, at least 4 proof waves, at least 10 effective unknown cells, and at least 3 material rule families.

## Attempt Results

| Probe | Result | Reason |
| --- | --- | --- |
| `022` | Rejected | Without the global guest rule, proof reached 4 waves and 17 deductions but stopped at `GUESS_POINT`; row-count rules were redundant. |
| `022g` | Rejected | Adding global guest count made all rules material, but proof validation hit `SOLVER_TRUNCATED` after the first wave. |
| `022g-r4` / `022g-r6` / `022g-r8` | Rejected | Extra safe reveals did not prevent opening guest-layout truncation and produced multiple `EXPLANATION_GAP` issues. |
| `022g-r10` | Rejected | Search no longer truncated, but the bin-anchor rule became redundant and degeneracy status fell to warning. |
| `022g-r12` | Rejected and kept as an experimental rejected fixture | Search stayed bounded and all rule families were material, but proof still reported `EXPLANATION_GAP`, proof wave count stayed at 1, and degeneracy status was warning. |

Rejected fixture:

- `content/experimental/phase-23/rejected/phase-23-probe-022-double-row-anchor-chain.json`

## Best Probe Summary

`022g-r12` report shape:

- Recommendation: `repair-proof`.
- Proof issue: `EXPLANATION_GAP`.
- Proof waves: 1.
- Deductions: 8.
- Effective unknown cells: 12.
- Material rule families: `anchor`, `foreach`, `global`, `line`.
- Redundant rules: none.
- Degeneracy: warning, 1 warning.
- Target 4 threshold: fail on proof-wave-count, frontier-unlock-count, and degeneracy-status.
- Initial guest layouts: 30, no truncation.

## Decision

No file is promoted or copied into `content/cases`.

The skeleton is useful negative evidence:

- Turning a final count into two row counts is not enough if proof validation cannot explain the row deductions.
- Adding reveals to tame solver caps can collapse the intended multi-wave proof into a near-opening deduction.
- A target candidate with all rules material can still fail Phase 23 if the explanation path is not stable and degeneracy is not clean.

## Round 12 Self-Checks

Debug self-check:

- Smallest candidate tested: six temporary JSON probes plus one rejected fixture preserved under `content/experimental/phase-23/rejected/`.
- Standard validation covered: schema, target rules, proof/no-guess, difficulty review, degeneracy, and rule-family materiality.
- Anti-clone report covered: skipped because no probe reached promotion-quality validation.
- Novelty claim covered: no claim created because no candidate was promoted.
- Proof/no-guess path covered: yes; the best bounded probe failed with `EXPLANATION_GAP`.
- Rejected prior candidates stayed out: yes.
- Runtime/player secrecy checked: no runtime change.
- Regression risk: low; rejected fixture is not imported by web content.

Architecture self-check:

- Domain/schema/solver/proof boundaries unchanged.
- No new DSL semantics, proof techniques, schema migration, public editor, backend, analytics, or broad UI/theme work.
- Experimental/rejected candidates remain out of `content/cases` and out of the selector.
- Target access and developer-only data exposure unchanged.
- Unrelated untracked docs were left untouched.
