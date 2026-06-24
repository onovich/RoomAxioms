# Phase 12 Rendering And Hint Compatibility Evidence

Status: Round 6 evidence

## Proof Rendering

Focused renderer coverage added in `packages/proof/src/renderer.test.ts`:

- `renders local scope difference deductions with stable public parents`.

The snapshot confirms a `LOCAL_SCOPE_DIFFERENCE` guest deduction renders with:

- observed subject facts;
- public rule nodes;
- a derived node for `B3 is guest`;
- no solver trace, target layout, forced-cell diagnostics, generator data, or authoring diagnostics.

## Runtime Hint Compatibility

Focused web hint coverage added in `apps/web/src/logic/hints.test.ts`:

- `renders local scope difference runtime hints without developer diagnostics`.

The test feeds a public `RuntimeHint` with technique `LOCAL_SCOPE_DIFFERENCE` into the existing hint adapter and verifies:

- the highlighted cell remains `B3`;
- the conclusion names the public cell;
- premises are rule references only;
- the adapter does not require developer-only analysis fields.

No player UI redesign or runtime contract change was needed because the technique id was already reserved in the hint title switch.

