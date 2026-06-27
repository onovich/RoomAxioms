# Phase 26 Candidate Review Log

Status: Round 3 ledger scaffold.
Guide: `docs/phase-26-workbench-guided-puzzle-ladder-production-goal-mode-execution-guide.md`

This log is the source of truth for Phase 26 candidate attempt accounting. A
candidate does not count as one of the required 12 serious attempts until it has
an entry here with at least report and score evidence.

## Candidate Evidence Contract

Each serious candidate must record:

- candidate id;
- file path under `content/experimental/phase-26/` or repaired shipped case path;
- intended proof skeleton;
- authoring `report` command and result;
- authoring `score` command and result;
- workbench diagnostics summary or exported draft note;
- anti-clone / degeneracy result before promotion;
- novelty claim status;
- copy review status;
- decision: rejected, deferred, repaired, promoted, or quarantined;
- exact reason for rejection or promotion.

Workflow details live in `docs/phase-26/authoring-workflow.md`.

## Skeleton Catalog

| Skeleton | Template | Intended use |
| --- | --- | --- |
| P26-S1 Crossing Overlap Unlock | `content/experimental/phase-26/templates/p26-s1-crossing-overlap-unlock-template.json` | Non-singleton overlap that becomes useful after a classic deduction. |
| P26-S2 Comparative Balance Fork | `content/experimental/phase-26/templates/p26-s2-comparative-balance-fork-template.json` | Comparison where a later observation breaks the balance. |
| P26-S3 Conditional Frontier Unlock | `content/experimental/phase-26/templates/p26-s3-conditional-frontier-unlock-template.json` | Conditional rule activated after an earlier human deduction. |
| P26-S4 Difference Intersection Braid | `content/experimental/phase-26/templates/p26-s4-difference-intersection-braid-template.json` | Local difference/intersection chain that avoids prior answer-pattern clones. |
| P26-S5 Object Gated Local Saturation | `content/experimental/phase-26/templates/p26-s5-object-gated-local-saturation-template.json` | Object identification unlocks later neighborhood/ring saturation. |
| P26-S6 Two Wave Reveal Frontier | `content/experimental/phase-26/templates/p26-s6-two-wave-reveal-frontier-template.json` | First proof wave changes the material scope for the second wave. |
| P26-S7 Grammar And Classic Hybrid | `content/experimental/phase-26/templates/p26-s7-grammar-classic-hybrid-template.json` | Phase 24 grammar is necessary but supported by classic readable counts. |

## Attempt Matrix

