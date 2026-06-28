# Phase 32 Presentation Secrecy Rules

Status: secrecy contract for theme, VN dialogue, and placeholder assets.

The VN layer is allowed to add mood, speaker framing, and tutorial pacing. It
is not allowed to become an extra clue channel. All puzzle-relevant facts must
come from public rules, revealed cells, player-visible marks, proof-backed
hints, and existing conclusion feedback.

## Forbidden Leakage

Dialogue scenes, portrait keys, background keys, sound keys, CSS class names
used for scene content, and test fixtures must not reveal:

- hidden cell contents;
- anomaly/visitor coordinates;
- final guest layouts;
- target answers;
- solver candidates;
- forced cells;
- proof internals or search traces;
- failed-answer coordinates beyond existing result behavior;
- safe cells not already public through rules, revealed observations, or the
  current proof-backed hint.

## Hint Dialogue

Hint dialogue may only wrap an existing `Hint` payload produced by the runtime
hint pipeline. It may reframe the title, conclusion, premises, and reasoning
as a scene, but it must not:

- invent a new conclusion;
- skip ahead to later proof steps;
- expose candidates or forced-cell sets;
- read target data directly;
- continue after the hint pipeline reports stale, truncated, unsat, or missing
  analysis except with a generic unavailable message.

## Failure And Success Dialogue

Failure presentation must not identify which submitted mark was wrong unless
the existing player-facing result already reveals that fact. Success may
celebrate completion, but should not add new answer facts beyond the existing
success payload.

Inspection failure currently occurs when the player actively investigates a
visitor cell. A VN wrapper may reuse the existing failure result payload, but
must not broaden it into a diagnostic of all wrong or hidden cells.

## Rule And Scope Copy

Player-facing copy must be understandable from text and public UI context. A
highlight may visualize a scope, but it must not be the only way to know what a
rule means.

Avoid resurrecting confusing internal labels in normal player copy, including:

- 安全区
- 空区
- 空房
- 侧翼
- 锚点
- 清扫点
- 已确认清扫点

Use established project terms consistently, especially `垃圾桶` for bin-like
objects when that object is surfaced to the player.

## Testing Expectations

Phase 32 tests should cover:

- required scene categories exist;
- generic scenes do not contain coordinate-like answer facts;
- hint scenes require an existing proof-backed hint payload;
- failure scenes do not expose exact wrong-answer cells;
- asset keys and dialogue data do not contain target/candidate/forced/proof
  leakage terms;
- player runtime imports stay browser-safe.

