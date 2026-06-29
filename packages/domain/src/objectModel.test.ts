import { describe, expect, it } from 'vitest'
import {
  DEFAULT_OBJECT_TYPE_REGISTRY,
  denormalizeLegacyCellState,
  denormalizeLegacyPuzzleTarget,
  findObjectTypeByLegacyKind,
  normalizeLegacyCellKind,
  normalizePuzzleTarget,
} from './index.js'
import type { PuzzleDefinition } from './index.js'

describe('object model compatibility adapters', () => {
  it('provides default object metadata for legacy object kinds', () => {
    expect(findObjectTypeByLegacyKind(DEFAULT_OBJECT_TYPE_REGISTRY, 'bottle')?.id).toBe('bottle')
    expect(findObjectTypeByLegacyKind(DEFAULT_OBJECT_TYPE_REGISTRY, 'bin')?.label.zhHans).toBe(
      '垃圾桶',
    )
    expect(findObjectTypeByLegacyKind(DEFAULT_OBJECT_TYPE_REGISTRY, 'mirror')?.category).toBe(
      'reflector',
    )
  })

  it('normalizes legacy cell kinds into target plus object arrays', () => {
    expect(normalizeLegacyCellKind('guest')).toEqual({ target: true, objects: [] })
    expect(normalizeLegacyCellKind('empty')).toEqual({ target: false, objects: [] })
    expect(normalizeLegacyCellKind('bottle')).toEqual({ target: false, objects: ['bottle'] })
    expect(normalizeLegacyCellKind('bin')).toEqual({ target: false, objects: ['bin'] })
    expect(normalizeLegacyCellKind('mirror')).toEqual({ target: false, objects: ['mirror'] })
  })

  it('denormalizes states that fit the current legacy content model', () => {
    expect(denormalizeLegacyCellState({ target: true, objects: [] })).toBe('guest')
    expect(denormalizeLegacyCellState({ target: false, objects: [] })).toBe('empty')
    expect(denormalizeLegacyCellState({ target: false, objects: ['bin'] })).toBe('bin')
  })

  it('refuses to hide normalized states that the legacy model cannot represent', () => {
    expect(denormalizeLegacyCellState({ target: true, objects: ['mirror'] })).toBeUndefined()
    expect(denormalizeLegacyCellState({ target: false, objects: ['bin', 'mirror'] })).toBeUndefined()
    expect(denormalizeLegacyCellState({ target: false, objects: ['future-object'] })).toBeUndefined()
  })

  it('normalizes and denormalizes a puzzle target without changing legacy content', () => {
    const puzzle = {
      target: {
        A1: 'guest',
        B1: 'empty',
        C1: 'bottle',
        A2: 'bin',
        B2: 'mirror',
      },
    } satisfies Pick<PuzzleDefinition, 'target'>

    const normalized = normalizePuzzleTarget(puzzle)

    expect(normalized.A1).toEqual({ target: true, objects: [] })
    expect(normalized.C1).toEqual({ target: false, objects: ['bottle'] })
    expect(denormalizeLegacyPuzzleTarget(normalized)).toEqual(puzzle.target)
  })
})
