import type { RuntimeHint } from '../runtime/contracts'
import type { CellId, CellKind, PuzzleDefinition } from '@room-axioms/domain'

export interface Hint {
  readonly title: string
  readonly conclusion: string
  readonly premises: readonly string[]
  readonly reasoning: string
  readonly highlight?: CellId
}

export function createHint(
  puzzle: PuzzleDefinition,
  runtimeHint: RuntimeHint | null,
): Hint {
  if (runtimeHint !== null) {
    return hintFromRuntime(runtimeHint)
  }

  return {
    title: 'No proof-backed hint available',
    conclusion: `${puzzle.title} has no currently explainable next step.`,
    premises: ['The hint system only uses revealed observations and rule-backed proof deductions.'],
    reasoning:
      'No human-readable deduction was produced for the current public state, so the app avoids showing solver-only conclusions.',
  }
}

export function kindIsInspectable(kind: CellKind): boolean {
  return kind !== 'guest'
}

function hintFromRuntime(runtimeHint: RuntimeHint): Hint {
  return {
    title: techniqueTitle(runtimeHint.technique),
    conclusion: conclusionText(runtimeHint),
    premises: runtimeHint.proofLines.length > 0
      ? runtimeHint.proofLines
      : runtimeHint.ruleIds.map((ruleId) => `Rule ${ruleId}`),
    reasoning:
      'This hint is produced from the proof package deduction graph, using only revealed observations and puzzle rules.',
    ...(runtimeHint.highlight === null ? {} : { highlight: runtimeHint.highlight }),
  }
}

function techniqueTitle(technique: RuntimeHint['technique']): string {
  switch (technique) {
    case 'GLOBAL_COUNT_SATURATED':
      return 'Global count is saturated'
    case 'GLOBAL_COUNT_ALL_REMAINING':
      return 'All remaining cells are forced'
    case 'LOCAL_COUNT_SATURATED':
      return 'Local count is saturated'
    case 'LOCAL_COUNT_ALL_REMAINING':
      return 'All cells in this scope are forced'
    case 'UNIQUE_TARGET_NEIGHBOR_INTERSECTION':
      return 'Neighbor scopes intersect'
    case 'LOCAL_SCOPE_INTERSECTION':
      return 'Local scopes intersect'
    case 'LOCAL_SCOPE_DIFFERENCE':
      return 'Local scopes differ'
    case 'KNOWN_SAFE_FROM_NON_GUEST_OBJECT':
      return 'Known object is safe'
  }
}

function conclusionText(runtimeHint: RuntimeHint): string {
  const conclusion = runtimeHint.conclusion

  switch (conclusion.kind) {
    case 'safe':
      return `${conclusion.cellId} is safe to inspect.`
    case 'guest':
      return `${conclusion.cellId} must contain a guest.`
    case 'object':
      return `${conclusion.cellId} must be ${conclusion.object}.`
  }
}
