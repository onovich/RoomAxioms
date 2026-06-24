# Phase 16 Case-012 Copy Review

Status: Round 2 evidence

## Reviewed Fields

Source: `content/cases/case-012.json`

- title;
- case name;
- rule titles;
- rule flavor text;
- metadata notes.

## Finding

The original title and case name used `走廊差集`.

That phrase matched the internal retained `LOCAL_SCOPE_DIFFERENCE` proof idea, but it was a little too technique-shaped for player-facing copy. It also risked leaking the kind of reasoning the case is meant to invite.

## Change

Changed only player-facing title fields:

- title: `客房 12：走廊缺口`;
- case name: `案卷 12 · 走廊缺口`.

No mechanics changed:

- rules unchanged;
- target layout unchanged;
- initial reveals unchanged;
- allowed kinds unchanged;
- difficulty metadata unchanged;
- proof/authoring gates unchanged.

## Rule Copy

Rule titles and flavor text are plain Chinese and aligned with existing shipped content:

- `酒瓶十字线`: describes exact orthogonal guest count in the flavor text;
- `镜面静区`: describes zero guests around each mirror;
- `空房静线`: describes zero guests in orthogonal neighbors of each empty cell;
- `住客总数`: describes the global guest total.

## Decision

The copy fix is narrow, player-facing, and mechanically neutral.
