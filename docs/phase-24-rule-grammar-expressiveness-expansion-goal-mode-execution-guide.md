# Phase 24 Rule Grammar Expressiveness Expansion Goal Mode Execution Guide

Date: 2026-06-26
Status: execution guide for the executor
Phase: Phase 24 - Rule Grammar Expressiveness Expansion
Round budget: 24 executor rounds; rounds 1-4 design and contract, rounds 5-14 implement additive grammar slices, rounds 15-19 prove expressiveness with fixtures and experimental cases, rounds 20-22 integrate authoring/runtime/copy, round 23 is buffer, and round 24 is final validation and report.

## 0. Direct Goal Prompt For Executor

You are executing Phase 24 of Room Axioms: Rule Grammar Expressiveness Expansion.

Read this guide, `README.md`, `Role.md`, `docs/development-plan.md`, `docs/phase-23-difficulty-4-plus-puzzle-expansion-final-report.md`, `docs/phase-23/`, `content/novelty-claims.json`, `packages/domain/src`, `packages/schema/src`, `packages/solver/src`, `packages/proof/src`, `packages/authoring/src`, `packages/generator/src`, `apps/web/src`, and `content/cases`.

Phase 23 proved an important blocker: stronger anti-degeneracy gates work, but the current content method and grammar only produced one machine-valid high-tier candidate (`case-021`), later downgraded by user review to difficulty 3, and no super-hard cases. The next user-approved direction is to expand rule grammar before returning to bulk content production.

Your goal is to add a small, conservative set of grammar features that create deeper overlapping proof frontiers:

- comparative count rules between two scopes;
- conditional rules where one public condition activates a second public constraint;
- shared-variable / overlap rules that explicitly reason about union, intersection, and difference between two scopes;
- a readable high-tier contaminated-record variant suitable for future player-facing use.

This is not a 20-case production phase. It is a mechanics and verification phase. You must prove the new grammar can create deeper, non-degenerate reasoning using fixtures, reports, and at least three experimental cases. Promote player-facing cases only if they pass all Phase 23 gates and feel genuinely ready; do not force promotion.

Use `$donextgoal` to execute this guide. When complete, report back to planner thread `019ef0df-a626-7181-9ca6-1cc75c1f4c47`.

## 1. Required Context

- `README.md`
- `AGENTS.md`
- `Role.md`
- `docs/development-plan.md`
- `docs/phase-23-difficulty-4-plus-puzzle-expansion-final-report.md`
- `docs/phase-23/difficulty-rubric-v2.md`
- `docs/phase-23/degeneracy-gate-design.md`
- `docs/phase-23/user-rating-intake.md`
- `docs/phase-22/mechanics-expression-design.md`
- `content/novelty-claims.json`
- `apps/web/src/content`
- `apps/web/src/runtime`
- `apps/web/src/view`
- `content/cases`
- `content/experimental`
- `packages/domain/src`
- `packages/schema/src`
- `packages/solver/src`
- `packages/proof/src`
- `packages/authoring/src`
- `packages/generator/src`
- `.codex/project-ops-workflow.json`
- `.codex/project-git-workflow.json`

Related but out of implementation scope unless needed for wording:

- `docs/unregistered-scene-ui-requirements.md`
- the theme-setting document whose filename starts with `docs/` and contains `项目设定`

## 2. Scope

Required deliverables:

