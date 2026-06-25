# Phase 22 Expressive Mechanics And Content Expansion Lab Goal Mode Execution Guide

Date: 2026-06-26
Status: execution guide for the executor
Phase: Phase 22 - Expressive Mechanics And Content Expansion Lab
Round budget: 24 executor rounds; rounds 1-8 extend mechanics and validation, rounds 9-17 produce content, rounds 18-21 integrate selector/runtime and smoke, rounds 22-23 are buffer, and round 24 is final validation and report.

## 0. Direct Goal Prompt For Executor

You are executing Phase 22 of Room Axioms: Expressive Mechanics And Content Expansion Lab.

Read this guide, `README.md`, `Role.md`, `docs/development-plan.md`, `docs/phase-21-distinct-puzzle-ladder-production-final-report.md`, `docs/phase-20/`, `docs/phase-21/`, `content/novelty-claims.json`, `packages/domain/src`, `packages/schema/src`, `packages/solver/src`, `packages/proof/src`, `packages/authoring/src`, `packages/generator/src`, `apps/web/src`, and `content/cases`.

The user accepted the conceptual direction:

- Use more expressive rule grammar to increase real constraint overlap.
- Make every added cell/region contribute to candidate space or proof progress.
- Let reveal behavior create new reasoning frontiers where possible.
- Let spatial shape change rule meaning through regions, sightlines, blockers, and anchors.
- Design multi-step chain puzzles rather than one- or two-step proofs.
- Make rules share variables instead of independently locking answers.
- Add a small high-tier concept of contaminated records/rules: a few records may be false, and the player can eliminate them by cross-checking.

Your goal is to implement a conservative additive mechanics lab and use it to replace low-quality/rejected content with a 10-20 case selector. This is a "try honestly" phase: do not force 20 cases if the new mechanics are not stable. The final selector must have at least 10 player-facing cases to PASS; otherwise return `READY_FOR_CHECK_WITH_BLOCKER` with evidence.

Within 24 executor rounds:

- Add backwards-compatible rule grammar that increases constraint overlap:
  - region/zone count constraints;
  - row/column or ray/sightline constraints with blockers;
  - anchor-reveal rules where public rules refer to object anchors that become useful when revealed;
  - a small high-tier contaminated-record mode with exactly/at-most false records.
- Update domain, schema, solver, proof, authoring, anti-clone, and runtime boundaries for those mechanics.
- Keep existing cases `case-004`, `case-011`, `case-012`, `case-013`, and `case-014` valid and player-facing unless a deliberate replacement is superior.
- Produce a final player selector with 10-20 cases, including:
  - existing useful baseline cases;
  - at least two region/zone cases;
  - at least two sightline/blocker cases;
  - at least two anchor-frontier cases;
  - one or two high-tier contaminated-record cases only after the normal mechanics are stable.
- Every promoted case must pass schema, solver, proof/no-guess or appropriate contaminated-record verifier, Phase 20 anti-clone gates, novelty claims, focused web runtime checks, and player secrecy checks.
- Do not fabricate playtest calibration. Difficulty scores remain provisional until real playtest evidence exists.
- Validate, commit, and push each successful round before moving on.

Use `$donextgoal` to execute this guide. When complete, report back to planner thread `019ef0df-a626-7181-9ca6-1cc75c1f4c47`.

## 1. Required Context

- `README.md`
- `AGENTS.md`
- `Role.md`
- `docs/development-plan.md`
- `docs/phase-21-distinct-puzzle-ladder-production-final-report.md`
- `docs/phase-21/proof-skeleton-catalog.md`
- `docs/phase-21/generator-capability-evidence.md`
- `docs/phase-20/repaired-selector-anti-clone-pass.md`
- `docs/phase-20/selector-repair-decision.md`
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

Related but out of this phase unless directly useful for theme copy:

- `docs/unregistered-scene-ui-requirements.md`
- the theme-setting document whose filename starts with `docs/` and contains `项目设定`

## 2. Scope

Required deliverables:

- A final report at `docs/phase-22-expressive-mechanics-and-content-expansion-lab-final-report.md`.
- A Phase 22 evidence folder under `docs/phase-22/`.
- A mechanics design document at `docs/phase-22/mechanics-expression-design.md`.
- Backwards-compatible content contract updates for new mechanics.
- Domain/schema/solver/proof/authoring/runtime support for:
  - regions/zones;
  - row/column or blocker-aware sightlines;
  - anchor-reveal frontiers;
  - high-tier contaminated records.
- Tests for all new mechanics at the smallest useful fixtures.
- Updated authoring reports and anti-clone/novelty handling for new mechanics.
- A final player-facing selector with 10-20 cases if possible, and at least 10 for PASS.
- `content/novelty-claims.json` updated for all player-facing cases.
- Docs evidence for rejected candidates and generator limitations.
- Full validation, local smoke, online HTTP, Pages, and boundary evidence.

