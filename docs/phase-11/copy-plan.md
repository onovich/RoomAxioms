# Phase 11 Copy Plan

Status: Round 2 draft
Scope: selected promotion candidate only

## Planned Shipped Case

Source candidate:

- `content/experimental/phase-10/phase-10-local-scope-intersection-001.json`

Planned shipped destination:

- `content/cases/case-011.json`

Planned selector id:

- `case-011`

## Chinese Player-Facing Copy

Case title:

- `客房 11：交汇视线`

Case name:

- `案卷 11 · 交汇视线`

Rule copy:

| Rule | Planned title | Planned flavor |
| --- | --- | --- |
| `R1` | `镜面登记` | `每面镜子的上下左右邻格里，恰好有 1 名未登记住客。` |
| `R2` | `酒瓶静区` | `每个酒瓶周围一圈里，最多有 1 名未登记住客。` |
| `R3` | `空房登记` | `每个空房间的上下左右邻格里，恰好有 1 名未登记住客。` |

Metadata plan:

- `difficulty`: keep `3` as internal provisional content metadata.
- `tags`: replace experimental tags with shipped tags such as `mvp`, `mid-band`, `local-scope-intersection`.
- `author`: `internal-phase-11`.
- `status`: `validated` after all gates pass.
- `notes`: mention Phase 11 promotion from the Phase 10 local-scope-intersection fixture and keep calibration caveat out of player-facing UI.

## Mechanics Preservation

The promotion copy plan must not change:

- board size;
- allowed kinds;
- rule ids;
- rule kinds;
- rule scopes;
- rule counts;
- initial reveals;
- target layout.

Only id, title, caseName, presentation copy, and metadata are planned to change.

## Copy Review Checks

- Case and rule copy are Chinese.
- Copy uses concrete player terms rather than abstract scope labels.
- The standard terms `上下左右邻格` and `周围一圈` are preserved.
- Copy does not mention `LOCAL_SCOPE_INTERSECTION`, solver, candidate counts, target layout, forced cells, or authoring diagnostics.
