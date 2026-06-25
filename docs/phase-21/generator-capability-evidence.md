# Phase 21 Generator Capability Evidence

Round: 9
Decision: generator samples produced no promotable candidates; manual authoring remains the source for promotion queue candidates.

## Scope

This round ran bounded `sample` commands against the seven Phase 21 skeleton templates. These templates are private authoring inputs under `content/experimental/phase-21/templates` and are not player-facing content.

## Focused Commands

```powershell
node packages/authoring/dist/cli.js sample --seed 2101 --template content/experimental/phase-21/templates/s1-split-local-count-template.json
node packages/authoring/dist/cli.js sample --seed 2102 --template content/experimental/phase-21/templates/s2-delayed-intersection-template.json
node packages/authoring/dist/cli.js sample --seed 2103 --template content/experimental/phase-21/templates/s3-offset-difference-template.json
node packages/authoring/dist/cli.js sample --seed 2104 --template content/experimental/phase-21/templates/s4-object-intersection-template.json
node packages/authoring/dist/cli.js sample --seed 2105 --template content/experimental/phase-21/templates/s5-global-finish-template.json
node packages/authoring/dist/cli.js sample --seed 2106 --template content/experimental/phase-21/templates/s6-local-object-template.json
node packages/authoring/dist/cli.js sample --seed 2107 --template content/experimental/phase-21/templates/s7-intersection-difference-template.json
```

## Sample Summary

| Seed | Template | Attempts | Accepted | Rejection summary | Solver stats |
| --- | --- | ---: | ---: | --- | --- |
| 2101 | `s1-split-local-count-template.json` | 160 | 0 | `TARGET_VIOLATES_RULES` 160; `NO_CANDIDATE_ACCEPTED` 1 | nodes 160; propagations 324; truncated false |
| 2102 | `s2-delayed-intersection-template.json` | 192 | 0 | `TARGET_VIOLATES_RULES` 192; `NO_CANDIDATE_ACCEPTED` 1 | nodes 192; propagations 405; truncated false |
| 2103 | `s3-offset-difference-template.json` | 192 | 0 | `TARGET_VIOLATES_RULES` 192; `NO_CANDIDATE_ACCEPTED` 1 | nodes 192; propagations 400; truncated false |
| 2104 | `s4-object-intersection-template.json` | 192 | 0 | `TARGET_VIOLATES_RULES` 192; `NO_CANDIDATE_ACCEPTED` 1 | nodes 192; propagations 234; truncated false |
| 2105 | `s5-global-finish-template.json` | 192 | 0 | `TARGET_VIOLATES_RULES` 189; `PROOF_GUESS_POINT` 3; `NO_CANDIDATE_ACCEPTED` 1 | nodes 933; propagations 3091; truncated false |
| 2106 | `s6-local-object-template.json` | 192 | 0 | `TARGET_VIOLATES_RULES` 192; `NO_CANDIDATE_ACCEPTED` 1 | nodes 192; propagations 409; truncated false |
| 2107 | `s7-intersection-difference-template.json` | 224 | 0 | `TARGET_VIOLATES_RULES` 224; `NO_CANDIDATE_ACCEPTED` 1 | nodes 224; propagations 481; truncated false |

Total bounded attempts: 1344.
Total accepted candidates: 0.

## Interpretation

The Phase 21 templates are useful as proof-skeleton documentation, but this sampling pass did not produce accepted candidates. The dominant failure mode is target construction: sampled targets often violate the generated rule set before proof, uniqueness, or anti-clone gates become relevant. The S5 template also found three non-promotable proof guess points.

This is an honest generator limitation, not a promotion blocker by itself. The guide permits zero accepted generator output if manual authoring still produces the required distinct promotions or the phase returns a blocker. The current promotion queue remains:

- `content/experimental/phase-21/candidates/phase-21-s2-intersection-001.json`
- `content/experimental/phase-21/candidates/phase-21-s3-difference-001.json`

No sampled template output is copied into `content/cases`, and no generated/rejected sample is added to the player selector.

## Round 9 Self-Checks

Debug self-check:

- Smallest candidate/skeleton tested: all seven Phase 21 templates with bounded deterministic seeds.
- Standard validation covered: sample commands completed without solver truncation.
- Anti-clone report covered: not applicable to zero accepted generated candidates; Round 8 covered the queue candidates.
- Novelty claim covered: no generated candidate receives a claim this round.
- Proof/no-guess path covered: S5 produced proof-gap rejections; no generated candidate enters queue.
- Rejected Phase 19 cases stayed out: yes.
- Generator/authoring rejection evidence recorded: yes, with attempts and rejection reasons.
- Runtime/player secrecy checked: no runtime change.
- Regression risk: docs-only evidence update.

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
