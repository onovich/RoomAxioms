import { formatCellId, parseCellId } from '@room-axioms/domain'
import type { BoardSize, CellId } from '@room-axioms/domain'

export function nextCellForArrowKey(
  cellId: CellId,
  key: string,
  board: BoardSize,
): CellId | null {
  const delta = deltaForArrowKey(key)
  if (delta === null) return null

  const current = parseCellId(cellId, board)
  const next = {
    x: current.x + delta.x,
    y: current.y + delta.y,
  }

  if (next.x < 0 || next.x >= board.width || next.y < 0 || next.y >= board.height) {
    return null
  }

  return formatCellId(next, board)
}

function deltaForArrowKey(key: string): { readonly x: number; readonly y: number } | null {
  switch (key) {
    case 'ArrowUp':
      return { x: 0, y: -1 }
    case 'ArrowRight':
      return { x: 1, y: 0 }
    case 'ArrowDown':
      return { x: 0, y: 1 }
    case 'ArrowLeft':
      return { x: -1, y: 0 }
    default:
      return null
  }
}