| # | Candidate | Path | Skeleton | Report | Score | Workbench / diagnostics | Anti-clone / degeneracy | Novelty | Copy | Decision | Reason |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `p26-c01-overlap-unlock` | `content/experimental/phase-26/candidates/p26-c01-overlap-unlock.json` | P26-S1 | PASS: ok true; initial guest layouts 9; final guests D1,B4; proof 1 wave / 13 deductions; no truncation. | PASS: 22.16 / band 5 uncalibrated. | CLI diagnostics PASS mechanically, but target-4 review misses `proof-wave-count` and `frontier-unlock-count`; proof techniques do not include any `SCOPE_OVERLAP_*` technique. | FAIL: full selector anti-clone reports exact proof-trace match for `case-004,p26-c01-overlap-unlock`; no C01-specific degeneracy hard-fail observed, but baseline selector still contains known inherited failures. | Not promotion-ready; no novelty claim added because clone gate fails. | PASS for experimental copy: R7 names the seven cells explicitly and does not rely on a hidden region label. | rejected | Serious candidate rejected. It is schema/solver/proof valid, but the scope-overlap rule does not materially enter the human proof (`minimize --require-technique SCOPE_OVERLAP_COUNT_SATURATED` reports `TECHNIQUE_RETENTION_FAILED`) and anti-clone finds an exact proof-trace clone of `case-004`. |
| 2 | `p26-c02-comparative-balance` | `content/experimental/phase-26/candidates/p26-c02-comparative-balance.json` | P26-S2 | FAIL: schema and target rules pass; initial guest layouts 2; proof noGuess false; final guest layout not unique; 1 wave / 4 deductions; no truncation. | PASS: 16.21 / band 4 uncalibrated. | CLI diagnostics `repair-proof`; techniques include `COMPARATIVE_COUNT_SATURATED` and `LOCAL_COUNT_SATURATED`; minimize retains `COMPARATIVE_COUNT_SATURATED` but still fails proof/final uniqueness. | FAIL: degeneracy hard-fail `comparative-left:R3:singleton-effective-scope`; rule-family diversity reviewer-blocking `redundant-rules`; no promotion anti-clone pass. | Not promotion-ready; no novelty claim added because proof, degeneracy, and redundancy gates fail. | PASS for experimental copy: R3 explicitly names A1/B1/A2 and C1/D1/C2; no hidden region semantics. | rejected | Serious candidate rejected. It proves Phase 24 comparative proof support can fire and survive minimization, but the candidate remains a one-wave proof gap with final non-unique guests, a singleton comparative side, and redundant R1/R4/R6 rules. |
| 3 | `p26-c03-conditional-frontier` | `content/experimental/phase-26/candidates/p26-c03-conditional-frontier.json` | P26-S3 | FAIL: schema and target rules pass; initial guest layouts 2; proof noGuess false; final guest layout not unique; 1 wave / 2 deductions; no truncation. | PASS: 8.95 / band 2 uncalibrated. | CLI diagnostics `repair-proof`; delayed-trigger version only uses `LOCAL_COUNT_SATURATED`, not `CONDITIONAL_COUNT_*`; public-condition repair was tried but collapsed to opening unique / 0 proof waves. | FAIL: reviewer-blocking `line:R4:near-count-giveaway`; reviewer-blocking `redundant-rules`; baseline selector still has inherited hard failures. | Not promotion-ready; no novelty claim added because conditional technique retention, proof, and quality gates fail. | PASS for experimental copy: R3 and R4 explicitly name their cells; no hidden scope label. | rejected | Serious candidate rejected. It shows the intended delayed condition cannot currently use safe-cell object reveals to activate `conditionalCount`, while the public-condition fallback becomes a zero-wave opening-unique fixture instead of a puzzle. |
| 4 | `p26-c04-difference-braid` | `content/experimental/phase-26/candidates/p26-c04-difference-braid.json` | P26-S4 | FAIL: schema and target rules pass; initial guest layouts 4; proof noGuess false; final guest layout not unique; `EXPLANATION_GAP` on C4; 1 wave / 7 deductions; no truncation. | PASS: 15.10 / band 4 uncalibrated. | CLI diagnostics `repair-proof`; techniques include `LOCAL_COUNT_SATURATED` and `LOCAL_SCOPE_DIFFERENCE`; target-4 review misses `proof-wave-count`, `deduction-count`, `material-rule-family-count`, and `frontier-unlock-count`. | FAIL for promotion: C04 degeneracy passes and material families pass, but selector anti-clone command remains fail because C04 lacks a novelty claim; broader pack also reports inherited baseline issues. | Not promotion-ready; no novelty claim added because proof/final uniqueness and intended intersection retention fail. | PASS for experimental copy: rules use object/neighborhood wording, no named hidden region, and no highlight-only scope dependency. | rejected | Serious candidate rejected. The D4 public-bottle repair reduced opening layouts to 4 and retained `LOCAL_SCOPE_DIFFERENCE`, but the proof still cannot explain C4, final guests remain non-unique, `LOCAL_SCOPE_INTERSECTION` never appears, and the case collapses to a one-wave/tutorial-or-baseline review instead of the intended difference/intersection braid. |
| 5 | `p26-c05-object-gated` | `content/experimental/phase-26/candidates/p26-c05-object-gated.json` | P26-S5 | FAIL: schema and target rules pass; initial guest layouts 10 with solver truncation; proof noGuess false; final guest layout not unique; 1 wave / 2 deductions; proof gaps on A3, C3, A4, B4, C4. | PASS: 18.81 / band 5 uncalibrated, but score metrics report solver truncation. | CLI diagnostics `raise-caps-or-simplify`; techniques include `LOCAL_COUNT_ALL_REMAINING` and `KNOWN_SAFE_FROM_NON_GUEST_OBJECT`; minimize retains both required object-gated techniques. | Not promotion-run to completion: degeneracy passes in report, but full selector anti-clone exceeded a reasonable local runtime and was stopped after C05 was already blocked by truncation, proof gaps, and final non-uniqueness. | Not promotion-ready; no novelty claim added because correctness and cap gates fail. | PASS for experimental copy: object names are plain Chinese (`酒瓶`, `垃圾桶`) and no internal anchor wording or hidden named region is exposed. | rejected | Serious candidate rejected. It proves the intended object-gated skeleton can fire: R1 identifies B3 as a garbage bin and the safe-from-object deduction is retained. The draft lacks enough independent closing pressure, so R2's expected downstream no-guest saturation becomes solver-only proof gaps and the guest layout remains non-unique. |
| 6 | `p26-c06-two-wave-frontier` | `content/experimental/phase-26/candidates/p26-c06-two-wave-frontier.json` | P26-S6 | pending | pending | pending | pending | pending | pending | pending | Round 10 candidate: two proof waves with changed material scope. |
| 7 | `p26-c07-grammar-classic` | `content/experimental/phase-26/candidates/p26-c07-grammar-classic.json` | P26-S7 | pending | pending | pending | pending | pending | pending | pending | Round 11+ candidate: explicit Phase 24 grammar/classic hybrid if first grammar attempts fail. |
| 8 | `p26-c08-overlap-repair` | `content/experimental/phase-26/candidates/p26-c08-overlap-repair.json` | P26-S1 | pending | pending | pending | pending | pending | pending | pending | Round 11+ candidate: repair or alternate overlap after C01 evidence. |
| 9 | `p26-c09-comparative-repair` | `content/experimental/phase-26/candidates/p26-c09-comparative-repair.json` | P26-S2 | pending | pending | pending | pending | pending | pending | pending | Round 12+ candidate: repair or alternate comparative case after C02 evidence. |
| 10 | `p26-c10-frontier-repair` | `content/experimental/phase-26/candidates/p26-c10-frontier-repair.json` | P26-S6 | pending | pending | pending | pending | pending | pending | pending | Round 13+ candidate: second two-wave frontier with different board pressure. |
| 11 | `p26-c11-replacement-attempt` | `content/experimental/phase-26/candidates/p26-c11-replacement-attempt.json` | P26-S5 | pending | pending | pending | pending | pending | pending | pending | Round 14+ candidate: target a replacement for one singleton-giveaway baseline. |
| 12 | `p26-c12-final-synthesis` | `content/experimental/phase-26/candidates/p26-c12-final-synthesis.json` | TBD | pending | pending | pending | pending | pending | pending | pending | Round 15+ candidate: choose skeleton based on accumulated rejection evidence. |

