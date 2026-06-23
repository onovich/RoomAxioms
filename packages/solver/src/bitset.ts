import { allCells, assertNever } from '@room-axioms/domain';
import type { CellId, CellKind, PuzzleDefinition } from '@room-axioms/domain';

export type DomainMask = number;
export type DomainState = Readonly<Record<CellId, DomainMask>>;

export const EMPTY_DOMAIN: DomainMask = 0;

const KIND_BITS: Readonly<Record<CellKind, DomainMask>> = {
  empty: 1 << 0,
  bottle: 1 << 1,
  bin: 1 << 2,
  mirror: 1 << 3,
  guest: 1 << 4,
};

const CELL_KIND_ORDER: readonly CellKind[] = ['empty', 'bottle', 'bin', 'mirror', 'guest'];

export function bitForKind(kind: CellKind): DomainMask {
  return KIND_BITS[kind];
}

export function maskForKinds(kinds: readonly CellKind[]): DomainMask {
  return kinds.reduce((mask, kind) => mask | bitForKind(kind), EMPTY_DOMAIN);
}

export function singletonMask(kind: CellKind): DomainMask {
  return bitForKind(kind);
}

export function containsKind(mask: DomainMask, kind: CellKind): boolean {
  return (mask & bitForKind(kind)) !== 0;
}

export function removeKind(mask: DomainMask, kind: CellKind): DomainMask {
  return mask & ~bitForKind(kind);
}

export function intersectMask(left: DomainMask, right: DomainMask): DomainMask {
  return left & right;
}

export function isSingleton(mask: DomainMask): boolean {
  return mask !== EMPTY_DOMAIN && (mask & (mask - 1)) === 0;
}

export function domainSize(mask: DomainMask): number {
  let size = 0;
  let remaining = mask;

  while (remaining !== 0) {
    remaining &= remaining - 1;
    size += 1;
  }

  return size;
}

export function singletonKind(mask: DomainMask): CellKind | null {
  if (!isSingleton(mask)) return null;

  for (const kind of CELL_KIND_ORDER) {
    if (containsKind(mask, kind)) return kind;
  }

  return assertNever(mask as never);
}

export function kindsInMask(mask: DomainMask, kindOrder: readonly CellKind[] = CELL_KIND_ORDER): readonly CellKind[] {
  return kindOrder.filter((kind) => containsKind(mask, kind));
}

export function createInitialDomains(puzzle: PuzzleDefinition): DomainState {
  const initialMask = maskForKinds(puzzle.allowedKinds);
  const domains: Record<CellId, DomainMask> = {};

  for (const cellId of allCells(puzzle.board)) {
    domains[cellId] = initialMask;
  }

  return domains;
}

export function setCellDomain(domains: DomainState, cellId: CellId, mask: DomainMask): DomainState {
  return { ...domains, [cellId]: mask };
}

export function cloneDomains(domains: DomainState): Record<CellId, DomainMask> {
  return { ...domains };
}
