# UI Art Sample Frontend Adaptation Requirements

Date: 2026-06-28

Purpose: translate the three UI art samples in `images/samples/` into frontend
preparation requirements. This document is for the frontend implementer before
final cut assets are supplied.

The target is presentation readiness, not a mechanics rewrite. Keep solver,
proof, puzzle validation, target semantics, and no-guess rules unchanged unless
a separate content/domain decision explicitly expands them.

## Source Samples

Reference order:

1. `images/samples/main-sample.png`
   - Primary visual direction.
   - Use for composition, module hierarchy, paper/ink treatment, red/blue status
     language, character placement, board state styling, and the overall
     "formal survey document plus VN partner review" feeling.
2. `images/samples/30083e07-bdf2-4a00-9168-320b18109a96 (1).png`
   - Chinese/localization reference.
   - Use for final Chinese naming, button text, shortcut hints, and how the
     design reads with Chinese typography.
3. `images/samples/93d91dda-c153-438e-8916-6c90653a26a7.png`
   - Secondary mood reference only.
   - Borrow selectively: heavier archive texture, grounded office background,
     darker VN dialogue band, and more realistic character rendering. Do not
     let its lower-contrast grey treatment override the clearer main sample.

## Packaging Direction

Working title:

- Chinese: `未登记现场`
- English: `UNREGISTERED SCENE`
- Organization subtitle: `非常规赔案调查部` / `Abnormal Claim Survey Division`

Player role:

- The player is a field surveyor or investigator reviewing an abnormal claim
  scene.
- The partner character is a review assistant who wraps hints/tutorials, but
  never becomes an extra clue source.

Mechanic vocabulary mapping:

| Current mechanic | Themed player-facing term |
| --- | --- |
| Case | 案卷 / Case File |
| Board | 现场平面图 / Scene Map |
| Cell | 区域 / Zone |
| Rules | 现场定则 / Scene Rules |
| Inspect | 勘察 / Inspect |
| Guest / target | 异常区域 / Anomaly |
| Mark guest | 标注异常 / Mark Anomaly |
| Mark safe | 标注可勘察 / Mark Safe to Inspect |
| Evidence log | 现场登记记录 / Record Log |
| Hint | 搭档复核 / Partner Review |
| Submit | 提交现场登记图 / Submit Survey |
| Reset | 重置调查 / Reset Survey |

The player must feel they are completing an official scene survey, not solving
an abstract grid puzzle. However, every puzzle-relevant fact must still come
from public rules, revealed facts, and proof-backed hints.

## Important Compatibility Note

The main sample shows many scene object labels: emergency light, bed, body,
security camera, damaged terminal, custodial closet, stairwell, and so on.
The current domain model only has these `CellKind` values:

- `empty`
- `bottle`
- `bin`
- `mirror`
- `guest`

Frontend must not silently invent new rule-bearing object kinds. Use one of
these approaches:

1. P0-safe approach: map current domain kinds to themed labels/icons through a
   theme vocabulary config.
2. Presentation-only approach: allow decorative floorplan labels for revealed
   safe cells, but make it explicit that they do not affect rules.
3. Future domain approach: if we need true rule-bearing objects like `body`,
   `camera`, or `terminal`, create a separate schema/domain expansion task.

Do not mix approach 2 into player-facing rules unless the content system can
validate that wording and mechanics remain aligned.

## Layout Requirements

Desktop layout should follow the main sample:

- Full paper-like work surface with thin navy ink lines.
- Top bar spans the full width.
- Left panel: scene rules.
- Center panel: scene map.
- Right panel: record log, player marks, submit button.
- Bottom dock: VN-style partner dialogue with character portraits.

The current three-column app shell can remain as the structural base, but it
needs art-ready regions and stable class names:

- `scene-shell`
- `scene-topbar`
- `scene-brand`
- `scene-case-file`
- `scene-progress`
- `scene-actions`
- `scene-rules-panel`
- `scene-map-panel`
- `scene-record-panel`
- `scene-vn-dock`

