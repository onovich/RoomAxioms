# Phase 36 Diagnostic Methodology

Status: implementation evidence
Date: 2026-06-30

## Minesweeper Takeaway

The Minesweeper reference document is useful as a validation-methodology note, not as a mandate to build random generation.

Relevant lessons:

- validate in modules rather than relying on a single final score;
- use no-guess solving as a quality gate;
- use CSP/SAT-like correctness checks for satisfiability and uniqueness;
- treat difficulty as a collection of signals, not a trusted calibrated number;
- generate-then-validate can be useful later as private assistant tooling, but only after the validation gates are strong.

## Room Axioms Mapping

The current project already has the equivalent validation layers:

- schema validation for contract and semantic structure;
- solver-backed satisfiability, uniqueness, forced facts, and capped counts;
- HumanReasoner/no-guess verification;
- quality gates for rule contribution, degeneracy, effective board, and rule-family diversity;
- anti-clone comparison against shipped and published authoring references;
- copy checks for internal terms, hidden-highlight reliance, and direct giveaway language;
- performance/cap checks that tell the author when the draft is too expensive or truncated.

Phase 36 exposes these as selectable workbench diagnostics instead of forcing every expensive check every time.

## Why Not Broad Random Generation

Minesweeper has a compact numeric clue grammar and a fixed board rule. Room Axioms has author-defined rule text, expandable object semantics, local scopes, regions, line-of-sight, overlap/comparative/conditional rules, and human-proof requirements.

Pure random generation has repeatedly produced degenerate or non-promotable content in earlier phases. The useful product path is manual puzzle design with fast diagnostics, not bulk random puzzle production.

## Async Workbench Decision

Phase 36 uses chunked async diagnostics in the browser workbench.

- Each diagnostic run is created from selected plain-language checks.
- Progress and cancellation are visible.
- Completed partial results are kept when cancellation happens after the core report is available.
- Stale/superseded runs are guarded by request ids.
- A Web Worker remains a future migration target.

Worker migration was deferred because the existing authoring diagnostics are packaged as synchronous TypeScript APIs and the immediate user blocker was UI control, progress, and cancellation. Moving the full diagnostic stack into a worker should be done as a focused runtime packaging phase, with serializable payload tests and bundle-size checks.

## Diagnostic Order

Recommended author workflow:

1. Run `能不能成立` and `会不会太慢` first while shaping a draft.
2. Add `答案是不是唯一` and `能不能不靠猜解开` after the rough structure works.
3. Add `每条规则有没有用`, `有没有白送答案`, and `文案是否清晰` before asking for review.
4. Add `有没有太像旧案例` when comparing against shipped or local published cases.
5. Treat `大概难度` as an uncalibrated signal until real playtest evidence exists.
