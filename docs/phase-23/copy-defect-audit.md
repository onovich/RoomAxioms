# Phase 23 Copy Defect Audit

Date: 2026-06-26
Status: Round 1 intake and immediate P0 repair

## Mandatory Copy Fixes

`case-004` copy is repaired so universal positive `forEachCount` rules use `必有`:

- `R3`: `每个酒瓶的上下左右邻格里，必有 1 个垃圾桶。`
- `R5`: `每面镜子周围一圈里，必有 1 名访客。`

This preserves rule semantics while matching the user's requested wording direction.

## Case 019 Quarantine

`case-019` is removed from `apps/web/src/content/cases.ts` and marked rejected in `content/novelty-claims.json`.

Reason:

- The user rejected or did not accept the case.
- The visible region name `东侧架` is an unclear "east shelf" concept.
- The current proof/copy does not explain why `C2` is a guest or why `C1` is safe in a readable player-facing chain.

Resolution:

- Keep `content/cases/case-019.json` as historical audit content.
- Do not count `case-019` as player-facing quality content or Phase 23 quota content.
- A future repair must produce proof/copy evidence before the case can be reintroduced.

## Remaining Copy Work

Round 1 only handles mandatory low-risk fixes. Later Phase 23 rounds must continue auditing:

- shipped case names and summaries;
- visible selector grouping labels introduced for baseline / target 4+ / super-hard;
- any new Phase 23 case copy before promotion.

Round 2 tightened generated rule text:

- `rulePlainText` now prefers reviewed `presentation.flavor` for player-facing rule cards.
- Region and anchor fallback text uses `presentation.title` instead of internal ids such as `north-edge` or `bottle-anchor`.
- Runtime smoke now checks `ruleSemantics` across every shipped rule, not only legacy `forEachCount` rules.
