# Phase 29 Proof Skeleton Review Rubric

Status: Round 2 review contract.

Guide: `docs/phase-29-proof-skeleton-authoring-workflow-goal-mode-execution-guide.md`

## Purpose

This rubric decides whether a proof skeleton is ready for review, blocked before
JSON, or eligible for the single Phase 29 translation feasibility trial. It is
stricter than a writing checklist: a skeleton must map to current rule grammar,
human proof techniques, ambiguity expectations, and anti-degeneracy claims.

The rubric deliberately keeps Phase 23 and Phase 28 lessons intact. A skeleton
cannot pass because it sounds clever. It must describe how the player reaches
the answer without opening uniqueness, direct safe dumps, clone traces, or
solver-only closure.

## Review Outcomes

Use exactly one outcome per skeleton:

| Outcome | Meaning |
| --- | --- |
| `reviewed: translate-at-most-one` | Eligible for the single Phase 29 translation trial, not automatic JSON production. |
| `reviewed: blocked-by-current-grammar` | Human proof shape is desirable, but current rule/proof grammar cannot express it cleanly. |
| `reviewed: blocked-by-degeneracy-risk` | The skeleton likely collapses to singleton, near-count, direct-safe, opening-unique, or minimization failure. |
| `reviewed: blocked-by-copy-risk` | The skeleton depends on vague regions, hidden highlight membership, or internal terms. |
| `reviewed: baseline-only` | Valid lower-difficulty idea, but not target-4 and not useful for the current blocker. |
| `rejected: clone-or-padding` | Reuses an accepted proof trace, mirror/rotation/label swap, or irrelevant board area. |
| `rejected: opening-unique-risk` | The proposed opening or rule set is likely solved before human deductions begin. |
| `rejected: direct-safe-dump` | A fixed group of safe cells is being handed to the player as if it were hard reasoning. |

## Hard Stop Gates

Stop review and mark the corresponding rejection/blocker if any are true:

- The skeleton has no explicit wave plan.
- The first guest or final guest layout is intended to be forced by opening
  observations alone.
- A singleton or near-count effective scope is the main reason the first answer
  works.
- A fixed region says a whole proof-gap group has no guests without a later
  dependency.
- The late closure is described as "solver will know" rather than a named human
  deduction.
- A region/scope can only be understood from highlight behavior, not text.
- The skeleton depends on a new broad rule grammar family outside Phase 29
  scope.
- The idea is a mirror, rotation, object-label swap, or padded version of an
  existing shipped or rejected candidate.
- The claimed difficulty is playtest-calibrated without real participant data.

## Required Review Checks

### 1. Intent Check

PASS when:

- the first non-obvious move is named;
- at least one later move depends on an earlier deduction;
- the intended player experience is distinct from the current selector and from
  Phase 28 rejected candidates;
- the skeleton names likely copy risks.

FAIL when:

- the description is only a theme or story beat;
- the same proof trace could be produced by C15, C10, or a shipped case with
  renamed cells;
- the hard move is "notice the highlighted group" rather than reasoning.

### 2. Opening Ambiguity Check

PASS when:

- expected initial guest layouts are greater than 1;
- target-4 skeletons justify at least moderate ambiguity, normally 6 or more
  plausible guest layouts before deductions;
- the skeleton names facts that must not be opening-forced;
- reveal minimization is expected to keep a meaningful opening set.

FAIL when:

- opening uniqueness is intentional;
- ambiguity is unknown and not listed as a risk;
- the skeleton depends on public reveals that directly identify all final
  guests.

### 3. Wave Depth Check

For target-4 review, default expectations are:

- at least 4 proof waves;
- at least 8 non-trivial deductions;
- at least one frontier unlock after Wave 1;
- final uniqueness reached only after the intended late closure.

PASS when:

- the skeleton can name each wave's inputs, rules, deductions, unlocks, and
  failure checks;
- missing one numeric target has a written density exception;
- late closure is a concrete human-deduction step.

FAIL when:

- two or more target-4 numeric expectations are missing without exception;
- proof is expected to end in 0 or 1 waves;
- final uniqueness happens before the claimed hard turn.

### 4. Fact Dependency Check

PASS when:

- every key guest/safe/object fact has a dependency chain;
- derived facts are not treated as public observations;
- the dependency chain identifies rule families and uncertain cells;
- at least one fact must survive minimization.

FAIL when:

- a late fact has no human-readable predecessor;
- the proof relies on player marks or target access;
- the skeleton hides a direct safe dump behind a named region.

### 5. Rule Grammar Mapping Check

PASS when the skeleton maps to existing supported grammar:

- `globalCount`
- `regionCount`
- `lineCount`
- `forEachCount`
- `anchorCount`
- `scopeOverlapCount`
- `comparativeCount`
- `conditionalCount`
- existing internal `recordSet` / contaminated-record verifier evidence where
  explicitly marked internal

FAIL or BLOCK when:

- a desired rule cannot be represented without changing Puzzle Schema v1;
- a proof step requires a proof technique that does not exist and cannot be
  expressed through current local, overlap, comparative, conditional, anchor, or
  line deductions;
- the skeleton asks for a public contaminated-record mechanic but cannot make it
  readable to players.

Use `reviewed: blocked-by-current-grammar` rather than forcing JSON when the
idea is good but unexpressible.

### 6. Shared-Variable Check

