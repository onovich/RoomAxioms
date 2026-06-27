# Phase 29 Target-4 Pre-JSON Checklist

Status: Round 3 authoring checklist.

Guide: `docs/phase-29-proof-skeleton-authoring-workflow-goal-mode-execution-guide.md`

## Purpose

This checklist is the compact gate for deciding whether a proof skeleton can
claim target-4 intent before any puzzle JSON exists. It converts
`proof-skeleton-format.md` and `proof-skeleton-review-rubric.md` into a form
that each Phase 29 skeleton brief can fill in.

Target-4 is not granted by a score, a theme, or a complicated-looking rule. The
skeleton must show a credible human proof shape, opening ambiguity, shared
variables, minimization resilience, and anti-degeneracy defenses before
translation.

## Mandatory Summary

Each target-4 skeleton must answer these in one paragraph:

```text
This should be target-4 because <first non-obvious move>, then <later move
unlocked by that move>, and final uniqueness waits until <late closure>. It is
not C15/C10 again because <specific structural difference>.
```

If this paragraph cannot be written concretely, mark the skeleton
`reviewed: baseline-only` or `reviewed: blocked-by-current-grammar`.

## Numeric Expectations

| Item | Default target-4 expectation | Skeleton answer |
| --- | --- | --- |
| Effective unknown cells | 10+ after opening |  |
| Initial guest layouts | More than 1, prefer 6+ |  |
| Proof waves | 4+ |  |
| Non-trivial deductions | 8+ |  |
| Material rule families | 3+ |  |
| Shared-variable groups | 1+ meaningful group |  |
| Frontier unlocks after Wave 1 | 1+ |  |
| Decorative/redundant rules | 0 |  |
| Hard degeneracy risks | 0 |  |

Decision rule:

- Missing none or one item: may remain target-4 if the written exception is
  strong.
- Missing two or more items: not target-4.
- Missing opening ambiguity or having hard degeneracy: reject for translation.

## Required Written Claims

### Opening Claim

Fill in:

```text
Opening reveals:
Expected initial guest layouts:
Facts intentionally not opening-forced:
Why the first guest is not singleton/near-count forced:
```

Reject if the first answer depends on a one-cell effective scope, a near-count
scope, or public reveals that directly locate all guests.

### Wave Chain Claim

Fill in:

```text
Wave 1:
Wave 2:
Wave 3:
Wave 4 or final closure:
```

Each wave must name:

- inputs;
- rule families;
- expected deductions;
- what it unlocks.

Reject if final uniqueness is expected before Wave 2 or if the proof needs a
solver-only gap to close.

### Shared-Variable Claim

Fill in:

```text
Shared cells/scope:
Rule pressure A:
Rule pressure B:
Why the group remains uncertain after opening:
Why this is not a direct giveaway:
```

Reject if rules operate on disconnected islands or if the shared group is only
one effective unknown cell.

### Anti-Degeneracy Claim

Mark each item:

| Risk | Clear? | Notes |
| --- | --- | --- |
| Singleton effective scope | yes / no |  |
| Near-count giveaway | yes / no |  |
| Direct fixed safe-cell group | yes / no |  |
| Opening-unique layout | yes / no |  |
| Redundant/passenger rule | yes / no |  |
| Effective-board padding | yes / no |  |
| Mirror/rotation/label clone | yes / no |  |
| Highlight-only scope meaning | yes / no |  |
| Internal player-facing terms | yes / no |  |

Any `no` blocks target-4 translation unless the skeleton is deliberately
downgraded to tutorial/baseline.

### Minimize Claim

Fill in:

```text
Required techniques:
Required facts:
Opening reveals expected to survive:
Collapse threshold:
```

Default collapse threshold:

```text
If minimization preserves no-guess/final uniqueness with 1-2 reveals or 0 proof
waves, reject as setup-driven.
```

### Grammar Mapping Claim

Fill in:

```text
Rule families used:
Required proof techniques:
Known unsupported step, if any:
Smallest grammar/proof extension needed, if any:
```

If a desired step cannot map to current grammar, do not write JSON. Record
`reviewed: blocked-by-current-grammar`.

### Expected Diagnostics Claim

Fill in before translation:

```text
Expected report:
Expected score band, uncalibrated:
Expected minimize result:
Expected degeneracy result:
Expected anti-clone result:
Expected copy risks:
Expected failure if the design is wrong:
```

This prediction is used to catch accidental skeleton drift during translation.

## Phase 28 Regression Guard

A target-4 skeleton must explicitly avoid these known traps:

| Known trap | Required answer |
| --- | --- |
| C15 opener creates a singleton/near-count first guest | Opener uses broader shared pressure and remains proof-explainable |
| C15 safe-region replacement becomes solver-only | Late safe facts have named human deductions |
| C15 larger board creates irrelevant cells | Every area has a wave or uncertainty role |
| C10 singleton conditional trigger | Trigger scope is multi-cell and not one effective unknown |
| C10 broadened trigger makes opening unique | Trigger is not already forced at opening |
| Conditional safe dump erases proof depth | Consequence unlocks later reasoning rather than closing the puzzle alone |
| Minimize collapse | Required techniques/facts survive minimization with meaningful reveals |

If any row cannot be answered, do not translate the skeleton in Phase 29.

## Translation Permission

A skeleton may enter the single Phase 29 translation feasibility slot only when:

- all hard rejection gates are clear;
- numeric expectations are met or have at most one written exception;
- the shared-variable claim is concrete;
- the grammar mapping uses current supported rule families;
- the expected diagnostics are written;
- the reviewer outcome is `reviewed: translate-at-most-one`.

Translation remains experimental and private. It must stay out of
`content/cases` and the player selector unless all existing strict gates pass.

## Copy/Paste Checklist For Skeleton Briefs

```markdown
## Target-4 Pre-JSON Checklist

Mandatory summary:

| Item | Target | Answer | Status |
| --- | --- | --- | --- |
| Effective unknown cells | 10+ |  |  |
| Initial guest layouts | >1, prefer 6+ |  |  |
| Proof waves | 4+ |  |  |
| Deductions | 8+ |  |  |
| Material rule families | 3+ |  |  |
| Shared-variable groups | 1+ |  |  |
| Frontier unlocks | 1+ after Wave 1 |  |  |
| Redundant rules | 0 |  |  |
| Hard degeneracy risks | 0 |  |  |

Opening claim:

Wave chain claim:

Shared-variable claim:

Anti-degeneracy claim:

Minimize claim:

Grammar mapping claim:

Expected diagnostics claim:

Phase 28 regression guard:

Translation permission: yes / no
```
