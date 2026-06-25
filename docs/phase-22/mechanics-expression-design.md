# Phase 22 Mechanics Expression Design

Round: 1
Guide: `docs/phase-22-expressive-mechanics-and-content-expansion-lab-goal-mode-execution-guide.md`

## Design Goal

Phase 22 adds expressive mechanics only when they create real candidate pressure and readable human deductions. The added mechanics must stay additive: every existing Puzzle Schema v1 case remains valid, and old `globalCount` / `forEachCount` rules keep their current meaning.

The content target is an honest 10-20 case selector, with 10 as the PASS floor. If the mechanics are not stable enough to produce at least 10 player-facing cases, Phase 22 must report `READY_FOR_CHECK_WITH_BLOCKER` instead of padding the selector.

## Current Baseline

Current domain grammar:

- `globalCount`: count a target kind over every board cell.
- `forEachCount`: for each observed or derived subject kind, count a target kind in `orthogonal` or `adjacent` scope.
- Observations are objective facts.
- Player marks are notes and never solver facts.
- Proof and runtime hints must describe public rules, not solver search.

Current accepted selector:

1. `case-004`
2. `case-011`
3. `case-013`
4. `case-012`
5. `case-014`

These cases remain protected unless a documented superior replacement exists.

## Additive Content Shape

The smallest additive content contract should add optional top-level puzzle metadata and new rule variants. Existing fields remain unchanged.

Recommended shape:

```ts
interface PuzzleDefinition {
  readonly regions?: readonly RegionDefinition[]
  readonly anchors?: readonly AnchorDefinition[]
  readonly records?: readonly RecordDefinition[]
}
```

New optional fields:

- `regions`: named public cell groups.
- `anchors`: public rule anchors that bind to observed or derived object cells.
- `records`: public rule cards that may be contaminated in high-tier cases.

New rule variants should be distinct discriminated union members rather than overloading old local scopes:

- `regionCount`
- `lineCount`
- `anchorCount`
- `recordSet`

Old cases omit these fields and continue to parse, solve, prove, score, and render as before.

## Region And Zone Mechanics

Tier: baseline to advanced.

Purpose:

- Give designers cell groups that overlap in non-neighborhood shapes.
- Make every extra region cell matter through candidate layouts, proof premises, or final uniqueness.
- Avoid padding by requiring anti-clone effective-board and rule-impact evidence.

Minimal public semantics:

```ts
interface RegionDefinition {
  readonly id: string
  readonly title: string
  readonly cells: readonly CellId[]
}

interface RegionCountRule {
  readonly id: string
  readonly type: 'regionCount'
  readonly regionId: string
  readonly target: CellKind
  readonly count: Comparator
  readonly presentation: RulePresentation
}
```

Solver semantics:

- Compile `regionCount` to a count constraint over exactly the cells in the named region.
- Region cells are public, board-bounded, unique, and non-empty.
- Regions may overlap; overlap is the point.
- Region count applies even before a cell is revealed, because the region itself is public.

Proof semantics:

- Reuse count-saturation and all-remaining patterns over a region cell set.
- Add region-specific technique ids only when the existing technique names become misleading:
  - `REGION_COUNT_SATURATED`
  - `REGION_COUNT_ALL_REMAINING`
  - `REGION_SCOPE_INTERSECTION`
  - `REGION_SCOPE_DIFFERENCE`
- Proof premises must name the public region title and list the relevant cells.

Plain Chinese copy:

- Region title: `东翼`, `窗边区`, `内圈`, `外圈`.
- Rule copy examples:
  - `东翼里恰好有 2 名未登记住客。`
  - `窗边区里没有未登记住客。`
  - `内圈至少有 1 名未登记住客。`

Promotion gate:

- At least two shipped region/zone cases for PASS.
- Each region case must include overlapping regions or a region plus local rule interaction.
- A single isolated global-like region is not enough.

## Sightline And Blocker Mechanics

Tier: baseline to advanced.

Purpose:

- Let board geometry change rule meaning through rows, columns, rays, and blockers.
- Make blockers materially alter proof progress.
- Create cases where visual shape is not just decoration.

