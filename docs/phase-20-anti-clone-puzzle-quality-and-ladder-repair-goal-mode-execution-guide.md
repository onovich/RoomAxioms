# Phase 20 Anti-Clone Puzzle Quality And Ladder Repair Goal Mode Execution Guide

Date: 2026-06-25
Status: execution guide for the executor
Phase: Phase 20 - Anti-Clone Puzzle Quality And Ladder Repair
Round budget: 16 executor rounds; rounds 1-10 build anti-clone analysis and fixtures, rounds 11-13 repair the ladder, rounds 14-15 are buffer and smoke hardening, round 16 is final validation and report.

## 0. Direct Goal Prompt For Executor

You are executing Phase 20 of Room Axioms: Anti-Clone Puzzle Quality And Ladder Repair.

Read this guide, `README.md`, `Role.md`, `docs/development-plan.md`, `docs/phase-19-high-quality-puzzle-ladder-generator-quality-gates-final-report.md`, `docs/phase-19/`, `packages/authoring/src`, `packages/generator/src`, `packages/proof/src`, `packages/solver/src`, `apps/web/src/content`, and `content/cases`.

The planner/checker previously accepted Phase 19, but the user has rejected the Phase 19 content result. Treat that feedback as binding product evidence:

- `case-006` is effectively the same as `case-004`; it only adds four irrelevant cells on the right side.
- `case-001`, `case-002`, and `case-005` are effectively cloned variants of `case-012` or the same deduction answer pattern.
- The user will not accept the Phase 19 newly promoted cases as valid player-facing content.
- The existing Phase 19 gates caught opening triviality and simple mirror/rotation duplicates, but they failed to catch effective-board equivalence, proof-trace equivalence, and meaningless map padding.

Your goal is to repair the quality process before adding more content. Build anti-clone gates that can reject puzzles that are formally solvable but feel like copied answers to a player. Then repair the player-facing ladder conservatively.

Within 16 executor rounds:

- Record a Phase 20 rejection audit that explains why Phase 19 content failed.
- Add effective-board reduction that removes cells and regions irrelevant to rules, observations, candidate layouts, and proof progress.
- Add effective-board isomorphism detection so padded or cropped clones fail even when raw board dimensions differ.
- Add proof-trace fingerprinting from public proof output: technique sequence, deduction targets, dependency shapes, and rule/fact references after coordinate normalization.
- Add candidate-shrink signatures from solver/proof checkpoints when available: opening count, per-wave count changes, final uniqueness, and whether the same move structure occurs.
- Add rule-impact vectors that summarize what each rule contributes after removal, not only whether a rule contributes at all.
- Add a novelty-claim manifest for promoted cases. Every player-facing case must declare a gameplay novelty and must pass a machine-checkable or documented reviewer gate for that novelty.
- Re-audit all currently shipped cases under these stricter gates.
- Remove or demote Phase 19 promoted cases that fail anti-clone gates. In particular, do not keep `case-001`, `case-002`, `case-005`, or `case-006` as normal player-facing cases unless the new gates and a written reviewer note prove they are meaningfully distinct.
- Preserve the known useful cases `case-004`, `case-011`, and `case-012` unless a deliberate replacement is superior and documented.
- Promote only genuinely distinct replacement cases. If the tools cannot produce enough good cases, ship a smaller honest ladder rather than padding it with clones.
- Do not change Puzzle Schema v1 semantics, solver correctness semantics, public editor scope, UGC, backend, analytics, daily challenge, broad UI/theme/VN systems, or fabricated playtest calibration.
- Validate, commit, and push each successful round before moving on.

Use `$donextgoal` to execute this guide. When complete, report back to planner thread `019ef0df-a626-7181-9ca6-1cc75c1f4c47`.

## 1. Required Context

- `README.md`
- `AGENTS.md`
- `Role.md`
- `docs/development-plan.md`
- `docs/phase-19-high-quality-puzzle-ladder-generator-quality-gates-final-report.md`
- `docs/phase-19/current-case-audit.md`
- `docs/phase-19/final-ladder-evidence.md`
- `docs/phase-19/non-isomorphism-report.md`
- `docs/phase-19/quality-gate-evidence.md`
- `packages/authoring/src/qualityGates.ts`
- `packages/authoring/src/qualityGates.test.ts`
- `packages/authoring/src/caseCommands.ts`
- `packages/authoring/src/validation.ts`
- `packages/generator/src`
- `packages/proof/src`
- `packages/solver/src`
- `apps/web/src/content`
- `content/cases`
- `content/experimental`
- `.codex/project-ops-workflow.json`
- `.codex/project-git-workflow.json`

Related but out of this phase unless directly useful:

- `docs/unregistered-scene-ui-requirements.md`
- the theme-setting document whose filename starts with `docs/` and contains `项目设定`

## 2. Scope

