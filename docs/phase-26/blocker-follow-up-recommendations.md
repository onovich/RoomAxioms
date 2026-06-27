# Phase 26 Blocker Follow-up Recommendations

Status: Round 25 evidence.
Guide: `docs/phase-26-workbench-guided-puzzle-ladder-production-goal-mode-execution-guide.md`

## Purpose

Phase 26 has attempted 15 serious candidates and promoted none. This document
turns the rejection corpus into concrete follow-up recommendations for the
final report and for planner-side next-goal decisions.

The recommendation is not to keep authoring similar variants in this phase. The
known failure modes are now repeated enough that more padding would mostly
produce more rejected content.

## Current Blocker Statement

The blocker is content-production quality under strict gates, not basic runtime
correctness.

What works:

- schema, solver, proof, authoring diagnostics, web runtime, selector tests, and
  local smoke all validate the current shipped ladder;
- Phase 24 grammar can parse and can sometimes emit proof techniques;
- Phase 25 workbench diagnostics expose candidate quality failures early;
- Phase 26 experimental/rejected content is isolated from player-facing content.

What blocks promotion:

- new candidates either fail no-guess/final uniqueness or collapse into
  opening-unique/zero-wave fixtures;
- direct safe-cell or singleton effective-scope pressure repeatedly appears when
  repairs try to force closure;
- Phase 24 grammar often fires only as an opening observation giveaway or as a
  one-wave opener without a readable late disambiguator;
- proof-trace and rule-impact novelty remain hard to preserve when using the
  same small-board answer patterns;
- derived facts do not always feed later grammar summaries in the way the
  intended proof skeletons require.

## Follow-up Priorities

### 1. Proof-Semantics Bridge Before More Scope-Overlap Content

Evidence:

- C08 retained `SCOPE_OVERLAP_COUNT_ALL_REMAINING`, but only through a direct
  opening-observation/singleton-style path.
- C15 kept a non-degenerate material overlap scope, but the proof never emitted
  a `SCOPE_OVERLAP_*` technique after deriving the intended guest.

Recommendation:

- Investigate whether derived safe/guest facts should become usable evidence
  for later `scopeOverlapCount` summaries.
- Add tiny proof fixtures before authoring more overlap puzzles.
- Keep this proof-side and fixture-focused; do not expand public schema
  semantics unless planner explicitly scopes it.

### 2. Comparative Late-Closure Fixture Before More Comparative Variants

Evidence:

- C02, C07, C09, and C12 show comparative techniques can fire.
- C09 removes the singleton comparative flaw, but the proof stops before late
  safe cells are human-explained.
- C12 reuses C09's proof trace once object-local rules are added.
- C14 makes object bridge rules material only by collapsing the opening into a
  singleton/opening-unique solution.

Recommendation:

- Build a minimal comparative fixture where the comparison creates two or more
  genuinely ambiguous branches and a later non-singleton rule resolves one
  branch without becoming a near-count giveaway.
- Add an anti-clone fixture for "comparative opener plus decorative closure" so
  C09/C12-style traces fail earlier.

### 3. Conditional Activation Design Before More Conditional Puzzles

Evidence:

- C03's delayed conditional form does not activate from safe-cell deductions.
- Public-condition repair collapses into opening uniqueness and zero proof
  waves.

Recommendation:

- Decide whether conditional rules should be activated only by opening facts or
  also by derived proof facts.
- If derived activation is desired, add a tiny proof fixture first.
- If derived activation is out of scope, downgrade conditionalCount as a
  content-production tool until a different rule family can make the condition
  meaningful without public over-closure.

### 4. Replacement-Case Strategy Should Start From Weak Shipped Cases, Not Generic Generators

Evidence:

- C11 tried to replace a known weak baseline shape and fixed some hard singleton
  issues, but it over-closed into `initialGuestLayouts = 1`.
- Existing selector caveats remain for `case-015`, `case-017`, `case-018`, and
  `case-020`.

Recommendation:

- For future content work, pick one weak shipped case at a time and preserve
  opening ambiguity first.
- Require replacement drafts to pass the selector anti-clone gate against the
  specific case they intend to replace before broader ladder review.
- Do not promote a replacement just because it removes one degeneracy warning if
  it becomes opening-unique, one-rule, or proof-trace equivalent.

### 5. Keep Difficulty Calibration Human-Reviewed

Evidence:

- `case-021` remains mechanically strong by some metrics but was user-downgraded
  to difficulty 3.
- Phase 26 score bands often overstate candidates that are actually proof gaps,
  direct giveaways, or zero-wave fixtures.

Recommendation:

- Treat authoring score as triage only.
- Keep player-facing difficulty conservative until real player review exists.
- In final report, avoid claiming Phase 26 improved the public difficulty ladder
  by quantity or score.

## Final Report Inputs

Use these final-report decisions unless later buffer rounds find a concrete
strict-gate repair:

- Status should be `READY_FOR_CHECK_WITH_BLOCKER`.
- Promoted cases: none.
- Serious attempts: 15.
- Player selector: unchanged 10-case ladder, `case-004` default.
- Phase 24 grammar evidence: useful but not yet content-production-ready under
  strict gates.
- Boundary result: Phase 26 candidates and historical rejected cases remain out
  of player-facing content.
- Recommended next phase: proof/authoring fixture hardening around derived-fact
  reuse and late-closure patterns, then a smaller targeted replacement pass.

## Non-Recommendations

Do not respond to this blocker by:

- lowering the promotion gate;
- promoting candidates with known no-guess/final-uniqueness failures;
- adding safe-cell giveaway rules and calling them difficulty;
- relying on highlight-only scope semantics;
- using score bands as public difficulty without human review;
- expanding public editor, UGC, backend, analytics, daily challenge, theme/VN,
  or broad UI scope.