Minimal public semantics:

```ts
type Direction = 'north' | 'south' | 'east' | 'west'

interface LineScope {
  readonly kind: 'row' | 'column'
  readonly index?: number
}

interface RayScope {
  readonly kind: 'ray'
  readonly direction: Direction
  readonly stopAtKinds?: readonly CellKind[]
}

interface LineCountRule {
  readonly id: string
  readonly type: 'lineCount'
  readonly origin?: CellId
  readonly subject?: CellKind
  readonly scope: LineScope | RayScope
  readonly target: CellKind
  readonly count: Comparator
  readonly presentation: RulePresentation
}
```

Two supported forms:

- `lineCount` with `scope.kind: 'row' | 'column'` and no subject counts a whole public row or column.
- `lineCount` with `scope.kind: 'ray'` and `subject` applies from every observed or derived subject anchor cell in the named direction.

Solver semantics:

- Row and column scopes are public static cell sets.
- Ray scopes start adjacent to the origin/subject cell and proceed in one direction.
- `stopAtKinds` are blockers. A blocker cell itself is not counted in the ray, and cells beyond it are not counted.
- For solver correctness, ray scopes over unknown blocker cells must be enumerated by model evaluation if the blocker is not observed or forced yet. Propagation may start conservatively and improve later.

Proof semantics:

- Human proof should only use a ray when blockers are observed or derived enough to make the visible segment public in the current knowledge state.
- Add technique ids:
  - `SIGHTLINE_COUNT_SATURATED`
  - `SIGHTLINE_COUNT_ALL_REMAINING`
  - `SIGHTLINE_BLOCKER_FRONTIER`
- A proof premise must state the visible segment, for example: `B2 向东看到 C2、D2；镜子挡住后面的格子。`

Plain Chinese copy:

- `这一行恰好有 2 名未登记住客。`
- `这列最多有 1 名未登记住客。`
- `每个酒瓶向右看见的格子里，恰好有 1 名未登记住客；镜子会挡住视线。`
- `镜子会挡住视线。`

Promotion gate:

- At least two shipped sightline/blocker cases for PASS.
- Each case must prove that blockers change the effective scope. If deleting blockers does not change candidate/proof progress, reject.

## Anchor-Reveal Frontier Mechanics

Tier: advanced.

Purpose:

- Let public rules depend on anchors whose coordinates become useful when the player reveals or derives object cells.
- Create reveal frontiers without hidden rules.
- Keep target reads out of runtime player mode.

Minimal public semantics:

```ts
interface AnchorDefinition {
  readonly id: string
  readonly title: string
  readonly subject: CellKind
}

interface AnchorCountRule {
  readonly id: string
  readonly type: 'anchorCount'
  readonly anchorId: string
  readonly scope: LocalScope | RayScope | { readonly kind: 'region'; readonly regionId: string }
  readonly target: CellKind
  readonly count: Comparator
  readonly presentation: RulePresentation
}
```

Semantics:

- The rule is public from the start.
- The anchor definition is public from the start.
- The anchor binds to every observed or derived cell with the anchor subject kind.
- Unknown target cells are not secretly used as anchors in player-facing proof or hints.
- Solver may evaluate full target models for verification, but runtime player hints and proof deductions may only activate anchor scopes from observed or derived anchors.

Proof semantics:

- Anchor rules create a new proof frontier when an observation or object deduction reveals an anchor.
- Existing object deductions may feed anchor rules.
- Add technique ids:
  - `ANCHOR_COUNT_SATURATED`
  - `ANCHOR_COUNT_ALL_REMAINING`
  - `ANCHOR_FRONTIER_UNLOCK`
- Proof text must say which public anchor became active, for example: `B2 是酒瓶，因此“酒瓶视线”规则现在作用在 B2。`

Plain Chinese copy:

- `每个被发现的酒瓶都会打开一条新线索。`
- `发现镜子后，检查它周围一圈。`
- `这条规则一直公开；只有锚点出现后才知道它作用在哪里。`

Promotion gate:

- At least two shipped anchor-frontier cases for PASS.
- Each case must have proof evidence that a new rule application appears only after a reveal or derived object fact.
- If the anchor is already fully useful from initial reveals, it is not an anchor-frontier case.

