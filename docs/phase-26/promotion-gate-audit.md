# Phase 26 Promotion Gate Audit

Status: Round 17 evidence.
Guide: `docs/phase-26-workbench-guided-puzzle-ladder-production-goal-mode-execution-guide.md`

## Purpose

This audit starts the Phase 26 promotion pass. It checks whether any of the 12
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
  late solver-only safety.
- `p26-c12-final-synthesis`: best compact grammar evidence, blocked by C09
  proof-trace clone and redundant object rules.
- `p26-c08-overlap-repair`: best scope-overlap retention evidence, blocked by
  direct opening-observation giveaway.

Avoid:

- C11-style over-closure that makes opening layout unique.
- C01-style decorative grammar shell around a known proof trace.
- C09/C12-style comparative opener without a second material proof family.

## Round 17 Conclusion

No `content/cases`, selector, default-case, or novelty-manifest changes were made
in this round. The honest player-facing ladder remains unchanged until a case
passes the full gate or the phase pivots to a documented blocker.
