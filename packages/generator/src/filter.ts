import type { SolverStats } from '@room-axioms/solver'

import {
  GENERATOR_SPIKE_VERSION,
  type AcceptedCandidate,
  type GeneratorInputContract,
  type GeneratorPuzzleTemplate,
  type GeneratorRunReport,
  type RejectedCandidate,
} from './contract.js'
import { sampleTargetAndObservationPools } from './sampling.js'

const ACCEPTANCE_STAGES = [
  'schema',
  'target-rules',
  'initial-satisfiable',
  'proof-no-guess',
  'final-guest-layout-unique',
] as const

export function generateVerifiedCandidates(
  input: GeneratorInputContract,
  template: GeneratorPuzzleTemplate = {},
): GeneratorRunReport {
  const samplingInput = {
    ...input,
    caps: {
      ...input.caps,
      maxAccepted: input.caps.maxAttempts,
    },
  } satisfies GeneratorInputContract
  const sampling = sampleTargetAndObservationPools(samplingInput, template)
  const accepted: AcceptedCandidate[] = []
  const rejected: RejectedCandidate[] = [...sampling.rejected]

  for (const preview of sampling.sampled) {
    if (accepted.length >= input.caps.maxAccepted) break
    if (!previewQualifies(preview)) continue

    accepted.push({
      attempt: preview.attempt,
      puzzle: preview.candidate.puzzle,
      validationStages: ACCEPTANCE_STAGES,
      proof: preview.proof,
      stats: preview.stats,
    })
  }

  if (accepted.length === 0) {
    rejected.push({
      attempt: sampling.attempts,
      code: 'NO_CANDIDATE_ACCEPTED',
      stage: 'proof-no-guess',
      message: 'No sampled candidate passed every generate-verify-filter gate.',
    })
  }

  return {
    version: GENERATOR_SPIKE_VERSION,
    input,
    attempts: sampling.attempts,
    accepted,
    rejected,
    stats: sampling.stats,
    artifactPolicy: input.artifactPolicy,
  }
}

function previewQualifies(preview: {
  readonly targetSatisfiesRules: boolean
  readonly initialSatisfiable: boolean
  readonly proofNoGuess: boolean
  readonly proofHumanExplainable: boolean
  readonly proofIssueCodes: readonly string[]
  readonly proof: {
    readonly guestLayoutUniqueAtEnd: boolean
  }
  readonly stats: SolverStats
}): boolean {
  return (
    preview.targetSatisfiesRules &&
    preview.initialSatisfiable &&
    preview.proofNoGuess &&
    preview.proofHumanExplainable &&
    preview.proof.guestLayoutUniqueAtEnd &&
    preview.proofIssueCodes.length === 0 &&
    !preview.stats.truncated
  )
}