## Contaminated Record Mechanics

Tier: high-tier only.

Purpose:

- Represent a small number of public records/rules that may be false.
- Let the player eliminate contaminated records by cross-checking, not guessing.
- Avoid mixing this mechanic into early cases.

Minimal public semantics:

```ts
interface RecordDefinition {
  readonly id: string
  readonly title: string
  readonly ruleIds: readonly string[]
}

interface RecordSetRule {
  readonly id: string
  readonly type: 'recordSet'
  readonly recordIds: readonly string[]
  readonly falseRecords: { readonly op: 'eq' | 'lte'; readonly value: 1 }
  readonly presentation: RulePresentation
}
```

Interpretation:

- Records are public groups of ordinary rule ids.
- A `recordSet` states that exactly one or at most one listed record is false.
- Rules inside a false record are ignored together.
- Rules outside the contaminated record set are always true.
- A contaminated case must explicitly label itself in metadata tags and player copy.

Solver/verifier semantics:

- Verification enumerates possible false-record assignments first.
- For each assignment, compile only active records' rules plus all always-true rules.
- The target is valid if at least one allowed false-record assignment satisfies all active rules.
- Player solution is valid only if the final guest layout is unique across all still-possible false-record assignments.
- A high-tier verifier must expose possible record-set counts to authoring/developer surfaces, but player mode must not dump internal assignment lists.

Proof semantics:

- Do not pretend a contaminated record is simply true.
- Human proof needs high-tier techniques:
  - `CONTAMINATED_RECORD_ELIMINATION`
  - `CONTAMINATED_RECORD_CONFIRMED`
  - `CONTAMINATED_RECORD_UNIQUE_LAYOUT`
- A proof step may eliminate a record only when assuming it false or true contradicts public observations and the remaining records.
- If verifier/proof remains unstable, do not ship contaminated cases in Phase 22.

Plain Chinese copy:

- Case label: `高阶：记录污染`
- Rule copy examples:
  - `这些记录里恰好有 1 条是错的。`
  - `这些记录里最多有 1 条是错的。`
  - `先用其他线索排除错误记录，再确认住客位置。`

Promotion gate:

- One or two contaminated cases may ship only after normal mechanics are stable.
- They must be late selector entries.
- They must have explicit metadata tags:
  - `high-tier`
  - `contaminated-record`
- If contaminated verification is not stable by Round 13, record a blocker and skip contaminated shipped cases.

## Baseline, Advanced, High-Tier Classification

Baseline mechanics:

- `regionCount`
- row/column `lineCount`

Advanced mechanics:

- blocker-aware ray `lineCount`
- `anchorCount`
- mixed region + sightline or anchor chains

High-tier mechanics:

- `recordSet` contaminated records

This classification controls selector order and copy. High-tier mechanics should not appear before players have seen normal region/sightline/anchor cases.

## Vertical Slice Plan

Domain:

- Add types for regions, anchors, records, and new rule variants.
- Add traversal helpers:
  - region cell lookup;
  - row/column cells;
  - ray cells with blocker policy;
  - observed/derived anchor binding input shape.

Schema:

- Parse optional `regions`, `anchors`, `records`.
- Validate unique ids.
- Validate referenced region/anchor/record/rule ids.
- Validate all cells are board-bounded and unique where required.
- Keep old cases valid with no new fields.

Solver:

- Compile region and row/column line scopes as static count constraints.
- Compile ray scopes as model-aware count constraints when blockers can be unknown.
- Support record-set verification without changing old solve behavior.
- Preserve deterministic ordering and existing budget reporting.

Proof:

- Summarize public cell sets for regions and row/column lines.
- Activate ray deductions only when the current knowledge state fixes the visible segment.
- Activate anchor deductions only from observed or derived anchors.
- Add high-tier contaminated proof techniques only when verifier-backed.

Authoring:

- Extend report/score/minimize to display new mechanics.
- Extend anti-clone signatures with:
  - region memberships;
  - sightline/ray shape and blocker use;
  - anchor frontier steps;
  - contaminated-record signatures.