PASS when:

- at least one uncertain cell group is constrained by two or more material
  rules;
- the group remains uncertain after opening observations;
- the two pressures are meaningfully different, such as region plus local,
  overlap plus object-local, comparative plus line, or conditional plus local;
- the shared group is not a singleton or near-count giveaway.

FAIL when:

- rules talk about separate islands;
- one rule alone identifies the whole answer;
- the shared group appears only after the player already knows the answer.

### 7. Anti-Degeneracy Check

PASS when the skeleton has explicit defenses against:

- singleton effective scopes;
- near-count giveaways;
- direct safe-cell groups;
- opening-unique layouts;
- redundant passenger rules;
- effective-board padding;
- mirror/rotation/label-swap clones;
- copy that depends on hidden highlights;
- internal terms in visible rule text.

FAIL when any hard rejection item is part of the intended design.

WARNING when a lower-difficulty or tutorial skeleton intentionally uses a
simple direct move. It may be `baseline-only`, but it cannot count as target-4.

### 8. Minimize Expectation Check

PASS when:

- required techniques are named;
- reveal cells expected to survive minimization are named;
- the skeleton says how to interpret minimization collapse;
- target-4 review rejects collapse to 1-2 reveals or 0-wave proof.

FAIL when:

- minimization is not considered;
- technique retention is treated as sufficient even when degeneracy remains;
- opening-reveal collapse would be patched by adding decorative rules.

### 9. Copy Clarity Check

PASS when:

- every fixed scope can be described with coordinates or plain visible language;
- no region title reveals the conclusion;
- no player-facing text uses internal terms such as "anchor", "frontier",
  "safe area", or "confirmed point";
- highlight behavior only visualizes already-readable text.

FAIL when:

- the rule text requires the workbench/player to infer hidden membership from a
  highlight;
- a rule gives a public no-guest group but labels it as if it were discovered;
- object labels conflict with existing Chinese terminology.

### 10. Translation Readiness Check

PASS when:

- all hard stop gates pass;
- the skeleton has a concrete grammar mapping;
- the skeleton has a plausible target diagnostic prediction;
- the author can say exactly what would falsify the design in `report`,
  `score`, `minimize`, and anti-clone output.

FAIL when:

- the translation would be exploratory board mutation rather than testing a
  specific proof skeleton;
- more than one JSON trial would be needed to understand the skeleton.

## Target-4 Pre-JSON Requirement

Before a skeleton can claim `target-4`, it must provide:

| Requirement | Default threshold | Pre-JSON evidence |
| --- | --- | --- |
| Opening ambiguity | More than 1 layout; prefer 6+ | Named ambiguity target and non-forced facts |
| Effective unknowns | Normally 10+ | Board/space hypothesis |
| Proof waves | Normally 4+ | Wave plan |
| Deductions | Normally 8+ | Fact dependency table |
| Material rule families | Normally 3+ | Rule family plan |
| Shared-variable pressure | At least 1 meaningful group | Shared-variable claim |
| Frontier unlock | At least 1 after Wave 1 | Wave plan unlocks |
| Degeneracy defense | No hard risks | Anti-degeneracy claim |
| Minimize resilience | Required facts/techniques survive | Minimize expectation |
| Copy clarity | Every scope readable | Copy clarity check |

Missing one threshold can be accepted only with a written density exception.
Missing two or more means the skeleton is not target-4. Mark it `baseline-only`,
`blocked`, or `rejected` instead.

## Phase 28 Failure Mode Cross-Check

Every skeleton must explicitly answer:

| Phase 28 failure | Required skeleton answer |
| --- | --- |
| C15 R2 singleton/near-count opener | What establishes the opener without singleton pressure? |
| C15 safe-region dump | How are safe cells derived through dependencies instead of public fixed zero-guest scope? |
| C15 board expansion padding | Why does every new area affect uncertainty or proof movement? |
| C10 singleton conditional trigger | Why is the late trigger multi-cell and not direct? |
| C10 broadened trigger opening uniqueness | Why is the trigger not already forced before Wave 1? |
| C10 minimization collapse | Which reveals/facts must remain necessary after minimization? |

If these answers are absent, the skeleton is not ready for JSON.

## Scoring Sheet

Use this compact scoring sheet in each skeleton brief:

| Check | Status | Notes |
| --- | --- | --- |
| Intent | pass / warn / fail |  |
| Opening ambiguity | pass / warn / fail |  |
| Wave depth | pass / warn / fail |  |
| Fact dependencies | pass / warn / fail |  |
| Rule grammar mapping | pass / warn / fail / blocked |  |
| Shared-variable claim | pass / warn / fail |  |
| Anti-degeneracy | pass / warn / fail |  |
| Minimize expectation | pass / warn / fail |  |
| Copy clarity | pass / warn / fail |  |
| Translation readiness | pass / blocked / fail |  |

Overall outcome:

```text
reviewed: <outcome>
```

## Reviewer Decision Rule

- Any hard stop gate fails: reject or block before JSON.
- Two or more target-4 pre-JSON requirements missing: not target-4.
- Any copy-scope ambiguity: block until rewritten.
- Any opening-unique or direct-safe-dump risk: reject for Phase 29 translation.
- If current grammar cannot express the skeleton cleanly, record the smallest
  needed grammar/proof extension instead of mutating JSON around it.
