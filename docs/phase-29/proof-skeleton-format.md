# Phase 29 Proof Skeleton Format

Status: Round 1 format contract.

Guide: `docs/phase-29-proof-skeleton-authoring-workflow-goal-mode-execution-guide.md`

## Purpose

A proof skeleton is a maintainer-facing design artifact written before puzzle
JSON. It describes the intended human proof, ambiguity budget, shared variables,
and anti-degeneracy claims in a form that can be reviewed before any board,
target, or rule file is committed.

This format exists because Phase 28 showed that local JSON mutation is exhausted
for the current C15/C10 near misses. A valid skeleton must explain what should
be hard, which facts unlock later facts, and why the design should not collapse
under authoring diagnostics.

## File Location And Naming

Skeleton briefs live under:

```text
docs/phase-29/skeletons/
```

Use this filename shape:

```text
<skeleton-id>.md
```

Recommended id shape:

```text
skel-<focus>-<short-name>
```

Examples:

- `skel-overlap-wide-opener.md`
- `skel-late-closure-delayed-trigger.md`
- `skel-conditional-comparative-ambiguity.md`

## Header

Every skeleton starts with:

```markdown
# <Skeleton Title>

Status: draft | reviewed | rejected | translation-trial
Inspired by: <source evidence or "fresh">
Intended bucket: tutorial/baseline | target-4 | super-hard | research-only
JSON translation: none | planned | attempted | rejected | promoted
```

Rules:

- `target-4` is a claim to be challenged, not a label granted by narrative
  interest.
- `translation-trial` means at most one experimental JSON attempt, not a
  production sprint.
- `promoted` is allowed only after all existing schema, solver, proof,
  degeneracy, anti-clone, copy, web runtime, and validation gates pass.

## Required Sections

### Player-Facing Intent

Describe what the player should feel and why this is distinct from existing
cases.

Required statements:

- the first non-obvious move;
- the later move that only becomes possible after an earlier deduction;
- why the puzzle is not a mirror, label swap, padded board, or proof-trace
  clone;
- any copy risk that must be avoided.

### Board / Space Hypothesis

Describe the intended board shape before JSON.

Required fields:

- rough dimensions, such as `4x4`, `5x4`, or `5x5`;
- estimated effective unknown cell count after opening observations;
- known areas that must stay relevant;
- areas that are forbidden as padding;
- expected object kinds beyond `empty` and `guest`, if any.

For a target-4 skeleton, the default expectation is at least 10 effective
unknown cells after opening observations. A smaller space needs a written
density exception.

### Opening Ambiguity Target

State the expected initial ambiguity before any human deductions.

Required fields:

- minimum guest-layout count;
- maximum reveal count or reveal style;
- facts that must not be opening-forced;
- what minimization should not be able to remove.

Default gate:

```text
Initial guest layouts must be greater than 1.
```

For target-4, prefer a higher ambiguity target unless a dense proof exception is
justified.

### Wave Plan

Describe the intended proof as waves. A wave is a set of facts that become
available after applying public observations plus earlier wave conclusions.

Use this template:

```markdown
#### Wave N - <name>

Inputs:
- observations or earlier facts used

Rules:
- public rule families involved

Expected deductions:
- <cell/fact> because <human-readable reason>

Unlocks:
- later rule or uncertain group made available

Failure checks:
- what would make this wave degenerate or solver-only
```

For target-4, the default expectation is at least 4 proof waves and at least 8
non-trivial deductions. Missing one numeric target needs a written exception.
Missing two or more blocks target-4 review.

### Fact Dependency Table

List the intended facts in dependency order.

Use this table:

| Fact | Kind | Wave | Depends on | Rule families | Must survive minimization? |
| --- | --- | ---: | --- | --- | --- |
| `A1 is guest` | guest | 1 | R2-style opener | region + overlap | yes |

Allowed fact kinds:

- `guest`
- `safe`
- `object:<kind>`
- `count relation`
- `condition true`
- `scope narrowed`

The table should reveal whether a claimed late move truly depends on an earlier
deduction or is already forced at opening.

### Rule Family Plan

Name concrete rule families and their purpose.

Current supported families include:

- `globalCount`
- `regionCount`
- `lineCount`
- `forEachCount`
- `anchorCount`
- `scopeOverlapCount`
- `comparativeCount`
- `conditionalCount`
- `recordSet` / internal contaminated-record evidence where applicable

