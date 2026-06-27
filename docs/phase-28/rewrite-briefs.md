# Phase 28 Rewrite Briefs

Status: Round 1 rewrite planning evidence.
Guide: `docs/phase-28-nondegenerate-puzzle-rewrite-sprint-goal-mode-execution-guide.md`

## Purpose

Phase 28 is a narrow rewrite sprint, not another broad candidate-production
batch. This brief fixes the starting evidence, the intended proof experiences,
and the rejection rules before any new Phase 28 candidate JSON is authored.

The sprint starts from the Phase 27 result: proof bridge support is now strong
enough for C15-style derived overlap facts, but the current content still fails
strict promotion gates.

## Required Context Read

Round 1 read the Phase 28 guide and the required context set:

- `README.md`
- `AGENTS.md`
- `Role.md`
- `docs/development-plan.md`
- `docs/phase-27-proof-authoring-bridge-hardening-final-report.md`
- `docs/phase-27/near-miss-recheck-after-bridge.md`
- `docs/phase-27/proof-authoring-blocker-taxonomy.md`
- `docs/phase-27/derived-fact-bridge-fixtures.md`
- `docs/phase-27/late-closure-diagnostics.md`
- `docs/phase-26/candidate-review-log.md`
- `docs/phase-26/blocker-follow-up-recommendations.md`
- `docs/phase-26/promotion-gate-audit.md`
- `docs/phase-23/difficulty-rubric-v2.md`
- the four Phase 26 near-miss candidate JSON files named by the guide
- relevant `packages/proof/src`, `packages/authoring/src`, and
  `apps/web/src/workbench` source files
- `.codex/project-ops-workflow.json`
- `.codex/project-git-workflow.json`

## Baseline CLI Snapshot

### C15: `p26-c15-overlap-chain-repair`

Commands:

```text
pnpm authoring -- report content\experimental\phase-26\candidates\p26-c15-overlap-chain-repair.json
pnpm authoring -- score content\experimental\phase-26\candidates\p26-c15-overlap-chain-repair.json
pnpm authoring -- minimize content\experimental\phase-26\candidates\p26-c15-overlap-chain-repair.json --require-technique SCOPE_OVERLAP_COUNT_SATURATED --require-technique LOCAL_COUNT_SATURATED
```

Current result:

- Report: `ok=true`, schema/target/initial/proof/final uniqueness all pass.
- Initial guest layouts: 4.
- Proof: `noGuess=true`, 2 waves, 7 deductions.
- Final guests: `A1`, `C2`.
- Techniques: `REGION_COUNT_ALL_REMAINING`,
  `SCOPE_OVERLAP_COUNT_SATURATED`, `REGION_COUNT_SATURATED`,
  `LOCAL_COUNT_SATURATED`.
- Score: 18.69, band 5, uncalibrated.
- Difficulty review: recommended `tutorial-or-baseline`.
- Target-4 missing: `proof-wave-count`, `deduction-count`,
  `shared-variable-overlap-count`, `degeneracy-status`.
- Degeneracy: `fail`.
- Minimize: 6 opening reveals collapse to 2 (`C1`, `D1`) while preserving the
  required overlap/local techniques.

Interpretation:

C15 is proof-bridge evidence, not promotion content. The overlap rule is now
material, but the case still has a direct structure: R2 makes A1 from a
three-cell entry count after two opening empties, and R5 directly grants three
safe cells. The minimizer proving that only `C1` and `D1` are needed is a design
weakness, not a success.

### Backup Late-Closure Candidates

Commands:

```text
pnpm authoring -- report content\experimental\phase-26\candidates\p26-c06-two-wave-frontier.json
pnpm authoring -- report content\experimental\phase-26\candidates\p26-c10-frontier-repair.json
pnpm authoring -- report content\experimental\phase-26\candidates\p26-c09-comparative-repair.json
pnpm authoring -- minimize content\experimental\phase-26\candidates\p26-c10-frontier-repair.json --require-technique LOCAL_COUNT_ALL_REMAINING --require-technique REGION_COUNT_SATURATED
pnpm authoring -- minimize content\experimental\phase-26\candidates\p26-c09-comparative-repair.json --require-technique COMPARATIVE_COUNT_ALL_REMAINING
```

Current result:

- C06: `repair-proof`; 14 initial guest layouts; 2 waves / 4 deductions;
  proof gaps on four cells; degeneracy passes; target-4 misses wave, deduction,
  and shared-variable overlap depth.
- C10: `repair-proof`; 9 initial guest layouts; 2 waves / 4 deductions; proof
  gaps on `D2`, `A3`, `B3`; degeneracy passes; minimization retains
  `LOCAL_COUNT_ALL_REMAINING` and `REGION_COUNT_SATURATED` but no-guess/final
  uniqueness still fail.
- C09: `repair-proof`; 6 initial guest layouts; 1 wave / 2 deductions; proof
  gaps on `A3`, `B3`; degeneracy warning; minimization retains
  `COMPARATIVE_COUNT_ALL_REMAINING` but no-guess/final uniqueness still fail.