Avoid hard-coding final art into the components. Frontend should expose CSS
tokens, asset manifest keys, and layout slots.

## Top Bar Requirements

Required visible groups:

- Brand block: `UNREGISTERED SCENE` / `未登记现场` plus department subtitle.
- Case file block:
  - case number, e.g. `04`
  - case title, e.g. `Guest Room Cleaning Record` / `客房清扫记录`
  - location/subtitle, e.g. `Motel Red Pine` / `红松旅店`
- Progress:
  - anomaly marks, e.g. `2 / 3`
  - inspections, e.g. `17 / 24`
- Actions:
  - Partner Review
  - Reset Survey

Frontend needs an inspection counter derived from currently revealed/inspected
zones and the total board cells or case-defined inspectable zone count.

## Rule Panel Requirements

Each rule card should support:

- two-digit visual rule number, e.g. `01`
- readable rule copy
- optional mini scope diagram
- optional small count indicator dots
- selected state

The mini scope diagrams must be generated from public rule definitions or a
safe presentation config. They must never encode hidden target positions.

Recommended component split:

- `SceneRulePanel`
- `SceneRuleCard`
- `RuleScopeMiniDiagram`
- `RuleCountGlyph`

Rule text should be plain and readable. Flavor can be stylized, but the exact
logical meaning must remain visible.

## Scene Map Requirements

The map is the central product surface. It should support a CAD/fire-escape
plan look rather than a generic button grid.

Required layers:

1. coordinate headers
2. grid/floorplan base
3. optional wall/door/stair decorative line layer
4. cell interaction layer
5. revealed object icon and label layer
6. player mark overlay
7. rule/hint highlight overlay
8. developer-only overlay

Cell states:

| State | Visual direction |
| --- | --- |
| Unknown | pale paper cell, thin boundary, no answer-bearing variation |
| Inspected safe | small framed object icon plus text label |
| Marked anomaly | red hatch fill, red border, warning/anomaly label |
| Marked safe | blue/green circle mark, restrained outline |
| Rule scope highlight | blue outline or translucent wash |
| Hint highlight | red or navy callout, but only after proof-backed hint |
| Developer forced safe/target | developer-only badges, never normal player route |

Coordinate presentation must be configurable. The samples use letters on the
left and numbers across the top (`A1`, `B2`, etc.). The current domain uses
letter-number cell ids internally. If the visual theme changes axis display,
add a presentation adapter and do not change internal puzzle ids casually.

The current shipped cases range from `3x3` to `5x5`; the sample shows `6x6`.
Prepare CSS for `3x3` through `6x6` without layout collapse. Do not require new
`6x6` content for this adaptation.

## Record Panel Requirements

The right panel should be split into:

- `Record Log`
  - inspected zones list
  - coordinate plus revealed object label
  - scrollable area with visible affordance
- `My Marks`
  - anomaly marks count and list
  - safe-to-inspect marks count and list
- Submit action

The submit button should be a large framed red action block, not a generic
filled button. Wrong submit feedback must not reveal which mark is wrong.

## VN / Partner Review Requirements

The existing VN overlay is useful, but the sample implies an in-game bottom
dock rather than only a full modal.

Required behavior:

- Keep full overlay support for case intro/outro if needed.
- Add or prepare an inline/docked VN mode for tutorial/hint lines during the
  gameplay screen.
- The dock must not block map interaction unless the active scene intentionally
  requires player attention.
- Character portraits must be separate transparent assets, not baked into the
  whole UI screenshot.
- Non-speaking character can be dimmed or hidden on small screens.

Controls visible in the sample:

- Space: next
- Ctrl: skip/read-skip
- Tab or L: log
- Esc: close

Frontend should keep keyboard behavior accessible and allow reduced-motion /
instant text preference to apply to this dock too.

