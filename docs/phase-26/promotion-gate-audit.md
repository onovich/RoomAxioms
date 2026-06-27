# Phase 26 Promotion Gate Audit

Status: Round 17 evidence.
Guide: `docs/phase-26-workbench-guided-puzzle-ladder-production-goal-mode-execution-guide.md`

## Purpose

This audit starts the Phase 26 promotion pass. It checks whether any of the
serious Phase 26 candidates can honestly enter `content/cases` and the
player-facing selector under the strict promotion gate.

No candidate is promoted in Round 17. The evidence says the honest next step is
repair/blocker analysis, not selector padding.

## Promotion Gate

A candidate may be promoted only when all of these are true:

- schema, target rules, and initial satisfiability pass;
- final guest-layout uniqueness passes;
- no-guess / human proof passes;
- default caps do not truncate, or a cap-aware justification is documented;
- opening ambiguity is greater than one guest layout;
- at least one proof wave exists;
- no hard degeneracy failure or direct singleton/near-singleton giveaway drives
  the solution;
- anti-clone finds no proof-trace, shrink-signature, effective-board, or
  rule-impact collision with shipped or candidate references;
- a human-readable novelty claim exists;
- visible copy is plain Chinese and does not rely on hidden highlight scope.

## Current Selector Boundary

Round 17 checked that Phase 26 experimental ids are not wired into the web
content selector:

```powershell
rg "p26-c|phase-26" content\cases apps\web\src\content apps\web\src -n
```

Result: no matches.

The current player selector still imports only shipped cases in
`apps/web/src/content/cases.ts`; `DEFAULT_CASE_ID` remains `case-004`.

## Candidate Promotion Matrix

| Candidate | Eligibility | Blocking gate(s) | Promotion decision |
| --- | --- | --- | --- |
| `p26-c01-overlap-unlock` | Mechanically valid, but clone-like. | Exact proof-trace clone of `case-004`; intended `scopeOverlapCount` rule does not enter proof; target-4 frontier criteria missing. | Reject; do not promote. |
| `p26-c02-comparative-balance` | Phase 24 comparative technique fires. | No-guess false; final uniqueness false; singleton comparative side; redundant rules. | Reject; do not promote. |
| `p26-c03-conditional-frontier` | Schema/target pass. | Conditional technique does not activate in delayed form; public-condition repair collapses to opening unique; near-count giveaway. | Reject; do not promote. |
| `p26-c04-difference-braid` | `LOCAL_SCOPE_DIFFERENCE` retained. | No-guess false; final uniqueness false; C4 explanation gap; intended intersection never enters proof. | Reject; do not promote. |
| `p26-c05-object-gated` | Object-gated techniques retained. | Solver truncation; proof gaps; final uniqueness false; full anti-clone not worth completing after correctness gates failed. | Reject; do not promote. |
| `p26-c06-two-wave-frontier` | Useful two-wave near miss. | No-guess false; final uniqueness false; bottom branch remains solver-only. | Reject; do not promote. |
| `p26-c07-grammar-classic` | Comparative/classic hybrid support exists. | Initial enumeration truncates; no-guess false; final uniqueness false; second wave guess point. | Reject; do not promote. |
| `p26-c08-overlap-repair` | `SCOPE_OVERLAP_COUNT_ALL_REMAINING` retained. | Retained overlap is a direct opening-observation giveaway; hard singleton overlap degeneracy; final uniqueness false. | Reject; do not promote. |
| `p26-c09-comparative-repair` | Non-singleton comparative repair. | No-guess false; final uniqueness false; late A3/B3 safety is solver-only; region near-count warning. | Reject; do not promote. |
| `p26-c10-frontier-repair` | Better S6 repair with no redundant bottle global. | No-guess false; final uniqueness false; D2/A3/B3 remain solver-only. | Reject; do not promote. |
| `p26-c11-replacement-attempt` | Replaces hard singleton baseline shape mechanically. | Opening guest layout already unique; zero proof waves; three near-count warnings; redundant R6. | Reject; do not promote. |
| `p26-c12-final-synthesis` | Comparative technique retained; degeneracy pass. | No-guess false; final uniqueness false; exact proof-trace clone of C09; object-local rules redundant. | Reject; do not promote. |
| `p26-c13-frontier-closure` | Retains the C10 local-count plus region-count proof techniques. | No-guess false; final uniqueness false; hard degeneracy on fully observed R2; R1/R2/R4/R5 redundant; R6 is direct three-cell no-guest closure. | Reject; do not promote. |
| `p26-c14-comparative-object-bridge` | Object-bridge rules become material. | Opening guest layout already unique; zero proof waves; hard degeneracy on singleton comparative-left; required proof techniques absent. | Reject; do not promote. |
| `p26-c15-overlap-chain-repair` | Non-degenerate material overlap scope with opening ambiguity. | No-guess false; final uniqueness false; no `SCOPE_OVERLAP_*` proof technique; B1/A2 explanation gaps; singleton entry rule; redundant R4. | Reject; do not promote. |