- A final report at `docs/phase-24-rule-grammar-expressiveness-expansion-final-report.md`.
- A Phase 24 evidence folder under `docs/phase-24/`.
- A grammar design document at `docs/phase-24/rule-grammar-expansion-design.md`.
- Additive Puzzle Schema v1-compatible rule variants for a conservative subset of:
  - `comparativeCount`: compare target counts between two named scopes with `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, or difference-by-N semantics;
  - `conditionalCount`: if a public count/observation condition is satisfied, apply another public count constraint;
  - `scopeOverlapCount`: constrain the count in the intersection, union, left-only, or right-only area of two scopes;
  - `recordContamination`: a player-readable record-set mode with exactly/at-most false records, kept high-tier and verifier-backed.
- Domain/schema/solver/proof/authoring/runtime support for every implemented rule variant.
- Small fixtures for valid, invalid, satisfiable, unsatisfiable, no-guess, explanation-gap, degenerate, and cap/truncation cases.
- Authoring reports that expose how the new grammar affects:
  - proof waves;
  - deduction count;
  - frontier unlock count;
  - shared-variable overlap;
  - rule family diversity;
  - degeneracy warnings.
- At least three experimental Phase 24 cases under `content/experimental/phase-24/` that prove the new grammar creates non-degenerate reasoning.
- At least one "hardness probe" attempting to exceed `case-021` proof depth without relying on reveal reduction.
- Web runtime and rule copy support so implemented rule variants render in clear Chinese if a case is later promoted.
- Full validation, focused package tests, local smoke when runtime/copy changes, online HTTP evidence, and boundary scans.

Allowed low-priority planner choices:

- If implementing all four grammar families is too large, prioritize `comparativeCount`, `scopeOverlapCount`, and `conditionalCount` first. Keep contaminated-record player-facing grammar as design + internal verifier evidence if needed.
- Experimental cases may stay private unless they clearly pass Phase 23 target-4 or super-hard gates.

## 3. Non-Scope

Do not implement these in Phase 24:

- Bulk production of 20+ target cases or 10 super-hard cases.
- Public editor, UGC upload/share, backend, accounts, analytics, leaderboard, daily challenge, PWA/offline mode, server-signed content, or GitHub Release/tagging.
- Broad visual/theme/VN implementation, dialogue system, or character portraits.
- Fabricated playtest feedback or public difficulty calibration.
- Weakening solver/proof correctness to make new grammar appear useful.
- Promoting cases that fail Phase 23 degeneracy, anti-clone, novelty, no-guess, or copy gates.
- Breaking migration that invalidates existing accepted cases.
- Player-facing target layouts, forced-cell/candidate diagnostics, generator diagnostics, authoring diagnostics, or anti-clone internals.
- Starting the Phase 25 editor/diagnostics workbench early.

## 4. Grammar Design Principles

Every new rule variant must satisfy these principles:

- It must make rules share hidden variables or scopes, not merely add a new label for an old count.
- It must work with existing solver/proof architecture without importing UI or authoring internals into core packages.
- It must be expressible in plain Chinese.
- It must have at least one small fixture where the new rule changes proof depth or frontier shape.
- It must have degenerate-case tests proving the authoring gates can reject singleton giveaways or redundant variants.
- It must remain additive: old cases parse and validate without migration.

Recommended player-language examples:

- Comparative: "东侧区域的访客数，比西侧区域多 1 个。"
- Scope overlap: "同时属于走廊和红区的格子里，必有 1 名访客。"
- Conditional: "如果档案柜周围一圈已经出现访客，那么北侧区域没有访客。"
- Contaminated record: "这组记录里恰有 1 条被污染。其余记录仍然可靠。"

## 5. Fixed Per-Round Workflow

At the start of every round:

1. Read this guide and `Role.md`.
2. Run `git status --short --branch`.
3. Choose one narrow round goal from the round plan.
4. Leave unrelated user or planner files untouched, including unrelated untracked docs.

During implementation:

1. Implement grammar in vertical slices: domain/schema first, then solver/proof, then authoring/runtime/copy.
2. Keep old cases valid at every step.
3. New mechanics must include negative fixtures, not only happy paths.
4. Experimental cases must begin from a proof-frontier idea, not from map padding.
5. If a candidate needs broader solver rewrite, record the blocker instead of forcing it.

Every round reply must include:

- round goal
- completed work
- Debug self-check
- architecture self-check
- validation commands and results
- commit hash and push result
- next round goal
- whether a buffer round was consumed

Progression rules:

- If validation fails, do not commit, do not push, and do not move to the next round.
- If validation passes but commit fails, do not move to the next round.
- If commit succeeds but push fails, do not move to the next round.
- Only after push succeeds may the executor continue.

## 6. Commit And Push Workflow

Prefer the project GitFlow wrapper:

```powershell
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\Status.cmd
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\CommitAndPush.cmd -Message "<message>" -Paths <phase-relevant paths>
```

Minimum validation before every successful round commit:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
```

Additional focused validation expected during grammar/content rounds:

```powershell
pnpm --filter @room-axioms/domain test
pnpm --filter @room-axioms/schema test
pnpm --filter @room-axioms/solver test
pnpm --filter @room-axioms/proof test
pnpm --filter @room-axioms/authoring test
pnpm --filter @room-axioms/web test -- src/content/caseVerification.test.ts src/content/runtimeSmoke.test.ts src/runtime/analyzer.test.ts src/runtime/facade.test.ts
pnpm authoring -- report <experimental-or-promoted-case-path>
pnpm authoring -- anti-clone <selector-case-paths...> --novelty-manifest content/novelty-claims.json --include-degeneracy
```

Run local smoke before final report if runtime or visible copy changed:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

Do not stage unrelated files, `apps/web/dist`, `node_modules`, coverage output, local smoke logs, generated bulk datasets, cache files, or rejected generated cases outside accepted evidence folders.