## Promotion Accounting

| Case | Source candidate | Promoted path | PASS gate evidence | Notes |
| --- | --- | --- | --- | --- |
| TBD | TBD | TBD | pending | No Phase 26 promotion yet. |

## Rejection Themes

Use this section to summarize repeated failures as evidence accumulates.

- Singleton or direct-count giveaway: `p26-c02-comparative-balance` fails degeneracy on `comparative-left:R3:singleton-effective-scope`; this is a clearer comparative-specific trap than the old region/line singleton failures.
- Singleton or direct-count giveaway: `p26-c03-conditional-frontier` avoids a hard singleton failure but still hits reviewer-blocking `line:R4:near-count-giveaway`, so the conditional consequence leaves too little real frontier.
- One-family closure: none yet.
- Clone-like proof trace or shrink signature: `p26-c01-overlap-unlock` is mechanically valid but anti-clone reports an exact proof-trace match with `case-004`, so adding a `scopeOverlapCount` shell did not create a distinct proof shape.
- Highlight-dependent or internal copy: none yet.
- Phase 24 grammar support/copy blocker: `p26-c01-overlap-unlock` has a `scopeOverlapCount` rule family, but proof techniques do not include `SCOPE_OVERLAP_*` and `minimize --require-technique SCOPE_OVERLAP_COUNT_SATURATED` reports `TECHNIQUE_RETENTION_FAILED`.
- Phase 24 grammar support/copy blocker: `p26-c02-comparative-balance` does retain `COMPARATIVE_COUNT_SATURATED`, but current candidate design still fails no-guess/final uniqueness and degeneracy; comparative proof support exists, but authoring must avoid fully fixed/singleton comparison sides and decorative follow-on rules.
- Phase 24 grammar support/copy blocker: `p26-c03-conditional-frontier` shows a proof-support boundary for delayed `conditionalCount`: safe-cell deductions do not reveal object facts early enough to activate the condition. Making the condition public at opening collapses into `initialGuestLayouts = 1` and `proofWaveCount = 0`, repeating the Phase 24 fixture problem.
- Phase 24 grammar support/copy blocker: `p26-c04-difference-braid` retains `LOCAL_SCOPE_DIFFERENCE` after minimization, but `LOCAL_SCOPE_INTERSECTION` never appears and the remaining C4 guest requires solver-only reasoning. The difference/intersection braid skeleton needs a second real local overlap or a different target, not another public reveal.
- Proof-gap failure: `p26-c04-difference-braid` shows that a candidate can pass degeneracy and material-family checks while still being promotion-blocked by no-guess/final-uniqueness failure; C4 is solver-proven but not human-explained.
- Object-gated support exists but needs closing pressure: `p26-c05-object-gated` retains `LOCAL_COUNT_ALL_REMAINING` and `KNOWN_SAFE_FROM_NON_GUEST_OBJECT`, confirming the proof system can derive a hidden garbage bin from a bottle count. The follow-on no-guest cells around that derived object are not human-explained, and the candidate is also blocked by solver truncation and final non-uniqueness.
- Cap/performance warning: `p26-c05-object-gated` shows that an apparently small 4x4 object-gate draft can still hit the default `initialGuestLayouts` node cap when the remaining object space is too unconstrained. Future S5 repairs should add readable non-guest/object constraints before broadening the board.
