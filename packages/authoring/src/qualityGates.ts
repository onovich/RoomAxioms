import {
  allCells,
  formatCellId,
  parseCellId,
  sortCellIds,
  type BoardSize,
  type CellId,
  type Coord,
  type Observation,
  type PuzzleDefinition,
  type RuleDefinition,
} from '@room-axioms/domain'
import type { ProvisionalDifficultyScore } from '@room-axioms/generator'
import { verifyNoGuess } from '@room-axioms/proof'
import type { Deduction, ProofPremise, TechniqueId, VerificationReport } from '@room-axioms/proof'
import { parsePuzzleDefinition } from '@room-axioms/schema'
import { countGuestLayouts, isSatisfiable, type SolverOptions, type SolverStats } from '@room-axioms/solver'

import type { AuthoringCaseValidationReport, AuthoringTechniqueRetentionReport } from './contracts.js'
import { reduceEffectiveBoard, type EffectiveBoardReduction } from './antiClone.js'

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

export type RuleContributionReason =
  | 'target-rejected-without-rule'
  | 'initial-layout-count-increased'
  | 'proof-fails-without-rule'
  | 'final-uniqueness-fails-without-rule'
  | 'required-technique-disappears'
  | 'solver-truncated'
  | 'no-material-change'

export type RuleContributionStatus = 'contributes' | 'redundant' | 'invalid'

export interface RuleContributionOptions {
  readonly solver?: SolverOptions
  readonly candidateLayoutCap?: number
  readonly materialLayoutIncrease?: number
  readonly requiredTechniqueIds?: readonly TechniqueId[]
}

export interface RuleContributionResult {
  readonly ruleId: string
  readonly status: RuleContributionStatus
  readonly reasons: readonly RuleContributionReason[]
  readonly baselineInitialGuestLayouts: number
  readonly withoutRuleInitialGuestLayouts?: number
  readonly withoutRuleTargetSatisfiesRules?: boolean
  readonly withoutRuleProofNoGuess?: boolean
  readonly withoutRuleHumanExplainable?: boolean
  readonly withoutRuleGuestLayoutUniqueAtEnd?: boolean
  readonly missingRequiredTechniqueIds: readonly TechniqueId[]
  readonly stats: SolverStats
}

export interface RuleContributionReport {
  readonly puzzleId: string
  readonly status: 'pass' | 'warning'
  readonly results: readonly RuleContributionResult[]
}

export type BoardTransformName =
  | 'identity'
  | 'mirror-horizontal'
  | 'mirror-vertical'
  | 'rotate-180'
  | 'rotate-90'
  | 'rotate-270'
  | 'transpose-main'
  | 'transpose-anti'

export interface PuzzleIsomorphismSignature {
  readonly puzzleId: string
  readonly canonicalSignature: string
  readonly canonicalTransform: BoardTransformName
  readonly transformSignatures: readonly PuzzleTransformSignature[]
}

export interface PuzzleTransformSignature {
  readonly transform: BoardTransformName
  readonly signature: string
}

export interface PuzzleIsomorphismGroup {
  readonly signature: string
  readonly puzzleIds: readonly string[]
  readonly members: readonly PuzzleIsomorphismSignature[]
}

export interface EffectivePuzzleIsomorphismSignature {
  readonly puzzleId: string
  readonly canonicalSignature: string
  readonly canonicalTransform: BoardTransformName
  readonly transformSignatures: readonly PuzzleTransformSignature[]
  readonly reduction: EffectiveBoardReduction
}

export interface EffectivePuzzleIsomorphismGroup {
  readonly signature: string
  readonly puzzleIds: readonly string[]
  readonly members: readonly EffectivePuzzleIsomorphismSignature[]
}

export interface ProofTraceStepFingerprint {
  readonly waveIndex: number
  readonly stepIndex: number
  readonly technique: TechniqueId
  readonly conclusionKind: Deduction['conclusion']['kind']
  readonly cellId: CellId
  readonly targetKind: string
  readonly targetKindRole: string
  readonly ruleShape: readonly string[]
  readonly kindAgnosticRuleShape: readonly string[]
  readonly premiseShape: readonly string[]
}

export interface ProofTraceTransformSignature {
  readonly transform: BoardTransformName
  readonly signature: string
  readonly kindAgnosticSignature: string
  readonly techniqueSequence: readonly TechniqueId[]
  readonly steps: readonly ProofTraceStepFingerprint[]
}

