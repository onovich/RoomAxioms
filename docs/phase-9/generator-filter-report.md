# Phase 9 Generate-Verify-Filter Report

Status: Round 3 prototype
Package: `@room-axioms/generator`

## Scope

Round 3 added a narrow generate-verify-filter loop over the Round 2 sampler. The loop keeps only experimental candidates that pass the current content contract:

- schema parse;
- target rule satisfaction;
- initial satisfiability;
- proof/no-guess completion;
- final guest-layout uniqueness.

No generated JSON was written to `content/cases`, and no web selector changed.

## Prototype API

- `generateVerifiedCandidates(input, template?)`

The filter uses `sampleTargetAndObservationPools` as its candidate source, asks the sampler to explore the attempt budget, and caps only verified accepted candidates.

## Focused Evidence

`packages/generator/src/filter.test.ts` covers:

- successful 3x3 one-guest candidate acceptance with all validation stages recorded;
- target-rule rejection when sampled guest count conflicts with a `guest eq 2` rule;
- proof rejection for a solver-valid but unprovable no-initial-reveal global-count puzzle.

## Throughput And Bottlenecks

The representative tests intentionally use tiny 3x3 boards:

- successful one-guest fixture accepts within one sampled preview;
- target-rule mismatch rejects every attempt through the target-rule gate;
- no-initial-reveal fixture reaches the proof gate and rejects as `PROOF_GUESS_POINT`.

The primary observed bottleneck is not runtime yet; it is acceptance quality. Naive target sampling can easily create cases that are solver-valid but not human-provable under the current proof template set.

## Next Spike Step

Round 4 should use an accepted fixture or candidate as input to reveal minimization, removing only observations whose deletion preserves proof/no-guess completion and final guest-layout uniqueness.
