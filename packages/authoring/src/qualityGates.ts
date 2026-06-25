import type { ProvisionalDifficultyScore } from '@room-axioms/generator'

import type { AuthoringCaseValidationReport } from './contracts.js'

export type QualityGateCaseProfile = 'normal' | 'onboarding' | 'internal-fixture'

export type QualityGateId =
  | 'opening-ambiguity'
  | 'proof-wave'
  | 'deduction-count'
  | 'non-onboarding-trivial-closure'

export type QualityGateStatus = 'pass' | 'warning' | 'fail'

export interface QualityGatePolicy {
  readonly minInitialGuestLayouts: number
  readonly minProofWaveCount: number
  readonly minDeductionCount: number
}

export interface QualityGateInput {
  readonly validation: AuthoringCaseValidationReport
  readonly score?: ProvisionalDifficultyScore
  readonly profile?: QualityGateCaseProfile
  readonly policy?: Partial<QualityGatePolicy>
}

export interface QualityGateResult {
  readonly id: QualityGateId
  readonly status: QualityGateStatus
  readonly message: string
  readonly expected?: number
  readonly actual?: number
}

export interface QualityGateReport {
  readonly puzzleId: string
  readonly profile: QualityGateCaseProfile
  readonly status: QualityGateStatus
  readonly results: readonly QualityGateResult[]
}

const DEFAULT_QUALITY_GATE_POLICY = {
  minInitialGuestLayouts: 2,
  minProofWaveCount: 1,
  minDeductionCount: 1,
} as const satisfies QualityGatePolicy

export function evaluateCoreQualityGates(input: QualityGateInput): QualityGateReport {
  const policy = {
    ...DEFAULT_QUALITY_GATE_POLICY,
    ...input.policy,
  } satisfies QualityGatePolicy
  const profile = input.profile ?? 'normal'
  const puzzleId = input.validation.puzzleId ?? input.score?.puzzleId ?? input.validation.sourcePath
  const initialGuestLayouts = input.validation.initialGuestLayouts?.count
  const proofWaveCount = input.validation.proof?.waveCount
  const deductionCount = input.validation.proof?.deductionCount
  const results: QualityGateResult[] = [
    numericMinimumGate({
      id: 'opening-ambiguity',
      actual: initialGuestLayouts,
      expected: policy.minInitialGuestLayouts,
      passMessage: `Opening state has at least ${policy.minInitialGuestLayouts} candidate guest layouts.`,
      failMessage: 'Opening state is already uniquely solved.',
    }),
    numericMinimumGate({
      id: 'proof-wave',
      actual: proofWaveCount,
      expected: policy.minProofWaveCount,
      passMessage: `Proof uses at least ${policy.minProofWaveCount} human deduction wave.`,
      failMessage: 'Proof has no human deduction wave.',
    }),
    numericMinimumGate({
      id: 'deduction-count',
      actual: deductionCount,
      expected: policy.minDeductionCount,
      passMessage: `Proof has at least ${policy.minDeductionCount} deduction.`,
      failMessage: 'Proof has no deduction.',
    }),
    trivialClosureGate({ profile, initialGuestLayouts, proofWaveCount, deductionCount }),
  ]

  return {
    puzzleId,
    profile,
    status: combinedStatus(results),
    results,
  }
}

function numericMinimumGate(input: {
  readonly id: QualityGateId
  readonly actual?: number
  readonly expected: number
  readonly passMessage: string
  readonly failMessage: string
}): QualityGateResult {
  if (input.actual === undefined) {
    return {
      id: input.id,
      status: 'fail',
      message: 'Required authoring metric is missing.',
      expected: input.expected,
    }
  }

  const passed = input.actual >= input.expected
  return {
    id: input.id,
    status: passed ? 'pass' : 'fail',
    message: passed ? input.passMessage : input.failMessage,
    expected: input.expected,
    actual: input.actual,
  }
}

function trivialClosureGate(input: {
  readonly profile: QualityGateCaseProfile
  readonly initialGuestLayouts?: number
  readonly proofWaveCount?: number
  readonly deductionCount?: number
}): QualityGateResult {
  const trivialClosure =
    input.initialGuestLayouts === 1 &&
    input.proofWaveCount === 0 &&
    input.deductionCount === 0

  if (!trivialClosure) {
    return {
      id: 'non-onboarding-trivial-closure',
      status: 'pass',
      message: 'Case does not close at the opening state without deductions.',
    }
  }

  if (input.profile === 'internal-fixture') {
    return {
      id: 'non-onboarding-trivial-closure',
      status: 'warning',
      message: 'Opening-state closure is acceptable only because this case is marked as an internal fixture.',
      actual: input.initialGuestLayouts,
      expected: 2,
    }
  }

  return {
    id: 'non-onboarding-trivial-closure',
    status: 'fail',
    message: input.profile === 'onboarding'
      ? 'Onboarding cases still need at least two opening candidate layouts.'
      : 'Normal player-facing cases cannot close at the opening state without deductions.',
    actual: input.initialGuestLayouts,
    expected: 2,
  }
}

function combinedStatus(results: readonly QualityGateResult[]): QualityGateStatus {
  if (results.some((result) => result.status === 'fail')) return 'fail'
  if (results.some((result) => result.status === 'warning')) return 'warning'

  return 'pass'
}