export interface ProofTraceFingerprint {
  readonly puzzleId: string
  readonly canonicalSignature: string
  readonly canonicalKindAgnosticSignature: string
  readonly canonicalTransform: BoardTransformName
  readonly techniqueSequence: readonly TechniqueId[]
  readonly steps: readonly ProofTraceStepFingerprint[]
  readonly transformSignatures: readonly ProofTraceTransformSignature[]
}

export type ProofTraceCloneMatchKind = 'exact' | 'kind-agnostic'
export type ProofTraceCloneStatus = 'hard-fail' | 'reviewer-blocking'

export interface ProofTraceCloneGroup {
  readonly signature: string
  readonly matchKind: ProofTraceCloneMatchKind
  readonly status: ProofTraceCloneStatus
  readonly puzzleIds: readonly string[]
  readonly members: readonly ProofTraceFingerprint[]
}

export interface TechniqueRetentionGateInput {
  readonly puzzleId: string
  readonly retention: AuthoringTechniqueRetentionReport
}

export interface TechniqueRetentionGateReport {
  readonly puzzleId: string
  readonly status: QualityGateStatus
  readonly message: string
  readonly beforeTechniqueIds: readonly TechniqueId[]
  readonly afterTechniqueIds: readonly TechniqueId[]
  readonly requiredTechniqueIds: readonly TechniqueId[]
  readonly missingRequiredTechniqueIds: readonly TechniqueId[]
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

export function evaluateRuleContribution(
  puzzle: PuzzleDefinition,
  options: RuleContributionOptions = {},
): RuleContributionReport {
  const solver = options.solver ?? {}
  const candidateLayoutCap = options.candidateLayoutCap ?? 1_000
  const materialLayoutIncrease = options.materialLayoutIncrease ?? 0
  const requiredTechniqueIds = options.requiredTechniqueIds ?? []
  const baselineInitial = countGuestLayouts(
    { puzzle, observations: targetObservationsForCells(puzzle, puzzle.initialReveals) },
    candidateLayoutCap,
    solver,
  )
  const baselineProof = verifyNoGuess(puzzle, { solver })
  const baselineStats = baselineProof.waves.reduce(
    (current, wave) => combineStats(current, wave.solverStats),
    baselineInitial.stats,
  )
  const baselineTechniqueIds = new Set<TechniqueId>(baselineProof.metrics.techniqueIds)
  const results = puzzle.rules.map((rule) => {
    const withoutRule = {
      ...puzzle,
      rules: puzzle.rules.filter((candidate) => candidate.id !== rule.id),
    }
    const parsed = parsePuzzleDefinition(withoutRule)
    if (!parsed.ok || parsed.puzzle === undefined) {
      return {
        ruleId: rule.id,
        status: 'invalid',
        reasons: ['target-rejected-without-rule'],
        baselineInitialGuestLayouts: baselineInitial.count,
        missingRequiredTechniqueIds: [],
        stats: baselineStats,
      } satisfies RuleContributionResult
    }

    return evaluateRuleRemoval({
      puzzle: parsed.puzzle,
      ruleId: rule.id,
      solver,
      candidateLayoutCap,
      materialLayoutIncrease,
      baselineInitialGuestLayouts: baselineInitial.count,
      baselineTechniqueIds,
      requiredTechniqueIds,
    })
  })

  return {
    puzzleId: puzzle.id,
    status: results.some((result) => result.status === 'redundant') ? 'warning' : 'pass',
    results,
  }
}

export function canonicalPuzzleIsomorphismSignature(puzzle: PuzzleDefinition): PuzzleIsomorphismSignature {
  const transformSignatures = availableBoardTransforms(puzzle.board).map((transform) => ({
    transform,
    signature: puzzleShapeSignature(puzzle, transform),
  }))
  const canonical = [...transformSignatures].sort((left, right) => (
    left.signature.localeCompare(right.signature) || left.transform.localeCompare(right.transform)
  ))[0]

  return {
    puzzleId: puzzle.id,
    canonicalSignature: canonical.signature,
    canonicalTransform: canonical.transform,
    transformSignatures,
  }
}

export function findIsomorphicPuzzleGroups(
  puzzles: readonly PuzzleDefinition[],
): readonly PuzzleIsomorphismGroup[] {
  const bySignature = new Map<string, PuzzleIsomorphismSignature[]>()
  for (const puzzle of puzzles) {
    const signature = canonicalPuzzleIsomorphismSignature(puzzle)
    const signatures = bySignature.get(signature.canonicalSignature) ?? []
    signatures.push(signature)
    bySignature.set(signature.canonicalSignature, signatures)
  }

  return [...bySignature.entries()]
    .filter(([, members]) => members.length > 1)
    .map(([signature, members]) => ({
      signature,
      puzzleIds: members.map((member) => member.puzzleId).sort(),
      members: [...members].sort((left, right) => left.puzzleId.localeCompare(right.puzzleId)),
    }))
    .sort((left, right) => left.puzzleIds[0].localeCompare(right.puzzleIds[0]))
}

export function canonicalEffectivePuzzleIsomorphismSignature(
  puzzle: PuzzleDefinition,
): EffectivePuzzleIsomorphismSignature {
  const reduction = reduceEffectiveBoard(puzzle)
  const transformSignatures = availableBoardTransforms(reduction.effectiveBoard).map((transform) => ({
    transform,
    signature: effectivePuzzleShapeSignature(puzzle, reduction, transform),
  }))
  const canonical = [...transformSignatures].sort((left, right) => (
    left.signature.localeCompare(right.signature) || left.transform.localeCompare(right.transform)
  ))[0]

  return {
    puzzleId: puzzle.id,
    canonicalSignature: canonical.signature,
    canonicalTransform: canonical.transform,
    transformSignatures,
    reduction,
  }
}

export function findEffectiveIsomorphicPuzzleGroups(
  puzzles: readonly PuzzleDefinition[],
): readonly EffectivePuzzleIsomorphismGroup[] {
  const bySignature = new Map<string, EffectivePuzzleIsomorphismSignature[]>()
  for (const puzzle of puzzles) {
    const signature = canonicalEffectivePuzzleIsomorphismSignature(puzzle)
    const signatures = bySignature.get(signature.canonicalSignature) ?? []
    signatures.push(signature)
    bySignature.set(signature.canonicalSignature, signatures)
  }

  return [...bySignature.entries()]
    .filter(([, members]) => members.length > 1)
    .map(([signature, members]) => ({
      signature,
      puzzleIds: members.map((member) => member.puzzleId).sort(),
      members: [...members].sort((left, right) => left.puzzleId.localeCompare(right.puzzleId)),
    }))
    .sort((left, right) => left.puzzleIds[0].localeCompare(right.puzzleIds[0]))
}

export function proofTraceFingerprint(puzzle: PuzzleDefinition): ProofTraceFingerprint {
  const reduction = reduceEffectiveBoard(puzzle)
  const proof = verifyNoGuess(puzzle)
  const transformSignatures = availableBoardTransforms(reduction.effectiveBoard).map((transform) => (
    proofTraceTransformSignature(puzzle, proof, reduction, transform)
  ))
  const canonical = [...transformSignatures].sort((left, right) => (
    left.signature.localeCompare(right.signature) || left.transform.localeCompare(right.transform)
  ))[0]

  return {
    puzzleId: puzzle.id,
    canonicalSignature: canonical.signature,
    canonicalKindAgnosticSignature: canonical.kindAgnosticSignature,
    canonicalTransform: canonical.transform,
    techniqueSequence: canonical.techniqueSequence,
    steps: canonical.steps,
    transformSignatures,
  }
}

export function findProofTraceCloneGroups(
  puzzles: readonly PuzzleDefinition[],
): readonly ProofTraceCloneGroup[] {
  const fingerprints = puzzles.map(proofTraceFingerprint)
  const exactGroups = proofTraceGroupsBySignature({
    fingerprints,
    matchKind: 'exact',
    status: 'hard-fail',
    signatureOf: (fingerprint) => fingerprint.canonicalSignature,
  })
  const exactPuzzleSets = new Set(exactGroups.map((group) => group.puzzleIds.join('|')))
  const kindAgnosticGroups = proofTraceGroupsBySignature({
    fingerprints,
    matchKind: 'kind-agnostic',
    status: 'reviewer-blocking',
    signatureOf: (fingerprint) => fingerprint.canonicalKindAgnosticSignature,
  }).filter((group) => !exactPuzzleSets.has(group.puzzleIds.join('|')))

  return [...exactGroups, ...kindAgnosticGroups]
    .sort((left, right) => (
      left.status.localeCompare(right.status) ||
      left.matchKind.localeCompare(right.matchKind) ||
      left.puzzleIds[0].localeCompare(right.puzzleIds[0])
    ))
}

export function evaluateTechniqueRetentionGate(
  input: TechniqueRetentionGateInput,
): TechniqueRetentionGateReport {
  const { retention } = input
  if (retention.requiredTechniqueIds.length === 0) {
    return {
      puzzleId: input.puzzleId,
      status: 'warning',
      message: 'No proof techniques were required for retention.',
      beforeTechniqueIds: retention.beforeTechniqueIds,
      afterTechniqueIds: retention.afterTechniqueIds,
      requiredTechniqueIds: [],
      missingRequiredTechniqueIds: [],
    }
  }

  const missingRequiredTechniqueIds = retention.missingRequiredTechniqueIds
  return {
    puzzleId: input.puzzleId,
    status: missingRequiredTechniqueIds.length === 0 ? 'pass' : 'fail',
    message: missingRequiredTechniqueIds.length === 0
      ? 'All required proof techniques were retained after minimization.'
      : `Required proof techniques were lost after minimization: ${missingRequiredTechniqueIds.join(', ')}.`,
    beforeTechniqueIds: retention.beforeTechniqueIds,
    afterTechniqueIds: retention.afterTechniqueIds,
    requiredTechniqueIds: retention.requiredTechniqueIds,
    missingRequiredTechniqueIds,
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

function evaluateRuleRemoval(input: {
  readonly puzzle: PuzzleDefinition
  readonly ruleId: string
  readonly solver: SolverOptions
  readonly candidateLayoutCap: number
  readonly materialLayoutIncrease: number
  readonly baselineInitialGuestLayouts: number
  readonly baselineTechniqueIds: ReadonlySet<TechniqueId>
  readonly requiredTechniqueIds: readonly TechniqueId[]
}): RuleContributionResult {
  const targetCheck = isSatisfiable(
    { puzzle: input.puzzle, observations: targetObservationsForCells(input.puzzle, allCells(input.puzzle.board)) },
    [],
    input.solver,
  )
  const initialLayouts = countGuestLayouts(
    { puzzle: input.puzzle, observations: targetObservationsForCells(input.puzzle, input.puzzle.initialReveals) },
    input.candidateLayoutCap,
    input.solver,
  )
  const proof = verifyNoGuess(input.puzzle, { solver: input.solver })
  const proofStats = proof.waves.reduce(
    (current, wave) => combineStats(current, wave.solverStats),
    zeroStats(),
  )
  const stats = combineStats(combineStats(targetCheck.stats, initialLayouts.stats), proofStats)
  const withoutRuleTechniqueIds = new Set<TechniqueId>(proof.metrics.techniqueIds)
  const missingRequiredTechniqueIds = input.requiredTechniqueIds.filter((techniqueId) => (
    input.baselineTechniqueIds.has(techniqueId) && !withoutRuleTechniqueIds.has(techniqueId)
  ))
  const reasons: RuleContributionReason[] = []

  if (stats.truncated) reasons.push('solver-truncated')
  if (!targetCheck.satisfiable) reasons.push('target-rejected-without-rule')
  if (initialLayouts.count > input.baselineInitialGuestLayouts + input.materialLayoutIncrease) {
    reasons.push('initial-layout-count-increased')
  }
  if (!proof.noGuess || !proof.humanExplainable) reasons.push('proof-fails-without-rule')
  if (!proof.guestLayoutUniqueAtEnd) reasons.push('final-uniqueness-fails-without-rule')
  if (missingRequiredTechniqueIds.length > 0) reasons.push('required-technique-disappears')

  return {
    ruleId: input.ruleId,
    status: reasons.length === 0 ? 'redundant' : 'contributes',
    reasons: reasons.length === 0 ? ['no-material-change'] : reasons,
    baselineInitialGuestLayouts: input.baselineInitialGuestLayouts,
    withoutRuleInitialGuestLayouts: initialLayouts.count,
    withoutRuleTargetSatisfiesRules: targetCheck.satisfiable && !targetCheck.stats.truncated,
    withoutRuleProofNoGuess: proof.noGuess,
    withoutRuleHumanExplainable: proof.humanExplainable,
    withoutRuleGuestLayoutUniqueAtEnd: proof.guestLayoutUniqueAtEnd,
    missingRequiredTechniqueIds,
    stats,
  }
}

function targetObservationsForCells(
  puzzle: PuzzleDefinition,
  cellIds: readonly CellId[],
): readonly Observation[] {
  return cellIds.map((cellId) => ({
    cellId,
    kind: puzzle.target[cellId],
  }))
}

function combineStats(left: SolverStats, right: SolverStats): SolverStats {
  return {
    nodeCount: left.nodeCount + right.nodeCount,
    propagationCount: left.propagationCount + right.propagationCount,
    truncated: left.truncated || right.truncated,
  }
}

function zeroStats(): SolverStats {
  return {
    nodeCount: 0,
    propagationCount: 0,
    truncated: false,
  }
}

function puzzleShapeSignature(puzzle: PuzzleDefinition, transform: BoardTransformName): string {
  return JSON.stringify({
    schemaVersion: puzzle.schemaVersion,
    board: puzzle.board,
    allowedKinds: [...puzzle.allowedKinds].sort(),
    rules: puzzle.rules.map(ruleSignature).sort(),
    initialReveals: transformedSortedCells(puzzle.initialReveals, puzzle.board, transform),
    target: transformedTargetSignature(puzzle, transform),
  })
}

function effectivePuzzleShapeSignature(
  puzzle: PuzzleDefinition,
  reduction: EffectiveBoardReduction,
  transform: BoardTransformName,
): string {
  return JSON.stringify({
    schemaVersion: puzzle.schemaVersion,
    board: reduction.effectiveBoard,
    allowedKinds: [...puzzle.allowedKinds].sort(),
    rules: puzzle.rules.map(ruleSignature).sort(),
    initialReveals: transformedSortedCells(
      normalizedEffectiveInitialReveals(puzzle, reduction),
      reduction.effectiveBoard,
      transform,
    ),
    target: transformedEffectiveTargetSignature(reduction, transform),
  })
}

function ruleSignature(rule: RuleDefinition): string {
  if (rule.type === 'globalCount') {
    return JSON.stringify({
      type: rule.type,
      target: rule.target,
      count: rule.count,
    })
  }

  return JSON.stringify({
    type: rule.type,
    subject: rule.subject,
    scope: rule.scope.kind,
    target: rule.target,
    count: rule.count,
  })
}

function transformedTargetSignature(
  puzzle: PuzzleDefinition,
  transform: BoardTransformName,
): readonly string[] {
  const transformed = new Map<CellId, string>()
  for (const cellId of allCells(puzzle.board)) {
    transformed.set(transformCellId(cellId, puzzle.board, transform), puzzle.target[cellId])
  }

  return sortCellIds(transformed.keys(), puzzle.board).map((cellId) => (
    `${cellId}:${transformed.get(cellId) ?? 'unknown'}`
  ))
}

function transformedEffectiveTargetSignature(
  reduction: EffectiveBoardReduction,
  transform: BoardTransformName,
): readonly string[] {
  const transformed = new Map<CellId, string>()
  for (const cell of reduction.cells) {
    transformed.set(
      transformCellId(cell.normalizedCellId, reduction.effectiveBoard, transform),
      cell.targetKind,
    )
  }

  return sortCellIds(transformed.keys(), reduction.effectiveBoard).map((cellId) => (
    `${cellId}:${transformed.get(cellId) ?? 'unknown'}`
  ))
}

function normalizedEffectiveInitialReveals(
  puzzle: PuzzleDefinition,
  reduction: EffectiveBoardReduction,
): readonly CellId[] {
  const normalizedByOriginal = new Map(
    reduction.cells.map((cell) => [cell.cellId, cell.normalizedCellId] as const),
  )

  return puzzle.initialReveals
    .map((cellId) => normalizedByOriginal.get(cellId))
    .filter(isDefined)
}

function proofTraceGroupsBySignature(input: {
  readonly fingerprints: readonly ProofTraceFingerprint[]
  readonly matchKind: ProofTraceCloneMatchKind
  readonly status: ProofTraceCloneStatus
  readonly signatureOf: (fingerprint: ProofTraceFingerprint) => string
}): readonly ProofTraceCloneGroup[] {
  const bySignature = new Map<string, ProofTraceFingerprint[]>()
  for (const fingerprint of input.fingerprints) {
    const signature = input.signatureOf(fingerprint)
    const members = bySignature.get(signature) ?? []
    members.push(fingerprint)
    bySignature.set(signature, members)
  }

  return [...bySignature.entries()]
    .filter(([, members]) => members.length > 1)
    .map(([signature, members]) => ({
      signature,
      matchKind: input.matchKind,
      status: input.status,
      puzzleIds: members.map((member) => member.puzzleId).sort(),
      members: [...members].sort((left, right) => left.puzzleId.localeCompare(right.puzzleId)),
    }))
}

function proofTraceTransformSignature(
  puzzle: PuzzleDefinition,
  proof: VerificationReport,
  reduction: EffectiveBoardReduction,
  transform: BoardTransformName,
): ProofTraceTransformSignature {
  const steps = proofTraceSteps(puzzle, proof, reduction, transform)
  const techniqueSequence = steps.map((step) => step.technique)

  return {
    transform,
    signature: JSON.stringify({
      steps: steps.map((step) => ({
        waveIndex: step.waveIndex,
        stepIndex: step.stepIndex,
        technique: step.technique,
        conclusionKind: step.conclusionKind,
        cellId: step.cellId,
        targetKind: step.targetKind,
        ruleShape: step.ruleShape,
        premiseShape: step.premiseShape,
      })),
    }),
    kindAgnosticSignature: JSON.stringify({
      steps: steps.map((step) => ({
        waveIndex: step.waveIndex,
        stepIndex: step.stepIndex,
        technique: step.technique,
        conclusionKind: step.conclusionKind,
        cellId: step.cellId,
        targetKindRole: step.targetKindRole,
        ruleShape: step.kindAgnosticRuleShape,
        premiseShape: step.premiseShape,
      })),
    }),
    techniqueSequence,
    steps,
  }
}

function proofTraceSteps(
  puzzle: PuzzleDefinition,
  proof: VerificationReport,
  reduction: EffectiveBoardReduction,
  transform: BoardTransformName,
): readonly ProofTraceStepFingerprint[] {
  const ruleById = new Map(puzzle.rules.map((rule) => [rule.id, rule] as const))
  const normalizedByOriginal = new Map(
    reduction.cells.map((cell) => [cell.cellId, cell.normalizedCellId] as const),
  )
  const steps: ProofTraceStepFingerprint[] = []
  let stepIndex = 0

  for (const wave of proof.waves) {
    for (const deduction of wave.deductions) {
      const cellId = transformedEffectiveCellId(
        deduction.conclusion.cellId,
        normalizedByOriginal,
        reduction.effectiveBoard,
        transform,
      )
      if (cellId === undefined) {
        throw new Error(`Proof conclusion ${deduction.conclusion.cellId} is outside the effective board.`)
      }
      const targetKind = deductionTargetKind(puzzle, deduction, wave.revealed)
      const ruleShape = deduction.ruleIds
        .map((ruleId) => ruleById.get(ruleId))
        .filter(isDefined)
        .map((rule) => ruleTraceShape(rule, 'exact'))
        .sort()
      const kindAgnosticRuleShape = deduction.ruleIds
        .map((ruleId) => ruleById.get(ruleId))
        .filter(isDefined)
        .map((rule) => ruleTraceShape(rule, 'kind-agnostic'))
        .sort()

      steps.push({
        waveIndex: wave.index,
        stepIndex,
        technique: deduction.technique,
        conclusionKind: deduction.conclusion.kind,
        cellId,
        targetKind,
        targetKindRole: traceKind(targetKind, 'kind-agnostic'),
        ruleShape,
        kindAgnosticRuleShape,
        premiseShape: deduction.premises
          .map((premise) => premiseTraceShape({
            premise,
            ruleById,
            normalizedByOriginal,
            board: reduction.effectiveBoard,
            transform,
            conclusionCellId: cellId,
          }))
          .sort(),
      })
      stepIndex += 1
    }
  }

  return steps
}

function deductionTargetKind(
  puzzle: PuzzleDefinition,
  deduction: Deduction,
  revealed: readonly Observation[],
): string {
  if (deduction.conclusion.kind === 'guest') return 'guest'
  if (deduction.conclusion.kind === 'object') return deduction.conclusion.object

  return revealed.find((observation) => observation.cellId === deduction.conclusion.cellId)?.kind
    ?? puzzle.target[deduction.conclusion.cellId]
    ?? 'unknown'
}

function premiseTraceShape(input: {
  readonly premise: ProofPremise
  readonly ruleById: ReadonlyMap<string, RuleDefinition>
  readonly normalizedByOriginal: ReadonlyMap<CellId, CellId>
  readonly board: BoardSize
  readonly transform: BoardTransformName
  readonly conclusionCellId: CellId
}): string {
  const rules = (input.premise.ruleIds ?? [])
    .map((ruleId) => input.ruleById.get(ruleId))
    .filter(isDefined)
    .map((rule) => ruleTraceShape(rule, 'kind-agnostic'))
    .sort()
  const cellOffsets = input.premise.kind === 'count'
    ? []
    : relativePremiseCellShape({
      cellIds: input.premise.cellIds ?? [],
      normalizedByOriginal: input.normalizedByOriginal,
      board: input.board,
      transform: input.transform,
      conclusionCellId: input.conclusionCellId,
    })

  return JSON.stringify({
    kind: input.premise.kind,
    rules,
    cellOffsets,
  })
}

function relativePremiseCellShape(input: {
  readonly cellIds: readonly CellId[]
  readonly normalizedByOriginal: ReadonlyMap<CellId, CellId>
  readonly board: BoardSize
  readonly transform: BoardTransformName
  readonly conclusionCellId: CellId
}): readonly string[] {
  const conclusion = parseCellId(input.conclusionCellId, input.board)

  return input.cellIds
    .map((cellId) => transformedEffectiveCellId(
      cellId,
      input.normalizedByOriginal,
      input.board,
      input.transform,
    ))
    .filter(isDefined)
    .map((cellId) => {
      const coord = parseCellId(cellId, input.board)
      return `${coord.x - conclusion.x},${coord.y - conclusion.y}`
    })
    .sort()
}

function transformedEffectiveCellId(
  cellId: CellId,
  normalizedByOriginal: ReadonlyMap<CellId, CellId>,
  board: BoardSize,
  transform: BoardTransformName,
): CellId | undefined {
  const normalized = normalizedByOriginal.get(cellId)
  if (normalized === undefined) return undefined

  return transformCellId(normalized, board, transform)
}

function ruleTraceShape(rule: RuleDefinition, mode: 'exact' | 'kind-agnostic'): string {
  if (rule.type === 'globalCount') {
    return JSON.stringify({
      type: rule.type,
      target: traceKind(rule.target, mode),
      count: rule.count,
    })
  }

  return JSON.stringify({
    type: rule.type,
    subject: traceKind(rule.subject, mode),
    scope: rule.scope.kind,
    target: traceKind(rule.target, mode),
    count: rule.count,
  })
}

function traceKind(kind: string, mode: 'exact' | 'kind-agnostic'): string {
  if (mode === 'exact') return kind
  if (kind === 'guest' || kind === 'empty' || kind === 'unknown') return kind

  return 'object'
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined
}

function transformedSortedCells(
  cellIds: readonly CellId[],
  size: BoardSize,
  transform: BoardTransformName,
): readonly CellId[] {
  return sortCellIds(cellIds.map((cellId) => transformCellId(cellId, size, transform)), size)
}

function transformCellId(cellId: CellId, size: BoardSize, transform: BoardTransformName): CellId {
  return formatCellId(transformCoord(parseCellId(cellId, size), size, transform), size)
}

function transformCoord(coord: Coord, size: BoardSize, transform: BoardTransformName): Coord {
  switch (transform) {
    case 'identity':
      return coord
    case 'mirror-horizontal':
      return { x: size.width - 1 - coord.x, y: coord.y }
    case 'mirror-vertical':
      return { x: coord.x, y: size.height - 1 - coord.y }
    case 'rotate-180':
      return { x: size.width - 1 - coord.x, y: size.height - 1 - coord.y }
    case 'rotate-90':
      return { x: size.width - 1 - coord.y, y: coord.x }
    case 'rotate-270':
      return { x: coord.y, y: size.height - 1 - coord.x }
    case 'transpose-main':
      return { x: coord.y, y: coord.x }
    case 'transpose-anti':
      return { x: size.width - 1 - coord.y, y: size.height - 1 - coord.x }
  }
}

function availableBoardTransforms(size: BoardSize): readonly BoardTransformName[] {
  const transforms: BoardTransformName[] = [
    'identity',
    'mirror-horizontal',
    'mirror-vertical',
    'rotate-180',
  ]

  if (size.width === size.height) {
    transforms.push('rotate-90', 'rotate-270', 'transpose-main', 'transpose-anti')
  }

  return transforms
}
