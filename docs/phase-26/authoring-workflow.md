# Phase 26 Authoring Workflow

Status: Round 4 workflow.
Guide: `docs/phase-26-workbench-guided-puzzle-ladder-production-goal-mode-execution-guide.md`

## Purpose

This workflow turns the Phase 26 skeletons into a repeatable candidate loop. It
keeps the workbench and authoring CLI as the evidence path, while leaving the
final fun, novelty, and copy judgment to human review.

## Important Template Boundary

Files under `content/experimental/phase-26/templates/` are proof-skeleton
templates. They are not guaranteed `pnpm authoring -- sample` inputs.

The current `sample` command requires concrete generator fields:

- `guestCount`;
- concrete `rules`;
- `board`, `allowedKinds`, `initialRevealRange`, `caps`, and
  `artifactPolicy`.

The Phase 26 skeleton templates intentionally describe target proof pressure,
preferred proof signals, and rejection traps. A candidate becomes serious only
after it is converted into a Puzzle Schema JSON draft under
`content/experimental/phase-26/candidates/` or a deliberately repaired shipped
case path, then evaluated with `report` and `score`.

## Candidate Loop

For each candidate:

1. Choose a skeleton from `docs/phase-26/candidate-review-log.md`.
2. Draft or repair a puzzle through the private workbench model or a narrow JSON
   edit based on the skeleton.
3. Save the candidate under `content/experimental/phase-26/candidates/`.
4. Run:

   ```powershell
   pnpm authoring -- report <candidate-path>
   pnpm authoring -- score <candidate-path>
   ```

5. If the candidate uses a required proof technique, also run:

   ```powershell
   pnpm authoring -- minimize <candidate-path> --require-technique <TECHNIQUE_ID>
   ```

6. If the candidate is being considered for promotion, run anti-clone against
   the current selector:

   ```powershell
   pnpm authoring -- anti-clone content\cases\case-004.json content\cases\case-011.json content\cases\case-013.json content\cases\case-015.json content\cases\case-012.json content\cases\case-014.json content\cases\case-017.json content\cases\case-018.json content\cases\case-020.json content\cases\case-021.json <candidate-path> --novelty-manifest content\novelty-claims.json --include-degeneracy
   ```

7. Record the result in `docs/phase-26/candidate-review-log.md`.
8. Reject immediately when the workbench or CLI shows a hard gate failure:
   opening unique layout, no proof wave, final non-unique layout, proof gap,
   truncation without justification, hard degeneracy, clone signature,
   highlight-dependent copy, or subjectively redundant proof flow.

## First Batch Plan

Rounds 5-10 should attempt these six candidates before any promotion:

| Slot | Candidate id | Path | Skeleton | Intended pressure | Primary risk to test |
| ---: | --- | --- | --- | --- | --- |
| 1 | `p26-c01-overlap-unlock` | `content/experimental/phase-26/candidates/p26-c01-overlap-unlock.json` | P26-S1 | `scopeOverlapCount` plus classic count. | Non-singleton overlap and readable scope text. |
| 2 | `p26-c02-comparative-balance` | `content/experimental/phase-26/candidates/p26-c02-comparative-balance.json` | P26-S2 | `comparativeCount` plus later local pressure. | Comparison must materially contribute. |
| 3 | `p26-c03-conditional-frontier` | `content/experimental/phase-26/candidates/p26-c03-conditional-frontier.json` | P26-S3 | `conditionalCount` activated by an earlier deduction. | Condition must not be solved at opening. |
| 4 | `p26-c04-difference-braid` | `content/experimental/phase-26/candidates/p26-c04-difference-braid.json` | P26-S4 | Difference/intersection chain. | Avoid `case-011` and `case-012` answer-pattern clones. |
| 5 | `p26-c05-object-gated` | `content/experimental/phase-26/candidates/p26-c05-object-gated.json` | P26-S5 | Object identification unlocks local saturation. | Avoid internal anchor wording and one-object closure. |
| 6 | `p26-c06-two-wave-frontier` | `content/experimental/phase-26/candidates/p26-c06-two-wave-frontier.json` | P26-S6 | Two proof waves with changed material scope. | Avoid padded board and singleton sightline/region traps. |

At least one of the first three should materially use Phase 24 grammar. If none
survives, Round 11+ should try P26-S7 as an explicit grammar-and-classic hybrid
and record whether the blocker is proof support, copy clarity, degeneracy, or
subjective redundancy.

## Ledger Update Format

When a candidate is evaluated, update its row in
`docs/phase-26/candidate-review-log.md` with compact evidence:

- `Report`: `PASS` or exact failure, including initial layouts, proof waves,
  deductions, final guests, and truncation status.
- `Score`: score and band, always marked uncalibrated.
- `Workbench / diagnostics`: status such as `valid-review-needed`, copy
  warnings, cap warnings, or not-run reason.
- `Anti-clone / degeneracy`: `PASS`, `FAIL`, `reviewer-blocking`, or not-run
  reason.
- `Novelty`: accepted, rejected, needs-review, or not-yet-written.
- `Copy`: clear, needs rewrite, highlight-dependent, internal-term warning, or
  direct-giveaway warning.
- `Decision`: reject, defer, repair, promote, or quarantine.

Do not count a pending row as a serious attempt.

## Promotion Preparation

Only after a candidate passes the strict gate should a later promotion round:

- copy it into `content/cases`;
- add a human-readable novelty claim to `content/novelty-claims.json`;
- wire it into `apps/web/src/content/cases.ts`;
- update web selector tests if ordering or tiers change;
- run focused content/runtime tests;
- run full validation and local smoke if the selector changed.

Until then, candidate files remain private evidence.
