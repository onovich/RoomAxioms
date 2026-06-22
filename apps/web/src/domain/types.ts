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

export type Tool = 'inspect' | 'guest' | 'safe'

export type ScopeKind = 'global' | 'orthogonal' | 'adjacent'

export type Comparator =
  | { readonly op: 'eq'; readonly value: number }
  | { readonly op: 'gte'; readonly value: number }
  | { readonly op: 'lte'; readonly value: number }

export interface RulePresentation {
  readonly title: string
  readonly flavor: string
}

export interface GlobalCountRule {
  readonly id: string
  readonly type: 'globalCount'
  readonly target: CellKind
  readonly count: Comparator
  readonly presentation: RulePresentation
}

export interface ForEachCountRule {
  readonly id: string
  readonly type: 'forEachCount'
  readonly subject: CellKind
  readonly scope: { readonly kind: Exclude<ScopeKind, 'global'> }
  readonly target: CellKind
  readonly count: Comparator
  readonly presentation: RulePresentation
}

export type RuleDefinition = GlobalCountRule | ForEachCountRule

export interface PuzzleDefinition {
  readonly schemaVersion: 1
  readonly id: string
  readonly title: string
  readonly caseName: string
  readonly board: BoardSize
  readonly allowedKinds: readonly CellKind[]
  readonly rules: readonly RuleDefinition[]
  readonly initialReveals: readonly CellId[]
  readonly target: Readonly<Record<CellId, CellKind>>
  readonly metadata: {
    readonly difficulty: 1 | 2 | 3 | 4 | 5
    readonly tags: readonly string[]
    readonly status: 'draft' | 'validated' | 'published' | 'deprecated'
  }
}

export interface ObservationEntry {
  readonly id: CellId
  readonly kind: CellKind
  readonly initial: boolean
  readonly order: number
}

