import type { BoardSize, CellId, Coord, ScopeKind } from './types.js'

export function columnsForWidth(width: number): readonly string[] {
  assertPositiveInteger(width, 'width')

  return Array.from({ length: width }, (_, index) => {
    let n = index
    let label = ''

    do {
      label = String.fromCharCode(65 + (n % 26)) + label
      n = Math.floor(n / 26) - 1
    } while (n >= 0)

    return label
  })
}

export function formatCellId(coord: Coord, size: BoardSize): CellId {
  assertBoardSize(size)

  if (!isInside(coord, size)) {
    throw new Error(`Cell coordinate is outside the board: ${coord.x},${coord.y}`)
  }

  return `${columnsForWidth(size.width)[coord.x]}${coord.y + 1}`
}

export function parseCellId(id: CellId, size: BoardSize): Coord {
  assertBoardSize(size)

  const match = /^([A-Za-z]+)([1-9][0-9]*)$/.exec(id.trim())
  if (!match) throw new Error(`Invalid cell id: ${id}`)

  const [, rawColumn, rawRow] = match
  const column = rawColumn.toUpperCase()
  const x = columnsForWidth(size.width).indexOf(column)
  const y = Number(rawRow) - 1
  const coord = { x, y }

  if (!isInside(coord, size)) throw new Error(`Cell id is outside the board: ${id}`)

  return coord
}

export function isInside(coord: Coord, size: BoardSize): boolean {
  return coord.x >= 0 && coord.x < size.width && coord.y >= 0 && coord.y < size.height
}

export function allCells(size: BoardSize): readonly CellId[] {
  assertBoardSize(size)

  const cells: CellId[] = []
  for (let y = 0; y < size.height; y += 1) {
    for (let x = 0; x < size.width; x += 1) {
      cells.push(formatCellId({ x, y }, size))
    }
  }
  return cells
}

export function neighbors(
  id: CellId,
  scope: Exclude<ScopeKind, 'global'>,
  size: BoardSize,
): readonly CellId[] {
  const origin = parseCellId(id, size)
  const cells: CellId[] = []

  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      if (dx === 0 && dy === 0) continue
      if (scope === 'orthogonal' && Math.abs(dx) + Math.abs(dy) !== 1) continue

      const next = { x: origin.x + dx, y: origin.y + dy }
      if (isInside(next, size)) cells.push(formatCellId(next, size))
    }
  }

  return cells
}

export function sortCellIds(ids: Iterable<CellId>, size: BoardSize): readonly CellId[] {
  return [...ids].sort((a, b) => {
    const ca = parseCellId(a, size)
    const cb = parseCellId(b, size)
    return ca.y - cb.y || ca.x - cb.x
  })
}

function assertBoardSize(size: BoardSize): void {
  assertPositiveInteger(size.width, 'width')
  assertPositiveInteger(size.height, 'height')
}

function assertPositiveInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`Board ${name} must be a positive integer: ${value}`)
  }
}
