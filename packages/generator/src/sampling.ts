import {
  allCells,
  sortCellIds,
  type CellId,
  type CellKind,
  type Observation,
  type PuzzleDefinition,
} from '@room-axioms/domain'
import { verifyNoGuess, type VerificationReport } from '@room-axioms/proof'
import { parsePuzzleDefinition } from '@room-axioms/schema'
import {
  isGuestLayoutUnique,
  isSatisfiable,
  type SolverOptions,
  type SolverStats,
} from '@room-axioms/solver'

import {
  GENERATOR_SPIKE_VERSION,
  type GeneratedCandidate,
  type GeneratorFailureCode,
  type GeneratorInputContract,
  type GeneratorPuzzleTemplate,
  type GeneratorSeedPolicy,
  type GeneratorValidationStage,
  type RejectedCandidate,
} from './contract.js'

export interface TargetSamplingPreview {
  readonly attempt: number
  readonly candidate: GeneratedCandidate
  readonly targetSatisfiesRules: boolean
  readonly initialSatisfiable: boolean
  readonly initialGuestLayoutUnique: boolean
  readonly proofNoGuess: boolean
  readonly proofHumanExplainable: boolean
  readonly proofIssueCodes: readonly string[]
  readonly proof: VerificationReport
  readonly stats: SolverStats
}

export interface TargetSamplingReport {
  readonly version: typeof GENERATOR_SPIKE_VERSION
  readonly input: GeneratorInputContract
  readonly attempts: number
  readonly sampled: readonly TargetSamplingPreview[]
  readonly rejected: readonly RejectedCandidate[]
  readonly stats: SolverStats
}

export function createGeneratorSeed(seed: number): GeneratorSeedPolicy {
  return {
    algorithm: 'mulberry32',
    seed: Math.trunc(seed),
    deterministic: true,
  }
}

export function sampleTargetAndObservationPools(
  input: GeneratorInputContract,
  template: GeneratorPuzzleTemplate = {},
): TargetSamplingReport {
  const rng = createMulberry32(input.seed.seed)
  const sampled: TargetSamplingPreview[] = []
  const rejected: RejectedCandidate[] = []
  let stats = zeroStats()
  let attempts = 0

  for (let attempt = 1; attempt <= input.caps.maxAttempts; attempt += 1) {
    attempts = attempt
    const candidate = buildSampledCandidate(input, template, attempt, rng)
    const schema = parsePuzzleDefinition(candidate.puzzle)

    if (!schema.ok || schema.puzzle === undefined) {
      rejected.push(rejection(attempt, 'SCHEMA_INVALID', 'schema', 'Generated puzzle failed schema parse.'))
      continue
    }

    const puzzle = schema.puzzle
    const solver = solverOptions(input)
    const targetCheck = isSatisfiable(
      { puzzle, observations: observationsForCells(puzzle, allCells(puzzle.board)) },
      [],
      solver,
    )
    stats = combineStats(stats, targetCheck.stats)

    if (targetCheck.stats.truncated) {
      rejected.push(rejection(attempt, 'SEARCH_CAP_REACHED', 'target-rules', 'Target rule check hit a solver cap.'))
      continue
    }

    if (!targetCheck.satisfiable) {
      rejected.push(rejection(attempt, 'TARGET_VIOLATES_RULES', 'target-rules', 'Target does not satisfy the rule set.'))
      continue
    }

    const initialCheck = isSatisfiable({ puzzle, observations: candidate.initialObservations }, [], solver)
    stats = combineStats(stats, initialCheck.stats)

    if (initialCheck.stats.truncated) {
      rejected.push(rejection(attempt, 'SEARCH_CAP_REACHED', 'initial-satisfiable', 'Initial observation check hit a solver cap.'))
      continue
    }

    if (!initialCheck.satisfiable) {
      rejected.push(rejection(attempt, 'INITIAL_UNSAT', 'initial-satisfiable', 'Initial observation pool is unsatisfiable.'))
      continue
    }

    const initialUnique = isGuestLayoutUnique({ puzzle, observations: candidate.initialObservations }, solver)
    stats = combineStats(stats, initialUnique.stats)

    if (initialUnique.stats.truncated) {
      rejected.push(rejection(attempt, 'SEARCH_CAP_REACHED', 'final-guest-layout-unique', 'Initial uniqueness preview hit a solver cap.'))
      continue
    }

    const proof = verifyNoGuess(puzzle, { solver })
    stats = proof.waves.reduce((current, wave) => combineStats(current, wave.solverStats), stats)

    if (proof.issues.some((issue) => issue.code === 'SOLVER_TRUNCATED')) {
      rejected.push(rejection(attempt, 'SOLVER_TRUNCATED', 'proof-no-guess', 'Proof preview reported solver truncation.'))
    } else if (!proof.noGuess || !proof.humanExplainable) {
      const hasGap = proof.issues.some((issue) => issue.code === 'EXPLANATION_GAP')
      rejected.push(
        rejection(
          attempt,
          hasGap ? 'PROOF_EXPLANATION_GAP' : 'PROOF_GUESS_POINT',
          'proof-no-guess',
          hasGap ? 'Proof preview found an explanation gap.' : 'Proof preview found a guess point.',
        ),
      )
    } else if (!proof.guestLayoutUniqueAtEnd) {
      rejected.push(rejection(attempt, 'FINAL_GUEST_LAYOUT_AMBIGUOUS', 'final-guest-layout-unique', 'Proof preview did not reach a unique guest layout.'))
    }

    sampled.push({
      attempt,
      candidate,
      targetSatisfiesRules: targetCheck.satisfiable,
      initialSatisfiable: initialCheck.satisfiable,
      initialGuestLayoutUnique: initialUnique.unique,
      proofNoGuess: proof.noGuess,
      proofHumanExplainable: proof.humanExplainable,
      proofIssueCodes: proof.issues.map((issue) => issue.code),
      proof,
      stats,
    })

    if (sampled.length >= input.caps.maxAccepted) break
  }

  return {
    version: GENERATOR_SPIKE_VERSION,
    input,
    attempts,
    sampled,
    rejected,
    stats,
  }
}

