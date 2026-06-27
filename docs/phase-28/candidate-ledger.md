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
| 1 | `p28-c15-a-remove-direct-safe-region` | `content/experimental/phase-28/p28-c15-a-remove-direct-safe-region.json` | C15 | Preserve derived overlap and local follow-up while replacing the direct `B3/C3/D3` no-guest region with an indirect late frontier. | FAIL: `repair-proof`; 16 initial guest layouts; 3 waves / 4 deductions; `GUESS_POINT`; final uniqueness false. | PASS: 21.51 / band 5 uncalibrated. | FAIL: required overlap/local techniques retained, but minimized proof still no-guess false and final uniqueness false. | FAIL: R5 replacement passes degeneracy, but R2 remains `singleton-effective-scope:direct-count-giveaway`; anti-clone status `fail`. | PASS for this private draft: fixed scopes are explicit coordinate text; no hidden named-region semantics. | rejected |
| 2 | `p28-c15-b-broaden-entry-opener` | `content/experimental/phase-28/p28-c15-b-broaden-entry-opener.json` | C15 | Broaden the entry opener so the overlap saturation depends on a derived frontier instead of two opening empties. | FAIL: `repair-proof`; 32 initial guest layouts; 1 wave / 0 deductions; `EXPLANATION_GAP` on B1. | PASS: 15.24 / band 4 uncalibrated. | FAIL: required overlap/local techniques missing before and after minimization. | BLOCKED: R2 improves to warning rather than hard fail, but R4 becomes redundant and anti-clone status is `fail` against C15 due baseline hard fail plus B warning. | PASS for this private draft: fixed scopes are explicit coordinate text; no hidden named-region semantics. | rejected |
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

## Candidate Notes

### 1. `p28-c15-a-remove-direct-safe-region`

Round 3 attempted C15 rewrite path A.

Intended change:

- Remove C15's direct `B3/C3/D3` no-guest region.
- Keep the derived `A1` guest feeding `SCOPE_OVERLAP_COUNT_SATURATED`.
- Keep the bottle-local follow-up.
- Add a bottom four-cell pressure rule instead of a public zero-guest region.

Evidence:

```text
pnpm authoring -- report content\experimental\phase-28\p28-c15-a-remove-direct-safe-region.json
pnpm authoring -- score content\experimental\phase-28\p28-c15-a-remove-direct-safe-region.json
pnpm authoring -- minimize content\experimental\phase-28\p28-c15-a-remove-direct-safe-region.json --require-technique SCOPE_OVERLAP_COUNT_SATURATED --require-technique LOCAL_COUNT_SATURATED
pnpm authoring -- anti-clone content\experimental\phase-26\candidates\p26-c15-overlap-chain-repair.json content\experimental\phase-28\p28-c15-a-remove-direct-safe-region.json --include-degeneracy
```

Result:

- Schema, target rules, and initial satisfiability pass.
- Initial guest layouts increase to 16, so the draft preserves opening
  ambiguity.
- Proof advances to 3 waves but stops at `GUESS_POINT`; no-guess and final
  guest-layout uniqueness fail.
- Required `SCOPE_OVERLAP_COUNT_SATURATED` and `LOCAL_COUNT_SATURATED`
  techniques are retained under minimization.
- The replacement R5 bottom-pressure rule passes degeneracy with four effective
  unknown cells and is material.
- R2 remains a hard degeneracy failure:
  `region:R2:singleton-effective-scope:direct-count-giveaway`.
- Target-4 still misses proof-wave, deduction-count, shared-variable-overlap,
  and degeneracy thresholds.

Decision:

Reject. This is useful evidence, not a survivor. Removing the direct safe region
improved one C15 weakness, but the narrow R2 entry opener remains a direct
giveaway, and the new bottom pressure becomes a solver-level/global-count
combination that the approved human proof cannot close. Attempt B should attack
R2 rather than only replacing the closing rule.

### 2. `p28-c15-b-broaden-entry-opener`

Round 4 attempted C15 rewrite path B.

Intended change:

- Broaden C15's entry opener from `A1/C1/D1 exactly 1 guest` to
  `A1/A2/C1/D1 exactly 1 guest`.
- Preserve the same non-singleton overlap scope over `A1/B1/A2`.
- Keep the bottom pressure from attempt A.
- Reject rather than patch with direct reveals if the broader opener cannot feed
  the overlap proof.

Evidence:

```text
pnpm authoring -- report content\experimental\phase-28\p28-c15-b-broaden-entry-opener.json
pnpm authoring -- score content\experimental\phase-28\p28-c15-b-broaden-entry-opener.json
pnpm authoring -- minimize content\experimental\phase-28\p28-c15-b-broaden-entry-opener.json --require-technique SCOPE_OVERLAP_COUNT_SATURATED --require-technique LOCAL_COUNT_SATURATED
pnpm authoring -- anti-clone content\experimental\phase-26\candidates\p26-c15-overlap-chain-repair.json content\experimental\phase-28\p28-c15-b-broaden-entry-opener.json --include-degeneracy
```

Result:

- Schema, target rules, and initial satisfiability pass.
- Initial guest layouts increase to 32.
- Proof produces no deductions and reports an `EXPLANATION_GAP` on `B1`.
- Required `SCOPE_OVERLAP_COUNT_SATURATED` and `LOCAL_COUNT_SATURATED`
  techniques are missing before and after minimization.
- R2 no longer hard-fails degeneracy, but it remains reviewer-blocking as a
  `near-count-giveaway`.
- R4 becomes redundant because the proof never reaches a bottle-local subject.
- R3 and R5 individually pass degeneracy, but the candidate does not preserve
  the material C15 proof chain.

Decision:

Reject. Broadening the entry opener attacks C15's hard degeneracy, but the
current proof templates cannot combine the broader entry frontier with the
overlap count to derive `B1` safely. This confirms that C15 cannot be salvaged
by widening R2 alone; attempt C should change the board/chain enough that an
overlap result creates a later frontier without depending on a direct or
near-direct entry count.

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