Backup choice:

Use C10 first if the C15 path is exhausted. C10 is the cleanest late-closure
rewrite seed because it already preserves a two-wave frontier and passes
degeneracy, while its remaining blocker is a compact set of solver-only safe
cells. C09 remains a secondary option if comparative closure becomes more
promising than C10, but it starts from only one proof wave and a degeneracy
warning.

## C15 Degeneracy Cause

C15 fails as player-facing target-4 content for four design reasons:

1. R2 is a narrow entry count that becomes `REGION_COUNT_ALL_REMAINING` after
   two opening empties. This makes the first guest feel located by setup rather
   than by an interaction.
2. R3's overlap deduction is valid after Phase 27 bridge work, but it only
   follows the direct R2 opener. It is a useful technique check, not enough
   proof depth.
3. R5 is a public zero-guest region over `B3`, `C3`, `D3`. Even with explicit
   coordinates, it directly gives a block of safe cells and should not count as
   hard reasoning.
4. The opening minimizer removes four of six reveals without losing the
   retained techniques. A real rewrite should not collapse to two observed
   cells and the same answer pattern.

## C15 Nondegenerate Rewrite Target

The Phase 28 C15 rewrite should preserve the core idea:

- a derived guest or derived safe fact becomes material for a later
  `scopeOverlapCount`;
- the overlap rule then changes the next proof frontier;
- a local/object/count rule uses the new frontier to close later cells.

The rewrite should change the player experience:

- no public zero-guest region over a block of cells;
- no singleton or near-singleton effective scope driving the answer;
- at least four proof waves and at least eight deductions if claiming target-4;
- the overlap/local chain should survive minimization without collapsing the
  opening to a two-cell setup;
- at least three material rule families and no redundant rules;
- visible copy must name explicit coordinates for any fixed scope, with no
  hidden membership, internal term, or highlight-only semantics.

## Planned C15 Attempts

### Attempt A: Remove The Direct Safe Region

Replace C15 R5 with an indirect closing rule whose scope includes later cells but
does not directly state that a whole region has no guests. Candidate shape:

- keep a non-singleton overlap intersection;
- make the overlap produce a safe object or safe cell that narrows a later
  local count;
- add a second closing rule that still has at least two effective unknowns at
  opening.

Fast rejection triggers:

- R5-equivalent no-guest giveaway returns;
- minimization reduces to two or three opening reveals while keeping the same
  techniques;
- proof waves stay at 2 or fewer.

### Attempt B: Broaden The Entry Opener

Replace the narrow R2 entry count with a broader or cross-family opener so A1 is
not forced by two opening empties alone. Candidate shape:

- use a 4-5 cell entry/frontier scope or comparative/conditional precondition;
- require at least one derived non-opening fact before the overlap can saturate;
- keep overlap cells non-singleton and explicitly named in player copy.

Fast rejection triggers:

- opening guest layouts drop to 1;
- the first proof wave identifies all final guests;
- target-4 still misses `shared-variable-overlap-count` and proof depth.

### Attempt C: Move To A Larger Effective Board

Use the C15 proof skeleton on a slightly broader board or with a different
target layout so the overlap result unlocks a later chain instead of closing the
puzzle. Candidate shape:

- preserve the C15 overlap/local dependency;
- add one honest late frontier, preferably object-local or line/region pressure
  that becomes meaningful only after the overlap reveal;
- avoid padding cells that reduce out of the effective board.

Fast rejection triggers:

- effective-board reduction discards the added area;
- anti-clone finds proof-trace or rule-impact equivalence with C15 or shipped
  cases;
- score looks high only because of more cells while proof remains shallow.

## Late-Closure Rewrite Target

If C15 does not produce a survivor, rewrite C10 first.

Intended player experience:

- Wave 1 uses the north-region rule to reveal/identify the bottle area.
- Wave 2 uses the bottle-local rule to confirm the first guest.
- A later rule should explain `D2`, `A3`, and `B3` without turning into a
  direct three-cell no-guest clue or public opening observation cluster.
- The second frontier must improve final guest uniqueness through approved
  human deductions, not solver-only closure.

Fast rejection triggers:

- direct no-guest/safe scope over the exact proof-gap cells;
- adding public observations until the opening layout is unique;
- retaining only the old two techniques with no new human-explainable closure.

## Promotion Gate Reminder

No Phase 28 candidate may be promoted unless it passes:

- schema, target rules, initial satisfiability;
- no-guess proof and final guest-layout uniqueness;
- no solver truncation;
- target-4 gates, or an explicit lower-difficulty decision that does not count
  as a target-4 win;
- degeneracy gate;
- anti-clone and novelty review against the current selector;
- rule contribution and technique retention;
- copy review for explicit scope text and no internal labels;
- focused web runtime tests if copied into shipped content.

Zero promotions remain acceptable only if this sprint records concrete rejection
evidence and a next-method recommendation.
