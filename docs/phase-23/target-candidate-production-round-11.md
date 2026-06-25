# Phase 23 Target Candidate Production - Round 11

Round: 11
Decision: reject/defer the attempted L-shaped centerline candidate; no promotion this round.

## Attempted Skeleton

Working label: `phase-23-chain-probe-022`

Goal:

- Avoid making a rotated clone of `case-021`.
- Keep the two-bottle shared mirror opening, but turn the cleaning chain through the center-right of the board.
- Preserve the Phase 23 target shape: at least 4 proof waves, at least 10 effective unknowns, at least 3 material rule families, no redundant rules, degeneracy pass, and no-guess proof.

## Attempts

| Probe | Result | Reason |
| --- | --- | --- |
| `022a` | Rejected at schema | Used a 6x5 board, but Puzzle Schema v1 currently caps board width at 5. |
| `022b` | Rejected at target rules | `D5` was a cleaning anchor adjacent to the intended `E5` guest, violating the cleaning no-guest rule. |
| `022c` | Rejected at proof/quality | Repairing `D5` to empty removed the target-rule conflict, but the report returned `GUESS_POINT`, opening layouts exceeded the default cap, and `R1` became redundant. |

## Best Repaired Probe Summary

`022c` report shape:

- Recommendation: `raise-caps-or-simplify`.
- Proof issue: `GUESS_POINT`.
- Proof waves before stall: 5.
- Deductions before stall: 19.
- Effective unknowns: 19.
- Material rule families: `anchor`, `foreach`, `global`, `region`.
- Degeneracy: pass.
- Redundant rules: `R1`.
- Target 4 threshold: fail because redundant-rule-count blocks promotion.

## Decision

No file is promoted or copied into `content/cases`.

The probe is useful evidence for the next search pass:

- Turning the chain is not enough; the final global guest rule must remain materially necessary.
- A late anchor cannot sit next to a final guest unless the target or rule family changes.
- Schema width 5 is a hard limit for current content.
- A candidate with 5 proof waves can still fail if the no-guess verifier reaches a guess point.

## Round 11 Self-Checks

Debug self-check:

- Smallest candidate tested: three temporary JSON probes under `%TEMP%`, not committed.
- Standard validation covered: schema, target rules, proof/no-guess, difficulty review.
- Anti-clone report covered: skipped because no probe reached promotion-quality validation.
- Novelty claim covered: no claim created because no candidate was promoted.
- Proof/no-guess path covered: yes; `022c` failed with `GUESS_POINT`.
- Rejected prior candidates stayed out: yes.
- Generator/authoring rejection evidence recorded: yes.
- Runtime/player secrecy checked: no runtime change.
- Regression risk: docs-only evidence update.

Architecture self-check:

- Domain/schema/solver/proof boundaries unchanged.
- No new DSL semantics, proof techniques, schema migration, public editor, backend, analytics, or broad UI/theme work.
- Experimental/rejected candidates remain out of `content/cases` and out of the selector.
- Target access and developer-only data exposure unchanged.
- Unrelated untracked docs were left untouched.
