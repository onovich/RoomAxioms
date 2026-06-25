# Phase 21 Baseline Acceptance Contract

Round: 1
Phase: Phase 21 - Distinct Puzzle Ladder Production

## Baseline Selector

Phase 21 starts from the repaired Phase 20 selector:

1. `case-011`
2. `case-012`
3. `case-004`

`case-004` remains the default case. These three cases are preserved unless a documented superior replacement exists, which is not an active Phase 21 goal.

## Minimum Content Target

Phase 21 must do one of two honest things:

- promote at least two genuinely distinct new player-facing cases beyond `case-011`, `case-012`, and `case-004`; or
- return `READY_FOR_CHECK_WITH_BLOCKER` with evidence that the current DSL, generator, authoring tools, or proof techniques could not produce two accepted non-clone additions after documented attempts.

The selector must not be padded. A smaller honest selector is accepted over a larger clone-like ladder.

## Rejected Phase 19 Content

The following cases remain rejected as normal player-facing content unless a future phase produces superior evidence:

- `case-001`
- `case-002`
- `case-003`
- `case-005`
- `case-006`

They remain in `content/cases` only as historical audit material. They must not be imported by `apps/web/src/content/cases.ts` during Phase 21.

## Promotion Gates

Every promoted candidate must pass all gates below.

### Standard Content Gates

- Puzzle Schema v1 parse succeeds.
- Target is complete and satisfies all declared rules.
- Initial observation state is satisfiable.
- Opening ambiguity is non-trivial for a normal player-facing case.
- Final guest layout is unique after the proof observations.
- Human proof is no-guess and human-explainable.
- Solver/proof reports are not truncated.
- Phase 19 quality gates pass, including proof waves, deduction count, rule contribution, and required technique retention where applicable.

### Phase 20 Anti-Clone Gates

The candidate must pass the combined anti-clone report against the full proposed selector:

```powershell
pnpm authoring -- anti-clone <selector-case-paths...> --novelty-manifest content/novelty-claims.json
```

This means:

- no effective-board isomorphism hard failure;
- no exact proof-trace hard failure;
- no reviewer-blocking kind-agnostic proof-trace clone;
- no repeated candidate-shrink signature;
- no repeated rule-impact vector;
- no missing, rejected, or needs-review novelty claim for any player-facing selector case.

### Novelty Claim Gates

Every promoted case must have an accepted entry in `content/novelty-claims.json` with:

- a concrete proof-skeleton novelty claim;
- a closest-case comparison against `case-004`, `case-011`, and `case-012`;
- gate evidence showing why it is not a coordinate transform, label swap, padded board, copied proof trace, repeated shrink signature, or repeated rule-impact pattern.

### Runtime And Selector Gates

- `apps/web/src/content/cases.ts` imports only deliberately promoted player-facing cases.
- Rejected/generated/experimental candidates remain out of the player selector.
- Focused web case verification and runtime smoke tests pass.
- Player UI does not expose target layouts, candidate counts, forced-cell overlays, generator output, authoring diagnostics, anti-clone internals, or proof internals outside existing developer-only surfaces.

## Phase Boundaries

Phase 21 does not add:

- Puzzle Schema v1 rule semantics;
- solver architecture rewrites;
- new proof technique implementations;
- public editor, UGC, backend, analytics, daily challenge, broad UI/theme/VN systems, GitHub Release, or version tag;
- fabricated playtest calibration or difficulty claims.

## Round 1 Baseline Anti-Clone Evidence

Command:

```powershell
pnpm authoring -- anti-clone content/cases/case-011.json content/cases/case-012.json content/cases/case-004.json --novelty-manifest content/novelty-claims.json
```

Expected result:

- `ok: true`
- anti-clone status `pass`
- hard failures `0`
- reviewer-blocking groups `0`
- accepted novelty claims for `case-004`, `case-011`, and `case-012`

Actual result is recorded in the Round 1 commit validation notes.

## Round 1 Self-Checks

Debug self-check:

- Smallest candidate/skeleton tested: current repaired selector baseline only.
- Standard validation covered: deferred to candidate rounds; baseline has prior Phase 20 evidence.
- Anti-clone report covered: required Round 1 command.
- Novelty claim covered: existing accepted claims for `case-004`, `case-011`, `case-012`.
- Proof/no-guess path covered: prior Phase 20 evidence; rechecked in later final sweep.
- Rejected Phase 19 cases stayed out: yes, this round makes no selector changes.
- Generator/authoring rejection evidence recorded: not applicable in Round 1.
- Runtime/player secrecy checked: no runtime changes in Round 1.
- Regression risk: docs-only contract.

Architecture self-check:

- Domain remains the source of truth for puzzle/rule/board types: yes, no domain changes.
- Schema remains the content contract: yes, no schema changes.
- Solver remains exact backend: yes, no solver changes.
- Proof remains human explanation backend: yes, no proof changes.
- Generator/authoring remain private maintainer tooling: yes.
- Candidate design starts from proof skeletons, not map padding: required by this contract.
- Anti-clone gates consume public APIs rather than duplicating solver/proof semantics: yes, via authoring CLI.
- Shipped content is intentionally promoted: no content promotion this round.
- Experimental/rejected candidates remain private: yes.
- Target access stayed behind the narrow app boundary: yes.
- Player marks stayed out of solver/proof facts: yes.
- Developer-only data stayed gated: yes.
- Theme/VN/editor/backend/new DSL/new proof technique scope avoided: yes.
- Unrelated files left untouched: yes.