For each family, state:

- which uncertain cells it pressures;
- whether it produces an opener, bridge, or closure;
- which other rule family shares its variables;
- how it avoids direct singleton or near-count giveaway behavior.

### Shared-Variable Claim

State the uncertain cell group that at least two material rules both constrain.

Use this format:

```text
Shared variable group: <cells or scope description>
Rule A pressure: <rule family and count relation>
Rule B pressure: <rule family and count relation>
Why it is not a direct giveaway: <reason>
```

A target-4 skeleton should include at least one meaningful shared-variable group
that survives opening observations.

### Anti-Degeneracy Claim

A skeleton must make an explicit anti-degeneracy claim before JSON.

Check all relevant risks:

- no singleton effective scope drives the first answer;
- no near-count giveaway carries the main move;
- no direct fixed safe-cell group pretends to be difficulty;
- no opening-unique guest layout;
- no decorative or redundant passenger rule;
- no effective-board padding;
- no mirror/rotation/label-swap clone;
- no highlight-only scope membership;
- no internal terms in player-facing copy.

If any risk is intentionally accepted for a tutorial/baseline case, label it as
such and do not claim target-4.

### Minimize Expectation

State what must survive reveal minimization.

Required fields:

- required proof techniques;
- facts that must still appear after minimization;
- reveal cells that are expected to be essential;
- failure interpretation if minimization collapses the design.

Examples:

```text
Required techniques: SCOPE_OVERLAP_COUNT_SATURATED, LOCAL_COUNT_SATURATED
Minimizer must not reduce opening reveals below 4 while preserving final uniqueness.
If it does, reject as setup-driven rather than repair the copy.
```

### Expected Diagnostics

Before JSON, predict how authoring diagnostics should behave.

Include:

- expected `report` outcome;
- expected `score` band, marked uncalibrated;
- expected `minimize --require-technique` result;
- expected degeneracy status;
- expected anti-clone risk;
- likely `EXPLANATION_GAP`, `GUESS_POINT`, or final-uniqueness risk.

This prediction is not proof of quality. It is a review target that helps detect
whether the JSON translation changed the design.

### Translation Criteria

State when the skeleton is allowed to become experimental JSON.

Minimum criteria:

- reviewer can name the intended wave chain without target data;
- opening ambiguity target is plausible;
- shared-variable claim is concrete;
- anti-degeneracy claim has no known hard fail;
- rule families map to existing grammar or the skeleton explicitly requests a
  future grammar/proof extension;
- copy can describe every fixed scope in plain player-facing language.

If these criteria fail, do not translate. Record the blocker in the skeleton.

## Skeleton Review Outcomes

Use one of:

- `reviewed: translate-at-most-one`
- `reviewed: blocked-by-current-grammar`
- `reviewed: blocked-by-degeneracy-risk`
- `reviewed: blocked-by-copy-risk`
- `reviewed: baseline-only`
- `rejected: clone-or-padding`
- `rejected: opening-unique-risk`
- `rejected: direct-safe-dump`

The review outcome must be updated before any experimental JSON trial.

## JSON Translation Boundary

Phase 29 allows at most one limited translation feasibility trial.

Translation rules:

- experimental JSON must stay under `content/experimental/phase-29/`;
- it must not be copied into `content/cases` unless all strict gates pass;
- it must run `report`, `score`, `minimize`, and anti-clone/degeneracy evidence
  if it becomes a serious trial;
- if it collapses into opening uniqueness, singleton giveaway, or solver-only
  closure, stop and record rejection instead of patching through multiple JSON
  variants.

## Template

```markdown
# <Skeleton Title>

Status:
Inspired by:
Intended bucket:
JSON translation:

## Player-Facing Intent

## Board / Space Hypothesis

## Opening Ambiguity Target

## Wave Plan

#### Wave 1 - <name>

Inputs:

Rules:

Expected deductions:

Unlocks:

Failure checks:

## Fact Dependency Table

| Fact | Kind | Wave | Depends on | Rule families | Must survive minimization? |
| --- | --- | ---: | --- | --- | --- |

## Rule Family Plan

## Shared-Variable Claim

## Anti-Degeneracy Claim

## Minimize Expectation

## Expected Diagnostics

## Translation Criteria

## Review Outcome
```