## Phase 24 Grammar Finding

Phase 26 produced real proof-technique evidence for Phase 24 grammar:

- `comparativeCount` can fire and survive minimization in C02, C07, C09, and C12.
- `scopeOverlapCount` can be retained in C08.
- `conditionalCount` remains blocked by proof activation limits in C03.

None of these are promotion-ready. The current blocker is not schema support or
copy alone; it is the combination of human proof closure, anti-clone novelty, and
degeneracy pressure.

## Promotion Decision

Round 17 promotion count: 0.

This is intentional. Promoting any Phase 26 candidate now would violate at least
one hard Phase 26 gate. The phase should continue with either narrow repair of
the strongest near misses or prepare `READY_FOR_CHECK_WITH_BLOCKER` evidence if
Rounds 18-20 cannot produce four honest promotions.

Best repair candidates:

- `p26-c10-frontier-repair`: strongest two-wave non-grammar near miss, blocked by
  late solver-only safety. Round 18's C13 repair tried to close that gap, but
  did so by adding direct safety and public observations; it still failed final
  uniqueness and introduced hard degeneracy/redundancy.
- `p26-c12-final-synthesis`: best compact grammar evidence, blocked by C09
  proof-trace clone and redundant object rules. Round 19's C14 repair made the
  object rules material, but only by collapsing the opening into a singleton
  comparative side and a zero-wave solution.
- `p26-c08-overlap-repair`: best scope-overlap retention evidence, blocked by
  direct opening-observation giveaway. Round 20's C15 repair kept the overlap
  scope non-degenerate and material, but derived A1 did not feed a later
  `SCOPE_OVERLAP_*` deduction.

Avoid:

- C11-style over-closure that makes opening layout unique.
- C01-style decorative grammar shell around a known proof trace.
- C09/C12-style comparative opener without a second material proof family.

## Round 17 Conclusion

No `content/cases`, selector, default-case, or novelty-manifest changes were made
in this round. The honest player-facing ladder remains unchanged until a case
passes the full gate or the phase pivots to a documented blocker.

## Round 18 Repair Update

Round 18 attempted a narrow repair of `p26-c10-frontier-repair` as
`p26-c13-frontier-closure`.

Evidence:

- `pnpm authoring -- report content\experimental\phase-26\candidates\p26-c13-frontier-closure.json`
  reports schema/target/initial pass, initial guest layouts 3, no truncation,
  noGuess false, final guest layout not unique, `GUESS_POINT`, 2 waves, and 4
  deductions.
- `pnpm authoring -- score content\experimental\phase-26\candidates\p26-c13-frontier-closure.json`
  reports 13.50 / band 3 uncalibrated.
- `pnpm authoring -- minimize ... --require-technique LOCAL_COUNT_ALL_REMAINING --require-technique REGION_COUNT_SATURATED`
  confirms both techniques are retained, but proof/final uniqueness still fail.
- A lightweight anti-clone/degeneracy run against C06/C10/C13 reports C13 hard
  degeneracy `region:R2:singleton-effective-scope` and reviewer-blocking
  redundant rules.

Conclusion: C13 is useful blocker evidence, not promotion material. It proves
that forcing the C10 closure by public observations and a direct three-cell
no-guest region preserves the desired technique labels but weakens the actual
player experience and still does not produce a complete no-guess proof.

## Round 19 Repair Update

Round 19 attempted a narrow repair of the C09/C12 comparative line as
`p26-c14-comparative-object-bridge`.

