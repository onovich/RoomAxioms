# Phase 29 Skeleton Review Helper

Status: private authoring support.

This note connects the human-readable Phase 29 skeleton documents to the
source-of-truth helper in `packages/authoring/src/skeletonReview.ts`.

The helper is deliberately small. It does not parse Markdown, mutate puzzle
JSON, weaken shipped-case gates, or decide promotion. It only gives maintainers
a repeatable pre-JSON checkpoint for the target-4 expectations defined in:

- `docs/phase-29/proof-skeleton-format.md`
- `docs/phase-29/proof-skeleton-review-rubric.md`
- `docs/phase-29/target-4-pre-json-checklist.md`

## Review Flow

1. Write a skeleton brief first.
2. Fill the metric fields by reviewer judgment, not by generated JSON:
   effective unknown cells, opening guest-layout target, wave count, deduction
   count, material families, shared-variable groups, late frontier unlocks,
   redundant-rule expectation, and hard degeneracy risks.
3. Fill every required claim:
   opening ambiguity, wave chain, shared-variable pressure, anti-degeneracy,
   minimize expectation, grammar mapping, and expected diagnostics.
4. Run or mirror `evaluateSkeletonReview` from the authoring package.
5. Translate to experimental JSON only when the report status is `pass`.

`warning` means the skeleton may be useful as a design note but should not be
translated yet. The current warning case is valid but thin opening ambiguity:
more than one layout, but below the preferred target-4 buffer.

`fail` means stop before JSON. Common fail reasons intentionally mirror Phase
28 blockers: opening uniqueness, too few effective cells, no late unlock,
singleton or direct-safe dump risk, expected redundant rules, or missing written
claims.

## Example Input Shape

```ts
evaluateSkeletonReview({
  skeletonId: 'phase-29-overlap-frontier',
  title: 'Overlap frontier with late shared-variable pressure',
  metrics: {
    effectiveUnknownCells: 14,
    initialGuestLayouts: 12,
    proofWaveCount: 4,
    deductionCount: 9,
    materialRuleFamilyCount: 4,
    sharedVariableGroupCount: 2,
    lateFrontierUnlockCount: 1,
    redundantRuleCount: 0,
    hardDegeneracyRiskCount: 0,
  },
  claims: {
    openingAmbiguity: 'Opening has many guest layouts and no singleton scope.',
    waveChain: 'Each wave depends on at least one prior public deduction.',
    sharedVariable: 'Two rules compete for the same uncertain frontier cells.',
    antiDegeneracy: 'No direct count, near-count, sightline, or region giveaway appears.',
    minimizeExpectation: 'The overlap and conditional rules must survive minimization.',
    grammarMapping: 'Maps to region, overlap, conditional, and anchor count rules.',
    expectedDiagnostics: 'Expected diagnostics should show no hard degeneracy findings.',
  },
})
```

## Boundary

This helper is a pre-JSON design filter. Passing it does not imply:

- schema validity;
- solver satisfiability;
- no-guess proof success;
- final uniqueness;
- anti-clone novelty;
- copy approval;
- player-selector eligibility.

Every translated candidate must still pass the normal authoring report, score,
minimize, degeneracy, rule-contribution, anti-clone, novelty, runtime, and copy
review gates before it can be considered for shipped content.
