# Phase 23 Target Candidate Production - Round 10

Round: 10
Decision: promote `case-021` as the first Phase 23 target 4+ ladder case.

Post-Phase 24 note: `case-021` was later kept in the player selector but downgraded by user review to difficulty 3. The target-4 notes in this round file are historical machine-gate evidence, not the current presentation tier.

## Promoted Case

Path: `content/cases/case-021.json`

Player title: `客房 21：中线清扫链`

Design skeleton:

- Opening ambiguity starts with two observed bottles on the top row and four observed empty middle-lane cells.
- The two bottles and the unique mirror rule force `C1` by shared-neighborhood intersection.
- The mirror opens the first cleaning anchor.
- Cleaning anchors advance down the centerline through `C2`, `C3`, `C4`, and `C5`.
- The side region removes non-guest side cells without padding the board.
- Final guest layout is `A4`, `A5`, `E5`.

## Authoring Report

Command:

```powershell
pnpm authoring -- report content/cases/case-021.json
```

Result:

- `ok`: true.
- Recommendation: `ready-for-experimental-review`.
- Initial guest layouts: 56, no `greaterThan`.
- Proof: no-guess true, human-explainable true, final guest-layout unique true.
- Proof waves: 4.
- Deductions: 23.
- Effective unknown cells: 19.
- Frontier unlocks: 3.
- Shared-variable overlap count: 5.
- Material rule families: `anchor`, `foreach`, `global`, `region`.
- Redundant rules: none.
- Degeneracy: pass.
- Difficulty bucket: `target-4`.
- Target 4 threshold: pass.
- Super-hard threshold: missing `proof-wave-count`.

## Score

Command:

```powershell
pnpm authoring -- score content/cases/case-021.json
```

Result:

- Score: 40.57.
- Band: 5.
- Calibrated with real playtest: false.
- Candidate guest layouts: 56.
- Solver truncated: false.

The score is only an internal authoring signal and is not playtest calibration.

## Minimize Check

Command:

```powershell
pnpm authoring -- minimize content/cases/case-021.json
```

Result:

- Before cells: `B1`, `D1`, `B3`, `D3`, `B4`, `D4`.
- Minimized after cells: `D1`.
- The minimized reveal set preserves no-guess uniqueness, but it is not accepted for Phase 23 promotion.

Reason:

- Rechecking the minimized `D1` reveal set returned `raise-caps-or-simplify`.
- It exceeded the default authoring guest-layout cap.
- It lost the target 4 threshold on `shared-variable-overlap-count`.
- It made `R2` and `R3` redundant.

The promoted reveal set is intentionally non-minimal because Phase 23 quality gates require controlled opening ambiguity, retained shared-overlap reasoning, and no redundant rules.

## Anti-Clone And Novelty

Full selector command shape:

```powershell
pnpm authoring -- anti-clone <current selector cases plus case-021> --novelty-manifest content/novelty-claims.json --include-degeneracy
```

Result summary:

- Pairwise clone groups: 0.
- Proof-trace clone groups: 0.
- Candidate-shrink clone groups: 0.
- Rule-impact clone groups: 0.
- `case-021` degeneracy: pass.
- `case-021` rule-family diversity: pass, 4 material families.
- Novelty claim: accepted in `content/novelty-claims.json`; focused manifest check for `case-004` and `case-021` returned `ok: true`.

Important legacy note:

- Full selector anti-clone still returned overall `fail` because legacy selector cases already fail newly added Phase 23 gates:
  - Degeneracy fail: `case-015`, `case-017`, `case-018`, `case-020`.
  - Single material-family fail: `case-011`, `case-013`, `case-014`.
- No clone group involved `case-021`.
- This is the same legacy selector quality issue recorded in Round 09 and remains a selector repair/demotion task for later Phase 23 rounds.

## Runtime And Performance

Focused web validation:

```powershell
pnpm --filter @room-axioms/web test
```

Result: PASS, 11 files, 75 tests.

Runtime repair included in this round:

- Raised the runtime analyzer default candidate-layout display cap from 20 to 100.
- This prevents normal target 4+ cases such as `case-021` with 56 opening guest layouts from being mislabeled as candidate-cap warnings.
- Player mode still does not expose candidate lists, forced cells, target layouts, authoring diagnostics, or anti-clone internals.

Performance baseline update:

- The shipped-case verification batch now covers 10 cases after `case-021`.
- The Node P95 ceiling was updated from 2000 ms to 2500 ms for the expanded batch.
- The baseline remains deterministic test evidence, not a product performance promise.

## Outcome

- Promoted target 4/5 cases this round: 1 (`case-021`).
- Promoted super-hard cases this round: 0.
- Deferred/rejected target candidates this round: minimized `D1` reveal variant rejected for Phase 23 quality loss.
- Carryover blocker: legacy selector cases fail new degeneracy/material-family gates and should be demoted, repaired, or separated before final release evidence claims the whole selector passes Phase 23 gates.

## Round 10 Self-Checks

Debug self-check:

- Smallest candidate tested: non-minimized and minimized `case-021` reveal sets.
- Standard validation covered: schema, target rules, initial satisfiability, opening guest layouts, proof/no-guess, final uniqueness, runtime readiness.
- Anti-clone report covered: yes; no clone groups, candidate-specific degeneracy/family pass, legacy selector failures documented.
- Novelty claim covered: yes, accepted `case-021` claim added and manifest check passed.
- Proof/no-guess path covered: yes, 4 waves and 23 deductions.
- Rejected prior candidates stayed out: yes.
- Generator/authoring rejection evidence recorded: yes, minimized reveal set rejected.
- Runtime/player secrecy checked: yes via web runtime smoke.
- Regression risk: moderate, because the web selector gained a heavier 5x5 case and runtime cap/baseline were updated narrowly.

Architecture self-check:

- Domain, schema, solver, proof, generator, and authoring package boundaries unchanged.
- Web imports the new case through the existing content path.
- Runtime cap change affects only summary counting, not player-visible internals.
- No new DSL semantics, proof techniques, schema migration, public editor, backend, analytics, or broad UI/theme work.
- Experimental/rejected candidates remain out of the player selector.
- Target access and developer-only data exposure remain unchanged.
- Unrelated untracked docs were left untouched.
