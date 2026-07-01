export const FIGMA_PUZZLE_PROTOTYPE_HASH = '#figma-puzzle-prototype'
export const FIGMA_PUZZLE_PROTOTYPE_QUERY_KEY = 'prototype'
export const FIGMA_PUZZLE_PROTOTYPE_QUERY_VALUE = 'figma-puzzle'

export interface FigmaPuzzlePrototypeLocationLike {
  readonly hash?: string
  readonly search?: string
}

export function shouldShowFigmaPuzzlePrototype(
  location: FigmaPuzzlePrototypeLocationLike,
): boolean {
  if (location.hash === FIGMA_PUZZLE_PROTOTYPE_HASH) return true

  const search = location.search?.startsWith('?') ? location.search.slice(1) : (location.search ?? '')
  const params = new URLSearchParams(search)

  return params.get(FIGMA_PUZZLE_PROTOTYPE_QUERY_KEY) === FIGMA_PUZZLE_PROTOTYPE_QUERY_VALUE
}