## 7. Round Plan

### Rounds 1-2 - Grammar Expansion Design

Goals:

- Create `docs/phase-24/rule-grammar-expansion-design.md`.
- Map Phase 23 blockers to grammar needs.
- Decide exact data shapes for comparative, conditional, overlap, and contaminated-record variants.
- Define readable Chinese copy for each rule family.

### Rounds 3-5 - Domain And Schema Contract

Goals:

- Add additive domain types and schema validation for the selected grammar variants.
- Add valid/invalid fixture coverage.
- Preserve all accepted and quarantined existing cases.

### Rounds 6-10 - Solver Semantics

Goals:

- Implement exact solver support for selected grammar variants.
- Add satisfiable, unsatisfiable, cap/truncation, and regression tests.
- Avoid broad solver rewrites; keep semantics deterministic.

### Rounds 11-14 - Proof And Human Reasoning

Goals:

- Add proof techniques or verifier steps needed for no-guess reasoning over the new rules.
- Add renderer/copy output for proof lines.
- Include explanation-gap tests for unsupported high-tier cases.

### Rounds 15-17 - Authoring And Degeneracy Integration

Goals:

- Extend authoring reports, difficulty review, anti-clone, rule-family, and degeneracy gates for the new grammar.
- Ensure singleton or redundant comparative/conditional/overlap rules are rejected or warned.

### Rounds 18-19 - Experimental Case Proofs

Goals:

- Add at least three private Phase 24 experimental cases.
- Each must demonstrate a different grammar interaction and include authoring report evidence.
- Attempt at least one hardness probe that aims beyond `case-021` proof depth.

### Rounds 20-22 - Runtime Copy, Selector Policy, And Smoke

Goals:

- Add web runtime/rule rendering support for implemented rule variants.
- Do not promote cases unless they pass Phase 23 gates.
- If no case is promoted, keep selector stable and record why.
- Run focused web tests and local smoke if runtime/copy changed.

### Round 23 - Buffer

Use only for repairs discovered by validation, proof gaps, schema diagnostics, smoke, or boundary scans.

### Round 24 - Final Validation And Report

Goals:

- Run full validation and focused grammar evidence.
- Create `docs/phase-24-rule-grammar-expressiveness-expansion-final-report.md`.
- Include implemented grammar variants, skipped variants and why, experimental case evidence, hardness probe result, validation, smoke/pages evidence, boundary scans, and recommended Phase 25/editor implications.
- Commit and push the final report.
- Return `READY_FOR_CHECK` only when PASS criteria are met; otherwise return `READY_FOR_CHECK_WITH_BLOCKER`.

## 8. PASS Criteria

Phase 24 PASS requires:

- Final report exists at `docs/phase-24-rule-grammar-expressiveness-expansion-final-report.md`.
- Grammar design doc exists at `docs/phase-24/rule-grammar-expansion-design.md`.
- At least three additive grammar capabilities are implemented end-to-end across domain/schema/solver/proof/authoring; if fewer are implemented, final status must be `READY_FOR_CHECK_WITH_BLOCKER`.
- Existing accepted and quarantined cases remain parseable and valid unless explicitly documented.
- At least three experimental Phase 24 cases demonstrate non-degenerate use of the new grammar.
- At least one hardness probe attempts to exceed `case-021` proof depth and records honest results.
- New rule rendering/copy is plain Chinese and does not reintroduce unclear English terms.
- Authoring degeneracy and difficulty reports understand the new rule families.
- No player-facing case is promoted unless it passes Phase 23 gates.
- Player UI does not expose target/candidate/forced/generator/authoring internals.
- No public editor, UGC, backend, analytics, daily challenge, broad theme/VN implementation, fabricated playtest calibration, or breaking schema migration is introduced.
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `git diff --check`, relevant focused tests, smoke if needed, and boundary scans pass before final push.

## 9. Final Report Template

```markdown
# Phase 24 Rule Grammar Expressiveness Expansion Final Report

Status: READY_FOR_CHECK or READY_FOR_CHECK_WITH_BLOCKER
Guide: docs/phase-24-rule-grammar-expressiveness-expansion-goal-mode-execution-guide.md
Final commit:

## Summary

## Implemented Grammar Variants

## Skipped Or Deferred Variants

## Experimental Case Evidence

## Hardness Probe Result

## Authoring And Degeneracy Evidence

## Runtime Copy And Selector Policy

## Validation Evidence

## Smoke / Pages Evidence

## Boundary Scans

## Blockers Or Caveats

## PASS Criteria Status
```
