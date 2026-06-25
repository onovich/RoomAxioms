# High-Quality Puzzle Production Plan

Date: 2026-06-25
Status: planner design draft
Purpose: replace filler cases with a real difficulty ladder and show the current automation ceiling honestly.

## 1. Player Feedback Summary

The current 12 shipped cases are valid, but not all are good player-facing puzzles.

Useful player-facing cases:

- `case-004`: complete 4x4 chain with multiple local rules.
- `case-011`: small intersection case.
- `case-012`: small retained local-scope-difference case.

Weak or filler cases:

- `case-001` to `case-003`: too solved at the opening state. Authoring score shows `initialGuestLayouts = 1`, `proofWaveCount = 0`, and `deductionCount = 0`.
- `case-008` to `case-010`: same problem. The number of unrevealed candidate cells equals the number of target cells, so the global count closes the puzzle immediately.
- `case-005` to `case-007`: mechanically valid but mirror variants of `case-004`; they do not create new player reasoning.

Conclusion: the shipped set should stop presenting "12 cases" as 12 meaningful puzzles. The next content phase should promote fewer, better cases and demote filler to internal fixtures or tutorial/debug content.

## 2. Current Automation Capability

The project can already do the following automatically:

- Parse Puzzle Schema v1.
- Check static content diagnostics.
- Verify target layouts satisfy rules.
- Check initial satisfiability.
- Count candidate target layouts.
- Verify final target uniqueness.
- Verify no-guess human proof with proof technique IDs.
- Minimize initial reveals while preserving proof and uniqueness.
- Score provisional difficulty.
- Run focused web/runtime compatibility tests.

Current practical ceiling:

- Good support: 3x3, 4x3, and 4x4 boards.
- Possible but not yet a production promise: 5x5 boards.
- Current DSL: global count and local for-each counts over orthogonal or adjacent scopes with `eq/gte/lte`.
- Current proof techniques: local count saturation, all-remaining closure, intersection, difference, known-safe-from-non-target objects, and unique target neighbor intersection.
- Current generator can find candidates, but quality still needs authoring gates. It is not yet a "press button, get excellent puzzle" system.

The real automation upper bound today is:

> generate or author many candidates, then automatically reject most of them with proof, uniqueness, minimization, rule-contribution, anti-triviality, and anti-duplicate gates.

## 3. New Quality Gates

Every promoted case should pass the existing validation gates plus the following quality gates.

### QG-1 Opening Ambiguity

The puzzle must not be solved at the initial state.

Minimum:

- `initialGuestLayouts >= 2`.

Preferred:

- Easy: 2 to 4.
- Medium: 4 to 12.
- Hard: 8 to 40.

Reject if:

- `initialGuestLayouts = 1`.
- `proofWaveCount = 0`.
- `deductionCount = 0`.

### QG-2 Rule Contribution

Each non-flavor rule must be necessary or materially useful.

Automated test proposal:

- Remove each rule one at a time.
- Re-run target satisfaction, initial layout count, no-guess proof, and final uniqueness.
- A rule contributes if removing it causes at least one of:
  - target no longer accepted;
  - initial candidate layouts increase materially;
  - no-guess proof fails;
  - final uniqueness fails;
  - required proof technique disappears.

Reject if a case has multiple decorative rules that can be ignored.

### QG-3 Non-Isomorphism

Mirror/rotation copies should not ship as separate puzzle value.

Automated test proposal:

- Canonicalize board under horizontal mirror, vertical mirror, 180 rotation, and transpose where board shape permits.
- Normalize rule object names by kind.
- Compare target, initial reveals, and rule scopes as a canonical signature.

Reject if:

- The candidate is isomorphic to an already shipped case and does not introduce a new teaching purpose.

### QG-4 Technique Retention

If a puzzle is promoted to teach a technique, minimization must preserve that technique.

Use:

```powershell
pnpm authoring -- minimize <case> --require-technique <TECHNIQUE_ID>
```

Reject if:

- The minimized version loses the required technique.

### QG-5 Progressive Deductions

The puzzle should create real decisions over time.

Minimum:

- Easy: `deductionCount >= 2`.
- Medium: `deductionCount >= 5`.
- Hard: `deductionCount >= 9`.

Preferred:

- At least one safe action and one anomaly-marking action become provable during play.

### QG-6 Reveal Economy

Initial reveals should not trivialize the puzzle.

Reject if:

- More than 70% of cells are initially revealed for non-tutorial cases.
- Unknown target count equals all unknown cells at start unless explicitly used as a one-minute tutorial.

### QG-7 Thematic Fit

For the 《未登记现场》 wrapper:

- Target cells are "异常区域".
- Non-target kinds should map to site objects such as emergency lights, terminals, bodies, cabinets, medical beds, devices, or empty zones.
- Narrative records are allowed but cannot carry hidden solving information.

## 4. Proposed Player-Facing Difficulty Ladder

The next shipped set should be 8 to 10 meaningful cases, not 20 thin cases.

### Tier 0 - Onboarding

