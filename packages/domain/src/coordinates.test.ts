import { describe, expect, it } from 'vitest'
import {
  allCells,
  columnCells,
  columnsForWidth,
  formatCellId,
  lineCells,
  neighbors,
  parseCellId,
  rayCells,
  regionCells,
  rowCells,
  sortCellIds,
} from './index.js'

const size = { width: 4, height: 4 }

describe('coordinates', () => {
  it('formats and parses row-major board cells', () => {
    expect(allCells(size)).toEqual([
      'A1',
      'B1',
      'C1',
      'D1',
      'A2',
      'B2',
      'C2',
      'D2',
      'A3',
      'B3',
      'C3',
      'D3',
      'A4',
      'B4',
      'C4',
      'D4',
    ])
    expect(parseCellId('b2', size)).toEqual({ x: 1, y: 1 })
    expect(formatCellId({ x: 1, y: 1 }, size)).toBe('B2')
  })

  it('supports multi-letter columns for future board expansion', () => {
    expect(columnsForWidth(28).slice(24)).toEqual(['Y', 'Z', 'AA', 'AB'])
    expect(parseCellId('AA1', { width: 27, height: 1 })).toEqual({ x: 26, y: 0 })
    expect(formatCellId({ x: 27, y: 0 }, { width: 28, height: 1 })).toBe('AB1')
  })

  it('rejects invalid and out-of-board coordinates', () => {
    expect(() => parseCellId('A0', size)).toThrow(/Invalid cell id/)
    expect(() => parseCellId('E1', size)).toThrow(/outside the board/)
    expect(() => parseCellId('A5', size)).toThrow(/outside the board/)
    expect(() => formatCellId({ x: -1, y: 0 }, size)).toThrow(/outside the board/)
    expect(() => columnsForWidth(0)).toThrow(/positive integer/)
  })

  it('sorts cell ids by y then x in stable board order', () => {
    expect(sortCellIds(['D4', 'A2', 'B1', 'A1', 'C3'], size)).toEqual([
      'A1',
      'B1',
      'A2',
      'C3',
      'D4',
    ])
  })
})

describe('neighborhoods', () => {
  it('keeps adjacent scope inside board corners, edges, and interiors', () => {
    expect(neighbors('A1', 'adjacent', size)).toEqual(['B1', 'A2', 'B2'])
    expect(neighbors('B1', 'adjacent', size)).toEqual(['A1', 'C1', 'A2', 'B2', 'C2'])
    expect(neighbors('B2', 'adjacent', size)).toEqual([
      'A1',
      'B1',
      'C1',
      'A2',
      'C2',
      'A3',
      'B3',
      'C3',
    ])
  })

  it('keeps orthogonal scope inside board corners, edges, and interiors', () => {
    expect(neighbors('A1', 'orthogonal', size)).toEqual(['B1', 'A2'])
    expect(neighbors('B1', 'orthogonal', size)).toEqual(['A1', 'C1', 'B2'])
    expect(neighbors('B2', 'orthogonal', size)).toEqual(['B1', 'A2', 'C2', 'B3'])
  })

  it('supports directional single-cell local scopes', () => {
    expect(neighbors('B2', 'north', size)).toEqual(['B1'])
    expect(neighbors('B2', 'south', size)).toEqual(['B3'])
    expect(neighbors('B2', 'east', size)).toEqual(['C2'])
    expect(neighbors('B2', 'west', size)).toEqual(['A2'])
    expect(neighbors('A1', 'north', size)).toEqual([])
    expect(neighbors('A1', 'west', size)).toEqual([])
  })
})

describe('expressive traversal helpers', () => {
  it('collects region cells as canonical sorted unique board cells', () => {
    expect(regionCells({
      id: 'east-wing',
      title: 'East wing',
      cells: ['D2', 'b1', 'B1', 'C3'],
    }, size)).toEqual(['B1', 'D2', 'C3'])
  })

  it('collects row and column line cells by zero-based index', () => {
    expect(rowCells(1, size)).toEqual(['A2', 'B2', 'C2', 'D2'])
    expect(columnCells(2, size)).toEqual(['C1', 'C2', 'C3', 'C4'])
    expect(lineCells({ kind: 'row', index: 3 }, size)).toEqual(['A4', 'B4', 'C4', 'D4'])
    expect(lineCells({ kind: 'column', index: 0 }, size)).toEqual(['A1', 'A2', 'A3', 'A4'])
    expect(() => rowCells(4, size)).toThrow(/outside the board/)
    expect(() => columnCells(-1, size)).toThrow(/outside the board/)
  })

  it('walks directional rays and stops before blocker cells by default', () => {
    expect(rayCells('B2', 'east', size)).toEqual(['C2', 'D2'])
    expect(rayCells('B2', 'west', size)).toEqual(['A2'])
    expect(rayCells('B2', 'north', size)).toEqual(['B1'])
    expect(rayCells('B2', 'south', size)).toEqual(['B3', 'B4'])
    expect(rayCells('A2', 'east', size, { stopCells: ['C2'] })).toEqual(['B2'])
    expect(rayCells('A2', 'east', size, { stopCells: ['C2'], includeStopCell: true })).toEqual(['B2', 'C2'])
  })
})
