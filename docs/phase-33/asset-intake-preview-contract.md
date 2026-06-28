# Phase 33 Asset Intake And Preview Contract

Date: 2026-06-28

Phase 33 prepares for user-provided original assets without importing final art.
All examples remain placeholders.

## Asset Intake Flow

1. `missing`: no source asset exists; runtime falls back to a safe placeholder.
2. `placeholder`: project-supplied temporary placeholder only.
3. `userProvided`: user has supplied an asset, but it is not approved for the
   player route yet.
4. `approved`: reviewer has checked source, license, dimensions, and secrecy;
   the asset may appear in the player route.

Approved assets require:

- stable id and kind;
- source or provenance note;
- license or ownership note;
- intended dimensions or aspect ratio;
- safe-for-player-route approval;
- reviewer notes when any risk was considered.

## Naming And Folders

Recommended private intake folders:

- `assets/theme/portraits/<character>/<expression>.png`
- `assets/theme/backgrounds/<scene>.png`
- `assets/theme/frames/<frame>.png`
- `assets/theme/board/<variant>.png`
- `assets/theme/icons/<kind>.png`
- `assets/theme/sound/<cue>.ogg`

Recommended id patterns:

- `portrait-investigator-neutral`
- `portrait-dispatcher-neutral`
- `background-field-office`
- `frame-dialogue-default`
- `board-current`
- `cell-icon-bin`
- `sound-dialogue-advance`

## Dimension Targets

- Portraits: transparent PNG, roughly 1200 x 1800 or 2:3 aspect ratio.
- Expressions: same canvas as the matching portrait.
- Backgrounds: 1920 x 1080 or wider safe crop for desktop/mobile.
- Dialogue frames: 1600 x 420 scalable PNG or CSS-friendly source.
- Board/cell treatments: designed for square cells and high contrast.
- Sounds: short OGG or WAV, normalized, no voice line that contains puzzle facts.

## Private Preview Requirement

The private review workflow must show or report:

- manifest counts by status and kind;
- placeholder/missing assets;
- user-provided assets not yet approved;
- leakage scan results for manifest and dialogue metadata;
- dialogue scene trigger/category list;
- fallback behavior when a referenced asset is missing;
- notes that final visual polish is blocked until approved art exists.

The preview workflow stays private/maintainer-facing and must not be reachable
as a normal player feature.