function buildSampledCandidate(
  input: GeneratorInputContract,
  template: GeneratorPuzzleTemplate,
  attempt: number,
  rng: () => number,
): GeneratedCandidate {
  const cells = allCells(input.board)
  const target = sampleTarget(cells, input, rng)
  const nonGuestCells = cells.filter((cellId) => target[cellId] !== 'guest')
  const revealCount = clamp(
    randomInteger(rng, input.initialRevealRange.min, input.initialRevealRange.max),
    0,
    nonGuestCells.length,
  )
  const initialReveals = sortCellIds(shuffle(nonGuestCells, rng).slice(0, revealCount), input.board)
  const metadata = template.metadata ?? {
    difficulty: 1,
    tags: ['experimental', 'phase-9-generator'],
    author: 'internal-generator-spike',
    status: 'draft',
  }
  const puzzle: PuzzleDefinition = {
    schemaVersion: 1,
    id: `${template.idPrefix ?? 'experimental-phase-9'}-${String(attempt).padStart(3, '0')}`,
    title: `${template.titlePrefix ?? 'Experimental Phase 9 Candidate'} ${attempt}`,
    ...(template.caseNamePrefix === undefined ? {} : { caseName: `${template.caseNamePrefix} ${attempt}` }),
    board: input.board,
    allowedKinds: input.allowedKinds,
    rules: input.rules,
    initialReveals,
    target,
    metadata,
  }

  return {
    puzzle,
    source: 'sampled-target',
    seed: input.seed,
    initialObservations: observationsForCells(puzzle, initialReveals),
  }
}

function sampleTarget(
  cells: readonly CellId[],
  input: GeneratorInputContract,
  rng: () => number,
): Readonly<Record<CellId, CellKind>> {
  const safeKinds = input.allowedKinds.filter((kind) => kind !== 'guest')
  const fallbackSafeKinds = safeKinds.length === 0 ? (['empty'] as const) : safeKinds
  const shuffledCells = shuffle(cells, rng)
  const guestCells = new Set(shuffledCells.slice(0, clamp(input.guestCount, 0, cells.length)))
  const target: Record<CellId, CellKind> = {}

  for (const cellId of cells) {
    target[cellId] = guestCells.has(cellId)
      ? 'guest'
      : fallbackSafeKinds[randomInteger(rng, 0, fallbackSafeKinds.length - 1)]
  }

  return target
}

function observationsForCells(puzzle: PuzzleDefinition, cellIds: readonly CellId[]): readonly Observation[] {
  return cellIds.map((cellId) => ({
    cellId,
    kind: puzzle.target[cellId],
  }))
}

function solverOptions(input: GeneratorInputContract): SolverOptions {
  return {
    maxNodes: input.solver?.maxNodes ?? input.caps.maxNodes,
    maxModels: input.solver?.maxModels ?? input.caps.maxModels,
    maxGuestLayouts: input.solver?.maxGuestLayouts ?? input.caps.maxGuestLayouts,
  }
}

function rejection(
  attempt: number,
  code: GeneratorFailureCode,
  stage: GeneratorValidationStage,
  message: string,
): RejectedCandidate {
  return {
    attempt,
    code,
    stage,
    message,
  }
}

function createMulberry32(seed: number): () => number {
  let state = Math.trunc(seed) >>> 0

  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(values: readonly T[], rng: () => number): readonly T[] {
  const copy = [...values]

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInteger(rng, 0, index)
    const value = copy[index]
    copy[index] = copy[swapIndex]
    copy[swapIndex] = value
  }

  return copy
}

function randomInteger(rng: () => number, min: number, max: number): number {
  const low = Math.ceil(Math.min(min, max))
  const high = Math.floor(Math.max(min, max))

  return Math.floor(rng() * (high - low + 1)) + low
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
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