Allowed implementation changes:

- Add additive fields to Puzzle Schema v1-compatible content, as long as old content remains valid.
- Add new domain rule variants and board metadata when needed.
- Add solver/proof handling for new rule variants and contaminated-record validation.
- Add private experimental fixtures under `content/experimental/phase-22`.
- Add shipped case JSONs only when candidates pass all gates.
- Update web copy, rule rendering, selector order, and case verification tests.
- Update authoring/generator helpers for new mechanics.
- Update README/development-plan status after the phase is complete.

## 3. Non-Scope

Do not implement these in Phase 22:

- Public editor, UGC upload/share, backend, accounts, analytics, leaderboard, daily challenge, PWA/offline mode, or server-signed content.
- Broad visual/theme/VN implementation. Use only minimal copy needed to describe mechanics.
- Fabricated playtest feedback or public difficulty calibration claims.
- A forced 20-case selector.
- Player-facing target layouts, forced-cell/candidate diagnostics, generator diagnostics, anti-clone internals, or contaminated-rule solver internals.
- Breaking migration that invalidates existing accepted cases.
- Broad solver rewrite beyond what is required for the new additive mechanics.
- Re-promoting rejected Phase 19 clone cases without superior evidence.
- GitHub Release creation or version tagging unless the planner/user explicitly asks for it.

## 4. Fixed Per-Round Workflow

At the start of every round:

1. Read this guide and `Role.md`.
2. Run `git status --short --branch`.
3. Choose one narrow round goal from the round plan.
4. Leave unrelated user or planner files untouched, including unrelated untracked docs.

During implementation:

1. Add mechanics in small vertical slices: domain/schema first, then solver/proof, then authoring/runtime/content.
2. Preserve existing accepted cases and tests at every step.
3. New cases must start from a proof/experience skeleton, not from padded maps.
4. Contaminated records are high-tier only and must be explicitly labeled in case metadata/copy.
5. If a candidate fails anti-clone or novelty, reject it. Do not tweak labels to pass.
6. If the phase cannot reach 10 honest cases, report `READY_FOR_CHECK_WITH_BLOCKER` with exact blockers.

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

Additional focused validation expected during mechanics/content rounds:

```powershell
pnpm --filter @room-axioms/domain test
pnpm --filter @room-axioms/schema test
pnpm --filter @room-axioms/solver test
pnpm --filter @room-axioms/proof test
pnpm --filter @room-axioms/authoring test
pnpm --filter @room-axioms/generator test
pnpm --filter @room-axioms/web test -- src/content/caseVerification.test.ts src/content/runtimeSmoke.test.ts src/runtime/analyzer.test.ts src/runtime/facade.test.ts
pnpm authoring -- report <case-path>
pnpm authoring -- score <case-path>
pnpm authoring -- minimize <case-path>
pnpm authoring -- anti-clone <selector-case-paths...> --novelty-manifest content/novelty-claims.json
```

Run local smoke before final report:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

Do not stage unrelated files, `apps/web/dist`, `node_modules`, coverage output, local smoke logs, generated bulk datasets, cache files, or rejected generated cases outside accepted evidence folders.

## 6. Round Plan

### Round 1 - Mechanics Expression Design

Goal:

- Produce `docs/phase-22/mechanics-expression-design.md`.
- Define the smallest additive semantics for:
  - region/zone scopes;
  - line/ray/sightline scopes and blockers;
  - anchor-reveal frontier cases;
  - contaminated records.
- Define player-facing language in plain Chinese.
- Define which mechanics are baseline, advanced, and high-tier.

PASS note:

- Do not design 20 cases yet. First make sure the mechanics can generate new player cognition.

### Round 2 - Domain Model Additive Types

Goal:

- Add domain types for regions/zones, line/sightline scopes, blockers, anchor references, and contaminated-record metadata.
- Preserve existing rule definitions and old cases.
- Add small domain traversal tests.

Architecture self-check:

- Domain remains framework-free and schema/solver/proof-free.

### Round 3 - Schema Contract And Fixture Validation

Goal:

- Extend schema parsing/diagnostics for the additive mechanics.
- Add valid and invalid fixtures.
- Confirm existing shipped cases still parse unchanged.

### Round 4 - Solver Support For Region And Sightline Scopes

Goal:

- Add solver rule evaluation/propagation support for region and sightline scopes.
- Cover row/column/ray/blocker semantics with tests.
- Cross-check tiny fixtures with oracle or direct expected outcomes where feasible.

### Round 5 - Proof Support For Region And Sightline Deductions

Goal:

- Add human-readable deduction support for region and sightline local count/exclusion patterns.
- Add no-guess verifier coverage.
- Ensure proof text avoids leaking target layouts.

