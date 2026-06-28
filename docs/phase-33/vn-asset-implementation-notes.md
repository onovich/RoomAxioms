# Phase 33 VN And Asset Implementation Notes

Date: 2026-06-28

## VN UX

- `apps/web/src/vn/preferences.ts` owns the harmless persisted VN preference
  shape: enabled, reduced motion, and text speed.
- `useRoomAxiomsGame` applies those preferences to scene opening only. It does
  not persist puzzle state, answers, solver data, candidates, proof internals,
  marks, or observations.
- Reset closes stale dialogue and result/hint state without re-opening first
  tutorial scenes. The explicit top-bar replay action is the supported way to
  replay the current case intro.
- Closing, skipping, or finishing VN dialogue attempts to restore focus to the
  previously focused control.

## Asset Review

- `ThemeAssetEntry` now accepts optional source, license, dimensions,
  `safeForPlayerRoute`, and reviewer notes metadata.
- `apps/web/src/theme/assetReview.ts` creates a private review report for
  maintainers: status counts, placeholder/pending/approved lists, dialogue
  trigger categories, fallback notes, manifest leaks, dialogue leaks, and intake
  issues.
- The existing authoring workbench shows a read-only Theme / VN private review
  summary. The normal player route does not expose this review tooling.

## Evidence

- Focused VN/asset tests:
  `pnpm --filter @room-axioms/web exec vitest run src/theme/assetManifest.test.ts src/theme/assetReview.test.ts src/vn/preferences.test.ts src/vn/VNDialogueOverlay.test.tsx`
- The earlier `pnpm --filter @room-axioms/web test -- ...` form was observed to
  run the entire web suite and hit unrelated performance wall-clock limits. Use
  the `exec vitest run <files>` form for focused web tests.
