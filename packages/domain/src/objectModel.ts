import type { CellId, CellKind, PuzzleDefinition } from './types.js'

export type LegacyObjectCellKind = Exclude<CellKind, 'empty' | 'guest'>

export type ObjectTypeCategory = 'evidence' | 'container' | 'reflector' | 'custom'

export interface LocalizedLabel {
  readonly zhHans: string
  readonly en: string
}

export interface ObjectTypeDefinition {
  readonly id: string
  readonly legacyKind?: LegacyObjectCellKind
  readonly label: LocalizedLabel
  readonly shortLabel?: LocalizedLabel
  readonly category: ObjectTypeCategory
  readonly icon?: string
}

export interface ObjectTypeRegistry {
  readonly objectTypes: readonly ObjectTypeDefinition[]
}

export interface NormalizedCellState {
  readonly target: boolean
  readonly objects: readonly string[]
}

export type NormalizedPuzzleTarget = Readonly<Record<CellId, NormalizedCellState>>

export const DEFAULT_OBJECT_TYPE_REGISTRY: ObjectTypeRegistry = {
  objectTypes: [
    {
      id: 'bottle',
      legacyKind: 'bottle',
      label: { zhHans: '瓶子', en: 'Bottle' },
      category: 'evidence',
      icon: 'bottle',
    },
    {
      id: 'bin',
      legacyKind: 'bin',
      label: { zhHans: '垃圾桶', en: 'Bin' },
      category: 'container',
      icon: 'trash-2',
    },
    {
      id: 'mirror',
      legacyKind: 'mirror',
      label: { zhHans: '镜子', en: 'Mirror' },
      category: 'reflector',
      icon: 'scan',
    },
  ],
}

export function findObjectType(
  registry: ObjectTypeRegistry,
  objectTypeId: string,
): ObjectTypeDefinition | undefined {
  return registry.objectTypes.find((objectType) => objectType.id === objectTypeId)
}

export function findObjectTypeByLegacyKind(
  registry: ObjectTypeRegistry,
  legacyKind: LegacyObjectCellKind,
): ObjectTypeDefinition | undefined {
  return registry.objectTypes.find((objectType) => objectType.legacyKind === legacyKind)
}

export function normalizeLegacyCellKind(
  kind: CellKind,
  registry: ObjectTypeRegistry = DEFAULT_OBJECT_TYPE_REGISTRY,
): NormalizedCellState {
  if (kind === 'guest') {
    return { target: true, objects: [] }
  }

  if (kind === 'empty') {
    return { target: false, objects: [] }
  }

  const objectType = findObjectTypeByLegacyKind(registry, kind)
  return { target: false, objects: objectType ? [objectType.id] : [kind] }
}

export function denormalizeLegacyCellState(
  cell: NormalizedCellState,
  registry: ObjectTypeRegistry = DEFAULT_OBJECT_TYPE_REGISTRY,
): CellKind | undefined {
  if (cell.target) {
    return cell.objects.length === 0 ? 'guest' : undefined
  }

  if (cell.objects.length === 0) {
    return 'empty'
  }

  if (cell.objects.length > 1) {
    return undefined
  }

  const objectType = findObjectType(registry, cell.objects[0])
  return objectType?.legacyKind
}

export function normalizePuzzleTarget(
  puzzle: Pick<PuzzleDefinition, 'target'>,
  registry: ObjectTypeRegistry = DEFAULT_OBJECT_TYPE_REGISTRY,
): NormalizedPuzzleTarget {
  return Object.fromEntries(
    Object.entries(puzzle.target).map(([cellId, kind]) => [
      cellId,
      normalizeLegacyCellKind(kind, registry),
    ]),
  )
}

export function denormalizeLegacyPuzzleTarget(
  target: NormalizedPuzzleTarget,
  registry: ObjectTypeRegistry = DEFAULT_OBJECT_TYPE_REGISTRY,
): Readonly<Record<CellId, CellKind>> | undefined {
  const entries: Array<[CellId, CellKind]> = []

  for (const [cellId, cell] of Object.entries(target)) {
    const legacyKind = denormalizeLegacyCellState(cell, registry)
    if (!legacyKind) {
      return undefined
    }
    entries.push([cellId, legacyKind])
  }

  return Object.fromEntries(entries)
}