### Round 6 - Anchor-Reveal Frontier Support

Goal:

- Support public rules that depend on discovered object anchors.
- Ensure runtime observations can unlock new rule applications without making hidden target reads.
- Add tests showing reveal creates a new proof frontier.

PASS note:

- Anchor rules must not become hidden rules. Rules remain public; some coordinates become meaningful only after observed anchors exist.

### Round 7 - Contaminated Record Solver/Verifier

Goal:

- Implement high-tier contaminated-record semantics:
  - exactly one false record;
  - at most one false record.
- Add solver/proof/authoring report support that identifies which record sets remain possible.
- Add tiny fixtures where cross-checking eliminates a false record.

PASS note:

- This is high-tier only. Do not mix contaminated records into beginner cases.

### Round 8 - Authoring, Anti-Clone, Novelty, And Runtime Copy

Goal:

- Update authoring reports, scores, anti-clone signatures, novelty claims, and rule rendering for new mechanics.
- Add web copy for regions, sightlines, anchors, and contaminated records.
- Ensure player UI hides internal false-record solver diagnostics unless surfaced through clear high-tier hint text.

### Round 9 - Baseline Selector Re-Verification

Goal:

- Re-run all existing accepted cases through updated mechanics.
- Confirm `case-004`, `case-011`, `case-012`, `case-013`, and `case-014` remain valid and anti-clone clean.
- Record evidence in `docs/phase-22/baseline-regression-evidence.md`.

### Round 10 - Region Case Production

Goal:

- Produce at least two region/zone candidate cases.
- Promote only cases that pass standard gates, anti-clone, novelty, and focused web checks.
- Record rejected candidates honestly.

### Round 11 - Sightline/Blocker Case Production

Goal:

- Produce at least two sightline/blocker candidate cases.
- Space shape must materially affect rule scope.
- Reject candidates where blockers or layout do not change proof progress.

### Round 12 - Anchor-Frontier Case Production

Goal:

- Produce at least two anchor-reveal candidate cases.
- Each must demonstrate reveal-created reasoning frontier.
- Confirm player-facing hints explain this without exposing internals.

### Round 13 - Contaminated Record High-Tier Cases

Goal:

- Produce one or two high-tier contaminated-record cases.
- The false record must be eliminated by cross-checking, not by guessing.
- Add explicit player-facing label/copy that this case contains polluted records.

PASS note:

- If contaminated-record verification is not stable, do not ship contaminated cases in this phase; record the blocker.

### Round 14 - Mixed Multi-Step Chain Cases

Goal:

- Produce mixed cases that combine at least two new mechanics.
- Focus on multi-step chains and shared-variable pressure.
- Do not ship if they are tedious or proof text becomes unreadable.

### Round 15 - Selector Assembly 10-20 Cases

Goal:

- Assemble final selector with 10-20 cases if possible.
- Minimum PASS selector size is 10.
- Preserve default `case-004` unless there is a strong player-facing reason to change it.
- Ensure rejected Phase 19 clones remain absent.
- Update `apps/web/src/content/cases.ts`, tests, and `content/novelty-claims.json`.

### Round 16 - Full Selector Gate Sweep

Goal:

- Run authoring report/score/minimize and anti-clone sweep across the final selector.
- Confirm each case has accepted novelty.
- Confirm no player-facing case relies on padding, label swaps, copied proof skeletons, or unhelpful cells.

### Round 17 - Generator Capability Evidence

Goal:

- Run bounded generator/authoring attempts for the new mechanics.
- Record acceptance/rejection reasons honestly.
- Do not promote generated candidates unless they pass the same gates as manual cases.

### Round 18 - Web Runtime And Player Secrecy

Goal:

- Run focused web/runtime tests for all new mechanics.
- Ensure selector metadata and hints do not leak solver/proof/generator/false-record internals.
- Ensure rule copy is plain Chinese and not over-abstract.

### Round 19 - Responsive, Keyboard, And Smoke Prep

Goal:

- Run or add focused tests for case switching, mobile tabs, keyboard flow, and rule rendering with new mechanics.
- Fix P0/P1 UI regressions only.

### Round 20 - Online/Pages Deployment Evidence

Goal:

- Run local smoke.
- Confirm GitHub Pages deployment succeeds after final content push.
- Confirm both online URLs return HTTP 200.

### Round 21 - Buffer Fixes I

Use this only for:

- mechanics false positives/false negatives;
- proof/no-guess gaps;
- contaminated-record verifier instability;
- selector/runtime regressions;
- P0/P1 player-facing copy or secrecy defects.

### Round 22 - Buffer Fixes II

Use this only if Round 21 was insufficient. Do not use it for broad UI/theme/VN/public editor scope.

### Round 23 - Final Candidate Triage