Purpose: teach controls without pretending to be a puzzle.

Recommended count: 1 case.

Quality target:

- 3x3.
- 1 anomaly.
- `initialGuestLayouts = 2`, not 1.
- 2 to 3 rules.
- 1 or 2 proof deductions.

Candidate theme:

- 《别按那个键：封锁线外》
- Teaches unknown area, controlled survey, anomaly mark, and final submission.

### Tier 1 - First Real Deduction

Purpose: one local exclusion or one local count creates the first provable action.

Recommended count: 2 cases.

Quality target:

- 3x3 or 4x3.
- 1 to 2 anomalies.
- `initialGuestLayouts = 2..4`.
- 3 to 4 rules.
- `deductionCount >= 3`.

Candidate themes:

- 《无主病床》
- 《最后一席》

Required techniques:

- `LOCAL_COUNT_SATURATED` or `LOCAL_COUNT_ALL_REMAINING`.

### Tier 2 - Intersection Reasoning

Purpose: teach that overlapping rule ranges can force a cell.

Recommended count: 2 cases.

Quality target:

- 3x3 or 4x3.
- 1 to 2 anomalies.
- `initialGuestLayouts = 2..8`.
- 3 to 5 rules.
- `deductionCount >= 5`.

Candidate themes:

- Keep and reskin `case-011`.
- Add one new non-isomorphic intersection case.

Required technique:

- `LOCAL_SCOPE_INTERSECTION`.

### Tier 3 - Difference Reasoning

Purpose: teach "this range has one more/less than that range" reasoning.

Recommended count: 2 cases.

Quality target:

- 4x3 or 4x4.
- 2 anomalies.
- `initialGuestLayouts = 2..12`.
- 4 to 5 rules.
- `deductionCount >= 6`.

Candidate themes:

- Keep and reskin `case-012`.
- Add one new non-isomorphic difference case.

Required technique:

- `LOCAL_SCOPE_DIFFERENCE`.

### Tier 4 - Mixed Mid-Band Cases

Purpose: combine count saturation, intersection, difference, and safe-object deductions.

Recommended count: 2 cases.

Quality target:

- 4x4.
- 2 to 3 anomalies.
- `initialGuestLayouts = 8..25`.
- 5 to 7 rules.
- `deductionCount >= 9`.
- At least 2 proof techniques.

Candidate themes:

- Reskin `case-004` as one mixed case.
- Add one new non-isomorphic 4x4 mixed case.

Required techniques:

- At least two of:
  - `KNOWN_SAFE_FROM_NON_GUEST_OBJECT`
  - `LOCAL_COUNT_SATURATED`
  - `UNIQUE_TARGET_NEIGHBOR_INTERSECTION`
  - `LOCAL_SCOPE_INTERSECTION`
  - `LOCAL_SCOPE_DIFFERENCE`

### Tier 5 - Showcase / Automation Ceiling

Purpose: show the current system's upper bound without promising every generated candidate is fun.

Recommended count: 1 experimental case.

Quality target:

- 4x4 preferred; 5x5 only if performance evidence is excellent.
- 3 anomalies.
- `initialGuestLayouts = 15..60`.
- 6 to 8 rules.
- `deductionCount >= 12`.
- At least 3 proof techniques.
- Runtime under the existing product performance budget.

Candidate themes:

- 《未放映母带》
- 《缺席货舱》

Required:

- Extra validation and manual review.
- Do not make this the default case.

## 5. Proposed Replacement Set

Recommended shipped selector after the next content phase:

| Slot | Role | Source |
|---|---|---|
| case-001 | onboarding, real but tiny | newly authored |
| case-002 | first local exclusion | newly generated/authored |
| case-003 | first local count | newly generated/authored |
| case-004 | mixed 4x4 baseline | keep current `case-004`, reskin |
| case-005 | intersection intro | keep/reskin `case-011` or new non-isomorphic case |
| case-006 | second intersection | newly generated/authored |
| case-007 | difference intro | keep/reskin `case-012` or new non-isomorphic case |
| case-008 | second difference | newly generated/authored |
| case-009 | mixed mid-band | newly generated/authored |
| case-010 | showcase hard | newly generated/authored |

Demote:

- Current `case-001` to `case-003`: internal tutorial/debug fixtures.
- Current `case-005` to `case-007`: mirror regression fixtures for symmetry testing.
- Current `case-008` to `case-010`: internal trivial/global-count fixtures.

Keep for internal tests:

- They are still useful as validation fixtures, but should not be sold as distinct player-facing puzzles.

## 6. Candidate Case Concepts

These are design targets for generation/authoring, not final JSON.

### C1 - 《别按那个键：封锁线外》

- Board: 3x3.
- Anomalies: 1.
- Types: emergency light, terminal, empty, anomaly.
- Teaching point: a local exclusion creates a safe first survey, then a count closes the anomaly.
- Target band: 1 to 2.
- Reject if initial layouts collapse to 1.

### C2 - 《无主病床》

