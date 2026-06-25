# Phase 21 Intersection Candidate Attempt

Round: 5
Skeleton: S2 - Crossing Intersection With Delayed Capacity
Candidate: `content/experimental/phase-21/candidates/phase-21-s2-intersection-001.json`
Decision: accepted for promotion queue, not yet player-facing.

## Source

The Phase 21 S2 template sample with seed `2102` produced no accepted candidate:

- attempts: 192
- accepted candidates: 0
- rejection summary: all sampled targets failed `TARGET_VIOLATES_RULES`
- stats: node count 192, propagation count 405, not truncated

Round 5 therefore re-reviewed the earlier private Phase 12 local-scope fixture as a candidate shape and copied it into the Phase 21 private candidate area with a new Phase 21 id and metadata. It is not a Phase 19 rejected case and is not player-facing.

## Focused Commands

```powershell
pnpm authoring -- report content/experimental/phase-21/candidates/phase-21-s2-intersection-001.json
pnpm authoring -- score content/experimental/phase-21/candidates/phase-21-s2-intersection-001.json
pnpm authoring -- minimize content/experimental/phase-21/candidates/phase-21-s2-intersection-001.json --require-technique LOCAL_SCOPE_INTERSECTION
pnpm authoring -- anti-clone content/cases/case-011.json content/cases/case-012.json content/cases/case-004.json content/experimental/phase-21/candidates/phase-21-s2-intersection-001.json --novelty-manifest content/novelty-claims.json
```

## Evidence Summary

Actual result after copying:

- report: `ok: true`
- initial guest layouts: 2
- proof: no-guess and human-explainable
- proof techniques before minimization: `LOCAL_SCOPE_DIFFERENCE`, `LOCAL_SCOPE_INTERSECTION`
- final guest cells: `C2`, `B3`
- score: 9.73, band 2, uncalibrated
- `minimize --require-technique LOCAL_SCOPE_INTERSECTION`: `ok: true`
- anti-clone structural evidence groups against `case-011`, `case-012`, and `case-004`: none
- anti-clone status before promotion: `fail`, only because `phase-21-s2-intersection-001` has no accepted novelty claim yet

`minimize --require-technique LOCAL_SCOPE_DIFFERENCE` is not used as the Round 5 gate because this candidate is being reviewed as an intersection candidate; earlier evidence showed difference does not survive minimization.

## Reviewer Decision

This candidate is allowed into the promotion queue because it differs from `case-011` under Phase 20 gates:

- it has a two-guest final layout (`C2`, `B3`) instead of `case-011`'s single guest `A1`;
- it uses bottle orthogonal and bottle adjacent scope interaction, not `case-011`'s compact mirror/empty intersection;
- anti-clone review of the original Phase 12 fixture reported no structural evidence groups against the current selector.

It is not promoted in Round 5 because promotion is reserved for Rounds 10-11 after the difference, mixed, and repair attempts are compared.

## Round 5 Self-Checks

Debug self-check:

- Smallest candidate/skeleton tested: S2 intersection candidate copied into Phase 21 private area.
- Standard validation covered: focused report/score/minimize commands are required before commit.
- Anti-clone report covered: baseline selector plus candidate, with novelty manifest.
- Novelty claim covered: no accepted claim yet; promotion deferred.
- Proof/no-guess path covered: candidate proof path is checked by report/minimize.
- Rejected Phase 19 cases stayed out: yes.
- Generator/authoring rejection evidence recorded: S2 seed `2102` produced zero accepted candidates.
- Runtime/player secrecy checked: no runtime changes.
- Regression risk: private candidate and docs only.

Architecture self-check:

- Domain remains the source of truth for puzzle/rule/board types: yes.
- Schema remains the content contract: yes.
- Solver remains exact backend: yes.
- Proof remains human explanation backend: yes.
- Generator/authoring remain private maintainer tooling: yes.
- Candidate design starts from proof skeletons, not map padding: yes.
- Anti-clone gates consume public APIs rather than duplicating solver/proof semantics: yes.
- Shipped content is intentionally promoted: no shipped content change.
- Experimental/rejected candidates remain private: yes.
- Target access stayed behind the narrow app boundary: yes.
- Player marks stayed out of solver/proof facts: yes.
- Developer-only data stayed gated: yes.
- Theme/VN/editor/backend/new DSL/new proof technique scope avoided: yes.
- Unrelated files left untouched: yes.
