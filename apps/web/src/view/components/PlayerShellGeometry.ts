export const PLAYER_DESIGN_WIDTH = 1920
export const PLAYER_DESIGN_HEIGHT = 1080

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