Required deliverables:

- A final report at `docs/phase-20-anti-clone-puzzle-quality-and-ladder-repair-final-report.md`.
- A Phase 20 evidence folder under `docs/phase-20/`.
- A rejection audit at `docs/phase-20/phase-19-content-rejection-audit.md` covering:
  - why `case-006` collapses to `case-004`;
  - why `case-001`, `case-002`, and `case-005` are clone-like variants of `case-012` or the same answer pattern;
  - which Phase 19 gates failed to catch the issue.
- Anti-clone quality gates in authoring tooling:
  - effective-board reduction;
  - effective-board isomorphism;
  - proof-trace fingerprint;
  - candidate-shrink signature;
  - rule-impact vector;
  - novelty-claim manifest and reviewer evidence.
- Tests proving the gates reject:
  - padded board clones;
  - coordinate-renamed proof clones;
  - same deduction skeleton with swapped labels;
  - redundant map areas that never influence candidate layouts or proof progress.
- A re-audited shipped ladder:
  - a smaller honest ladder is acceptable;
  - an 8-case ladder is acceptable only if every case passes anti-clone gates;
  - no Phase 19 replacement case may remain only because it passed the old gates.
- Web selector and verification tests updated to the repaired ladder.
- Generator/authoring evidence that reports accepted and rejected candidates honestly.
- Full validation, local smoke, online HTTP, Pages, and boundary evidence.

Allowed implementation changes:

- Add authoring package analysis helpers and tests.
- Add private experimental fixtures under `content/experimental/phase-20`.
- Add docs under `docs/phase-20`.
- Update shipped case JSON only when the case passes the new anti-clone policy.
- Remove or demote shipped cases that fail the new policy.
- Update web selector and content verification tests.
- Update README/development-plan status after the phase is complete.

## 3. Non-Scope

Do not implement these in Phase 20:

- New Puzzle Schema v1 rule semantics.
- Solver architecture rewrite, SAT/WASM backend, or oracle expansion.
- New proof technique implementation.
- Public editor, visual editor, UGC upload/share, backend, accounts, analytics, leaderboard, daily challenge, PWA/offline mode, or server-signed content.
- Broad UI redesign or theme/VN implementation.
- Public player exposure of generator output, target layouts, forced cells, candidate counts, proof internals, authoring diagnostics, or internal metadata.
- Fabricated playtest feedback or difficulty calibration claims.
- A padded 8-case selector. A smaller honest selector is better than clone content.
- GitHub Release creation or version tagging unless the planner/user explicitly asks for it.

## 4. Fixed Per-Round Workflow

At the start of every round:

1. Read this guide and `Role.md`.
2. Run `git status --short --branch`.
3. Choose one narrow round goal from the round plan.
4. Leave unrelated user or planner files untouched, including unrelated untracked docs.

During implementation:

1. Treat Phase 19 promoted replacements as suspect until the new anti-clone gates prove otherwise.
2. Keep `case-004`, `case-011`, and `case-012` as the useful baseline unless a documented superior replacement exists.
3. Do not present a case as player-facing unless its novelty claim is recorded and accepted.
4. Keep generated/experimental candidates out of `apps/web/src/content/cases.ts` unless deliberately promoted.
5. Do not claim calibrated difficulty without real playtest data.
6. Every promoted case must remain human-explainable, no-guess, unique at completion, player-secret-safe, and non-clone under the new gates.

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

## 5. Commit And Push Workflow

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

Additional focused validation expected during authoring and content rounds:

```powershell
pnpm --filter @room-axioms/authoring test
pnpm --filter @room-axioms/generator test
pnpm --filter @room-axioms/web test -- src/content/caseVerification.test.ts src/content/runtimeSmoke.test.ts src/runtime/analyzer.test.ts src/runtime/facade.test.ts
pnpm authoring -- report <case-path>
pnpm authoring -- score <case-path>
pnpm authoring -- minimize <case-path>
pnpm authoring -- minimize <case-path> --require-technique <TECHNIQUE_ID>
```

Run local smoke before final report:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

Do not stage unrelated files, `apps/web/dist`, `node_modules`, coverage output, local smoke logs, generated bulk datasets, cache files, or rejected generated cases outside accepted evidence folders.

## 6. Round Plan

### Round 1 - Phase 19 Rejection Audit

Goal:

- Produce `docs/phase-20/phase-19-content-rejection-audit.md`.
- Re-run authoring reports for the current selector.
- Record why the user rejected the current Phase 19 additions.
- Explicitly compare:
  - `case-006` versus `case-004`;
  - `case-001`, `case-002`, and `case-005` versus `case-012` and each other.

Validation:

- Focused authoring commands for all shipped selector cases.
- `git diff --check`.

### Round 2 - Effective Board Reduction Design And Fixtures

Goal:

