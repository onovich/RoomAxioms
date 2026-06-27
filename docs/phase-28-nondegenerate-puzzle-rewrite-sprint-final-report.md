# Phase 28 Nondegenerate Puzzle Rewrite Sprint Final Report

Status: READY_FOR_CHECK_WITH_BLOCKER

Guide: `docs/phase-28-nondegenerate-puzzle-rewrite-sprint-goal-mode-execution-guide.md`

Final commit: f55ef7e9473a7e2de621cc2ee21f63904617d425

## Summary

Phase 28 ran a narrow rewrite sprint rather than a broad production batch. It
produced three serious C15 overlap rewrites and two serious C10 late-closure
rewrites. No case was promoted because every candidate failed strict quality
gates. This is an accepted blocker-style result: the failures are design-level
content problems, not proof/authoring/runtime validation failures.

No shipped `content/cases` files changed, no player selector/default changed,
and no experimental candidate leaked into the player-facing app.

## Rewrite Briefs

Evidence:

- `docs/phase-28/rewrite-briefs.md`
- `docs/phase-28/candidate-ledger.md`
- `docs/phase-28/c15-survivor-review.md`
- `docs/phase-28/late-closure-survivor-review.md`

The C15 brief targeted a non-degenerate overlap/local chain. The backup lane
selected C10 because it had a real two-wave bottle frontier but stalled on
late safe-cell explanation gaps.

## C15 Rewrite Attempts

Three C15 attempts were recorded under `content/experimental/phase-28/`:

- `p28-c15-a-remove-direct-safe-region`
  - Best evidence: preserved `SCOPE_OVERLAP_COUNT_SATURATED` and
    `LOCAL_COUNT_SATURATED`; 3 proof waves.
  - Blocker: no-guess false, final uniqueness false, R2 still
    `singleton-effective-scope:direct-count-giveaway`.
- `p28-c15-b-broaden-entry-opener`
  - Best evidence: widened R2 enough to avoid the hard singleton failure.
  - Blocker: proof collapsed to 0 deductions, required techniques disappeared,
    and R4 became redundant.
- `p28-c15-c-larger-effective-board`
  - Best evidence: retained overlap on a larger board with additional pressure
    rules.
  - Blocker: only 1 wave / 3 deductions, lost local follow-up, R2 still hard
    degeneracy, and 6 irrelevant cells.

Decision: no C15 survivor. The remaining issue is the opener skeleton itself:
it must establish an overlap variable without a singleton or near-count
giveaway.

## Late-Closure Rewrite Attempt

Two C10-focused late-closure attempts were recorded:

- `p28-c10-a-late-closure-frontier`
  - Machine correctness passed, but proof collapsed to 1 wave / 3 deductions.
  - R7/R5 were redundant, minimization reduced six reveals to only `C3`, R7
    hard-failed as a singleton conditional giveaway, and R8 was near-giveaway.
- `p28-c10-b-broadened-condition-frontier`
  - R7 no longer hard-failed singleton degeneracy.
  - The opening became uniquely solved before any human deduction: 1 initial
    guest layout, 0 proof waves, 0 deductions, R4/R5 redundant.

Decision: no C10 survivor. The diagnostics correctly distinguished the two
failure modes: A was a degeneracy/rule-contribution failure; B was an
opening-uniqueness and zero-proof failure.

## Promotion Or Rejection Decisions

Promotions: none.

Rejections:

- C15 A/B/C rejected for strict degeneracy, proof, final-uniqueness, or
  technique-retention failures.
- C10 A/B rejected for strict degeneracy, opening ambiguity, proof-depth, and
  rule-contribution failures.

The selector remains honest. A smaller or unchanged selector is preferred over
padding with weak or clone-like content.

## Validation Evidence

Per-round validation used the project wrappers and passed before every commit:

- `Validate.cmd`: PASS repeatedly across Phase 28 checkpoints.
- `git diff --check`: PASS before each commit.
- `CommitAndPush.cmd`: PASS and pushed each successful checkpoint.

Focused authoring evidence:

- `pnpm authoring -- report` run for every serious candidate.
- `pnpm authoring -- score` run for every serious candidate.
- `pnpm authoring -- minimize` run for every serious candidate with required
  technique retention checks.
- `pnpm authoring -- anti-clone ... --include-degeneracy` run for C15 and C10
  survivor groups.

Final local validation before this report:

- `Validate.cmd`: PASS.
- `git diff --check`: PASS.

The final report commit is made through `CommitAndPush.cmd`, which reruns
`pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before pushing.

## Smoke / Pages Evidence

Local smoke:

- `StartDevServer.cmd`: PASS, served `http://127.0.0.1:5173/RoomAxioms/`.
- `Smoke.cmd`: PASS, local HTTP checks passed.
- `StopDevServer.cmd`: PASS.

Pages deployment evidence is not required for Phase 28 because no shipped
content, web runtime, selector, or player-facing app files changed.

## Boundary Scans

Boundary scans:

- `rg -n "p28-|phase-28|late-closure-frontier|broadened-condition" content\cases apps\web\src\content apps\web\src\logic apps\web\src\workbench`: no matches.
- `rg -n "p28-c10|p28-c15|p26-c15-overlap-chain-repair|p26-c10-frontier-repair" content\cases apps\web\src\content`: no matches.
- `git status --short --branch`: tracked worktree clean; unrelated untracked
  docs remain untouched.

## Blockers Or Caveats

Status is READY_FOR_CHECK_WITH_BLOCKER because strict gates blocked all
candidate promotions.

Design blockers:

- C15 needs a new opener skeleton, not board expansion or a local patch.
- C10 needs a late trigger that is both non-singleton and not opening-forced.
- Conditional safe closures are especially risky: they can satisfy machine
  uniqueness while erasing the intended human proof.

Recommended next method:

- Start from a fresh human-authored proof skeleton with intended wave-by-wave
  facts before writing JSON.
- Require opening ambiguity before any target-4 label is considered.
- Prototype the late trigger as a material multi-rule dependency, then run
  minimization immediately before adding copy polish.

## PASS Criteria Matrix

| Criterion | Status | Evidence |
| --- | --- | --- |
| Final report exists | PASS | This file |
| Rewrite briefs exist | PASS | `docs/phase-28/rewrite-briefs.md` |
| At least three serious C15 rewrites | PASS | C15 A/B/C in `content/experimental/phase-28/` |
| At least one late-closure rewrite | PASS | C10 A/B in `content/experimental/phase-28/` |
| Promoted cases pass all gates | N/A | No promotions |
| Zero promotions have rejection evidence | PASS | Candidate ledger and survivor reviews |
| Current shipped cases remain valid | PASS | Full validation and no shipped content changes |
| No experimental IDs leak into selector | PASS | Boundary scans |
| Full validation passes | PASS | `Validate.cmd` and final `CommitAndPush.cmd` validation |
| Local smoke passes | PASS | `StartDevServer.cmd`, `Smoke.cmd`, `StopDevServer.cmd` |
| Pages evidence recorded if needed | N/A | No shipped web/content changes |
