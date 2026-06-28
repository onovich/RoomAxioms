# Phase 31 Theme Packaging And VN Workflow

Status: Round 1 packaging workflow from existing Unregistered Scene notes.

## Purpose

Prepare the `未登记现场` wrapper for future art-driven implementation without
changing puzzle mechanics or leaking hidden answer information.

This phase may document and lightly scaffold. It must not imply final visual
redesign is complete without user-provided art and design references.

## Binding Product Boundaries

Allowed:

- theme terminology and UI copy planning;
- asset intake checklist;
- visual-novel dialogue data/interface planning;
- future implementation phase split;
- private maintainer-facing docs and scaffolding.

Forbidden in this phase:

- broad final theme UI redesign;
- public editor or UGC;
- backend, analytics, daily challenge, or cloud save;
- puzzle target changes or content promotion;
- narrative text that reveals hidden cells, hidden object kinds, candidates,
  forced cells, solver internals, proof-only facts, or target answer facts.

## Asset Intake Checklist

Before final theme implementation, request and catalog:

- project logo / department mark;
- key visual or main background;
- room/board surface treatment references;
- unknown-cell mask treatment;
- object icons or illustrated tokens for current object kinds;
- selected, highlighted, marked, and investigated cell states;
- character half-body portraits;
- expression variants for protagonist and partner;
- dialogue box, speaker plate, log, skip, and advance controls;
- case selector visual references;
- evidence / site-record panel references;
- success and failure modal references;
- typography notes;
- color palette notes;
- mobile layout references.

Asset metadata should record:

- source/owner;
- license or user-provided status;
- intended use;
- required dimensions or aspect ratio;
- whether it is safe for normal player route.

## VN Dialogue Module Requirements

Future dialogue data may use:

```ts
type DialogueLine = {
  id: string
  speaker: 'protagonist' | 'partner' | 'system' | 'client'
  text: string
  portrait?: string
  expression?: string
  position?: 'left' | 'right' | 'center'
  background?: string
  sfx?: string
  waitMs?: number
}

type DialogueScene = {
  id: string
  trigger:
    | 'caseIntro'
    | 'firstRuleSelect'
    | 'firstSafeInspect'
    | 'firstAnomalyMark'
    | 'hint'
    | 'failure'
    | 'success'
  lines: readonly DialogueLine[]
  skippable: boolean
}
```

Dialogue data is presentation-only. It must not mutate puzzle target, rules,
observations, marks, candidates, proof state, or solver state.

## Trigger Boundaries

Permitted triggers:

- case intro;
- first rule selection;
- first safe inspection;
- first anomaly mark;
- proof-backed hint;
- failure result;
- success result.

Hint dialogue must wrap the existing proof-backed hint result. It must not
invent a conclusion.

Failure dialogue must not reveal which cell was wrong unless the existing
player-facing failure mode already does so.

Success dialogue may show post-solve report flavor and limited anomaly imagery.

## Secrecy Rules

Narrative and art can provide:

- mood;
- job role;
- tutorial framing;
- case premise;
- UI affordance explanation;
- post-solve report flavor.

Narrative and art must not provide:

- target cell coordinates;
- hidden object identities before investigation;
- candidate counts;
- forced-cell overlays;
- proof trace internals;
- different audiovisual cues for true anomaly cells;
- repeated failure dialogue that can be used to enumerate answers.

## Implementation Phase Split

Suggested future phases:

1. Theme terminology pass:
   - replace abstract prototype labels with `未登记现场` terms;
   - preserve all mechanics and secrecy gates.
2. Asset catalog and token/icon pass:
   - import user-approved art;
   - map assets to object kinds and UI states.
3. VN data and renderer pass:
   - implement dialogue overlay and data format;
   - add route-level tests for triggers and secrecy.
4. Case intro/outro pass:
   - add case-level narrative scenes;
   - keep rule/hint/target mechanics unchanged.
5. Polish pass:
   - responsive/mobile layout;
   - accessibility for dialogue;
   - optional log/skip/autoplay if cheap.

## Phase 31 Deliverable Boundary

For Phase 31, the acceptable deliverables are:

- this workflow doc;
- optional lightweight type/interface scaffolding if later code needs it;
- no final art assumptions;
- no player-facing answer-bearing narrative;
- no public theme claim that the visual redesign is complete.
