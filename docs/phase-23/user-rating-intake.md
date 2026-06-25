# Phase 23 User Rating Intake

Date: 2026-06-26
Guide: `docs/phase-23-difficulty-4-plus-puzzle-expansion-goal-mode-execution-guide.md`
Status: binding product input for Phase 23

## Source Verdict

The user's Phase 22 playtest verdict is treated as binding product evidence. Mechanical validity is not enough for Phase 23 promotion: a case must produce a genuinely non-trivial player experience and must avoid direct giveaway, clone, padding, and unclear-copy failure modes.

## Case Ratings

| Case | User rating | Intake decision |
| --- | ---: | --- |
| `case-015` | 1/5 | Too simple; tutorial only, not counted toward 4+ expansion. |
| `case-013` | 2/5 | Accepted baseline, not counted toward new 4+ quota. |
| `case-004` | 3/5 | Accepted baseline/default; copy must use `必有` for universal positive bottle/bin wording. |
| `case-011` | 2.5/5 | Accepted baseline, not counted toward new 4+ quota. |
| `case-012` | 2.2/5 | Accepted baseline, not counted toward new 4+ quota. |
| `case-014` | 1.5/5 | Feels familiar; keep only as baseline/audit unless later replaced. |
| `case-017` | 1.5/5 | Too easy; not counted toward new 4+ quota. |
| `case-018` | 1.2/5 | Too easy; not counted toward new 4+ quota. |
| `case-019` | rejected | Invalid or unclear; quarantine from the player-facing selector until proof/copy can explain C2 as guest and C1 as safe. |
| `case-020` | 1/5 | Too simple; not counted toward new 4+ quota. |

## Binding Failure Modes

- Many shipped rule terms remain untranslated or unclear.
- `case-004` universal positive copy must say `必有`, e.g. `酒瓶的上下左右邻格里，必有 1 个垃圾桶。`
- English/opaque terms such as `east shelf` are not acceptable in player-facing copy.
- Edge/side and sightline rules with only one effective unknown cell are close to direct answer reveals and must be detected by degeneracy gates.
- Singleton or near-singleton regions/sightlines lower difficulty and must not count toward target 4/5 or super-hard quotas.
- Clone-like proof traces, shrink signatures, rule-impact vectors, and padded effective boards remain product failures even when solver/proof validation passes.

## Phase 23 Counting Policy

- Low-rated Phase 22 cases may remain available as baseline/tutorial/audit content, but they do not count toward the 20 target 4/5 or 10 super-hard attempted/promoted quotas.
- New promoted cases must include an intended player experience note, novelty claim, degeneracy review, and authoring evidence.
- If honest gates block the 20 + 10 quota, Phase 23 must report `READY_FOR_CHECK_WITH_BLOCKER` rather than padding the selector.
