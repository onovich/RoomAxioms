import { describe, expect, it } from 'vitest'

import { nextCellForArrowKey } from '../keyboardNavigation'

const board = { width: 4, height: 3 } as const

describe('board keyboard navigation', () => {
  it('moves focus by arrow key within the board bounds', () => {
    expect(nextCellForArrowKey('B2', 'ArrowUp', board)).toBe('B1')
    expect(nextCellForArrowKey('B2', 'ArrowRight', board)).toBe('C2')
    expect(nextCellForArrowKey('B2', 'ArrowDown', board)).toBe('B3')
    expect(nextCellForArrowKey('B2', 'ArrowLeft', board)).toBe('A2')
  })

  it('does not wrap focus at board edges', () => {
    expect(nextCellForArrowKey('A1', 'ArrowUp', board)).toBeNull()
    expect(nextCellForArrowKey('A1', 'ArrowLeft', board)).toBeNull()
    expect(nextCellForArrowKey('D3', 'ArrowRight', board)).toBeNull()
    expect(nextCellForArrowKey('D3', 'ArrowDown', board)).toBeNull()
  })

  it('ignores non-arrow keys so Enter and Space keep their button behavior', () => {
    expect(nextCellForArrowKey('B2', 'Enter', board)).toBeNull()
    expect(nextCellForArrowKey('B2', ' ', board)).toBeNull()
  })
})