- Board: 3x3.
- Anomalies: 1 or 2.
- Types: medical bed, cabinet, empty, anomaly.
- Teaching point: every bed has a fixed count in上下左右邻格; one cabinet exclusion eliminates a branch.
- Required technique: `LOCAL_COUNT_SATURATED`.
- Target band: 2.

### C3 - 《最后一席》

- Board: 4x3.
- Anomalies: 2.
- Types: seat, body, table, empty, anomaly.
- Teaching point: table周围一圈 count plus global anomaly count.
- Required: at least 3 initial layouts.
- Target band: 2 to 3.

### C4 - 《交汇视线》

- Board: 3x3.
- Anomalies: 1.
- Source: current `case-011`.
- Teaching point: intersection.
- Target band: 3.

### C5 - 《无灯楼层》

- Board: 4x3.
- Anomalies: 2.
- Types: emergency light, elevator door, empty, anomaly.
- Teaching point: two exclusion fields overlap to force one safe route and one anomaly.
- Required technique: `LOCAL_SCOPE_INTERSECTION`.
- Target band: 3.

### C6 - 《走廊缺口》

- Board: 4x3.
- Anomalies: 2.
- Source: current `case-012`.
- Teaching point: difference.
- Target band: 3.

### C7 - 《缺席货舱》

- Board: 4x4.
- Anomalies: 2 or 3.
- Types: cargo bay, terminal, empty, anomaly.
- Teaching point: local-scope difference plus all-remaining closure.
- Required technique: `LOCAL_SCOPE_DIFFERENCE`.
- Target band: 4.

### C8 - 《重复遗体》

- Board: 4x4.
- Anomalies: 3.
- Types: body, terminal, file cabinet, empty, anomaly.
- Teaching point: mixed local counts; one revealed body starts a chain but does not solve the puzzle alone.
- Required techniques: at least 2.
- Target band: 4.

### C9 - 《未放映母带》

- Board: 4x4.
- Anomalies: 3.
- Types: archive shelf, projector, empty, anomaly.
- Teaching point: count saturation + intersection + unique-neighbor reasoning.
- Required techniques: at least 3.
- Target band: 4 to 5.

### C10 - 《缺席货舱：舱门复核》

- Board: 4x4, or 5x5 only as an experimental cap test.
- Anomalies: 3 to 4.
- Types: cargo bay, terminal, corridor, empty, anomaly.
- Teaching point: current automation ceiling.
- Required:
  - `initialGuestLayouts >= 15`;
  - `deductionCount >= 12`;
  - no truncation;
  - local runtime p95 remains acceptable;
  - manual review confirms it is not just tedious.

## 7. Authoring And Generator Workflow

Recommended workflow for the next content phase:

1. Inventory current shipped cases and mark each as `keep`, `reskin`, `demote`, or `replace`.
2. Add automated quality tests:
   - opening ambiguity;
   - rule contribution;
   - non-isomorphism;
   - required technique retention;
   - no trivial global-count closure.
3. Generate candidates by template family, not one generic template:
   - local count template;
   - intersection template;
   - difference template;
   - mixed 4x4 template.
4. For every accepted candidate:
   - run schema validation;
   - run authoring report;
   - run score;
   - run minimization;
   - run required technique retention;
   - run web runtime smoke.
5. Promote only candidates that fill a ladder slot.
6. Keep rejected candidates and trivial/mirror variants in `content/experimental`, not `content/cases`.

## 8. Automation Upper Bound Demonstration

To honestly show the system's capability, the phase should produce a report with these numbers:

- Attempts per template.
- Accepted candidate count.
- Rejection breakdown:
  - schema failure;
  - target-rule failure;
  - initial unique/trivial;
  - no-guess failure;
  - explanation gap;
  - uniqueness failure;
  - technique retention failure;
  - duplicate/isomorphic failure.
- Best accepted candidate per difficulty tier.
- Final promoted cases and why.

Success is not "we generated 100 cases".

Success is:

> We generated or authored many candidates, automatically rejected weak/trivial/duplicate ones, and promoted a small ladder of distinct human-explainable puzzles.

## 9. Proposed Phase 19 Scope

Phase name:

- Phase 19 - High-Quality Puzzle Ladder And Generator Quality Gates

Round estimate:

- 14 executor rounds.

Suggested split:

- Rounds 1-2: current-case audit and demotion policy.
- Rounds 3-5: automated quality gates.
- Rounds 6-9: candidate generation/authoring by technique family.
- Rounds 10-11: promote replacement ladder.
- Round 12: web selector/copy/runtime smoke.
- Round 13: buffer fixes.
- Round 14: final validation and report.

PASS criteria:

- The selector presents a real difficulty ladder.
- Filler cases are demoted or clearly labeled as tutorial/debug if retained.
- No shipped case has `initialGuestLayouts = 1` unless explicitly marked as onboarding.
- No shipped case is only a mirror/rotation of another shipped case.
- Every promoted case passes schema, solver, proof, no-guess, uniqueness, quality gates, and web smoke.
- The report honestly states generator success rate and failure breakdown.