- Add novelty claim checks for promoted cases.

Runtime/Web:

- Rule rendering must use plain Chinese labels.
- Player mode may show rule copy and high-level hints.
- Player mode must not expose target layouts, candidate lists, forced cells, generated candidate diagnostics, anti-clone details, or false-record assignment internals.
- Developer/verification mode may expose diagnostics already allowed by existing gates.

Content:

- Preserve `case-004`, `case-011`, `case-012`, `case-013`, `case-014`.
- Add candidates under `content/experimental/phase-22`.
- Promote only deliberately reviewed cases into `content/cases`.
- Add novelty claims for every player-facing case.

## Candidate Design Rules

Every candidate must start from a player cognition skeleton:

- What is the first ambiguity?
- Which public rule creates pressure?
- Which reveal or derived object changes the frontier?
- Which cells are effective unknowns?
- Which existing case is closest, and why is this not a clone?

Reject candidates when:

- the opening layout is already unique;
- proof has zero waves or zero deductions;
- a large region behaves like a renamed global count;
- blockers do not change line scope;
- anchors are all already active at opening;
- contaminated records require guessing;
- minimization removes the advertised mechanic;
- anti-clone gates report hard failures or unresolved reviewer-blocking similarities;
- player-facing copy needs solver jargon to make sense.

## Required Evidence By Mechanic

Region/zone case evidence:

- report/score/minimize PASS;
- anti-clone PASS;
- novelty accepted;
- at least one proof premise names an overlapping or non-global region.

Sightline/blocker case evidence:

- report/score/minimize PASS;
- anti-clone PASS;
- novelty accepted;
- proof or verifier demonstrates blocker-changed scope.

Anchor-frontier case evidence:

- report/score/minimize PASS;
- anti-clone PASS;
- novelty accepted;
- proof waves or evidence show a new anchor application after reveal/derived object fact.

Contaminated-record case evidence:

- contaminated verifier PASS;
- record assignment ambiguity eliminated or bounded without guessing;
- final guest layout unique across possible record assignments;
- explicit high-tier copy and metadata tags;
- no player-facing internal false-record assignment dump.

## Round 1 Self-Checks

Debug self-check:

- Smallest mechanic fixture tested: deferred to Round 2/3; this round defines the smallest intended fixtures.
- Existing accepted cases preserved: yes, design is additive and old content omits new fields.
- Effective unknown cells covered: design requires effective-cell proof/candidate evidence for promotion.
- Constraint overlap increased: region overlaps, blocker-aware rays, anchor frontiers, and record cross-checking are the core mechanics.
- Reveal frontier covered: anchor rules activate only from observed or derived anchors.
- Multi-step proof path covered: candidate design rules require first ambiguity, pressure, frontier, and final narrowing.
- Contaminated-record path covered, if touched: high-tier semantics and verifier gates defined.
- Anti-clone and novelty covered: design requires extending signatures and accepted novelty claims before promotion.
- Runtime/player secrecy checked: player mode restrictions are explicit.
- Rejected candidate evidence recorded: future rejected candidates go under Phase 22 evidence.
- Regression risk: docs-only design artifact.

Architecture self-check:

- Domain remains the source of truth for puzzle/rule/board types: yes, new mechanics start in domain types.
- Schema remains the content contract: yes, schema validates optional mechanics fields.
- Solver remains exact backend: yes, solver/verifier own satisfaction semantics.
- Proof remains human explanation backend: yes, proof only narrates public, verifier-backed deductions.
- Generator/authoring remain private maintainer tooling: yes.
- New mechanics are additive and backward compatible: yes.
- Candidate design starts from player cognition/proof frontiers, not map padding: yes.
- Anti-clone gates consume public APIs rather than duplicating solver/proof semantics: yes.
- Shipped content is intentionally promoted: no content promotion this round.
- Experimental/rejected candidates remain private: yes.
- Target access stayed behind the narrow app boundary: yes.
- Player marks stayed out of solver/proof facts: yes.
- Developer-only data stayed gated: yes.
- Theme/VN/editor/backend scope avoided: yes.
- Unrelated files left untouched: yes.
