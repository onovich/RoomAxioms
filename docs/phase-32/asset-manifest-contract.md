# Phase 32 Asset Manifest Contract

Status: implementation contract for asset-ready, placeholder-safe theme hooks.

The Phase 32 runtime foundation prepares for user-provided original art without
shipping or generating final art. Asset data must be browser-safe and must not
depend on filesystem APIs, Node-only authoring code, generator internals, or
remote backends.

## Asset Statuses

Every manifest entry should carry one of these statuses:

- `missing`: the slot is known, but no asset has been supplied.
- `placeholder`: a deliberately non-final placeholder is available.
- `userProvided`: the user supplied the asset, but it has not been approved as
  final.
- `approved`: the user supplied and approved the asset for the runtime.

Runtime rendering must treat `missing` and `placeholder` as non-final. UI copy
and docs must not claim the visual redesign is complete while required assets
remain in those statuses.

## Asset Kinds

The initial manifest should support these presentation asset categories:

- character portraits and expression variants;
- backgrounds;
- dialogue frame or box treatments;
- board theme keys;
- cell icon keys;
- optional sound keys, if represented as inert metadata only.

The runtime may omit an optional asset cleanly when no safe fallback exists.
Missing art must not crash the player route.

## Lookup Behavior

Browser-safe lookup helpers should:

- accept a manifest, kind, and asset key;
- return the matching entry when it exists;
- return a restrained placeholder result when the key is missing;
- expose whether the result is final or placeholder-like;
- never fetch from disk or infer puzzle information;
- never encode target coordinates, hidden object identities, candidates,
  forced cells, or proof internals in asset keys.

## Placeholder Rendering

Placeholders should be quiet and clearly non-final:

- portraits can render as initials, speaker labels, or no portrait;
- backgrounds can render as a neutral panel or existing page surface;
- dialogue frames can use CSS only;
- board/cell themes can fall back to the current Room Axioms visuals.

No AI-generated artwork should be added in this phase. If user assets arrive
later, they should enter through manifest keys and status metadata rather than
hard-coded runtime imports spread through player components.

## Boundary Checks

The player runtime may import the browser-safe manifest module. It must not
import:

- authoring CLI entry points;
- generator modules;
- Node filesystem APIs;
- experimental content-production utilities;
- target-answer or solver internal data solely for theming.

