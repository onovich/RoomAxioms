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

export type ScopeKind = 'global' | 'orthogonal' | 'adjacent'