Evidence:

- The first C14 draft kept both A1/B1 hidden. It preserved opening ambiguity
  but produced explanation gaps on A3, B3, and B4 before the intended object
  bridge could fire.
- Revealing B1 as a guest was rejected by the schema (`INITIAL_REVEAL_GUEST`),
  so the legal repair changed B1 to a public mirror and adjusted the
  comparative offset.
- `pnpm authoring -- report content\experimental\phase-26\candidates\p26-c14-comparative-object-bridge.json`
  then reports schema/target/initial pass, no truncation, noGuess true, final
  uniqueness true, but only because `initialGuestLayouts = 1`; proof has 0 waves
  and 0 deductions.
- `pnpm authoring -- score content\experimental\phase-26\candidates\p26-c14-comparative-object-bridge.json`
  reports 5.60 / band 1 uncalibrated.
- `pnpm authoring -- minimize ... --require-technique COMPARATIVE_COUNT_ALL_REMAINING --require-technique LOCAL_COUNT_ALL_REMAINING --require-technique LOCAL_COUNT_SATURATED`
  reports all required techniques missing because there is no proof wave.
- Anti-clone/degeneracy against C09/C12/C14 reports C14 hard degeneracy
  `comparative-left:R2:singleton-effective-scope`.

Conclusion: C14 is useful blocker evidence, not promotion material. It confirms
that making the C12 object bridge mechanically material is possible, but the
tested legal repair over-closes the puzzle before play begins and recreates the
singleton-comparative trap that Phase 26 is supposed to avoid.

## Round 20 Repair Update

Round 20 attempted a narrow repair of the C08 scope-overlap line as
`p26-c15-overlap-chain-repair`.

Evidence:

- `pnpm authoring -- report content\experimental\phase-26\candidates\p26-c15-overlap-chain-repair.json`
  reports schema/target/initial pass, initial guest layouts 4, no truncation,
  noGuess false, final guest layout not unique, explanation gaps on B1 and A2,
  1 wave, and 4 deductions.
- `pnpm authoring -- score content\experimental\phase-26\candidates\p26-c15-overlap-chain-repair.json`
  reports 13.69 / band 3 uncalibrated.
- `pnpm authoring -- minimize ... --require-technique SCOPE_OVERLAP_COUNT_SATURATED --require-technique LOCAL_COUNT_SATURATED --require-technique LOCAL_COUNT_ALL_REMAINING`
  reports all required techniques missing. The proof only emits
  `REGION_COUNT_ALL_REMAINING` and `REGION_COUNT_SATURATED`.
- Anti-clone/degeneracy against C01/C08/C15 reports C15 hard degeneracy
  `region:R2:singleton-effective-scope:direct-count-giveaway`; C15's
  `scopeOverlapCount` rule itself passes degeneracy and is material.

Conclusion: C15 is useful blocker evidence, not promotion material. It confirms
that a non-degenerate overlap scope can be present and material, but the current
human proof still does not turn a derived A1 guest into a later
`SCOPE_OVERLAP_COUNT_SATURATED` deduction. The available Phase 26 overlap paths
therefore split into either "technique retained only by opening-observation
giveaway" (C08) or "non-degenerate overlap that never becomes a proof
technique" (C15).

## Round 21 Ladder And Copy Review

Round 21 review is recorded in
`docs/phase-26/ladder-copy-review.md`.

Result:

- No Phase 26 candidate is promoted.
- Current player selector and `DEFAULT_CASE_ID = case-004` remain unchanged.
- Phase 26 experimental candidates remain isolated from `content/cases` and
  `apps/web/src/content/cases.ts`.
- The current 10-case selector is retained with explicit caveats rather than
  padded or reordered around rejected experimental content.

## Round 22 Blocker Readiness Update

Round 22 review is recorded in
`docs/phase-26/blocker-readiness-plan.md`.

Result:

- No Phase 26 candidate is promoted.
- No selector order, default-case, shipped case JSON, or novelty-manifest change
  is made.
- The current 15-candidate rejection corpus is sufficient blocker evidence if no
  later repair produces at least four strict-gate promotions.
- Remaining non-final rounds should prioritize runtime/selector QA and concrete
  repair of any discovered P0/P1 issue, not additional content padding.
