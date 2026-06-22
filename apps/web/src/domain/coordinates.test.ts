import { describe, expect, it } from 'vitest'
import { neighbors } from './coordinates'

const size = { width: 4, height: 4 }

describe('neighborhoods', () => {
  it('keeps adjacent scope inside board edges', () => {
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

  it('keeps orthogonal scope inside board edges', () => {
    expect(neighbors('A1', 'orthogonal', size)).toEqual(['B1', 'A2'])
    expect(neighbors('B2', 'orthogonal', size)).toEqual(['B1', 'A2', 'C2', 'B3'])
  })
})

