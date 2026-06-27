# Phase 29 Limited Translation Feasibility

Status: one experimental translation attempted; not eligible for promotion.

Skeleton translated:

- `docs/phase-29/skeletons/overlap-frontier-ledger.md`

Experimental JSON:

- `content/experimental/phase-29/p29-overlap-frontier-ledger-trial.json`

This is the only Phase 29 JSON translation trial. It stays private,
experimental, and out of shipped content.

## Trial Intent

The translation tested whether the overlap-frontier skeleton can avoid the old
C15 singleton/near-count opener while still producing a human-readable proof
chain. The draft used:

- broad west/east region ledgers;
- a non-singleton `scopeOverlapCount` over B2, C2, C3;
- a lower pocket region count;
- a bottle-local rule intended as the late object pressure.

## Authoring Report

Command:

```text
pnpm authoring -- report content\experimental\phase-29\p29-overlap-frontier-ledger-trial.json
```

Result summary:

- `ok`: false.
- Schema: pass, 0 issues.
- Target satisfies rules: true.
- Initial satisfiable: true.
- Initial guest layouts: 42.
- Degeneracy in difficulty review: pass.
- Proof: `noGuess=false`, `humanExplainable=false`,
  `guestLayoutUniqueAtEnd=false`.
- Proof issues: two `EXPLANATION_GAP` findings.
- Wave count: 1.
- Deduction count: 0.
- Technique IDs: none.
- Recommendation: `repair-proof`.
- Target-4 missing: `proof-wave-count`, `deduction-count`,
  `frontier-unlock-count`, `shared-variable-overlap-count`.

Interpretation: the skeleton successfully avoided the old direct opener and kept
large opening ambiguity, but the concrete translation did not create a human
deduction bridge. It should not be repaired by adding singleton reveals.

## Score

Command:

```text
pnpm authoring -- score content\experimental\phase-29\p29-overlap-frontier-ledger-trial.json
```

Result summary:

- `ok`: true.
- Uncalibrated score: 20.77.
- Band: 5.
- Real playtest calibration: false.
- Candidate guest layouts: 42.
- Proof wave count: 1.
- Deduction count: 0.
- Technique count: 0.

Interpretation: the numeric score is misleading for player quality because the
proof has no human deductions. The score is evidence for why Phase 29 needs the
skeleton review gate before trusting generated difficulty.

## Minimize / Technique Retention

Command:

```text
pnpm authoring -- minimize content\experimental\phase-29\p29-overlap-frontier-ledger-trial.json --require-technique SCOPE_OVERLAP_COUNT_SATURATED
```

Result summary:

- `ok`: false.
- Reveal count before/after: 8 / 8.
- Required technique retained: false.
- Missing required technique: `SCOPE_OVERLAP_COUNT_SATURATED`.
- Proof gap cells: A2 and B3.
- Proof before/after remains `noGuess=false` and `humanExplainable=false`.

Interpretation: the overlap rule is material to solver constraints but does not
become an explainable overlap deduction in this trial.

## Anti-Clone / Degeneracy

Command:

```text
pnpm authoring -- anti-clone content\cases\case-004.json content\cases\case-011.json content\cases\case-012.json content\experimental\phase-29\p29-overlap-frontier-ledger-trial.json --include-degeneracy
```

Result summary for the trial:

- Degeneracy: pass.
- R2 region scope: 5 effective unknown cells, not a direct giveaway.
- R3 region scope: 4 effective unknown cells, not a direct giveaway.
- R4 scope-overlap scope: 3 effective unknown cells, not a direct giveaway.
- R6 region scope: 4 effective unknown cells, not a direct giveaway.
- Rule-family diversity: warning because R5 is redundant.
- No hard clone evidence was attributed to the trial in this comparison set.

Interpretation: the trial's main failure is not a singleton opener or a clone.
It is the missing human proof bridge plus one redundant object-local rule.

## Decision

Decision: stop after this one trial.

The trial is useful evidence but not a promotion candidate. Continuing to mutate
this JSON locally would repeat the Phase 28 failure pattern. The next useful
work is not another random rewrite; it is a smaller proof/authoring bridge that
can turn a non-singleton overlap count plus derived object/local facts into a
human-visible deduction, or else a clearer diagnostic saying this skeleton is
not currently expressible as a no-guess puzzle.

## Boundary

- No shipped `content/cases` files changed.
- No player selector or default case changed.
- The experimental ID is not referenced from `apps/web/src/content`.
- No proof, solver, schema, or runtime semantics changed.
