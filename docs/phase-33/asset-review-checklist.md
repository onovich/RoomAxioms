# Phase 33 Asset Review Checklist

Use this checklist before changing any asset status to `approved`.

- Source: asset came from the user or another documented permitted source.
- License: ownership or license is written in the manifest.
- Dimensions: portrait, background, frame, board, icon, or sound target size is
  recorded.
- Player-route safety: `safeForPlayerRoute` is true only after review.
- Secrecy: no target answers, anomaly coordinates, candidates, forced cells,
  proof internals, solver internals, or hidden cell facts appear in labels,
  filenames, notes, images, or audio.
- Fallback: missing or unapproved assets still render as placeholders.
- Mobile crop: important visual content is not lost in narrow viewports.
- Final-art claim: do not call placeholders or unapproved drafts final.

Recommended command evidence:

```powershell
cmd /c pnpm.cmd --filter @room-axioms/web test -- src/theme/assetManifest.test.ts src/theme/assetReview.test.ts src/vn/dialogue.test.ts
```

Reviewer decision:

- `missing` -> keep placeholder fallback.
- `placeholder` -> acceptable temporary project placeholder only.
- `userProvided` -> received but not player-route approved.
- `approved` -> ready for player route after all checklist items pass.
