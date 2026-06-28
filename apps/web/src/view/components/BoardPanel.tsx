import { Circle, Flag, Search } from 'lucide-react'
import { columnsForWidth, parseCellId } from '@room-axioms/domain'
import { nextCellForArrowKey } from '../keyboardNavigation'
import type { CSSProperties, KeyboardEvent } from 'react'
import type { BoardSize, CellId } from '@room-axioms/domain'
import type { RoomAxiomsGame } from '../../hooks/useRoomAxiomsGame'
import {
  sceneCellLabels,
  sceneMarkLabels,
  scenePanels,
  sceneToolDescriptions,
  sceneToolLabels,
} from '../../theme/vocabulary'
import type { Tool } from '../types'
import { ObjectIcon } from './ObjectIcon'

interface BoardPanelProps {
  readonly game: RoomAxiomsGame
}

export function BoardPanel({ game }: BoardPanelProps) {
  const columns = columnsForWidth(game.puzzle.board.width)
  const boardStyle = {
    '--board-width': String(game.puzzle.board.width),
    '--board-height': String(game.puzzle.board.height),
  } as CSSProperties

  return (
    <section className="board-panel scene-map-panel" data-panel="board" aria-labelledby="boardHeading">
      <div className="board-heading">
        <div>
          <span className="eyebrow">Scene Map</span>
          <h2 id="boardHeading">{scenePanels.map}</h2>
        </div>
        <div className="mode-badge">{sceneToolLabels[game.tool]}</div>
      </div>

      <div className="board-stage scene-map-stage">
        <div className="scene-map-floorplan" aria-hidden="true" />
        <div
          className="board-coordinates scene-map-grid"
          role="grid"
          aria-label={`${game.puzzle.board.width} by ${game.puzzle.board.height} scene map`}
          aria-rowcount={game.puzzle.board.height}
          aria-colcount={game.puzzle.board.width}
          style={boardStyle}
        >
          <div className="coordinate-label" role="presentation" aria-hidden="true" />
          {columns.map((column) => (
            <div className="coordinate-label" key={column} role="presentation" aria-hidden="true">
              {column}
            </div>
          ))}
          {Array.from({ length: game.puzzle.board.height }, (_, row) => (
            <BoardRow game={game} columns={columns} row={row + 1} key={row} />
          ))}
        </div>
        <div className="board-caption">{captionFor(game)}</div>
      </div>

      <div className="tool-row" role="toolbar" aria-label="现场勘察工具">
        <ToolButton tool="inspect" active={game.tool === 'inspect'} onClick={() => game.setTool('inspect')} />
        <ToolButton tool="guest" active={game.tool === 'guest'} onClick={() => game.setTool('guest')} />
        <ToolButton tool="safe" active={game.tool === 'safe'} onClick={() => game.setTool('safe')} />
      </div>

      <div className={`status-strip ${game.status.kind}`} role="status" aria-live="polite">
        <span className="status-dot" />
        <span>{game.status.text}</span>
      </div>
    </section>
  )
}

function BoardRow({
  game,
  columns,
  row,
}: {
  readonly game: RoomAxiomsGame
  readonly columns: readonly string[]
  readonly row: number
}) {
  return (
    <>
      <div className="coordinate-label" role="presentation" aria-hidden="true">
        {row}
      </div>
      {columns.map((column) => {
        const cellId = `${column}${row}`
        return <CellButton game={game} cellId={cellId} key={cellId} />
      })}
    </>
  )
}