Secrecy rule: partner dialogue may wrap proof-backed hints, but cannot invent
new conclusions, expose hidden cell contents, or imply answer cells through
portrait expression, sound, timing, or camera movement.

## Asset Manifest Extensions

The current manifest categories are a good start. Extend or document slots for:

- `logoMark`
- `paperTexture`
- `panelFrame`
- `topbarFrame`
- `ruleCardFrame`
- `boardFrame`
- `boardGridTexture`
- `cellUnknownTexture`
- `cellMarkedAnomalyOverlay`
- `cellMarkedSafeOverlay`
- `scopeHighlightOverlay`
- `objectIcon`
- `characterPortrait`
- `characterExpression`
- `dialogueFrame`
- `buttonFrame`
- `background`

Asset entries must keep the existing safety metadata:

- source/owner
- license
- dimensions
- status: `missing`, `placeholder`, `userProvided`, `approved`
- `safeForPlayerRoute`
- reviewer notes

Filenames, labels, and notes must not contain answer coordinates, target cells,
candidates, forced-cell names, solver terms, or proof internals.

## CSS Token Requirements

Create a theme token layer before final cut-in:

```css
:root {
  --scene-paper: #f4ecdc;
  --scene-paper-aged: #eadfc9;
  --scene-ink: #0d2544;
  --scene-ink-soft: #49617a;
  --scene-red: #a83a33;
  --scene-green: #477d55;
  --scene-line: rgba(13, 37, 68, 0.72);
  --scene-faint-line: rgba(13, 37, 68, 0.28);
  --scene-shadow: rgba(13, 37, 68, 0.18);
}
```

Exact values can change during art implementation; the important part is that
major color decisions are centralized.

## Responsive Requirements

Desktop:

- Target the sample composition at roughly `1448x1086`.
- Keep all main modules visible from about `1280px` wide upward.
- Board must remain the primary focal point.

Tablet:

- Allow side panels to collapse or become tabs.
- Keep the map and current tool visible.
- Dialogue dock can become overlay-like.

Mobile:

- Do not try to reproduce the full sample composition.
- Use tabs: rules, map, record.
- Hide or crop non-speaking portraits.
- Keep tap targets at least 44px.
- Text must not overlap portraits or browser safe areas.

## Implementation Phases

P0: Structure and copy readiness

- Add theme vocabulary config for all player-facing labels.
- Add inspection counter.
- Add rule mini diagram slots.
- Add sample-ready class names and module wrappers.
- Split board rendering enough to support floorplan/map styling layers.
- Keep all current cases playable.

P1: Placeholder visual adaptation

- Implement paper/ink CSS theme using generated CSS only.
- Add red hatch anomaly mark, safe circle mark, and floorplan-like board lines.
- Add placeholder portrait slots and inline VN dock.
- Add asset manifest slots without relying on final cut images.

P2: Final asset intake

- Import artist-cut assets through the manifest.
- Mark assets `userProvided`, then approve only after checklist review.
- Replace placeholder icons/frames/textures with cut assets.
- Verify mobile crops and secrecy safety.

P3: Polish

- Case-specific intro/outro art.
- Per-case background mood.
- Optional sound effects if reviewed as non-clue-bearing.
- Dialogue log/read-skip polish.

## Acceptance Checklist For Frontend Handoff

- All current cases can be selected, reset, played, hinted, failed, and solved.
- Player-facing copy uses `未登记现场` terminology, not old `Room Axioms`
  terminology, except in developer/internal docs.
- No hidden answer data is present in asset keys, CSS class names, dialogue
  data, image filenames, or labels.
- Normal player route never shows developer forced-cell overlays.
- Rule cards remain readable and include exact meaning.
- The map supports current rectangular boards and does not assume square-only
  content.
- The UI works without final art assets.
- VN can be disabled; reduced motion and instant text are respected.
- Mobile fallback is usable even if it is visually simpler than the desktop
  composition.

