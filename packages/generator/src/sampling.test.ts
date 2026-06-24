import { describe, expect, it } from 'vitest'
import type { RuleDefinition } from '@room-axioms/domain'

import {
  createGeneratorSeed,
  sampleTargetAndObservationPools,
  type GeneratorInputContract,
} from './index.js'

const oneGuestRule: RuleDefinition = {
  id: 'R1',
  type: 'globalCount',
  target: 'guest',
  count: { op: 'eq', value: 1 },
  presentation: {
    title: 'One guest',
    flavor: 'Exactly one guest is in this experimental room.',
  },
}

const twoGuestRule: RuleDefinition = {
  ...oneGuestRule,
  count: { op: 'eq', value: 2 },
}

function inputWithRule(rule: RuleDefinition, seed = 29): GeneratorInputContract {
  return {
    seed: createGeneratorSeed(seed),
    board: { width: 3, height: 3 },
    allowedKinds: ['empty', 'guest'],
    guestCount: 1,
    rules: [rule],
    initialRevealRange: { min: 8, max: 8 },
    caps: {
      maxAttempts: 4,
      maxNodes: 10_000,
      maxModels: 10_000,
      maxGuestLayouts: 100,
      maxAccepted: 1,
    },
    artifactPolicy: 'report-only',
  }
}

describe('target and observation sampling', () => {
  it('samples deterministic target layouts and non-guest observation pools', () => {
    const first = sampleTargetAndObservationPools(inputWithRule(oneGuestRule))
    const second = sampleTargetAndObservationPools(inputWithRule(oneGuestRule))
    const third = sampleTargetAndObservationPools(inputWithRule(oneGuestRule, 30))

    expect(first.sampled).toHaveLength(1)
    expect(first.rejected).toEqual([])
    expect(first.sampled[0]?.candidate.puzzle).toEqual(second.sampled[0]?.candidate.puzzle)
    expect(first.sampled[0]?.candidate.puzzle.target).not.toEqual(third.sampled[0]?.candidate.puzzle.target)
    expect(first.sampled[0]?.candidate.initialObservations.every((observation) => observation.kind !== 'guest')).toBe(true)
    expect(first.sampled[0]?.candidate.puzzle.initialReveals).toHaveLength(8)
    expect(first.sampled[0]?.proofNoGuess).toBe(true)
    expect(first.sampled[0]?.proofHumanExplainable).toBe(true)
    expect(first.sampled[0]?.initialGuestLayoutUnique).toBe(true)
  })

  it('records target rule failures without accepting the candidate', () => {
    const report = sampleTargetAndObservationPools(inputWithRule(twoGuestRule))

    expect(report.sampled).toEqual([])
    expect(report.rejected.map((candidate) => candidate.code)).toEqual([
      'TARGET_VIOLATES_RULES',
      'TARGET_VIOLATES_RULES',
      'TARGET_VIOLATES_RULES',
      'TARGET_VIOLATES_RULES',
    ])
    expect(report.rejected.every((candidate) => candidate.stage === 'target-rules')).toBe(true)
  })

  it('records explicit search caps as sampler failures', () => {
    const input = {
      ...inputWithRule(oneGuestRule),
      caps: {
        ...inputWithRule(oneGuestRule).caps,
        maxNodes: 0,
      },
    } satisfies GeneratorInputContract
    const report = sampleTargetAndObservationPools(input)

    expect(report.sampled).toEqual([])
    expect(report.rejected).toHaveLength(4)
    expect(report.rejected[0]).toMatchObject({
      code: 'SEARCH_CAP_REACHED',
      stage: 'target-rules',
    })
    expect(report.stats.truncated).toBe(true)
  })
})