function CellButton({ game, cellId }: { readonly game: RoomAxiomsGame; readonly cellId: CellId }) {
  const revealed = game.revealed.has(cellId)
  const kind = game.observedKind(cellId)
  const targetKind = game.developerTargetKind(cellId)
  const mark = game.marks.get(cellId)
  const classes = ['cell', 'scene-map-cell', ...game.highlightedCells(cellId)]
  const coord = parseCellId(cellId, game.puzzle.board)

  if (revealed) classes.push('revealed')
  if (mark === 'guest') classes.push('mark-guest', 'mark-anomaly')
  if (mark === 'safe') classes.push('mark-safe')
  if (game.devMode && !revealed && game.analysis.forcedSafe.includes(cellId)) classes.push('dev-safe')
  if (game.devMode && !revealed && game.analysis.forcedGuests.includes(cellId)) classes.push('dev-guest')
  if (targetKind !== null) classes.push('target-spoiler')

  return (
    <button
      className={classes.join(' ')}
      type="button"
      role="gridcell"
      onClick={() => game.handleCell(cellId)}
      onKeyDown={(event) => focusNextCellForKey(event, cellId, game.puzzle.board)}
      onContextMenu={(event) => {
        event.preventDefault()
        game.cycleMark(cellId)
      }}
      onMouseEnter={() => game.setHoveredCell(cellId)}
      onMouseLeave={() => game.setHoveredCell(null)}
      data-cell-id={cellId}
      aria-rowindex={coord.y + 1}
      aria-colindex={coord.x + 1}
      aria-label={cellAria(cellId, revealed, kind, mark)}
    >
      <span className="coord">{cellId}</span>
      <span className="scene-cell-hit-target" aria-hidden="true" />
      {revealed && kind !== null ? (
        <span className="object scene-object-layer">
          <ObjectIcon kind={kind} />
          <span>{sceneCellLabels[kind]}</span>
        </span>
      ) : (
        <CellUnknown mark={mark} />
      )}
      {targetKind !== null ? (
        <span className="target-tag">{sceneCellLabels[targetKind]}</span>
      ) : null}
    </button>
  )
}

function CellUnknown({ mark }: { readonly mark?: 'guest' | 'safe' }) {
  if (mark === 'guest') {
    return (
      <span className="player-mark">
        <Flag size={22} aria-hidden="true" />
        <small>{sceneMarkLabels.guest}</small>
      </span>
    )
  }

  if (mark === 'safe') {
    return (
      <span className="player-mark">
        <Circle size={22} aria-hidden="true" />
        <small>{sceneMarkLabels.safe}</small>
      </span>
    )
  }

  return <span className="unknown-mark">?</span>
}

function ToolButton({
  tool,
  active,
  onClick,
}: {
  readonly tool: Tool
  readonly active: boolean
  readonly onClick: () => void
}) {
  const Icon = tool === 'inspect' ? Search : tool === 'guest' ? Flag : Circle

  return (
    <button className={`tool-button${active ? ' active' : ''}`} type="button" onClick={onClick}>
      <Icon className="tool-icon" size={22} aria-hidden="true" />
      <span>{sceneToolLabels[tool]}</span>
      <small>{sceneToolDescriptions[tool]}</small>
    </button>
  )
}

function captionFor(game: RoomAxiomsGame): string {
  if (game.hoveredCell) {
    const mark = game.marks.get(game.hoveredCell)
    const observedKind = game.observedKind(game.hoveredCell)
    const stateText = game.revealed.has(game.hoveredCell)
      ? observedKind === null
        ? '已登记'
        : sceneCellLabels[observedKind]
      : mark === 'guest'
        ? `玩家标注：${sceneMarkLabels.guest}`
        : mark === 'safe'
          ? `玩家标注：${sceneMarkLabels.safe}`
          : '尚未勘察'
    return `${game.hoveredCell} / ${stateText}`
  }

  if (game.selectedRule) return '蓝色区域是当前定则的公开作用范围；高亮只用于可视化，不额外提供隐藏信息。'
  return '选择现场定则可查看公开作用范围。右键区域可快速切换工作标注。'
}

function cellAria(
  cellId: CellId,
  revealed: boolean,
  kind: keyof typeof sceneCellLabels | null,
  mark: 'guest' | 'safe' | undefined,
): string {
  if (revealed) return `${cellId}，已登记，${kind === null ? '未知内容' : sceneCellLabels[kind]}`
  if (mark === 'guest') return `${cellId}，未知区域，玩家标注为${sceneMarkLabels.guest}`
  if (mark === 'safe') return `${cellId}，未知区域，玩家标注为${sceneMarkLabels.safe}`
  return `${cellId}，未知区域，未标注`
}

function focusNextCellForKey(
  event: KeyboardEvent<HTMLButtonElement>,
  cellId: CellId,
  board: BoardSize,
): void {
  const nextCell = nextCellForArrowKey(cellId, event.key, board)
  if (nextCell === null) return

  event.preventDefault()
  document.querySelector<HTMLButtonElement>(`[data-cell-id="${nextCell}"]`)?.focus()
}
