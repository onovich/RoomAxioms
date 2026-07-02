# Phase 40 Figma Final Art Export Audit

Date: 2026-07-02
Figma file: `vvFlfc7o0G2MK9C9QIF04v`

## Exported Assets

| Role | Figma node | Figma canvas | Local asset |
| --- | --- | --- | --- |
| Protagonist normal | `52:75` `主角半身像 - 普通` | `377x454` | `apps/web/public/theme/final/portraits/protagonist-normal.png` |
| Protagonist thinking | `52:83` `主角半身像 - 思考` | `377x454` | `apps/web/public/theme/final/portraits/protagonist-thinking.png` |
| Assistant normal | `52:98` `助手半身像 - 普通` | `377x454` | `apps/web/public/theme/final/portraits/assistant-normal.png` |
| Assistant sensing rule | `52:103` `助手半身像 - 感应定则` | `377x454` | `apps/web/public/theme/final/portraits/assistant-sensing.png` |
| VN dialogue frame | `33:114` `VN-对话框` | `1081x276` | `apps/web/public/theme/final/dialogue/dialogue-default.png` |

## Verification

- Export path: Figma screenshot export with isolated node rendering (`contentsOnly: true`).
- PNG dimensions: all four exports are `377x454`.
- PNG pixel format: all four exports are `Format32bppArgb`.
- Transparency check: all four exports contain sampled transparent pixels and sampled visible pixels.
- Corner/bottom alpha samples:
  - `assistant-normal.png`: `0,0,0,46,255`
  - `assistant-sensing.png`: `0,0,255,0,255`
  - `protagonist-normal.png`: `0,0,255,0,255`
  - `protagonist-thinking.png`: `0,0,255,0,255`
  - `dialogue-default.png`: `0,0,0,0,255`

Non-zero bottom/corner alpha samples come from portrait or effect pixels touching the canvas edge, not from a full opaque background.
