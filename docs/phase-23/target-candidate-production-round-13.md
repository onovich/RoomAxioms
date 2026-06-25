# Phase 23 Target Candidate Production - Round 13

Round: 13
Decision: reject/defer the sightline-region-anchor and middle-mirror line-finish probes; no promotion this round.

## Attempted Skeletons

### `phase-23-probe-023`

Goal:

- Use a unique mirror intersection to create a sightline blocker instead of opening a cleaning chain directly.
- Pair a non-singleton region clear with a ray line and a bin-anchor frontier.
- Finish with a fifth-row count after anchor deductions reveal enough safe cells.

### `phase-23-probe-024`

Goal:

- Move the mirror intersection into the middle of the board.
- Use two row-count rules as final pressure.
- Make the center bin chain and line counts materially different from `case-021`.

## Attempt Results

| Probe | Result | Reason |
| --- | --- | --- |
| `023a` / `023b` / `023c` | Rejected at target rules | First sightline layout violated bin-anchor no-guest constraints because the chain placed a bin next to a target guest. |
| `023g` | Rejected at target rules / caps | Adding global guest count did not repair the target-rule issue and also caused initial layout truncation. |
| `023r-a` / `023r-b` | Rejected | Revised target satisfied the rules, but proof validation hit `SOLVER_TRUNCATED`; bin-anchor rule was redundant. |
| `023r-c` / `023r-d` | Rejected | Extra reveals reduced ambiguity but produced `EXPLANATION_GAP`; bin-anchor rule remained redundant. |
| `023r-nog` | Rejected | Removing global guest count gave 2 proof waves and 11 deductions, but row-count rule was redundant and opening layouts exceeded the cap. |
| `023r-smallregion` | Rejected | Smaller region still truncated and kept the anchor rule redundant. |
| `024a` / `024b` | Rejected | Middle-mirror line finish kept all intended families except bin-anchor materiality; proof validation truncated. |
| `024c` / `024e` | Rejected | Extra reveals produced `EXPLANATION_GAP`, redundant bin-anchor rule, and insufficient proof-wave/frontier evidence. |
| `024d` | Rejected | Best middle-mirror probe reached 2 waves and 20 deductions with bounded layouts, but proof failed with `EXPLANATION_GAP`, line/global rules were redundant, and degeneracy status was warning. |

## Best Probe Summaries

`023r-nog`:

- Recommendation: `raise-caps-or-simplify`.
- Proof issue: `EXPLANATION_GAP`.
- Proof waves: 2.
- Deductions: 11.
- Effective unknown cells: 22.
- Material rule families: `anchor`, `foreach`, `global`, `line`, `region`.
- Redundant rules: `R6`.
- Degeneracy: pass.
- Target 4 threshold: fail on proof-wave-count and redundant-rule-count.
- Initial guest layouts: greater than 100.

`024d`:

- Recommendation: `repair-proof`.
- Proof issue: `EXPLANATION_GAP`.
- Proof waves: 2.
- Deductions: 20.
- Effective unknown cells: 19.
- Material rule families: `anchor`, `foreach`, `global`, `region`.
- Redundant rules: `R1`, `R7`, `R8`.
- Degeneracy: warning, 1 warning.
- Target 4 threshold: fail on proof-wave-count, redundant-rule-count, and degeneracy-status.
- Initial guest layouts: 30, no truncation.

## Decision

No file is promoted or copied into `content/cases`.

The negative evidence is useful because both skeletons tried to introduce different player-facing mechanics from `case-021`, but the authoring gates caught real issues:

- The current human verifier does not accept several solver-valid line/ray deductions as explanation-safe.
- If enough extra reveals are added to avoid caps, the puzzle collapses into a shallow proof or creates redundant rules.
- Sightline and line-count mechanics are easy to make visually novel but hard to make materially necessary without degeneracy.

## Round 13 Self-Checks

Debug self-check:

- Smallest candidate tested: 16 temporary JSON probes across two skeleton families.
- Standard validation covered: schema, target rules, proof/no-guess, difficulty review, degeneracy, and rule-family materiality.
- Anti-clone report covered: skipped because no probe reached promotion-quality validation.
- Novelty claim covered: no claim created because no candidate was promoted.
- Proof/no-guess path covered: yes; best bounded probes failed with `EXPLANATION_GAP`.
- Rejected prior candidates stayed out: yes.
- Runtime/player secrecy checked: no runtime change.
- Regression risk: docs-only evidence update.

Architecture self-check:

- Domain/schema/solver/proof boundaries unchanged.
- No new DSL semantics, proof techniques, schema migration, public editor, backend, analytics, or broad UI/theme work.
- Temporary probes remain out of `content/cases` and out of the selector.
- Target access and developer-only data exposure unchanged.
- Unrelated untracked docs were left untouched.
