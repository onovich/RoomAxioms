# Phase 23 Super-Hard Candidate Production - Round 14

Round: 14
Decision: reject/defer ten reveal-reduction super-hard probes; no super-hard promotion this round.

## Attempted Skeleton

Working labels: `phase-23-super-hard-probe-041` through `phase-23-super-hard-probe-050`

Goal:

- Test whether the accepted `case-021` centerline proof skeleton can honestly become a 6-7 difficulty case by reducing opening reveals.
- Require the same Phase 23 quality expectations: no caps, no redundant rules, no degeneracy, at least 6 proof waves, at least 12 deductions, at least 4 material rule families, at least 2 frontier unlocks, and retained shared-variable pressure.
- Reject every candidate that becomes merely more ambiguous without gaining explainable proof depth.

## Attempt Results

| Probe | Opening reveals | Result | Reason |
| --- | --- | --- | --- |
| `041` | `D1` | Rejected | 5 proof waves and 24 deductions, but opening layouts exceeded 100, shared-overlap was lost, and `R2`/`R3` became redundant. |
| `042` | `B1` | Rejected | Same failure shape as `041`: 5 waves, >100 layouts, no shared-overlap, and redundant mirror-opening rules. |
| `043` | `B1`, `D1` | Rejected | Target-4 metrics passed, but opening layouts exceeded 100 and super-hard failed on proof-wave-count. |
| `044` | `B1`, `D1`, `B3` | Rejected | Target-4 metrics passed, but opening layouts exceeded 100 and super-hard failed on proof-wave-count. |
| `045` | `B1`, `D1`, `D3` | Rejected | Target-4 metrics passed, but opening layouts exceeded 100 and super-hard failed on proof-wave-count. |
| `046` | `B1`, `D1`, `B3`, `D3` | Rejected | Target-4 metrics passed, but opening layouts exceeded 100 and super-hard failed on proof-wave-count. |
| `047` | `B1`, `D1`, `B4`, `D4` | Rejected | Target-4 metrics passed, but opening layouts exceeded 100 and super-hard failed on proof-wave-count. |
| `048` | `B1`, `D1`, `B3`, `D3`, `B4` | Rejected | Target-4 metrics passed, but initial layout counting truncated and super-hard failed on proof-wave-count. |
| `049` | `B1`, `D1`, `B3`, `D3`, `D4` | Rejected | Target-4 metrics passed, but initial layout counting truncated and super-hard failed on proof-wave-count. |
| `050` | `B1`, `D1`, `B3`, `B4`, `D4` | Rejected | Target-4 metrics passed, but initial layout counting truncated and super-hard failed on proof-wave-count. |

## Key Finding

The reveal-reduction path does not produce honest super-hard content.

- Removing too many reveals increases opening ambiguity beyond the current authoring/runtime cap rather than adding explainable proof depth.
- The proof remains at 4 or 5 waves, short of the 6-wave super-hard threshold.
- One-reveal variants lose the shared-overlap hard turn and make the mirror-opening rules redundant.
- The candidates that still look structurally target-4 are not safe to promote because their opening layout counts exceed the intended player-runtime envelope.

## Decision

No file is promoted or copied into `content/cases`.

These ten probes satisfy the Phase 23 requirement to attempt super-hard candidates, but they also show the current content method has a ceiling: super-hard cases likely require a new proof skeleton or a carefully verifier-backed high-tier mechanic, not just fewer opening observations on an accepted target-4 puzzle.

## Round 14 Self-Checks

Debug self-check:

- Smallest candidate tested: 10 temporary JSON probes based on reduced reveal sets.
- Standard validation covered: schema, target rules, proof/no-guess, difficulty review, degeneracy, rule-family materiality, and candidate-layout caps.
- Anti-clone report covered: skipped because no probe reached promotion-quality validation.
- Novelty claim covered: no claim created because no candidate was promoted.
- Proof/no-guess path covered: yes; every probe failed super-hard gates, caps, or redundancy checks.
- Rejected prior candidates stayed out: yes.
- Runtime/player secrecy checked: no runtime change.
- Regression risk: docs-only evidence update.

Architecture self-check:

- Domain/schema/solver/proof boundaries unchanged.
- No new DSL semantics, proof techniques, schema migration, public editor, backend, analytics, or broad UI/theme work.
- Temporary probes remain out of `content/cases` and out of the selector.
- Target access and developer-only data exposure unchanged.
- Unrelated untracked docs were left untouched.
