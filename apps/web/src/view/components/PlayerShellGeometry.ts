export const PLAYER_DESIGN_WIDTH = 1920
export const PLAYER_DESIGN_HEIGHT = 1080
export const PLAYER_DESIGN_ASPECT_RATIO = PLAYER_DESIGN_WIDTH / PLAYER_DESIGN_HEIGHT

export interface PlayerCanvasViewport {
  readonly height: number
  readonly marginX: number
  readonly marginY: number
  readonly scale: number
  readonly width: number
}

export function calculatePlayerCanvasScale(viewportWidth: number, viewportHeight: number): number {
  if (viewportWidth <= 0 || viewportHeight <= 0) return 1
  return Math.max(
    0.1,
    Math.min(
      viewportWidth / PLAYER_DESIGN_WIDTH,
      viewportHeight / PLAYER_DESIGN_HEIGHT,
    ),
  )
}

export function calculatePlayerCanvasViewport(
  viewportWidth: number,
  viewportHeight: number,
): PlayerCanvasViewport {
  const scale = calculatePlayerCanvasScale(viewportWidth, viewportHeight)
  const width = PLAYER_DESIGN_WIDTH * scale
  const height = PLAYER_DESIGN_HEIGHT * scale

  return {
    height,
    marginX: Math.max(0, (viewportWidth - width) / 2),
    marginY: Math.max(0, (viewportHeight - height) / 2),
    scale,
    width,
  }
}
