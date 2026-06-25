# Phase 23 Difficulty Rubric V2

Date: 2026-06-26
Status: Round 6 promotion rubric
Guide: `docs/phase-23-difficulty-4-plus-puzzle-expansion-goal-mode-execution-guide.md`

## Purpose

Phase 23 treats the user's Phase 22 ratings as binding product evidence. A puzzle can pass schema, solver, and proof validation while still being too trivial, cloned, padded, or unclear for the new 4+ ladder. This rubric defines the gates for Phase 23 candidates before any case can be promoted into `content/cases`.

Automated scores remain internal authoring diagnostics. They are not real playtest calibration.

## Library Buckets

Tutorial or baseline:

- May include lower-rated or simpler shipped cases.
- Must remain valid and readable if player-facing.
- Does not count toward the 20 target 4/5 or 10 super-hard Phase 23 quotas.

Target 4/5:

- Intended to feel meaningfully harder than the Phase 22 baseline.
- Must require overlapping constraints rather than one direct side, edge, region, or sightline count.
- Needs explicit reviewer evidence for its intended player experience.

Super-hard 6-7:

- Intended for high-tier authoring experiments.
- Must show chained frontiers or contaminated-record-equivalent pressure without exposing internals to the player.
- May be promoted fewer than 10 times if readability or proof quality blocks honest promotion.

## Hard Rejection Gates

A normal Phase 23 promotion fails if any item below is true:

- Schema, target-rule, initial satisfiability, no-guess proof, or final guest-layout uniqueness fails.
- `case-019`-style copy/proof ambiguity is present: the player cannot read why the intended guest/safe conclusion follows.
- Player-facing case names, rule text, region labels, or selector labels contain unclear English/internal terms.
- Opening state has a unique guest layout.
- A singleton region, singleton sightline, direct count giveaway, or near-count giveaway is the main reason the puzzle works.
- Material rules are carried by only one rule family.
- A rule is decorative/redundant without an explicit tutorial/baseline reason.
- Effective-board reduction shows added cells that do not affect uncertainty, proof movement, or final layout.
- Proof trace, candidate-shrink signature, rule-impact vector, or effective-board shape matches an accepted case without a documented superior novelty claim.
- A candidate differs only by mirror, rotation, object labels, padding, or irrelevant safe area.
- Difficulty is claimed as playtest-calibrated without real participant feedback.

## Target 4/5 Rubric

A target 4/5 candidate should normally satisfy:

- At least 10 effective unknown cells after opening reveals.
- At least 4 proof waves.
- At least 8 non-trivial deductions before final uniqueness.
- At least 3 material rule families or materially different scopes.
- At least 3 contributing rules with no decorative passenger rules.
- At least one reveal or derived anchor creates a later reasoning frontier.
- At least one hidden variable group is pressured by two or more rules.
- No single first observation or single rule family identifies all guests.
- Degeneracy report is `pass`; a `warning` needs explicit reviewer justification and must not be the core move.
- Authoring score/report is present and marked uncalibrated.

Exception policy:

- A smaller board may pass only if the proof is dense, non-cloned, and reviewer evidence explains why the interaction is still genuinely non-trivial.
- Missing one numeric target is allowed only with a written reason in the candidate evidence. Missing two or more numeric targets blocks promotion.

## Super-Hard 6-7 Rubric

A super-hard candidate should normally satisfy:

- At least 14 effective unknown cells after opening reveals.
- At least 6 proof waves.
- At least 12 non-trivial deductions.
- At least 4 material rule families or materially different scopes.
- At least two chained frontiers where one deduction unlocks a later deduction family.
- Either contaminated-record reasoning, high-overlap region/sightline/anchor reasoning, or another verifier-backed high-tier interaction.
- Degeneracy report is `pass`.
- Anti-clone report is `pass` after degeneracy and novelty checks.
- Reviewer note names the intended "hard turn" without revealing the answer path to players.

Exception policy:

- If contaminated-record candidates remain unreadable, promote fewer super-hard cases and record the blocker instead of lowering standards.
- Numeric strength cannot compensate for clone, padding, giveaway, or unclear copy failures.

## Required Candidate Evidence

Every Phase 23 candidate attempt should have evidence under `docs/phase-23/` or in an experimental candidate log:

- Candidate id and path.
- Intended bucket: tutorial/baseline, target 4/5, or super-hard 6-7.
- One-paragraph intended player experience.
- Authoring `report` result.
- Authoring `score` result with `calibratedWithRealPlaytest: false`.
- Degeneracy report summary.
- Rule-family diversity summary.
- Anti-clone result against the current selector and novelty manifest.
- Novelty claim status.
- Copy review status.
- Promotion, rejection, or deferred decision with exact reason.

Promotion requires deliberate copy into `content/cases`, selector wiring, novelty manifest update, focused web runtime tests, and full validation before commit.

## Reviewer Questions

Before promotion, answer these in the candidate evidence:

- What is the first non-obvious move?
- Which later move becomes possible only because of an earlier deduction?
- Which rule family or scope would make the puzzle collapse if removed?
- Why is this not a mirror, label swap, padded board, or proof-trace clone?
- Which player-facing phrase could confuse a tester, and how was it removed?

## Commands

Use these as the minimum evidence commands for promoted cases:

```powershell
pnpm authoring -- report <case-path>
pnpm authoring -- score <case-path>
pnpm authoring -- minimize <case-path>
pnpm authoring -- anti-clone <selector-case-paths...> --novelty-manifest content/novelty-claims.json --include-degeneracy
```

Run focused web content/runtime tests after selector or shipped content changes, then full validation before every successful round commit.
