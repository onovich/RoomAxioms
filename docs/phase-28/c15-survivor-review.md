# Phase 28 C15 Survivor Review

Status: no C15 survivor eligible for promotion or repair.

Guide: `docs/phase-28-nondegenerate-puzzle-rewrite-sprint-goal-mode-execution-guide.md`

This review closes the C15-focused repair lane for Phase 28. The three
serious rewrites attacked the known C15 weakness from different angles:
removing the direct closing safe region, broadening the entry opener, and
moving the chain onto a larger board. None produced a candidate that both
preserved the material overlap proof and passed strict non-degeneracy gates.

## Attempt Summary

| Candidate | Best evidence | Blocking evidence | Decision |
| --- | --- | --- | --- |
| `p28-c15-a-remove-direct-safe-region` | Retains `SCOPE_OVERLAP_COUNT_SATURATED` and `LOCAL_COUNT_SATURATED`; 3 proof waves; R5 replacement passes degeneracy. | No-guess false, final uniqueness false, `GUESS_POINT`; R2 remains `singleton-effective-scope:direct-count-giveaway`. | reject |
| `p28-c15-b-broaden-entry-opener` | R2 improves from hard direct giveaway to reviewer-blocking `near-count-giveaway`; opening ambiguity rises to 32 guest layouts. | Proof collapses to 0 deductions, both required techniques disappear, R4 becomes redundant. | reject |
| `p28-c15-c-larger-effective-board` | Retains overlap technique and adds non-direct wide bottom/east pressure rules. | Proof reaches only 1 wave / 3 deductions, `LOCAL_COUNT_SATURATED` disappears, R2 hard giveaway remains, 6 irrelevant cells. | reject |

## Combined Anti-Clone / Degeneracy Evidence

Command:

```text
pnpm authoring -- anti-clone content\experimental\phase-26\candidates\p26-c15-overlap-chain-repair.json content\experimental\phase-28\p28-c15-a-remove-direct-safe-region.json content\experimental\phase-28\p28-c15-b-broaden-entry-opener.json content\experimental\phase-28\p28-c15-c-larger-effective-board.json --include-degeneracy
```

Result:

- Overall status: `fail`.
- Hard failure count: 3.
- Reviewer-blocking count: 3.
- Seed, A, and C all fail on
  `region:R2:singleton-effective-scope:direct-count-giveaway`.
- B converts R2 to `region:R2:near-count-giveaway`, but also triggers
  `redundant-rules`.
- B and C both lose the material `forEach` family because R4 is redundant.

## Survivor Decision

No C15 candidate is a survivor:

- A is the closest proof survivor, but it is not a promotion or repair
  survivor because the hard R2 degeneracy remains and final uniqueness fails.
- B is the closest degeneracy survivor, but it is not a proof survivor because
  the overlap/local chain disappears.
- C proves that adding board area is not a repair by itself; it keeps the same
  entry giveaway and introduces irrelevant cells.

The remaining C15 design problem is not a single-rule copy issue or a simple
board-shape issue. The skeleton still needs a different human-authored opener:
one that establishes the overlap variable without forcing a singleton effective
scope and without reducing to a near-count giveaway. Phase 28 should therefore
move to the backup late-closure lane instead of spending Rounds 7-8 on cosmetic
C15 mutations.

## Boundary Notes

- No shipped `content/cases` files changed.
- No player selector or default case changed.
- No proof, solver, schema, or web runtime semantics changed.
- Experimental C15 candidates remain under `content/experimental/phase-28/`.
