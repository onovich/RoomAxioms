# Phase 27 Proof And Authoring Blocker Taxonomy

Status: Round 1 blocker taxonomy and fixture plan.
Guide: `docs/phase-27-proof-authoring-bridge-hardening-goal-mode-execution-guide.md`

## Purpose

Phase 26 accepted a blocker after 15 serious workbench-guided candidates produced
zero honest promotions. This document turns the rejection corpus into focused
proof and authoring fixtures for Phase 27.

The phase should not run another broad puzzle-production batch. The immediate
goal is to make repeated Phase 26 failures either:

- human-explainable through proof support with preserved dependency chains; or
- earlier detectable through authoring diagnostics before a candidate reaches
  promotion review.

## Source Evidence

Primary evidence:

- `docs/phase-26-workbench-guided-puzzle-ladder-production-final-report.md`
- `docs/phase-26/candidate-review-log.md`
- `docs/phase-26/promotion-gate-audit.md`
- `docs/phase-26/blocker-follow-up-recommendations.md`
- `docs/phase-24-rule-grammar-expressiveness-expansion-final-report.md`
- `docs/phase-25/diagnostics-contract.md`

Relevant implementation surfaces:

- proof source of truth: `packages/proof/src/reasoner.ts`
- proof graph and validation: `packages/proof/src/graph.ts`,
  `packages/proof/src/validation.ts`
- authoring diagnostics source of truth:
  `packages/authoring/src/diagnostics.ts`
- authoring quality and clone gates:
  `packages/authoring/src/qualityGates.ts`,
  `packages/authoring/src/antiCloneReport.ts`
- private workbench rendering:
  `apps/web/src/workbench`

## Taxonomy Summary

| ID | Blocker class | Phase 26 evidence | Desired Phase 27 outcome |
| --- | --- | --- | --- |
| B01 | Derived safe/object/guest facts do not feed later count summaries consistently. | C08, C13, C15; C05 object-gated caveat. | Minimal proof fixtures show which derived facts are valid premises for later local, anchor, and overlap deductions. |
| B02 | `scopeOverlapCount` either fires only from opening observations or does not fire when the overlap fact is derived. | C08 and C15. | Non-singleton overlap fixtures either emit `SCOPE_OVERLAP_COUNT_*` with derived premises, or authoring reports a specific missing-proof-support diagnostic. |
| B03 | Comparative proof can open a line but does not produce non-degenerate late closure. | C02, C07, C09, C12, C14. | Comparative fixtures distinguish design degeneracy from missing late-closure proof support. |
| B04 | Conditional activation cannot use human-derived facts, while public activation collapses to zero-wave/opening-unique puzzles. | C03 and Phase 24 conditional fixture. | Conditional fixtures document whether activation may depend on derived facts; diagnostics flag unsupported delayed activation. |
| B05 | Object-gated local saturation is possible, but follow-on closure around a derived object remains solver-only. | C05 and C11. | Object-gated fixtures preserve the proof chain from derived object to safe/object facts and detect over-closed zero-wave repairs. |
| B06 | Two-wave frontier closures leave second-wave cells solver-only. | C06, C10, C13. | A small frontier fixture isolates late safe/object/guest closure and records exact proof gaps. |
| B07 | No-guess/final-uniqueness failure lacks a precise author-facing explanation. | C04, C06, C09, C10, C13, C15. | Diagnostics separate final non-unique layouts from human-proof gaps and identify likely late-closure clusters. |
| B08 | Required technique survives in one draft but is lost under minimization or repair. | C01, C03, C08, C14, C15. | Authoring diagnostics make required-technique loss explicit without implying promotion readiness. |
| B09 | Decorative rule additions create proof-trace clones. | C01 exact `case-004` clone; C12 exact C09 trace clone. | Clone diagnostics continue to catch proof-trace copies and explain decorative rule contribution. |
| B10 | Singleton/near-count fixes look like progress but make the puzzle degenerate. | C02, C08, C11, C13, C14. | Degeneracy diagnostics remain hard gates and should be cross-referenced with proof diagnostics. |

## Fixture Plan

### F01 Derived Fact Bridge - Local Subject

Blocker: B01, B05.

Minimal shape:

- A first rule derives a hidden non-guest object, such as a bottle or bin.
- A later `forEachCount` or `anchorCount` rule uses that derived object as its
  subject.
- The expected proof graph must include a derived premise from the first rule.

Evidence target:

- proof test in `packages/proof/src/reasoner.test.ts` or a dedicated Phase 27
  fixture test;
- technique examples: `KNOWN_SAFE_FROM_NON_GUEST_OBJECT`,
  `LOCAL_COUNT_SATURATED`, `LOCAL_COUNT_ALL_REMAINING`,
  `ANCHOR_COUNT_SATURATED`;
- graph check that premises preserve the dependency chain.

### F02 Derived Guest Bridge - Scope Overlap

Blocker: B01, B02.

Minimal shape:

- A classic count rule derives a guest in one cell.
- A later `scopeOverlapCount` rule has a non-singleton overlap scope that becomes
  saturated or all-remaining only after that derived guest is known.
- Opening observations must not already make the overlap exact.

Evidence target:

- if supported, proof emits `SCOPE_OVERLAP_COUNT_SATURATED` or
  `SCOPE_OVERLAP_COUNT_ALL_REMAINING` with a derived premise;
- if not supported without a larger proof design change, authoring emits a
  specific missing bridge diagnostic instead of a vague `repair-proof`.

Primary candidate reference: C15.

### F03 Non-Singleton Scope Overlap Degeneracy Guard

