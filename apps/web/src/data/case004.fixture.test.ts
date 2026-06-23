import canonicalCase004 from '../../../../content/cases/case-004.json'
import { describe, expect, it } from 'vitest'
import { case004 } from './case004'

describe('case004 data fixture', () => {
  it('matches the canonical JSON content fixture', () => {
    expect(canonicalCase004).toEqual(case004)
  })
})
