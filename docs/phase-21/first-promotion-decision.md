# Phase 21 First Promotion Decision

Round: 10
Decision: promote `phase-21-s2-intersection-001` as `case-013`.

## Shipped Content Changes

- Added `content/cases/case-013.json`.
- Added `case-013` to the player selector after `case-011`.
- Added an accepted novelty claim for `case-013`.
- Kept `case-004` as the default case.

The shipped case uses formal player-facing copy and maintainer metadata. The original experimental candidate remains under `content/experimental/phase-21/candidates` as source evidence.

## Focused Commands

```powershell
node packages/authoring/dist/cli.js report content/cases/case-013.json
node packages/authoring/dist/cli.js score content/cases/case-013.json
node packages/authoring/dist/cli.js minimize content/cases/case-013.json --require-technique LOCAL_SCOPE_INTERSECTION
node packages/authoring/dist/cli.js anti-clone content/cases/case-011.json content/cases/case-013.json content/cases/case-012.json content/cases/case-004.json --novelty-manifest content/novelty-claims.json
```

## Gate Evidence

`report`:

- `ok: true`
- diagnostics: `VALIDATION_PASS`
- schema ok: true
- target satisfies rules: true
- initial guest layouts: 2
- final guest cells: `C2`, `B3`
- no-guess: true
- human explainable: true
- proof techniques: `LOCAL_SCOPE_DIFFERENCE`, `LOCAL_SCOPE_INTERSECTION`
- deduction count: 3
- wave count: 1
- solver truncation: false

`score`:

- `ok: true`
- score: 9.73
- band: 2
- note: authoring metrics remain uncalibrated until real playtest evidence exists

`minimize --require-technique LOCAL_SCOPE_INTERSECTION`:

- `ok: true`
- diagnostics: `MINIMIZATION_COMPLETE`, `TECHNIQUE_RETENTION_PASS`
- before reveal count: 4
- after reveal count: 2
- before cells: `A1`, `B1`, `C1`, `B2`
- after cells: `A1`, `B2`

`anti-clone` with the current selector:

- `ok: true`
- status: `pass`
- diagnostics: `ANTI_CLONE_PASS`
- hard failures: 0
- reviewer-blocking findings: 0
- structural evidence groups: none
- novelty manifest: accepted for `case-004`, `case-011`, `case-012`, and `case-013`; no missing-review issues

## Distinctness Review

`case-013` is distinct enough to promote:

- it is not `case-011`: both are compact 3x3 puzzles, but `case-011` is a single-guest local-scope-intersection baseline, while `case-013` has two final guests and combines `LOCAL_SCOPE_DIFFERENCE` with `LOCAL_SCOPE_INTERSECTION`;
- it is not `case-012`: `case-012` is a 4x3 retained-difference corridor with global count support, while `case-013` is a 3x3 crossing-ledger puzzle with no global guest count;
- it is not `case-004`: `case-004` is the mixed cleaning-chain baseline on a 4x4 board, while `case-013` resolves through compact bottle/mirror scope comparisons.

The anti-clone report found no effective-board, proof-trace, shrink-signature, or rule-impact collision against the current selector.

## Round 10 Self-Checks

Debug self-check:

- Smallest candidate/skeleton tested: `case-013`, promoted from S2 crossing intersection.
- Standard validation covered: report, score, technique-retention minimize, anti-clone, and focused web content test update.
- Anti-clone report covered: `case-011`, `case-013`, `case-012`, `case-004`.
- Novelty claim covered: accepted claim added for `case-013`.
- Proof/no-guess path covered: `LOCAL_SCOPE_DIFFERENCE` plus `LOCAL_SCOPE_INTERSECTION`, no guess, human explainable.
- Rejected Phase 19 cases stayed out: yes.
- Generator/authoring rejection evidence recorded: Round 9 remains the generator limitation evidence.
- Runtime/player secrecy checked: selector imports only shipped case data; no target/candidate/forced/generator internals added to player UI.
- Regression risk: one shipped case, selector order, novelty manifest, and focused tests.

Architecture self-check:

- Domain remains the source of truth for puzzle/rule/board types: yes.
- Schema remains the content contract: yes.
- Solver remains exact backend: yes.
- Proof remains human explanation backend: yes.
- Generator/authoring remain private maintainer tooling: yes.
- Candidate design starts from proof skeletons, not map padding: yes.
- Anti-clone gates consume public APIs rather than duplicating solver/proof semantics: yes.
- Shipped content is intentionally promoted: yes, `case-013`.
- Experimental/rejected candidates remain private: yes.
- Target access stayed behind the narrow app boundary: yes.
- Player marks stayed out of solver/proof facts: yes.
- Developer-only data stayed gated: yes.
- Theme/VN/editor/backend/new DSL/new proof technique scope avoided: yes.
- Unrelated files left untouched: yes.
