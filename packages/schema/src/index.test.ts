import { describe, expect, it } from 'vitest'
import { PUZZLE_SCHEMA_VERSION } from './index.js'

describe('schema package boundary', () => {
  it('exports the current puzzle schema version', () => {
    expect(PUZZLE_SCHEMA_VERSION).toBe(1)
  })
})
