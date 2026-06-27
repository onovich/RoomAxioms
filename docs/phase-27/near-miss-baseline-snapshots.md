# Phase 27 Near-Miss Baseline Snapshots

Status: Round 2 baseline evidence before proof or diagnostics changes.
Guide: `docs/phase-27-proof-authoring-bridge-hardening-goal-mode-execution-guide.md`

## Purpose

Phase 27 will harden proof and authoring behavior against Phase 26 blocker
patterns. This document records the current CLI baseline for the four highest
priority near-miss candidates before any proof or diagnostics behavior changes:

- C06 `p26-c06-two-wave-frontier`
- C10 `p26-c10-frontier-repair`
- C15 `p26-c15-overlap-chain-repair`
- C09 `p26-c09-comparative-repair`

These snapshots are not promotion evidence. They are before/after anchors for
later Phase 27 rounds.

## Commands

Reports:

```powershell
pnpm authoring -- report content\experimental\phase-26\candidates\p26-c06-two-wave-frontier.json
pnpm authoring -- report content\experimental\phase-26\candidates\p26-c10-frontier-repair.json
pnpm authoring -- report content\experimental\phase-26\candidates\p26-c15-overlap-chain-repair.json
pnpm authoring -- report content\experimental\phase-26\candidates\p26-c09-comparative-repair.json
```

Scores:

```powershell
pnpm authoring -- score content\experimental\phase-26\candidates\p26-c06-two-wave-frontier.json
pnpm authoring -- score content\experimental\phase-26\candidates\p26-c10-frontier-repair.json
pnpm authoring -- score content\experimental\phase-26\candidates\p26-c15-overlap-chain-repair.json
pnpm authoring -- score content\experimental\phase-26\candidates\p26-c09-comparative-repair.json
```

Technique-retention baselines:

```powershell
pnpm authoring -- minimize content\experimental\phase-26\candidates\p26-c06-two-wave-frontier.json --require-technique REGION_COUNT_SATURATED --require-technique LOCAL_COUNT_ALL_REMAINING
pnpm authoring -- minimize content\experimental\phase-26\candidates\p26-c10-frontier-repair.json --require-technique REGION_COUNT_SATURATED --require-technique LOCAL_COUNT_ALL_REMAINING
pnpm authoring -- minimize content\experimental\phase-26\candidates\p26-c09-comparative-repair.json --require-technique COMPARATIVE_COUNT_ALL_REMAINING
pnpm authoring -- minimize content\experimental\phase-26\candidates\p26-c15-overlap-chain-repair.json --require-technique SCOPE_OVERLAP_COUNT_SATURATED --require-technique LOCAL_COUNT_SATURATED --require-technique LOCAL_COUNT_ALL_REMAINING
```

## Baseline Matrix

| Candidate | Initial guest layouts | Proof waves / deductions | Techniques | Proof/final status | Score | Retention baseline | Phase 27 target |
| --- | ---: | --- | --- | --- | ---: | --- | --- |
| C06 `p26-c06-two-wave-frontier` | 14 | 2 / 4 | `REGION_COUNT_SATURATED`, `LOCAL_COUNT_ALL_REMAINING` | `noGuess=false`, `humanExplainable=false`, `guestLayoutUniqueAtEnd=false`; gaps D2, A3, B3, C3 | 17.52 / band 4 | PASS: required techniques retained, but proof/final uniqueness still fail | Late-closure fixture for second-wave safe cells after B2 is derived. |
| C10 `p26-c10-frontier-repair` | 9 | 2 / 4 | `REGION_COUNT_SATURATED`, `LOCAL_COUNT_ALL_REMAINING` | `noGuess=false`, `humanExplainable=false`, `guestLayoutUniqueAtEnd=false`; gaps D2, A3, B3 | 16.41 / band 4 | PASS: required techniques retained, but proof/final uniqueness still fail | Smaller C06-style fixture with fewer gaps; best B06/B07 baseline. |
| C15 `p26-c15-overlap-chain-repair` | 4 | 1 / 4 | `REGION_COUNT_ALL_REMAINING`, `REGION_COUNT_SATURATED` | `noGuess=false`, `humanExplainable=false`, `guestLayoutUniqueAtEnd=false`; gaps B1, A2; degeneracy fail; redundant R4 | 13.69 / band 3 | FAIL: missing `SCOPE_OVERLAP_COUNT_SATURATED`, `LOCAL_COUNT_SATURATED`, `LOCAL_COUNT_ALL_REMAINING` | Derived-guest to scope-overlap bridge fixture; distinguish missing proof support from direct giveaway. |
| C09 `p26-c09-comparative-repair` | 6 | 1 / 2 | `COMPARATIVE_COUNT_ALL_REMAINING` | `noGuess=false`, `humanExplainable=false`, `guestLayoutUniqueAtEnd=false`; gaps A3, B3; degeneracy warning | 14.06 / band 4 | PASS: comparative technique retained, but proof/final uniqueness still fail | Comparative late-closure fixture without singleton or near-count collapse. |

