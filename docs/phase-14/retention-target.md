# Phase 14 Retention Target

Status: Round 1 baseline

## Target

Phase 14 should add a repeatable private authoring check that answers:

- Which techniques appeared before minimization?
- Which techniques appeared after minimization?
- Did required techniques survive minimization?
- If not, which required techniques were lost?
- Did the minimized proof still pass no-guess and final guest-layout uniqueness?

## Initial Required Technique

For Phase 14 difference candidates, the required technique is:

```text
LOCAL_SCOPE_DIFFERENCE
```

## Reporting Shape

The smallest safe report can be derived from existing proof output:

- `minimization.proofBefore.metrics.techniqueIds`
- `minimization.proofAfter.metrics.techniqueIds`
- `minimization.proofAfter.noGuess`
- `minimization.proofAfter.humanExplainable`
- `minimization.proofAfter.guestLayoutUniqueAtEnd`

No solver, proof, or DSL semantics need to be duplicated in the CLI.

## Acceptance

A candidate passes Phase 14 retention only when:

- `LOCAL_SCOPE_DIFFERENCE` appears in the accepted proof used for promotion;
- after minimization, `LOCAL_SCOPE_DIFFERENCE` still appears if the minimized reveal set is the accepted set;
- the minimized proof remains no-guess, human-explainable, and final-unique;
- no solver truncation is present.

If a candidate fails retention, keep it experimental and document the reason.