Goal:

- If selector has fewer than 10 valid cases, decide `READY_FOR_CHECK_WITH_BLOCKER` and document why.
- If selector has 10-20 valid cases, freeze final selector and prepare final report evidence.

### Round 24 - Final Validation And Report

Goal:

- Run full validation.
- Run focused domain/schema/solver/proof/authoring/generator/web tests.
- Run local smoke and online HTTP checks.
- Check GitHub Pages deploy health after final push.
- Produce `docs/phase-22-expressive-mechanics-and-content-expansion-lab-final-report.md`.

Required final evidence:

- Mechanics expression design.
- Additive schema/domain/solver/proof evidence.
- Content production table.
- Final selector list.
- Anti-clone and novelty evidence.
- Contaminated-record evidence, if shipped.
- Generator capability evidence.
- Boundary and player-secrecy evidence.

## 7. PASS Criteria

Phase 22 passes only when all are true:

- Final report exists at `docs/phase-22-expressive-mechanics-and-content-expansion-lab-final-report.md`.
- `docs/phase-22/` contains mechanics design, baseline regression evidence, content production evidence, generator capability evidence, final selector evidence, and smoke/boundary evidence.
- Existing accepted cases remain valid unless deliberately replaced with documented superior cases.
- Final player selector has 10-20 cases.
- Final player selector includes:
  - at least two region/zone cases;
  - at least two sightline/blocker cases;
  - at least two anchor-frontier cases;
  - contaminated-record cases only if verifier/proof/player copy are stable.
- Every player-facing case passes:
  - schema parse;
  - target rule satisfaction or contaminated-record equivalent;
  - initial satisfiability;
  - final target layout uniqueness;
  - proof/no-guess or contaminated-record verifier;
  - Phase 20 anti-clone gates;
  - accepted novelty claim;
  - focused web runtime verification.
- New mechanics increase actual constraint overlap; added cells/regions must be effective, not padding.
- Player-facing rule copy is plain Chinese and avoids unnecessary abstraction.
- Generator/authoring evidence reports attempts, accepted candidates, rejected candidates, and rejection reasons honestly.
- Full validation passes: lint, typecheck, tests, build, and `git diff --check`.
- Local smoke and online HTTP smoke pass.
- GitHub Pages final deployment succeeds.
- Domain remains schema/solver/proof/oracle/generator/authoring/Zod/UI/fs-free.
- Solver/proof/generator/authoring packages remain independent of React/Vite/browser UI code outside tests.
- Authoring/generator tooling is not imported by player-facing web code or shipped content.
- Experimental/rejected candidates remain out of the player selector.
- Target reads remain limited to existing targetAccess, verification, tests, conclusion checking, performance baseline, and explicit developer-only surfaces.
- No public editor, UGC, backend, analytics, daily challenge, broad UI redesign, breaking migration, or fabricated playtest calibration enters this phase.
- Working tree has no unexpected tracked changes and the final commit is pushed.

If the phase cannot reach at least 10 valid player-facing cases, it must return `READY_FOR_CHECK_WITH_BLOCKER`, not PASS, with the exact technical or design blocker.

## 8. Debug Self-Check Template

Use this every round:

```text
Debug self-check:
- Smallest mechanic fixture tested:
- Existing accepted cases preserved:
- Effective unknown cells covered:
- Constraint overlap increased:
- Reveal frontier covered:
- Multi-step proof path covered:
- Contaminated-record path covered, if touched:
- Anti-clone and novelty covered:
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
- New mechanics are additive and backward compatible:
- Candidate design starts from player cognition/proof frontiers, not map padding:
- Anti-clone gates consume public APIs rather than duplicating solver/proof semantics:
- Shipped content is intentionally promoted:
- Experimental/rejected candidates remain private:
- Target access stayed behind the narrow app boundary:
- Player marks stayed out of solver/proof facts:
- Developer-only data stayed gated:
- Theme/VN/editor/backend scope avoided:
- Unrelated files left untouched:
```

## 10. Final Report Template

```markdown
# Phase 22 Expressive Mechanics And Content Expansion Lab Final Report

Status: READY_FOR_CHECK
Guide: `docs/phase-22-expressive-mechanics-and-content-expansion-lab-goal-mode-execution-guide.md`
Phase: Phase 22 - Expressive Mechanics And Content Expansion Lab

## Summary
## Files Changed By Category
## Mechanics Added
## Existing Case Regression
## Promoted Cases
## Rejected Or Blocked Candidates
## Final Selector And Novelty Claims
## Contaminated Record Evidence
## Anti-Clone Evidence
## Generator Capability Evidence
## Validation
## Smoke And Pages Evidence
## Boundary Scans
## Commits
## PASS Criteria
## Blockers Or Follow-Up Notes
```
