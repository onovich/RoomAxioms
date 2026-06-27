export type SkeletonReviewStatus = 'pass' | 'warning' | 'fail'

export type SkeletonReviewGateId =
  | 'effective-unknown-space'
  | 'opening-ambiguity'
  | 'proof-wave-depth'
  | 'deduction-count'
  | 'material-rule-families'
  | 'shared-variable-pressure'
  | 'late-frontier-unlock'
  | 'redundant-rules'
  | 'hard-degeneracy-risks'
  | 'required-claims'

export interface SkeletonReviewMetrics {
  readonly effectiveUnknownCells: number
  readonly initialGuestLayouts: number
  readonly proofWaveCount: number
  readonly deductionCount: number
  readonly materialRuleFamilyCount: number
  readonly sharedVariableGroupCount: number
  readonly lateFrontierUnlockCount: number
  readonly redundantRuleCount: number
  readonly hardDegeneracyRiskCount: number
}

export interface SkeletonReviewClaims {
  readonly openingAmbiguity: string
  readonly waveChain: string
  readonly sharedVariable: string
  readonly antiDegeneracy: string
  readonly minimizeExpectation: string
  readonly grammarMapping: string
  readonly expectedDiagnostics: string
}

export interface SkeletonReviewInput {
  readonly skeletonId: string
  readonly title?: string
  readonly metrics: SkeletonReviewMetrics
  readonly claims: SkeletonReviewClaims
}

export interface SkeletonReviewGate {
  readonly id: SkeletonReviewGateId
  readonly status: SkeletonReviewStatus
  readonly message: string
  readonly expected?: number
  readonly actual?: number
}

export interface SkeletonReviewReport {
  readonly skeletonId: string
  readonly title?: string
  readonly status: SkeletonReviewStatus
  readonly gates: readonly SkeletonReviewGate[]
  readonly missingClaimIds: readonly (keyof SkeletonReviewClaims)[]
  readonly translationRecommended: boolean
}

const TARGET_FOUR_MINIMUMS = {
  effectiveUnknownCells: 10,
  initialGuestLayouts: 2,
  preferredInitialGuestLayouts: 6,
  proofWaveCount: 4,
  deductionCount: 8,
  materialRuleFamilyCount: 3,
  sharedVariableGroupCount: 1,
  lateFrontierUnlockCount: 1,
  redundantRuleCount: 0,
  hardDegeneracyRiskCount: 0,
} as const

export function evaluateSkeletonReview(input: SkeletonReviewInput): SkeletonReviewReport {
  const gates: SkeletonReviewGate[] = [
    minimumGate({
      id: 'effective-unknown-space',
      actual: input.metrics.effectiveUnknownCells,
      expected: TARGET_FOUR_MINIMUMS.effectiveUnknownCells,
      passMessage: 'Skeleton keeps enough effective unknown cells for a real target-4 search space.',
      failMessage: 'Skeleton has too few effective unknown cells before JSON.',
    }),
    openingAmbiguityGate(input.metrics.initialGuestLayouts),
    minimumGate({
      id: 'proof-wave-depth',
      actual: input.metrics.proofWaveCount,
      expected: TARGET_FOUR_MINIMUMS.proofWaveCount,
      passMessage: 'Skeleton has the expected number of human deduction waves.',
      failMessage: 'Skeleton closes too early for a target-4 brief.',
    }),
    minimumGate({
      id: 'deduction-count',
      actual: input.metrics.deductionCount,
      expected: TARGET_FOUR_MINIMUMS.deductionCount,
      passMessage: 'Skeleton plans enough visible deductions to avoid a one-turn closure.',
      failMessage: 'Skeleton has too few planned deductions.',
    }),
    minimumGate({
      id: 'material-rule-families',
      actual: input.metrics.materialRuleFamilyCount,
      expected: TARGET_FOUR_MINIMUMS.materialRuleFamilyCount,
      passMessage: 'Skeleton uses multiple material rule families.',
      failMessage: 'Skeleton does not yet show enough material rule-family variety.',
    }),
    minimumGate({
      id: 'shared-variable-pressure',
      actual: input.metrics.sharedVariableGroupCount,
      expected: TARGET_FOUR_MINIMUMS.sharedVariableGroupCount,
      passMessage: 'Skeleton names at least one shared-variable pressure group.',
      failMessage: 'Skeleton does not identify a shared-variable group.',
    }),
    minimumGate({
      id: 'late-frontier-unlock',
      actual: input.metrics.lateFrontierUnlockCount,
      expected: TARGET_FOUR_MINIMUMS.lateFrontierUnlockCount,
      passMessage: 'Skeleton includes a frontier unlock after Wave 1.',
      failMessage: 'Skeleton lacks a late frontier unlock.',
    }),
    maximumGate({
      id: 'redundant-rules',
      actual: input.metrics.redundantRuleCount,
      expected: TARGET_FOUR_MINIMUMS.redundantRuleCount,
      passMessage: 'Skeleton expects no redundant rules after minimization.',
      failMessage: 'Skeleton already expects redundant rules.',
    }),
    maximumGate({
      id: 'hard-degeneracy-risks',
      actual: input.metrics.hardDegeneracyRiskCount,
      expected: TARGET_FOUR_MINIMUMS.hardDegeneracyRiskCount,
      passMessage: 'Skeleton names no hard degeneracy risk.',
      failMessage: 'Skeleton still has hard degeneracy risk before JSON.',
    }),
  ]
  const missingClaimIds = missingClaims(input.claims)
  gates.push({
    id: 'required-claims',
    status: missingClaimIds.length === 0 ? 'pass' : 'fail',
    message: missingClaimIds.length === 0
      ? 'Skeleton includes all required written review claims.'
      : `Skeleton is missing required written claims: ${missingClaimIds.join(', ')}.`,
  })

  const status = combinedSkeletonReviewStatus(gates)

  return {
    skeletonId: input.skeletonId,
    ...(input.title === undefined ? {} : { title: input.title }),
    status,
    gates,
    missingClaimIds,
    translationRecommended: status === 'pass',
  }
}

