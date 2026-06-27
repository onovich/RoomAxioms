# Phase 28 Candidate Ledger

Status: Round 2 evidence contract.
Guide: `docs/phase-28-nondegenerate-puzzle-rewrite-sprint-goal-mode-execution-guide.md`

This ledger is the source of truth for Phase 28 serious rewrite attempts. A
candidate does not count as a serious attempt until it has at least an intended
proof skeleton plus `report`, `score`, and `minimize` evidence.

## Evidence Contract

Each candidate entry must record:

- candidate id and path;
- source seed and rewrite attempt type;
- intended player-facing proof experience;
- what should become hard or non-degenerate before editing;
- authoring `report` result;
- authoring `score` result, explicitly uncalibrated;
- required-technique minimization result;
- degeneracy, rule contribution, and rule-family summary;
- anti-clone result against relevant shipped/experimental references before
  promotion;
- copy review result;
- promotion, quarantine, or rejection decision with exact reason.

## Strict Gates

Do not promote or count a candidate as a target-4 win unless it passes:

- schema, target rules, initial satisfiability;
- no-guess proof and final guest-layout uniqueness;
- no solver truncation;
- target-4 thresholds or an explicit lower-difficulty label that is not counted
  as target-4;
- degeneracy gate;
- anti-clone and novelty review;
- rule contribution and technique retention;
- readable copy with explicit scope membership.

## Attempt Matrix

| # | Candidate | Path | Source | Intended skeleton | Report | Score | Minimize | Degeneracy / clone | Copy | Decision |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `p28-c15-a-remove-direct-safe-region` | `content/experimental/phase-28/p28-c15-a-remove-direct-safe-region.json` | C15 | Preserve derived overlap and local follow-up while replacing the direct `B3/C3/D3` no-guest region with an indirect late frontier. | pending | pending | pending | pending | pending | pending |
| 2 | `p28-c15-b-broaden-entry-opener` | `content/experimental/phase-28/p28-c15-b-broaden-entry-opener.json` | C15 | Broaden the entry opener so the overlap saturation depends on a derived frontier instead of two opening empties. | pending | pending | pending | pending | pending | pending |
| 3 | `p28-c15-c-larger-effective-board` | `content/experimental/phase-28/p28-c15-c-larger-effective-board.json` | C15 | Move the overlap/local chain onto a larger effective board where the overlap result unlocks later pressure rather than closing the case. | pending | pending | pending | pending | pending | pending |
| 4 | `p28-c10-a-late-closure-frontier` | `content/experimental/phase-28/p28-c10-a-late-closure-frontier.json` | C10 | Preserve the two-wave bottle frontier and add one honest late-closure rule for `D2/A3/B3` without a direct no-guest giveaway. | pending | pending | pending | pending | pending | pending |

## Baseline Rejection Knowledge

### C15 Seed

The C15 seed is not eligible for promotion:

- It is mechanically valid and no-guess after Phase 27 hardening.
- It has only 2 proof waves and 7 deductions.
- It fails degeneracy.
- It misses target-4 proof-wave, deduction, shared-variable-overlap, and
  degeneracy thresholds.
- Its minimizer keeps the overlap/local techniques after reducing six reveals
  to `C1` and `D1`.

The C15 rewrite must therefore change the actual proof experience, not just
rename or mirror cells.

### C10 Backup Seed

C10 is the preferred late-closure backup:

- It has 9 initial guest layouts.
- It has 2 proof waves and 4 deductions.
- It passes degeneracy and retains `LOCAL_COUNT_ALL_REMAINING` plus
  `REGION_COUNT_SATURATED` under minimization.
- It still fails no-guess/final uniqueness because `D2`, `A3`, and `B3` are
  solver-only explanation gaps.

The C10 rewrite must explain those gaps with a readable late frontier, not by
public observations or a direct no-guest region over the gap cells.

## Planned Command Pattern

For each serious C15 candidate:

```text
pnpm authoring -- report content\experimental\phase-28\<candidate>.json
pnpm authoring -- score content\experimental\phase-28\<candidate>.json
pnpm authoring -- minimize content\experimental\phase-28\<candidate>.json --require-technique SCOPE_OVERLAP_COUNT_SATURATED
pnpm authoring -- anti-clone <selector cases and relevant references> content\experimental\phase-28\<candidate>.json --include-degeneracy --novelty-manifest content\novelty-claims.json
```

For the C10 late-closure candidate:

```text
pnpm authoring -- report content\experimental\phase-28\p28-c10-a-late-closure-frontier.json
pnpm authoring -- score content\experimental\phase-28\p28-c10-a-late-closure-frontier.json
pnpm authoring -- minimize content\experimental\phase-28\p28-c10-a-late-closure-frontier.json --require-technique LOCAL_COUNT_ALL_REMAINING --require-technique REGION_COUNT_SATURATED
pnpm authoring -- anti-clone <selector cases and relevant references> content\experimental\phase-28\p28-c10-a-late-closure-frontier.json --include-degeneracy --novelty-manifest content\novelty-claims.json
```

## Round 2 Boundary Notes

- No candidate JSON has been authored yet.
- No shipped `content/cases` file changed.
- No selector/default-case change is planned unless a later candidate passes all
  strict gates.
- The maintainer workbench may render diagnostics, but source-of-truth
  validation remains in `packages/authoring`, `packages/proof`, and the
  authoring CLI.
