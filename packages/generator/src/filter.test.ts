import { describe, expect, it } from 'vitest'
import type { RuleDefinition } from '@room-axioms/domain'

import {
  createGeneratorSeed,
  generateVerifiedCandidates,
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

function generatorInput(overrides: Partial<GeneratorInputContract> = {}): GeneratorInputContract {
  return {
    seed: createGeneratorSeed(31),
    board: { width: 3, height: 3 },
    allowedKinds: ['empty', 'guest'],
    guestCount: 1,
    rules: [oneGuestRule],
    initialRevealRange: { min: 8, max: 8 },
    caps: {
      maxAttempts: 4,
      maxNodes: 10_000,
      maxModels: 10_000,
      maxGuestLayouts: 100,
      maxAccepted: 1,
    },
    artifactPolicy: 'report-only',
    ...overrides,
  }
}

describe('generate-verify-filter loop', () => {
  it('keeps only candidates that pass schema, solver, proof, and final uniqueness gates', () => {
    const report = generateVerifiedCandidates(generatorInput())

    expect(report.accepted).toHaveLength(1)
    expect(report.rejected).toEqual([])
    expect(report.accepted[0]?.validationStages).toEqual([
      'schema',
      'target-rules',
      'initial-satisfiable',
      'proof-no-guess',
      'final-guest-layout-unique',
    ])
    expect(report.accepted[0]?.proof.noGuess).toBe(true)
    expect(report.accepted[0]?.proof.humanExplainable).toBe(true)
    expect(report.accepted[0]?.proof.guestLayoutUniqueAtEnd).toBe(true)
    expect(report.artifactPolicy).toBe('report-only')
  })

  it('rejects candidates whose target conflicts with the current rules', () => {
    const report = generateVerifiedCandidates(generatorInput({
      rules: [{
        ...oneGuestRule,
        count: { op: 'eq', value: 2 },
      }],
    }))

    expect(report.accepted).toEqual([])
    expect(report.rejected.map((candidate) => candidate.code)).toContain('TARGET_VIOLATES_RULES')
    expect(report.rejected.map((candidate) => candidate.code)).toContain('NO_CANDIDATE_ACCEPTED')
  })

  it('rejects unprovable candidates instead of treating solver validity as human proof', () => {
    const report = generateVerifiedCandidates(generatorInput({
      initialRevealRange: { min: 0, max: 0 },
      caps: {
        maxAttempts: 1,
        maxNodes: 10_000,
        maxModels: 10_000,
        maxGuestLayouts: 100,
        maxAccepted: 1,
      },
    }))

    expect(report.accepted).toEqual([])
    expect(report.rejected.map((candidate) => candidate.code)).toEqual([
      'PROOF_GUESS_POINT',
      'NO_CANDIDATE_ACCEPTED',
    ])
  })
})
