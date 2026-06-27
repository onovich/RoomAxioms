# Phase 27 Near-Miss Recheck After Proof Bridge Hardening

Round 7 re-ran the Phase 26 near-miss candidates after the derived-fact and grammar-count bridge hardening.

## Commands

```text
pnpm authoring -- report content\experimental\phase-26\candidates\p26-c06-two-wave-frontier.json
pnpm authoring -- report content\experimental\phase-26\candidates\p26-c10-frontier-repair.json
pnpm authoring -- report content\experimental\phase-26\candidates\p26-c15-overlap-chain-repair.json
pnpm authoring -- report content\experimental\phase-26\candidates\p26-c09-comparative-repair.json
pnpm authoring -- score content\experimental\phase-26\candidates\p26-c15-overlap-chain-repair.json
pnpm authoring -- minimize content\experimental\phase-26\candidates\p26-c15-overlap-chain-repair.json --require-technique SCOPE_OVERLAP_COUNT_SATURATED --require-technique LOCAL_COUNT_SATURATED
pnpm authoring -- minimize content\experimental\phase-26\candidates\p26-c06-two-wave-frontier.json --require-technique REGION_COUNT_SATURATED --require-technique LOCAL_COUNT_ALL_REMAINING
```

## Results

| Candidate | Current Result | Proof | Main Remaining Blocker |
| --- | --- | --- | --- |
| `p26-c06-two-wave-frontier` | Not repairable yet | `noGuess=false`, 2 waves, 4 deductions | Four `EXPLANATION_GAP` cells remain; final uniqueness is not reached. |
| `p26-c10-frontier-repair` | Not repairable yet | `noGuess=false`, 2 waves, 4 deductions | Three `EXPLANATION_GAP` cells remain; final uniqueness is not reached. |
| `p26-c09-comparative-repair` | Not repairable yet | `noGuess=false`, 1 wave, 2 deductions | Two `EXPLANATION_GAP` cells remain; degeneracy warning remains. |
| `p26-c15-overlap-chain-repair` | Proof bridge repaired, not promotion-ready | `noGuess=true`, 2 waves, 7 deductions | Degeneracy status is `fail`; target-4 threshold still misses proof-wave-count, deduction-count, shared-variable-overlap-count, and degeneracy-status. |

## C15 Delta

`p26-c15-overlap-chain-repair` is the important bridge-hardening success case:

- Before Phase 27 bridge work, it failed required technique retention for `SCOPE_OVERLAP_COUNT_SATURATED`, `LOCAL_COUNT_SATURATED`, and `LOCAL_COUNT_ALL_REMAINING`.
- After the grammar-count bridge, it produces a no-guess proof with `SCOPE_OVERLAP_COUNT_SATURATED`, `LOCAL_COUNT_SATURATED`, `REGION_COUNT_ALL_REMAINING`, and `REGION_COUNT_SATURATED`.
- The minimizer retains required `SCOPE_OVERLAP_COUNT_SATURATED` and `LOCAL_COUNT_SATURATED` after reducing initial reveals from 6 to 2.
- It still should not be promoted: the quality gates mark degeneracy as `fail`, and the difficulty review recommends `tutorial-or-baseline`, not target-4.

## Promotion Decision

No candidate was promoted in this round. The post-hardening result confirms the proof bridge can unlock overlap material, but content promotion still needs separate non-degenerate authoring work.