function openingAmbiguityGate(actual: number): SkeletonReviewGate {
  if (actual < TARGET_FOUR_MINIMUMS.initialGuestLayouts) {
    return {
      id: 'opening-ambiguity',
      status: 'fail',
      actual,
      expected: TARGET_FOUR_MINIMUMS.initialGuestLayouts,
      message: 'Opening state is already unique before any deduction wave.',
    }
  }

  if (actual < TARGET_FOUR_MINIMUMS.preferredInitialGuestLayouts) {
    return {
      id: 'opening-ambiguity',
      status: 'warning',
      actual,
      expected: TARGET_FOUR_MINIMUMS.preferredInitialGuestLayouts,
      message: 'Opening ambiguity is valid but below the preferred target-4 buffer.',
    }
  }

  return {
    id: 'opening-ambiguity',
    status: 'pass',
    actual,
    expected: TARGET_FOUR_MINIMUMS.preferredInitialGuestLayouts,
    message: 'Opening ambiguity has the preferred target-4 buffer.',
  }
}

function minimumGate(input: {
  readonly id: SkeletonReviewGateId
  readonly actual: number
  readonly expected: number
  readonly passMessage: string
  readonly failMessage: string
}): SkeletonReviewGate {
  return {
    id: input.id,
    status: input.actual >= input.expected ? 'pass' : 'fail',
    actual: input.actual,
    expected: input.expected,
    message: input.actual >= input.expected ? input.passMessage : input.failMessage,
  }
}

function maximumGate(input: {
  readonly id: SkeletonReviewGateId
  readonly actual: number
  readonly expected: number
  readonly passMessage: string
  readonly failMessage: string
}): SkeletonReviewGate {
  return {
    id: input.id,
    status: input.actual <= input.expected ? 'pass' : 'fail',
    actual: input.actual,
    expected: input.expected,
    message: input.actual <= input.expected ? input.passMessage : input.failMessage,
  }
}

function missingClaims(claims: SkeletonReviewClaims): readonly (keyof SkeletonReviewClaims)[] {
  return (Object.entries(claims) as [keyof SkeletonReviewClaims, string][])
    .filter(([, value]) => value.trim().length === 0)
    .map(([key]) => key)
}

function combinedSkeletonReviewStatus(gates: readonly SkeletonReviewGate[]): SkeletonReviewStatus {
  if (gates.some((gate) => gate.status === 'fail')) return 'fail'
  if (gates.some((gate) => gate.status === 'warning')) return 'warning'

  return 'pass'
}