Blocker: B02, B10.

Minimal shape:

- Two overlap drafts: one C08-like singleton/direct giveaway, one C15-like
  non-singleton material overlap.
- The authoring gate should distinguish "proof support missing" from
  "scope-overlap direct giveaway".

Evidence target:

- quality gate test in `packages/authoring/src/qualityGates.test.ts`;
- diagnostics group item in `packages/authoring/src/diagnostics.test.ts` if the
  proof-support warning is added.

### F04 Comparative Late Closure

Blocker: B03, B07.

Minimal shape:

- A comparative rule on two non-singleton sides produces an opener.
- A second family should close later cells without using a near-count giveaway.
- A negative fixture should show C09/C12-style "comparative opener only, then
  guess point".

Evidence target:

- proof test records whether `COMPARATIVE_COUNT_ALL_REMAINING` or
  `COMPARATIVE_COUNT_SATURATED` feeds later deductions;
- authoring diagnostics flag "comparative material but late closure remains
  solver-only" when the proof stops after the opener.

Primary candidate references: C09 and C12.

### F05 Conditional Derived Activation

Blocker: B04.

Minimal shape:

- The condition is not publicly forced at opening.
- Earlier human deductions make the condition true.
- The `then` clause can become saturated or all-remaining only after that
  activation.

Evidence target:

- explicit decision in tests: derived activation supported or unsupported;
- if unsupported, diagnostics call this out as "conditional activation requires
  opening/public facts" rather than letting authors chase zero-wave repairs.

Primary candidate reference: C03.

### F06 Two-Wave Frontier Closure

Blocker: B06, B07.

Minimal shape:

- Wave 1 derives a subject or object.
- Wave 2 derives a guest or safe cell from that new fact.
- A remaining late branch intentionally fails in the negative fixture so
  diagnostics can point to the cluster.

Evidence target:

- no-guess verifier test captures the exact proof gap cells;
- diagnostics report late-closure cluster refs, not only `NO_GUESS` fail.

Primary candidate references: C06 and C10.

### F07 Final Uniqueness Gap Versus Proof Gap

Blocker: B07.

Minimal shape:

- One fixture where proof is human-explainable but final guest layout remains
  non-unique.
- One fixture where solver can close the layout but proof cannot explain the
  cells.

Evidence target:

- authoring group details distinguish `FINAL_UNIQUENESS` from
  `HUMAN_EXPLAINABLE`;
- report recommendation remains strict, but the repair advice differs.

### F08 Required Technique Retention

Blocker: B08.

Minimal shape:

- A fixture that contains grammar material but loses the required technique
  after minimization or repair.
- A fixture where the required technique is present but the candidate still
  fails degeneracy.

Evidence target:

- authoring report or minimize output stays strict;
- diagnostics do not treat retained technique as promotion readiness.

### F09 Proof-Trace Clone With Decorative Closure

Blocker: B09.

Minimal shape:

- A C09/C12-style pair with the same proof trace but extra decorative material
  rules.

Evidence target:

- anti-clone report remains `fail` or `reviewer-blocking`;
- authoring diagnostics can surface "decorative proof-trace clone" alongside
  rule contribution warnings.

## Candidate Mapping

| Candidate | Primary blocker IDs | Re-evaluation priority | Notes |
| --- | --- | --- | --- |
| C03 `p26-c03-conditional-frontier` | B04, B08, B10 | Medium | Use after F05 clarifies whether derived conditional activation is allowed. |
| C06 `p26-c06-two-wave-frontier` | B06, B07 | High | Best clean two-wave near miss; useful for late closure diagnostics. |
| C08 `p26-c08-overlap-repair` | B02, B10 | Medium | Retains overlap technique only through direct opening giveaway; use as negative degeneracy fixture. |
| C09 `p26-c09-comparative-repair` | B03, B07 | High | Non-singleton comparative opener; best comparative late-closure near miss. |
| C10 `p26-c10-frontier-repair` | B06, B07 | High | Stronger repaired two-wave frontier; still blocked by D2/A3/B3 proof gaps. |
| C15 `p26-c15-overlap-chain-repair` | B01, B02, B07 | High | Best overlap bridge evidence: material non-degenerate overlap, but no `SCOPE_OVERLAP_*` proof technique. |

## Round Mapping

| Phase 27 rounds | Planned blocker focus |
| --- | --- |
| Rounds 1-2 | Complete taxonomy, fixture inventory, and baseline CLI snapshots. |
| Rounds 3-6 | F01/F02 derived-fact bridge proof fixtures and dependency graph assertions. |
| Rounds 7-10 | F03/F04/F05 grammar proof and missing-technique diagnostics. |
| Rounds 11-14 | F06/F07 no-guess/final-uniqueness and late-closure diagnostics. |
| Rounds 15-18 | Re-evaluate 2-4 near misses, preferably C06/C10/C15/C09. |
| Rounds 19-22 | Workbench group rendering and QA for any new diagnostics. |
| Round 23 | Buffer for regressions or cap/performance issues. |
| Round 24 | Final validation, report, smoke/Pages evidence if web changed, and planner routing. |

## Guardrails

- Do not promote a candidate merely because a new proof technique fires.
- Do not weaken no-guess, final uniqueness, degeneracy, anti-clone, or copy
  gates.
- Do not add broad rule grammar families.
- Keep player selector and default case unchanged unless a later gated repair
  naturally passes all Phase 26 promotion criteria.
- Keep diagnostics source of truth in `packages/authoring` and `packages/proof`;
  the web workbench may render diagnostics but must not duplicate proof logic.