## Detailed Observations

### C06 Two-Wave Frontier

C06 is the cleanest two-wave skeleton from Phase 26. The first wave derives
A1/B1/C1 as safe through `REGION_COUNT_SATURATED`; revealing B1 as a bottle then
lets `LOCAL_COUNT_ALL_REMAINING` confirm B2 as a guest.

The current proof cannot explain D2, A3, B3, or C3. The authoring score looks
moderately strong, but the candidate is still a proof/final-uniqueness failure.
This makes C06 useful as a broader frontier baseline but too large for the first
micro-fixture.

### C10 Frontier Repair

C10 is the narrower C06 repair baseline. It keeps the two-wave structure and
retains both required techniques under minimization, but still has D2, A3, and
B3 explanation gaps.

C10 should be the preferred starting point for the B06/B07 late-closure
diagnostic work because it removes one of C06's four gaps while preserving the
same core proof shape.

### C15 Overlap Chain Repair

C15 has material `scope-overlap` rule contribution, opening ambiguity, and a
non-degenerate overlap rule shape, but the proof never emits
`SCOPE_OVERLAP_COUNT_*`. The proof only emits region-count techniques, then
stops with B1 and A2 explanation gaps.

This baseline separates two facts that Phase 27 must keep distinct:

- the overlap rule can be material at the authoring/solver layer;
- the human proof currently lacks the derived-guest to overlap-summary bridge.

### C09 Comparative Repair

C09 removes the singleton comparative flaw from earlier comparative drafts and
retains `COMPARATIVE_COUNT_ALL_REMAINING`. The current proof derives A1 and B1
as guests, then stops with A3/B3 explanation gaps.

This is a good comparative late-closure baseline because the grammar technique
works and survives minimization. The failure is downstream closure, not parser,
solver, or basic proof-technique recognition.

## Fixture Implications

| Fixture | Baseline input | What the next rounds should prove |
| --- | --- | --- |
| F02 Derived Guest Bridge - Scope Overlap | C15 | Whether a guest derived by a region count may feed a later `scopeOverlapCount` deduction with dependency-preserving proof premises. |
| F04 Comparative Late Closure | C09 | Whether a retained comparative opener can feed a later human-readable closing deduction without degeneracy. |
| F06 Two-Wave Frontier Closure | C10 first, then C06 | Whether D2/A3/B3-style solver-only safe cells can be localized into a diagnostic or a new human-readable fixture. |
| F07 Final Uniqueness Gap Versus Proof Gap | C06/C10/C09/C15 | Whether authoring can separate final non-unique layout from proof explanation gaps and point to the late cluster. |

## Round 2 Conclusion

The baseline confirms that Phase 27 should not start by changing candidate JSON.
The near misses already have useful skeletons. The missing layer is a focused
proof/authoring bridge:

- C06/C10: techniques retained, but late closure remains solver-only.
- C09: comparative technique retained, but downstream safe-cell closure is
  missing.
- C15: scope-overlap material exists, but the proof technique itself is absent.

