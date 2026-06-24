# Phase 14 Candidate Strategy

Status: Round 4 strategy

## Search Goal

Find a natural difference candidate whose accepted or minimized reveal set still requires `LOCAL_SCOPE_DIFFERENCE`.

Phase 14 should not look for a case that merely mentions the technique before minimization. The retained proof is the target.

## Preferred Shape

The preferred private candidate shape is:

- an outer known subject whose local scope requires at least one remaining guest;
- an inner known subject whose unknown scope is contained inside the outer unknown scope;
- the inner scope has a lower maximum capacity than the outer remaining requirement;
- the difference cells are few enough that the extra required guests force a guest conclusion;
- the subject or count facts needed for the difference are not redundant under minimization.

## Repair Heuristics

Use these before adding new candidates:

- If minimization removes the outer subject reveal, the candidate is probably over-constrained by another rule.
- If minimization removes the inner subject reveal, the inner cap is not structurally necessary.
- If minimization retains both subjects but drops `LOCAL_SCOPE_DIFFERENCE`, another accepted technique explains the same progress earlier.
- If proof emits `LOCAL_SCOPE_DIFFERENCE` but final uniqueness fails, repair final guest closure with existing public rules only.
- If proof emits gaps, reject or simplify; do not add a proof technique in Phase 14.

## Sampling Policy

- Sampling remains report-only.
- Seeds start at `1401`.
- `maxAttempts` may increase modestly from 48 to 96 for Phase 14 templates.
- Accepted sampled output is not automatically copied into shipped content.
- A sampled candidate must still be hand-reviewed, run through `report`, `score`, `minimize --require-technique LOCAL_SCOPE_DIFFERENCE`, and pass all promotion gates.

## Rejection Categories

- `TARGET_VIOLATES_RULES`: sampled target does not satisfy public rules.
- `PROOF_EXPLANATION_GAP`: proof needs a human move outside approved techniques.
- `FINAL_GUEST_LAYOUT_AMBIGUOUS`: proof does not end at one guest layout.
- `TECHNIQUE_RETENTION_FAILED`: minimization drops the required difference technique.
- `LOW_BAND_OR_REDUNDANT`: score or reveal set indicates the difference move is not pacing-useful.

