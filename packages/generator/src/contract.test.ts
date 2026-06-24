import { describe, expect, it } from 'vitest'

import {
  GENERATOR_PACKAGE_NAME,
  GENERATOR_SPIKE_VERSION,
  type GeneratorInputContract,
} from './index.js'

describe('generator spike contract', () => {
  it('declares the package and spike version used in Phase 9 reports', () => {
    expect(GENERATOR_PACKAGE_NAME).toBe('@room-axioms/generator')
    expect(GENERATOR_SPIKE_VERSION).toBe('phase-9-spike-v1')
  })

  it('keeps generated artifacts out of shipped content by default', () => {
    const input = {
      seed: {
        algorithm: 'mulberry32',
        seed: 9,
        deterministic: true,
      },
      board: { width: 3, height: 3 },
      allowedKinds: ['empty', 'bottle', 'bin', 'guest'],
      guestCount: 1,
      rules: [],
      initialRevealRange: { min: 1, max: 3 },
      caps: {
        maxAttempts: 25,
        maxNodes: 10_000,
        maxModels: 10_000,
        maxGuestLayouts: 500,
        maxAccepted: 1,
      },
      artifactPolicy: 'report-only',
    } satisfies GeneratorInputContract

    expect(input.artifactPolicy).toBe('report-only')
    expect(input.seed.deterministic).toBe(true)
  })
})
