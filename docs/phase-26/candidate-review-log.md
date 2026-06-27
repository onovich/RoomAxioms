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
| 2 | `p26-c02-comparative-balance` | `content/experimental/phase-26/candidates/p26-c02-comparative-balance.json` | P26-S2 | pending | pending | pending | pending | pending | pending | pending | Round 6 candidate: material `comparativeCount` pressure. |
| 3 | `p26-c03-conditional-frontier` | `content/experimental/phase-26/candidates/p26-c03-conditional-frontier.json` | P26-S3 | pending | pending | pending | pending | pending | pending | pending | Round 7 candidate: `conditionalCount` activated after an earlier deduction. |
| 4 | `p26-c04-difference-braid` | `content/experimental/phase-26/candidates/p26-c04-difference-braid.json` | P26-S4 | pending | pending | pending | pending | pending | pending | pending | Round 8 candidate: difference/intersection braid without baseline answer-pattern clone. |
| 5 | `p26-c05-object-gated` | `content/experimental/phase-26/candidates/p26-c05-object-gated.json` | P26-S5 | pending | pending | pending | pending | pending | pending | pending | Round 9 candidate: object identification unlocks later local saturation. |
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

- Singleton or direct-count giveaway: none yet.
- One-family closure: none yet.
- Clone-like proof trace or shrink signature: `p26-c01-overlap-unlock` is mechanically valid but anti-clone reports an exact proof-trace match with `case-004`, so adding a `scopeOverlapCount` shell did not create a distinct proof shape.
- Highlight-dependent or internal copy: none yet.
- Phase 24 grammar support/copy blocker: `p26-c01-overlap-unlock` has a `scopeOverlapCount` rule family, but proof techniques do not include `SCOPE_OVERLAP_*` and `minimize --require-technique SCOPE_OVERLAP_COUNT_SATURATED` reports `TECHNIQUE_RETENTION_FAILED`.
