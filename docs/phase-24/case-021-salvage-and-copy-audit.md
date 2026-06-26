# Case 021 Salvage And Copy Audit

Status: case-021 salvaged as a target-4 candidate with a caveat.

## Decision

`case-021` had a real content-quality defect, not just a wording defect. The former R7 was a fixed five-cell `regionCount` rule with `empty = 5` over A2, A3, E2, E3, and E4. The text depended on a region label and rule highlight to communicate the scope, and the rule directly granted five safe cells while being counted as a hard clue.

The repaired case removes that rule entirely. A2, A3, E2, E3, and E4 are now ordinary opening reveals. The remaining rules are global counts plus the bottle, mirror, and garbage-bin chain.

Changed player-facing content:

- Title: `客房 21：中线垃圾桶链`.
- Removed region `side-clear`.
- Removed rule R7.
- Added opening reveals: A2, A3, E2, E3, E4.
- Kept target guest layout: A4, A5, E5.
- Kept rules R1-R6 unchanged mechanically, with object wording for mirror and garbage-bin anchors.

## Salvage Probes

| Probe | Result |
| --- | --- |
| Original R7 `empty = 5` | Machine-valid target-4 metrics, but rejected on player clarity and direct safe-cell giveaway. |
| Remove R7 | No-guess proof failed with `GUESS_POINT`; target-4 failed due redundant-rule evidence. |
| Replace R7 with `guest = 0` over the same five cells | Preserved proof shape but still directly gave five safe cells and produced cap/truncation warning in the authoring report. |
| Replace R7 with bottle/mirror/bin zero-count variants | Failed no-guess and/or made R7 redundant. |
| Remove R7 and reveal A2, A3, E2, E3, E4 at opening | PASS: 56 opening guest layouts, 4 proof waves, 13 deductions, no-guess true, final guest layout unique, degeneracy pass, target-4 pass. |

## Current Evidence

`pnpm authoring -- report content/cases/case-021.json`:

- ok: true
- recommendation: `ready-for-experimental-review`
- initial guest layouts: 56
- proof waves: 4
- deductions: 13
- final guest cells: A4, A5, E5
- technique ids: `ANCHOR_COUNT_SATURATED`, `KNOWN_SAFE_FROM_NON_GUEST_OBJECT`, `LOCAL_COUNT_SATURATED`, `UNIQUE_TARGET_NEIGHBOR_INTERSECTION`
- material rule families: anchor, foreach, global
- redundant rules: none
- degeneracy: pass
- targetFour: pass

Quality caveat: the repaired puzzle still has 11 opening reveals and 5 irrelevant cells. It is acceptable as a salvaged target-4 candidate under current gates, but difficulty remains uncalibrated until real playtest evidence exists.

Anti-clone/novelty run over the current web selector:

- Overall status: fail because legacy baseline cases still have known degeneracy or single-family hard failures.
- `case-021`: degeneracy pass; rule-family diversity pass with anchor, foreach, and global families; no redundant rules.
- novelty manifest: pass for required selector cases, including the repaired `case-021` claim.

## Shipped-Case Audit

Scope: current web selector cases `case-004`, `case-011`, `case-013`, `case-015`, `case-012`, `case-014`, `case-017`, `case-018`, `case-020`, and `case-021`.

Findings:

- `case-021`: repaired. No visible `安全区`, `空区`, `空房`, `侧翼`, `锚点`, `清扫点`, or `已确认清扫点` terms remain in the case file.
- `case-004`: rule title `清扫安全区` still contains `安全区`. The rule is local to garbage bins rather than a hidden fixed region, but the title should be softened in a future copy pass.
- `case-011`: rule title `空房登记` and text `空房间` remain. This is a stable object-rule pattern rather than a hidden fixed region, but the object vocabulary should be reviewed for consistency with `空地`.
- `case-012` and `case-014`: rule title `空房静线` and text `空房间` remain. Same copy-debt class as `case-011`.
- `case-013`: no named regions, fixed-scope highlight dependency, direct region safe-cell giveaway, or internal anchor terms found in visible rules.
- `case-015`, `case-017`, `case-018`, and `case-020`: visible anchor copy uses `锚点`, and named region rules such as `北沿区`/`北侧台面` rely on visual highlighting to fully identify membership. These are baseline/mechanics samples and already have quality caveats from earlier phases; they should not be promoted as high-tier content without a copy and degeneracy repair pass.

Deferred repairs:

- Replace visible `锚点` labels with object wording such as `已确认的酒瓶`.
- For fixed region rules, either put the coordinates in the rule text or make the scope obvious through stable non-answer map labels.
- Do not count any fixed-region `guest = 0` or `empty = all` rule as high-tier evidence unless it survives the degeneracy review as more than a safe-cell giveaway.
