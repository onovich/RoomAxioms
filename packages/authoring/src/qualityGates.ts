import {
  allCells,
  formatCellId,
  lineCells,
  parseCellId,
  rayCells,
  regionCells,
  sortCellIds,
  type BoardSize,
  type CellId,
  type CellKind,
  type Comparator,
  type CountScopeRef,
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

export type DegeneracyGateStatus = 'pass' | 'warning' | 'fail'
export type DegeneracyScopeKind =
  | 'region'
  | 'line'
  | 'scope-overlap'
  | 'conditional-condition'
  | 'conditional-then'
  | 'comparative-left'
  | 'comparative-right'
  | 'comparative'
export type DegeneracyReason =
  | 'singleton-effective-scope'
  | 'direct-count-giveaway'
  | 'near-count-giveaway'
  | 'trivial-same-scope-comparison'

export interface DegeneracyGateOptions {
  readonly nearGiveawaySlack?: number
}

export interface DegeneracyGateResult {
  readonly ruleId: string
  readonly ruleType: 'regionCount' | 'lineCount' | 'scopeOverlapCount' | 'conditionalCount' | 'comparativeCount'
  readonly scopeKind: DegeneracyScopeKind
  readonly status: DegeneracyGateStatus
  readonly reasons: readonly DegeneracyReason[]
  readonly scopeCellCount: number
  readonly unknownCellCount: number
  readonly observedTargetCount: number
  readonly requiredTargetCount: number
  readonly message: string
}

export interface DegeneracyGateReport {
  readonly puzzleId: string
  readonly status: DegeneracyGateStatus
  readonly results: readonly DegeneracyGateResult[]
}

export type MaterialRuleFamily =
  | 'global'
  | 'region'
  | 'line'
  | 'anchor'
  | 'foreach'
  | 'record-set'
  | 'scope-overlap'
  | 'comparative'
  | 'conditional'

export type RuleFamilyDiversityReason =
  | 'no-material-rule'
  | 'single-material-family'
  | 'insufficient-material-families'
  | 'redundant-rules'
  | 'solver-truncated'

export interface RuleFamilyDiversityOptions extends RuleContributionOptions {
  readonly minMaterialFamilies?: number
}

export interface RuleFamilyDiversityEntry {
  readonly ruleId: string
  readonly ruleType: RuleDefinition['type']
  readonly family: MaterialRuleFamily
  readonly status: RuleImpactVectorStatus
}

export interface RuleFamilyDiversityReport {
  readonly puzzleId: string
  readonly status: QualityGateStatus
  readonly minMaterialFamilies: number
  readonly materialFamilyCount: number
  readonly materialFamilies: readonly MaterialRuleFamily[]
  readonly materialRuleIds: readonly string[]
  readonly redundantRuleIds: readonly string[]
  readonly reasons: readonly RuleFamilyDiversityReason[]
  readonly entries: readonly RuleFamilyDiversityEntry[]
  readonly message: string
}

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

export type RuleImpactVectorStatus = 'material' | 'redundant' | 'invalid'

export interface RuleImpactVectorEntry {
  readonly ruleId: string
  readonly ruleShape: string
  readonly status: RuleImpactVectorStatus
  readonly openingGuestLayoutDelta?: number
  readonly proofWaveDelta?: number
  readonly proofDeductionDelta?: number
  readonly baselineInitialGuestLayouts: number
  readonly withoutRuleInitialGuestLayouts?: number
  readonly baselineGuestLayoutUniqueAtEnd: boolean
  readonly withoutRuleGuestLayoutUniqueAtEnd?: boolean
  readonly baselineTargetSatisfiesRules: boolean
  readonly withoutRuleTargetSatisfiesRules?: boolean
  readonly baselineInitialSatisfiable: boolean
  readonly withoutRuleInitialSatisfiable?: boolean
  readonly lostTechniqueIds: readonly TechniqueId[]
  readonly gainedTechniqueIds: readonly TechniqueId[]
  readonly stats: SolverStats
}

export interface RuleImpactVectorReport {
  readonly puzzleId: string
  readonly status: 'pass' | 'warning'
  readonly entries: readonly RuleImpactVectorEntry[]
}

export interface RuleImpactVectorSignature {
  readonly puzzleId: string
  readonly signature: string
  readonly report: RuleImpactVectorReport
}

export interface RuleImpactCloneGroup {
  readonly signature: string
  readonly status: 'reviewer-blocking'
  readonly puzzleIds: readonly string[]
  readonly members: readonly RuleImpactVectorSignature[]
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

export interface CandidateShrinkCheckpoint {
  readonly label: 'opening' | 'wave' | 'final'
  readonly waveIndex?: number
  readonly guestLayoutCount: number
  readonly greaterThan?: number
  readonly unique: boolean
}

export interface CandidateShrinkSignature {
  readonly puzzleId: string
  readonly signature: string
  readonly techniqueSequence: readonly TechniqueId[]
  readonly checkpoints: readonly CandidateShrinkCheckpoint[]
  readonly stats: SolverStats
}

export interface CandidateShrinkCloneGroup {
  readonly signature: string
  readonly status: 'reviewer-blocking'
  readonly puzzleIds: readonly string[]
  readonly members: readonly CandidateShrinkSignature[]
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

export function evaluateDegeneracyGates(
  puzzle: PuzzleDefinition,
  options: DegeneracyGateOptions = {},
): DegeneracyGateReport {
  const nearGiveawaySlack = options.nearGiveawaySlack ?? 1
  const results = puzzle.rules
    .flatMap((rule) => {
      if (rule.type === 'regionCount') {
        const region = puzzle.regions?.find((candidate) => candidate.id === rule.regionId)
        if (region === undefined) return []

        return [scopeDegeneracyResult({
          puzzle,
          ruleId: rule.id,
          ruleType: rule.type,
          scopeKind: 'region',
          scopeCells: regionCells(region, puzzle.board),
          target: rule.target,
          count: rule.count,
          nearGiveawaySlack,
        })]
      }

      if (rule.type === 'lineCount') {
        const scopeCells = lineCountScopeCells(puzzle, rule)
        if (scopeCells === undefined) return []

        return [scopeDegeneracyResult({
          puzzle,
          ruleId: rule.id,
          ruleType: rule.type,
          scopeKind: 'line',
          scopeCells,
          target: rule.target,
          count: rule.count,
          nearGiveawaySlack,
        })]
      }

      if (rule.type === 'scopeOverlapCount') {
        return [scopeDegeneracyResult({
          puzzle,
          ruleId: rule.id,
          ruleType: rule.type,
          scopeKind: 'scope-overlap',
          scopeCells: scopeOverlapCells(puzzle, rule),
          target: rule.target,
          count: rule.count,
          nearGiveawaySlack,
        })]
      }

      if (rule.type === 'conditionalCount') {
        return [
          scopeDegeneracyResult({
            puzzle,
            ruleId: rule.id,
            ruleType: rule.type,
            scopeKind: 'conditional-condition',
            scopeCells: countScopeCells(puzzle, rule.condition.scope) ?? [],
            target: rule.condition.target,
            count: rule.condition.count,
            nearGiveawaySlack,
          }),
          scopeDegeneracyResult({
            puzzle,
            ruleId: rule.id,
            ruleType: rule.type,
            scopeKind: 'conditional-then',
            scopeCells: countScopeCells(puzzle, rule.then.scope) ?? [],
            target: rule.then.target,
            count: rule.then.count,
            nearGiveawaySlack,
          }),
        ]
      }

      if (rule.type === 'comparativeCount') {
        const comparativeResults: DegeneracyGateResult[] = []
        const leftScopeCells = countScopeCells(puzzle, rule.left)
        if (leftScopeCells !== undefined) {
          comparativeResults.push(comparativeScopeDegeneracyResult({
            puzzle,
            ruleId: rule.id,
            scopeKind: 'comparative-left',
            scopeCells: leftScopeCells,
          }))
        }
        const rightScopeCells = countScopeCells(puzzle, rule.right)
        if (rightScopeCells !== undefined) {
          comparativeResults.push(comparativeScopeDegeneracyResult({
            puzzle,
            ruleId: rule.id,
            scopeKind: 'comparative-right',
            scopeCells: rightScopeCells,
          }))
        }
        if (countScopeSignature(rule.left) === countScopeSignature(rule.right) && (rule.comparison.offset ?? 0) === 0) {
          comparativeResults.push(trivialComparativeDegeneracyResult(rule.id))
        }

        return comparativeResults
      }

      return []
    })

  return {
    puzzleId: puzzle.id,
    status: combinedDegeneracyStatus(results),
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

export function evaluateRuleImpactVector(
  puzzle: PuzzleDefinition,
  options: RuleContributionOptions = {},
): RuleImpactVectorReport {
  const solver = options.solver ?? {}
  const candidateLayoutCap = options.candidateLayoutCap ?? 1_000
  const baseline = ruleImpactBaseline(puzzle, candidateLayoutCap, solver)
  const entries = puzzle.rules.map((rule) => {
    const withoutRule = {
      ...puzzle,
      rules: puzzle.rules.filter((candidate) => candidate.id !== rule.id),
    }
    const parsed = parsePuzzleDefinition(withoutRule)
    if (!parsed.ok || parsed.puzzle === undefined) {
      return {
        ruleId: rule.id,
        ruleShape: ruleTraceShape(rule, 'kind-agnostic'),
        status: 'invalid',
        baselineInitialGuestLayouts: baseline.initialGuestLayouts,
        baselineGuestLayoutUniqueAtEnd: baseline.proof.guestLayoutUniqueAtEnd,
        baselineTargetSatisfiesRules: baseline.targetSatisfiesRules,
        baselineInitialSatisfiable: baseline.initialSatisfiable,
        lostTechniqueIds: [],
        gainedTechniqueIds: [],
        stats: baseline.stats,
      } satisfies RuleImpactVectorEntry
    }

    return ruleImpactEntry({
      rule,
      baseline,
      withoutRule: parsed.puzzle,
      candidateLayoutCap,
      solver,
    })
  })

  return {
    puzzleId: puzzle.id,
    status: entries.some((entry) => entry.status === 'redundant') ? 'warning' : 'pass',
    entries,
  }
}

export function evaluateRuleFamilyDiversityGate(
  puzzle: PuzzleDefinition,
  options: RuleFamilyDiversityOptions = {},
): RuleFamilyDiversityReport {
  const minMaterialFamilies = options.minMaterialFamilies ?? 2
  const report = evaluateRuleImpactVector(puzzle, options)
  const ruleById = new Map(puzzle.rules.map((rule) => [rule.id, rule]))
  const entries = report.entries
    .map((entry) => {
      const rule = ruleById.get(entry.ruleId)
      if (rule === undefined) return undefined

      return {
        ruleId: entry.ruleId,
        ruleType: rule.type,
        family: materialRuleFamily(rule),
        status: entry.status === 'invalid' ? 'material' : entry.status,
      } satisfies RuleFamilyDiversityEntry
    })
    .filter(isDefined)
  const materialEntries = entries.filter((entry) => entry.status === 'material')
  const materialFamilies = [...new Set(materialEntries.map((entry) => entry.family))].sort()
  const materialRuleIds = materialEntries.map((entry) => entry.ruleId).sort()
  const redundantRuleIds = entries
    .filter((entry) => entry.status === 'redundant')
    .map((entry) => entry.ruleId)
    .sort()
  const reasons: RuleFamilyDiversityReason[] = []

  if (materialFamilies.length === 0) {
    reasons.push('no-material-rule')
  } else if (materialFamilies.length === 1) {
    reasons.push('single-material-family')
  } else if (materialFamilies.length < minMaterialFamilies) {
    reasons.push('insufficient-material-families')
  }
  if (redundantRuleIds.length > 0) reasons.push('redundant-rules')
  if (report.entries.some((entry) => entry.stats.truncated)) reasons.push('solver-truncated')

  const hardReasons = new Set<RuleFamilyDiversityReason>([
    'no-material-rule',
    'single-material-family',
    'insufficient-material-families',
  ])
  const status: QualityGateStatus = reasons.some((reason) => hardReasons.has(reason))
    ? 'fail'
    : reasons.length > 0
      ? 'warning'
      : 'pass'

  return {
    puzzleId: puzzle.id,
    status,
    minMaterialFamilies,
    materialFamilyCount: materialFamilies.length,
    materialFamilies,
    materialRuleIds,
    redundantRuleIds,
    reasons,
    entries,
    message: ruleFamilyDiversityMessage(status, materialFamilies.length, minMaterialFamilies, redundantRuleIds.length),
  }
}

export function ruleImpactVectorSignature(
  puzzle: PuzzleDefinition,
  options: RuleContributionOptions = {},
): RuleImpactVectorSignature {
  const report = evaluateRuleImpactVector(puzzle, options)

  return {
    puzzleId: puzzle.id,
    signature: JSON.stringify({
      entries: report.entries
        .map((entry) => ({
          ruleShape: entry.ruleShape,
          status: entry.status,
          openingGuestLayoutDelta: entry.openingGuestLayoutDelta,
          proofWaveDelta: entry.proofWaveDelta,
          proofDeductionDelta: entry.proofDeductionDelta,
          guestLayoutUniqueChanged:
            entry.baselineGuestLayoutUniqueAtEnd !== entry.withoutRuleGuestLayoutUniqueAtEnd,
          targetSatisfiesRulesChanged:
            entry.baselineTargetSatisfiesRules !== entry.withoutRuleTargetSatisfiesRules,
          initialSatisfiableChanged:
            entry.baselineInitialSatisfiable !== entry.withoutRuleInitialSatisfiable,
          lostTechniqueIds: entry.lostTechniqueIds,
          gainedTechniqueIds: entry.gainedTechniqueIds,
        }))
        .sort((left, right) => left.ruleShape.localeCompare(right.ruleShape)),
    }),
    report,
  }
}

export function findRuleImpactCloneGroups(
  puzzles: readonly PuzzleDefinition[],
): readonly RuleImpactCloneGroup[] {
  const signatures = puzzles.map((puzzle) => ruleImpactVectorSignature(puzzle))
  const bySignature = new Map<string, RuleImpactVectorSignature[]>()
  for (const signature of signatures) {
    const members = bySignature.get(signature.signature) ?? []
    members.push(signature)
    bySignature.set(signature.signature, members)
  }

  return [...bySignature.entries()]
    .filter(([, members]) => members.length > 1)
    .map(([signature, members]) => ({
      signature,
      status: 'reviewer-blocking' as const,
      puzzleIds: members.map((member) => member.puzzleId).sort(),
      members: [...members].sort((left, right) => left.puzzleId.localeCompare(right.puzzleId)),
    }))
    .sort((left, right) => left.puzzleIds[0].localeCompare(right.puzzleIds[0]))
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

export function candidateShrinkSignature(
  puzzle: PuzzleDefinition,
  options: { readonly solver?: SolverOptions; readonly cap?: number } = {},
): CandidateShrinkSignature {
  const solver = options.solver ?? {}
  const cap = options.cap ?? 1_000
  const proof = verifyNoGuess(puzzle, { solver })
  const checkpoints: CandidateShrinkCheckpoint[] = []
  let observations = targetObservationsForCells(puzzle, puzzle.initialReveals)
  let stats = zeroStats()

  const opening = candidateShrinkCheckpoint({
    label: 'opening',
    puzzle,
    observations,
    cap,
    solver,
  })
  checkpoints.push(opening.checkpoint)
  stats = combineStats(stats, opening.stats)

  for (const wave of proof.waves) {
    observations = mergeObservationState(puzzle, observations, [
      ...wave.revealed,
      ...wave.confirmedGuests.map((cellId) => ({ cellId, kind: 'guest' as const })),
    ])
    const afterWave = candidateShrinkCheckpoint({
      label: 'wave',
      waveIndex: wave.index,
      puzzle,
      observations,
      cap,
      solver,
    })
    checkpoints.push(afterWave.checkpoint)
    stats = combineStats(stats, afterWave.stats)
  }

  const final = candidateShrinkCheckpoint({
    label: 'final',
    puzzle,
    observations,
    cap,
    solver,
  })
  checkpoints.push(final.checkpoint)
  stats = combineStats(stats, final.stats)

  const techniqueSequence = proof.waves.flatMap((wave) => (
    wave.deductions.map((deduction) => deduction.technique)
  ))

  return {
    puzzleId: puzzle.id,
    signature: JSON.stringify({
      checkpoints: checkpoints.map((checkpoint) => ({
        label: checkpoint.label,
        ...(checkpoint.waveIndex === undefined ? {} : { waveIndex: checkpoint.waveIndex }),
        guestLayoutCount: checkpoint.guestLayoutCount,
        ...(checkpoint.greaterThan === undefined ? {} : { greaterThan: checkpoint.greaterThan }),
        unique: checkpoint.unique,
      })),
      techniqueSequence,
    }),
    techniqueSequence,
    checkpoints,
    stats,
  }
}

export function findCandidateShrinkCloneGroups(
  puzzles: readonly PuzzleDefinition[],
): readonly CandidateShrinkCloneGroup[] {
  const signatures = puzzles.map((puzzle) => candidateShrinkSignature(puzzle))
  const bySignature = new Map<string, CandidateShrinkSignature[]>()
  for (const signature of signatures) {
    const members = bySignature.get(signature.signature) ?? []
    members.push(signature)
    bySignature.set(signature.signature, members)
  }

  return [...bySignature.entries()]
    .filter(([, members]) => members.length > 1)
    .map(([signature, members]) => ({
      signature,
      status: 'reviewer-blocking' as const,
      puzzleIds: members.map((member) => member.puzzleId).sort(),
      members: [...members].sort((left, right) => left.puzzleId.localeCompare(right.puzzleId)),
    }))
    .sort((left, right) => left.puzzleIds[0].localeCompare(right.puzzleIds[0]))
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

interface RuleImpactBaseline {
  readonly initialGuestLayouts: number
  readonly targetSatisfiesRules: boolean
  readonly initialSatisfiable: boolean
  readonly proof: VerificationReport
  readonly techniqueIds: ReadonlySet<TechniqueId>
  readonly stats: SolverStats
}

function ruleImpactBaseline(
  puzzle: PuzzleDefinition,
  candidateLayoutCap: number,
  solver: SolverOptions,
): RuleImpactBaseline {
  const targetCheck = isSatisfiable(
    { puzzle, observations: targetObservationsForCells(puzzle, allCells(puzzle.board)) },
    [],
    solver,
  )
  const initialSatisfiability = isSatisfiable(
    { puzzle, observations: targetObservationsForCells(puzzle, puzzle.initialReveals) },
    [],
    solver,
  )
  const initialLayouts = countGuestLayouts(
    { puzzle, observations: targetObservationsForCells(puzzle, puzzle.initialReveals) },
    candidateLayoutCap,
    solver,
  )
  const proof = verifyNoGuess(puzzle, { solver })
  const proofStats = proof.waves.reduce(
    (current, wave) => combineStats(current, wave.solverStats),
    zeroStats(),
  )

  return {
    initialGuestLayouts: initialLayouts.count,
    targetSatisfiesRules: targetCheck.satisfiable && !targetCheck.stats.truncated,
    initialSatisfiable: initialSatisfiability.satisfiable && !initialSatisfiability.stats.truncated,
    proof,
    techniqueIds: new Set(proof.metrics.techniqueIds),
    stats: combineStats(
      combineStats(targetCheck.stats, initialSatisfiability.stats),
      combineStats(initialLayouts.stats, proofStats),
    ),
  }
}

function ruleImpactEntry(input: {
  readonly rule: RuleDefinition
  readonly baseline: RuleImpactBaseline
  readonly withoutRule: PuzzleDefinition
  readonly candidateLayoutCap: number
  readonly solver: SolverOptions
}): RuleImpactVectorEntry {
  const without = ruleImpactBaseline(input.withoutRule, input.candidateLayoutCap, input.solver)
  const withoutTechniqueIds = without.techniqueIds
  const lostTechniqueIds = [...input.baseline.techniqueIds]
    .filter((techniqueId) => !withoutTechniqueIds.has(techniqueId))
    .sort()
  const gainedTechniqueIds = [...withoutTechniqueIds]
    .filter((techniqueId) => !input.baseline.techniqueIds.has(techniqueId))
    .sort()
  const openingGuestLayoutDelta = without.initialGuestLayouts - input.baseline.initialGuestLayouts
  const proofWaveDelta = without.proof.metrics.waveCount - input.baseline.proof.metrics.waveCount
  const proofDeductionDelta = without.proof.metrics.deductionCount - input.baseline.proof.metrics.deductionCount
  const changed = [
    openingGuestLayoutDelta !== 0,
    proofWaveDelta !== 0,
    proofDeductionDelta !== 0,
    input.baseline.proof.guestLayoutUniqueAtEnd !== without.proof.guestLayoutUniqueAtEnd,
    input.baseline.targetSatisfiesRules !== without.targetSatisfiesRules,
    input.baseline.initialSatisfiable !== without.initialSatisfiable,
    lostTechniqueIds.length > 0,
    gainedTechniqueIds.length > 0,
  ].some(Boolean)

  return {
    ruleId: input.rule.id,
    ruleShape: ruleTraceShape(input.rule, 'kind-agnostic'),
    status: changed ? 'material' : 'redundant',
    openingGuestLayoutDelta,
    proofWaveDelta,
    proofDeductionDelta,
    baselineInitialGuestLayouts: input.baseline.initialGuestLayouts,
    withoutRuleInitialGuestLayouts: without.initialGuestLayouts,
    baselineGuestLayoutUniqueAtEnd: input.baseline.proof.guestLayoutUniqueAtEnd,
    withoutRuleGuestLayoutUniqueAtEnd: without.proof.guestLayoutUniqueAtEnd,
    baselineTargetSatisfiesRules: input.baseline.targetSatisfiesRules,
    withoutRuleTargetSatisfiesRules: without.targetSatisfiesRules,
    baselineInitialSatisfiable: input.baseline.initialSatisfiable,
    withoutRuleInitialSatisfiable: without.initialSatisfiable,
    lostTechniqueIds,
    gainedTechniqueIds,
    stats: combineStats(input.baseline.stats, without.stats),
  }
}

function materialRuleFamily(rule: RuleDefinition): MaterialRuleFamily {
  switch (rule.type) {
    case 'globalCount':
      return 'global'
    case 'regionCount':
      return 'region'
    case 'lineCount':
      return 'line'
    case 'anchorCount':
      return 'anchor'
    case 'forEachCount':
      return 'foreach'
    case 'recordSet':
      return 'record-set'
    case 'scopeOverlapCount':
      return 'scope-overlap'
    case 'comparativeCount':
      return 'comparative'
    case 'conditionalCount':
      return 'conditional'
  }
}

function ruleFamilyDiversityMessage(
  status: QualityGateStatus,
  materialFamilyCount: number,
  minMaterialFamilies: number,
  redundantRuleCount: number,
): string {
  if (status === 'fail') {
    return `Only ${materialFamilyCount} material rule family/families were found; expected at least ${minMaterialFamilies}.`
  }
  if (status === 'warning') {
    return `${redundantRuleCount} redundant rule(s) need reviewer attention.`
  }

  return `Material rules span ${materialFamilyCount} rule families.`
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

function lineCountScopeCells(
  puzzle: PuzzleDefinition,
  rule: Extract<RuleDefinition, { readonly type: 'lineCount' }>,
): readonly CellId[] | undefined {
  switch (rule.scope.kind) {
    case 'row':
    case 'column':
      return lineCells(rule.scope, puzzle.board)
    case 'ray': {
      if (rule.origin === undefined) return undefined

      const blockerKinds = new Set(rule.scope.stopAtKinds ?? [])
      const observedStopCells = puzzle.initialReveals.filter((cellId) => blockerKinds.has(puzzle.target[cellId]))

      return rayCells(rule.origin, rule.scope.direction, puzzle.board, { stopCells: observedStopCells })
    }
  }
}

function countScopeCells(puzzle: PuzzleDefinition, scope: CountScopeRef): readonly CellId[] | undefined {
  switch (scope.kind) {
    case 'global':
      return allCells(puzzle.board)
    case 'region': {
      const region = puzzle.regions?.find((candidate) => candidate.id === scope.regionId)
      if (region === undefined) return undefined

      return regionCells(region, puzzle.board)
    }
    case 'line':
      return countScopeLineCells(puzzle, scope)
  }
}

function countScopeLineCells(
  puzzle: PuzzleDefinition,
  scope: Extract<CountScopeRef, { readonly kind: 'line' }>,
): readonly CellId[] | undefined {
  switch (scope.scope.kind) {
    case 'row':
    case 'column':
      return lineCells(scope.scope, puzzle.board)
    case 'ray': {
      if (scope.origin === undefined) return undefined

      const blockerKinds = new Set(scope.scope.stopAtKinds ?? [])
      const observedStopCells = puzzle.initialReveals.filter((cellId) => blockerKinds.has(puzzle.target[cellId]))

      return rayCells(scope.origin, scope.scope.direction, puzzle.board, { stopCells: observedStopCells })
    }
  }
}

function scopeOverlapCells(
  puzzle: PuzzleDefinition,
  rule: Extract<RuleDefinition, { readonly type: 'scopeOverlapCount' }>,
): readonly CellId[] {
  const left = countScopeCells(puzzle, rule.left) ?? []
  const right = countScopeCells(puzzle, rule.right) ?? []
  const leftSet = new Set(left)
  const rightSet = new Set(right)

  switch (rule.mode) {
    case 'intersection':
      return sortCellIds(left.filter((cellId) => rightSet.has(cellId)), puzzle.board)
    case 'union':
      return sortCellIds(new Set([...left, ...right]), puzzle.board)
    case 'leftOnly':
      return sortCellIds(left.filter((cellId) => !rightSet.has(cellId)), puzzle.board)
    case 'rightOnly':
      return sortCellIds(right.filter((cellId) => !leftSet.has(cellId)), puzzle.board)
  }
}

function scopeDegeneracyResult(input: {
  readonly puzzle: PuzzleDefinition
  readonly ruleId: string
  readonly ruleType: DegeneracyGateResult['ruleType']
  readonly scopeKind: DegeneracyScopeKind
  readonly scopeCells: readonly CellId[]
  readonly target: CellKind
  readonly count: Comparator
  readonly nearGiveawaySlack: number
}): DegeneracyGateResult {
  const initialReveals = new Set(input.puzzle.initialReveals)
  const unknownCellCount = input.scopeCells.filter((cellId) => !initialReveals.has(cellId)).length
  const observedTargetCount = input.scopeCells
    .filter((cellId) => initialReveals.has(cellId) && input.puzzle.target[cellId] === input.target)
    .length
  const requiredTargetCount = Math.max(0, input.count.value - observedTargetCount)
  const reasons: DegeneracyReason[] = []

  if (unknownCellCount <= 1) reasons.push('singleton-effective-scope')

  if (input.target === 'guest' && (input.count.op === 'eq' || input.count.op === 'gte') && requiredTargetCount > 0) {
    if (requiredTargetCount >= unknownCellCount) {
      reasons.push('direct-count-giveaway')
    } else if (unknownCellCount - requiredTargetCount <= input.nearGiveawaySlack) {
      reasons.push('near-count-giveaway')
    }
  }

  const status: DegeneracyGateStatus = reasons.some((reason) => (
    reason === 'singleton-effective-scope' || reason === 'direct-count-giveaway'
  ))
    ? 'fail'
    : reasons.length > 0
      ? 'warning'
      : 'pass'

  return {
    ruleId: input.ruleId,
    ruleType: input.ruleType,
    scopeKind: input.scopeKind,
    status,
    reasons,
    scopeCellCount: input.scopeCells.length,
    unknownCellCount,
    observedTargetCount,
    requiredTargetCount,
    message: degeneracyMessage(input.scopeKind, status, reasons, unknownCellCount, requiredTargetCount),
  }
}

function comparativeScopeDegeneracyResult(input: {
  readonly puzzle: PuzzleDefinition
  readonly ruleId: string
  readonly scopeKind: 'comparative-left' | 'comparative-right'
  readonly scopeCells: readonly CellId[]
}): DegeneracyGateResult {
  const initialReveals = new Set(input.puzzle.initialReveals)
  const unknownCellCount = input.scopeCells.filter((cellId) => !initialReveals.has(cellId)).length
  const reasons: DegeneracyReason[] = []

  if (unknownCellCount <= 1) reasons.push('singleton-effective-scope')

  const status: DegeneracyGateStatus = reasons.length > 0 ? 'fail' : 'pass'

  return {
    ruleId: input.ruleId,
    ruleType: 'comparativeCount',
    scopeKind: input.scopeKind,
    status,
    reasons,
    scopeCellCount: input.scopeCells.length,
    unknownCellCount,
    observedTargetCount: 0,
    requiredTargetCount: 0,
    message: status === 'pass'
      ? `${input.scopeKind} has ${unknownCellCount} effective unknown cells.`
      : `${input.scopeKind} has only ${unknownCellCount} effective unknown cell(s).`,
  }
}

function trivialComparativeDegeneracyResult(ruleId: string): DegeneracyGateResult {
  return {
    ruleId,
    ruleType: 'comparativeCount',
    scopeKind: 'comparative',
    status: 'fail',
    reasons: ['trivial-same-scope-comparison'],
    scopeCellCount: 0,
    unknownCellCount: 0,
    observedTargetCount: 0,
    requiredTargetCount: 0,
    message: 'Comparative rule compares the same scope with no offset.',
  }
}

function combinedDegeneracyStatus(results: readonly DegeneracyGateResult[]): DegeneracyGateStatus {
  if (results.some((result) => result.status === 'fail')) return 'fail'
  if (results.some((result) => result.status === 'warning')) return 'warning'
  return 'pass'
}

function degeneracyMessage(
  scopeKind: DegeneracyScopeKind,
  status: DegeneracyGateStatus,
  reasons: readonly DegeneracyReason[],
  unknownCellCount: number,
  requiredTargetCount: number,
): string {
  if (status === 'pass') {
    return `${scopeKind} rule has ${unknownCellCount} effective unknown cells and is not a direct giveaway.`
  }

  if (reasons.includes('direct-count-giveaway')) {
    return `${scopeKind} rule requires ${requiredTargetCount} guest(s) from ${unknownCellCount} effective unknown cell(s).`
  }

  if (reasons.includes('near-count-giveaway')) {
    return `${scopeKind} rule is one cell away from directly identifying every remaining guest.`
  }

  return `${scopeKind} rule has only ${unknownCellCount} effective unknown cell(s).`
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

function candidateShrinkCheckpoint(input: {
  readonly label: CandidateShrinkCheckpoint['label']
  readonly waveIndex?: number
  readonly puzzle: PuzzleDefinition
  readonly observations: readonly Observation[]
  readonly cap: number
  readonly solver: SolverOptions
}): { readonly checkpoint: CandidateShrinkCheckpoint; readonly stats: SolverStats } {
  const result = countGuestLayouts(
    { puzzle: input.puzzle, observations: input.observations },
    input.cap,
    input.solver,
  )

  return {
    checkpoint: {
      label: input.label,
      ...(input.waveIndex === undefined ? {} : { waveIndex: input.waveIndex }),
      guestLayoutCount: result.count,
      ...(result.greaterThan === undefined ? {} : { greaterThan: result.greaterThan }),
      unique: result.count === 1 && result.greaterThan === undefined && !result.stats.truncated,
    },
    stats: result.stats,
  }
}

function mergeObservationState(
  puzzle: PuzzleDefinition,
  current: readonly Observation[],
  additions: readonly Observation[],
): readonly Observation[] {
  const byCell = new Map<CellId, Observation>()
  for (const observation of current) byCell.set(observation.cellId, observation)
  for (const observation of additions) byCell.set(observation.cellId, observation)

  return sortCellIds(byCell.keys(), puzzle.board)
    .map((cellId) => byCell.get(cellId))
    .filter(isDefined)
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
    regions: transformedRegionSignatures(puzzle, transform),
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
    regions: transformedEffectiveRegionSignatures(puzzle, reduction, transform),
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

  if (rule.type === 'regionCount') {
    return JSON.stringify({
      type: rule.type,
      regionId: rule.regionId,
      target: rule.target,
      count: rule.count,
    })
  }

  if (rule.type === 'lineCount') {
    return JSON.stringify({
      type: rule.type,
      origin: rule.origin,
      scope: rule.scope,
      target: rule.target,
      count: rule.count,
    })
  }

  if (rule.type === 'anchorCount') {
    return JSON.stringify({
      type: rule.type,
      anchorId: rule.anchorId,
      scope: rule.scope.kind,
      target: rule.target,
      count: rule.count,
    })
  }

  if (rule.type === 'recordSet') {
    return JSON.stringify({
      type: rule.type,
      recordIds: [...rule.recordIds].sort(),
      falseRecords: rule.falseRecords,
    })
  }

  if (rule.type === 'scopeOverlapCount') {
    return JSON.stringify({
      type: rule.type,
      left: countScopeSignature(rule.left),
      right: countScopeSignature(rule.right),
      mode: rule.mode,
      target: rule.target,
      count: rule.count,
    })
  }

  if (rule.type === 'comparativeCount') {
    return JSON.stringify({
      type: rule.type,
      left: countScopeSignature(rule.left),
      right: countScopeSignature(rule.right),
      target: rule.target,
      comparison: rule.comparison,
    })
  }

  if (rule.type === 'conditionalCount') {
    return JSON.stringify({
      type: rule.type,
      condition: {
        scope: countScopeSignature(rule.condition.scope),
        target: rule.condition.target,
        count: rule.condition.count,
      },
      then: {
        scope: countScopeSignature(rule.then.scope),
        target: rule.then.target,
        count: rule.then.count,
      },
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

function transformedRegionSignatures(
  puzzle: PuzzleDefinition,
  transform: BoardTransformName,
): readonly string[] {
  return (puzzle.regions ?? [])
    .map((region) => JSON.stringify({
      id: region.id,
      cells: transformedSortedCells(regionCells(region, puzzle.board), puzzle.board, transform),
    }))
    .sort()
}

function transformedEffectiveRegionSignatures(
  puzzle: PuzzleDefinition,
  reduction: EffectiveBoardReduction,
  transform: BoardTransformName,
): readonly string[] {
  const normalizedByOriginal = new Map(
    reduction.cells.map((cell) => [cell.cellId, cell.normalizedCellId] as const),
  )

  return (puzzle.regions ?? [])
    .map((region) => {
      const normalizedCells = regionCells(region, puzzle.board)
        .map((cellId) => normalizedByOriginal.get(cellId))
        .filter(isDefined)

      return JSON.stringify({
        id: region.id,
        cells: transformedSortedCells(normalizedCells, reduction.effectiveBoard, transform),
      })
    })
    .sort()
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

  if (rule.type === 'regionCount') {
    return JSON.stringify({
      type: rule.type,
      regionId: rule.regionId,
      target: traceKind(rule.target, mode),
      count: rule.count,
    })
  }

  if (rule.type === 'lineCount') {
    return JSON.stringify({
      type: rule.type,
      origin: rule.origin,
      scope: rule.scope.kind === 'ray'
        ? {
            ...rule.scope,
            stopAtKinds: rule.scope.stopAtKinds?.map((kind) => traceKind(kind, mode)).sort(),
          }
        : rule.scope,
      target: traceKind(rule.target, mode),
      count: rule.count,
    })
  }

  if (rule.type === 'anchorCount') {
    return JSON.stringify({
      type: rule.type,
      anchorId: rule.anchorId,
      scope: rule.scope.kind,
      target: traceKind(rule.target, mode),
      count: rule.count,
    })
  }

  if (rule.type === 'recordSet') {
    return JSON.stringify({
      type: rule.type,
      recordIds: [...rule.recordIds].sort(),
      falseRecords: rule.falseRecords,
    })
  }

  if (rule.type === 'scopeOverlapCount') {
    return JSON.stringify({
      type: rule.type,
      left: traceCountScope(rule.left, mode),
      right: traceCountScope(rule.right, mode),
      mode: rule.mode,
      target: traceKind(rule.target, mode),
      count: rule.count,
    })
  }

  if (rule.type === 'comparativeCount') {
    return JSON.stringify({
      type: rule.type,
      left: traceCountScope(rule.left, mode),
      right: traceCountScope(rule.right, mode),
      target: traceKind(rule.target, mode),
      comparison: rule.comparison,
    })
  }

  if (rule.type === 'conditionalCount') {
    return JSON.stringify({
      type: rule.type,
      condition: {
        scope: traceCountScope(rule.condition.scope, mode),
        target: traceKind(rule.condition.target, mode),
        count: rule.condition.count,
      },
      then: {
        scope: traceCountScope(rule.then.scope, mode),
        target: traceKind(rule.then.target, mode),
        count: rule.then.count,
      },
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

function countScopeSignature(scope: CountScopeRef): unknown {
  if (scope.kind === 'line' && scope.scope.kind === 'ray') {
    return {
      kind: scope.kind,
      origin: scope.origin,
      scope: {
        ...scope.scope,
        stopAtKinds: scope.scope.stopAtKinds?.slice().sort(),
      },
    }
  }

  return scope
}

function traceCountScope(scope: CountScopeRef, mode: 'exact' | 'kind-agnostic'): unknown {
  if (scope.kind === 'line' && scope.scope.kind === 'ray') {
    return {
      kind: scope.kind,
      origin: scope.origin,
      scope: {
        ...scope.scope,
        stopAtKinds: scope.scope.stopAtKinds?.map((kind) => traceKind(kind, mode)).sort(),
      },
    }
  }

  return scope
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
