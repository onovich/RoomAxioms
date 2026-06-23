import type {
  CellId,
  CellKind,
  Observation,
  ObservationEntry,
  PuzzleDefinition,
} from '@room-axioms/domain'

export function observationForTargetCell(
  puzzle: PuzzleDefinition,
  cellId: CellId,
): Observation {
  return {
    cellId,
    kind: puzzle.target[cellId],
  }
}

export function observationMapForRevealed(
  puzzle: PuzzleDefinition,
  revealed: ReadonlySet<CellId>,
): ReadonlyMap<CellId, CellKind> {
  return new Map([...revealed].map((cellId) => {
    const observation = observationForTargetCell(puzzle, cellId)
    return [observation.cellId, observation.kind] as const
  }))
}

export function observationsForRevealed(
  puzzle: PuzzleDefinition,
  revealed: ReadonlySet<CellId>,
): readonly Observation[] {
  return [...revealed].map((cellId) => observationForTargetCell(puzzle, cellId))
}

export function initialActionLogForTarget(
  puzzle: PuzzleDefinition,
): readonly ObservationEntry[] {
  return puzzle.initialReveals.map((cellId, order) => {
    const observation = observationForTargetCell(puzzle, cellId)
    return {
      id: observation.cellId,
      kind: observation.kind,
      initial: true,
      order,
    }
  })
}

export function targetGuestCells(puzzle: PuzzleDefinition): readonly CellId[] {
  return Object.entries(puzzle.target)
    .filter(([, kind]) => kind === 'guest')
    .map(([cellId]) => cellId)
    .sort()
}

export function targetKindForDeveloperOverlay(
  puzzle: PuzzleDefinition,
  cellId: CellId,
): CellKind {
  return puzzle.target[cellId]
}
