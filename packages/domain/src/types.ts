export type CellKind = 'empty' | 'bottle' | 'bin' | 'mirror' | 'guest'

export type CellId = string

export interface Coord {
  readonly x: number
  readonly y: number
}

export interface BoardSize {
  readonly width: number
  readonly height: number
}

export type PlayerMark = 'guest' | 'safe'

export type ScopeKind = 'global' | 'orthogonal' | 'adjacent'

export type Direction = 'north' | 'south' | 'east' | 'west'

export type Comparator =
  | { readonly op: 'eq'; readonly value: number }
  | { readonly op: 'gte'; readonly value: number }
  | { readonly op: 'lte'; readonly value: number }

export interface RulePresentation {
  readonly title: string
  readonly flavor?: string
}

export interface GlobalCountRule {
  readonly id: string
  readonly type: 'globalCount'
  readonly target: CellKind
  readonly count: Comparator
  readonly presentation: RulePresentation
}

export interface LocalScope {
  readonly kind: Exclude<ScopeKind, 'global'>
}

export type Scope = { readonly kind: 'global' } | LocalScope

export interface StaticLineScope {
  readonly kind: 'row' | 'column'
  readonly index: number
}

export interface RayScope {
  readonly kind: 'ray'
  readonly direction: Direction
  readonly stopAtKinds?: readonly CellKind[]
}

export interface RegionReferenceScope {
  readonly kind: 'region'
  readonly regionId: string
}

export type ExpressiveScope = LocalScope | StaticLineScope | RayScope | RegionReferenceScope

export interface ForEachCountRule {
  readonly id: string
  readonly type: 'forEachCount'
  readonly subject: CellKind
  readonly scope: LocalScope
  readonly target: CellKind
  readonly count: Comparator
  readonly presentation: RulePresentation
}

export interface RegionDefinition {
  readonly id: string
  readonly title: string
  readonly cells: readonly CellId[]
}

export interface AnchorDefinition {
  readonly id: string
  readonly title: string
  readonly subject: CellKind
}

export interface RecordDefinition {
  readonly id: string
  readonly title: string
  readonly ruleIds: readonly string[]
}

export interface RegionCountRule {
  readonly id: string
  readonly type: 'regionCount'
  readonly regionId: string
  readonly target: CellKind
  readonly count: Comparator
  readonly presentation: RulePresentation
}

export interface LineCountRule {
  readonly id: string
  readonly type: 'lineCount'
  readonly subject?: CellKind
  readonly origin?: CellId
  readonly scope: StaticLineScope | RayScope
  readonly target: CellKind
  readonly count: Comparator
  readonly presentation: RulePresentation
}

export type RuleDefinition = GlobalCountRule | ForEachCountRule | RegionCountRule | LineCountRule

export interface AnchorCountRule {
  readonly id: string
  readonly type: 'anchorCount'
  readonly anchorId: string
  readonly scope: ExpressiveScope
  readonly target: CellKind
  readonly count: Comparator
  readonly presentation: RulePresentation
}

export interface RecordSetRule {
  readonly id: string
  readonly type: 'recordSet'
  readonly recordIds: readonly string[]
  readonly falseRecords: { readonly op: 'eq' | 'lte'; readonly value: 1 }
  readonly presentation: RulePresentation
}

export type ExpressiveRuleDefinition =
  | RegionCountRule
  | LineCountRule
  | AnchorCountRule
  | RecordSetRule

export type AnyRuleDefinition = RuleDefinition | ExpressiveRuleDefinition

export interface PuzzleMetadata {
  readonly difficulty: 1 | 2 | 3 | 4 | 5
  readonly tags: readonly string[]
  readonly author?: string
  readonly status: 'draft' | 'validated' | 'published' | 'deprecated'
  readonly notes?: string
}

export interface PuzzleDefinition {
  readonly schemaVersion: 1
  readonly id: string
  readonly title: string
  readonly caseName?: string
  readonly board: BoardSize
  readonly allowedKinds: readonly CellKind[]
  readonly regions?: readonly RegionDefinition[]
  readonly anchors?: readonly AnchorDefinition[]
  readonly records?: readonly RecordDefinition[]
  readonly rules: readonly RuleDefinition[]
  readonly initialReveals: readonly CellId[]
  readonly target: Readonly<Record<CellId, CellKind>>
  readonly metadata: PuzzleMetadata
}

export interface Observation {
  readonly cellId: CellId
  readonly kind: CellKind
}

export interface ObservationEntry {
  readonly id: CellId
  readonly kind: CellKind
  readonly initial: boolean
  readonly order: number
}

export function assertNever(value: never): never {
  throw new Error(`Unhandled domain variant: ${JSON.stringify(value)}`)
}