- Define an effective-board reduction model.
- A cell is relevant only if it can affect at least one of:
  - rule scopes;
  - initial observations;
  - candidate layouts;
  - proof deductions;
  - final uniqueness.
- Add fixtures for padded board clones and irrelevant map extensions.

Architecture self-check:

- Reduction must consume public solver/proof/authoring results rather than reimplementing solver semantics.

### Round 3 - Effective Board Isomorphism Gate

Goal:

- Implement reduced-board signature and isomorphism checks for supported rectangular/irregular shipped boards.
- Prove that padded variants collapse to the same signature.
- Use explicit tests for `case-006` style right-side padding.

PASS note:

- Raw board dimensions must not be enough to make a case look new.

### Round 4 - Proof Trace Fingerprint Design

Goal:

- Define proof trace fingerprint fields:
  - technique sequence;
  - normalized target kinds;
  - normalized relative coordinates;
  - rule dependency shape;
  - prior-fact dependency shape.
- Add tests with hand-built proof-like fixtures when exact case proofs are too large.

Architecture self-check:

- The fingerprint summarizes public proof output. It must not read hidden target data in player runtime.

### Round 5 - Proof Trace Clone Gate

Goal:

- Implement proof-trace clone detection.
- Detect coordinate-renamed or object-label-swapped copies.
- Record similarity thresholds conservatively:
  - exact normalized trace match is hard fail;
  - high similarity is reviewer-blocking evidence, not silent pass.

### Round 6 - Candidate Shrink Signature

Goal:

- Record candidate count changes through the opening and proof waves where available.
- Add a signature such as `opening -> wave1 -> wave2 -> final`.
- Detect identical shrink curves plus identical proof technique order.

PASS note:

- A shrink curve alone is not enough to reject, but combined with trace similarity it should block promotion.

### Round 7 - Rule Impact Vector

Goal:

- Extend the Phase 19 rule contribution surface into a per-rule impact vector:
  - opening guest-layout delta;
  - final uniqueness delta;
  - proof wave/deduction delta;
  - technique delta;
  - target satisfaction or satisfiability impact when relevant.
- Add tests for redundant decorative rules and identical rule-impact clones.

### Round 8 - Novelty Claim Manifest

Goal:

- Add a private novelty-claim schema or manifest format for shipped cases.
- Each promoted case must declare:
  - intended player novelty;
  - closest existing case;
  - why it is not a clone;
  - required proof/candidate/rule signature differences.
- Add tests or docs checks that no player-facing selector case lacks a novelty claim.

Non-scope:

- Do not change public Puzzle Schema v1 unless absolutely necessary. Prefer sidecar authoring metadata under `docs/phase-20` or private content metadata if compatible.

### Round 9 - Combined Anti-Clone Gate And Report CLI

Goal:

- Combine effective-board, proof-trace, shrink-signature, rule-impact, and novelty-claim results into a single anti-clone report.
- Add CLI or authoring command output that can be recorded in docs.
- The report must identify hard failures, reviewer-blocking similarities, and accepted distinctions.

### Round 10 - Re-Audit Current Shipped Cases

Goal:

- Run combined anti-clone reports on all currently shipped selector cases.
- Decide for each case:
  - preserve;
  - demote;
  - repair;
  - replace.
- Treat `case-001`, `case-002`, `case-005`, and `case-006` as rejected unless the new evidence proves otherwise.

### Round 11 - Ladder Repair Policy

Goal:

- Decide the target selector size based on actual quality:
  - minimum honest ladder: `case-004`, `case-011`, `case-012`;
  - add replacements only when genuinely distinct;
  - do not force 8 cases.
- Update `docs/phase-20/ladder-repair-policy.md`.

PASS note:

- A 3-5 case honest selector is better than an 8-case clone selector.

### Round 12 - Replacement Candidate Search

Goal:

- Use authoring/generator/manual design to attempt genuinely distinct replacements.
- Start from proof skeletons, not map shapes:
  - local count intro;
  - intersection with different dependency shape;
  - difference with different dependency shape;
  - mixed case that does not collapse to `case-004`.
- Record rejected candidates and reasons.

### Round 13 - Promotion Or Demotion

Goal:

- Promote only candidates that pass the combined anti-clone report and standard schema/solver/proof gates.
- Demote or remove failed Phase 19 cases from `content/cases` and web selector.
- Update case verification tests and selector order.

### Round 14 - Buffer Fixes

Use this only for:

- anti-clone false positives/false negatives;
- proof fingerprint instability;
- content validation failures;
- selector/runtime regressions;
- P0/P1 player-facing secrecy or copy defects.

Do not use this round for:

- theme/VN implementation;
- new DSL/proof semantics;
- broad UI redesign;
- public editor or backend.

### Round 15 - Runtime Smoke And Boundary Hardening

Goal:

- Run focused web tests on the repaired selector.
- Confirm player-facing UI does not expose anti-clone diagnostics.
- Run local smoke and boundary scans.
- Confirm online HTTP after final push if Pages deployment occurs before the final report.

### Round 16 - Final Validation And Report

Goal:

- Run full validation.
- Run focused authoring/generator/web tests.
- Run local smoke and online HTTP checks.
- Check GitHub Pages deploy health after final push.
- Produce `docs/phase-20-anti-clone-puzzle-quality-and-ladder-repair-final-report.md`.

Required final evidence:

- Phase 19 rejection audit.
- Anti-clone gate design and implementation evidence.
- Re-audit table for every shipped selector case.
- Final selector list and why each case is genuinely distinct.
- Demoted/replaced case list.
- Replacement candidate rejection breakdown.
- Boundary and player-secrecy evidence.

## 7. PASS Criteria

Phase 20 passes only when all are true:

- Final report exists at `docs/phase-20-anti-clone-puzzle-quality-and-ladder-repair-final-report.md`.
- `docs/phase-20/` contains rejection audit, gate design/evidence, re-audit, ladder repair policy, candidate evidence, and final selector evidence.
- The final selector contains only cases that pass:
  - schema parse;
  - target rule satisfaction;
  - initial satisfiability;
  - final target layout uniqueness;
  - proof/no-guess verification;
  - Phase 19 quality gates;
  - Phase 20 anti-clone gates;
  - focused web runtime verification.
- `case-006` style padded-board clone detection exists and rejects equivalent padded cases.
- `case-001`/`case-002`/`case-005` style proof-flow clone detection exists and rejects equivalent answer-pattern cases.
- Every player-facing case has a novelty claim and reviewer evidence.
- No player-facing selector case is accepted only because it is a coordinate transform, label swap, padded map, or same proof skeleton.
- A smaller honest selector is accepted if not enough distinct replacements exist.
- Generator/authoring evidence reports attempts, accepted candidates, rejected candidates, and rejection reasons honestly.
- Full validation passes: lint, typecheck, tests, build, and `git diff --check`.
- Local smoke and online HTTP smoke pass.
- GitHub Pages final deployment succeeds.
- Domain remains schema/solver/proof/oracle/generator/authoring/Zod/UI/fs-free.
- Solver/proof/generator/authoring packages remain independent of React/Vite/browser UI code outside tests.
- Authoring/generator tooling is not imported by player-facing web code or shipped content.
- Experimental/rejected candidates remain out of the player selector.
- Target reads remain limited to existing targetAccess, verification, tests, conclusion checking, performance baseline, and explicit developer-only surfaces.
- No public editor, UGC, backend, analytics, daily challenge, broad UI redesign, breaking schema migration, new proof technique, or new shipped DSL rule enters this phase.
- Working tree has no unexpected tracked changes and the final commit is pushed.

## 8. Debug Self-Check Template

Use this every round:

```text
Debug self-check:
- Smallest anti-clone fixture tested:
- Effective-board reduction covered:
- Padded-board clone failure covered:
- Proof-trace clone failure covered:
- Candidate-shrink signature covered:
- Rule-impact vector covered:
- Novelty claim covered:
- Existing accepted cases protected:
- Rejected Phase 19 cases handled:
- Runtime/player secrecy checked:
- Rejected candidate evidence recorded:
- Regression risk:
```

## 9. Architecture Self-Check Template

Use this every round:

```text
Architecture self-check:
- Domain remains the source of truth for puzzle/rule/board types:
- Schema remains the content contract:
- Solver remains exact backend:
- Proof remains human explanation backend:
- Generator/authoring remain private maintainer tooling:
- Anti-clone gates consume public APIs rather than duplicating solver/proof semantics:
- Shipped content is intentionally promoted:
- Experimental/rejected candidates remain private:
- Target access stayed behind the narrow app boundary:
- Player marks stayed out of solver/proof facts:
- Developer-only data stayed gated:
- Theme/VN/editor/backend/new DSL/new proof technique scope avoided:
- Unrelated files left untouched:
```

## 10. Final Report Template

```markdown
# Phase 20 Anti-Clone Puzzle Quality And Ladder Repair Final Report

Status: READY_FOR_CHECK
Guide: `docs/phase-20-anti-clone-puzzle-quality-and-ladder-repair-goal-mode-execution-guide.md`
Phase: Phase 20 - Anti-Clone Puzzle Quality And Ladder Repair

## Summary
## Files Changed By Category
## Phase 19 Rejection Audit
## Anti-Clone Gates
## Re-Audit Results
## Final Selector And Novelty Claims
## Demoted Or Replaced Cases
## Candidate Search Evidence
## Validation
## Smoke And Pages Evidence
## Boundary Scans
## Commits
## PASS Criteria
## Blockers Or Follow-Up Notes
```
