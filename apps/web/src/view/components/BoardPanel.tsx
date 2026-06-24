import { Circle, Flag, Search } from 'lucide-react'
import { columnsForWidth, parseCellId } from '@room-axioms/domain'
import { cellLabels, toolLabels } from '../../data/case004'
import { nextCellForArrowKey } from '../keyboardNavigation'
import type { CSSProperties, KeyboardEvent } from 'react'
import type { BoardSize, CellId } from '@room-axioms/domain'
import type { RoomAxiomsGame } from '../../hooks/useRoomAxiomsGame'
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
    <section className="board-panel" data-panel="board" aria-labelledby="boardHeading">
      <div className="board-heading">
        <div>
          <span className="eyebrow">翻格子找证据</span>
          <h2 id="boardHeading">房间棋盘</h2>
        </div>
        <div className="mode-badge">{toolLabels[game.tool]}</div>
      </div>

      <div className="board-stage">
        <div
          className="board-coordinates"
          role="grid"
          aria-label={`${game.puzzle.board.width} by ${game.puzzle.board.height} investigation board`}
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

      <div className="tool-row" role="toolbar" aria-label="调查工具">
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
  const classes = ['cell', ...game.highlightedCells(cellId)]
  const coord = parseCellId(cellId, game.puzzle.board)

  if (revealed) classes.push('revealed')
  if (mark === 'guest') classes.push('mark-guest')
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
      {revealed && kind !== null ? (
        <span className="object">
          <ObjectIcon kind={kind} />
          <span>{cellLabels[kind]}</span>
        </span>
      ) : (
        <CellUnknown mark={mark} />
      )}
      {targetKind !== null ? (
        <span className="target-tag">{cellLabels[targetKind]}</span>
      ) : null}
    </button>
  )
}

function CellUnknown({ mark }: { readonly mark?: 'guest' | 'safe' }) {
  if (mark === 'guest') {
    return (
      <span className="player-mark">
        <Flag size={22} aria-hidden="true" />
        <small>访客？</small>
      </span>
    )
  }

  if (mark === 'safe') {
    return (
      <span className="player-mark">
        <Circle size={22} aria-hidden="true" />
        <small>安全？</small>
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
  const description =
    tool === 'inspect' ? '翻开格子' : tool === 'guest' ? '做访客笔记' : '做安全笔记'

  return (
    <button className={`tool-button${active ? ' active' : ''}`} type="button" onClick={onClick}>
      <Icon className="tool-icon" size={22} aria-hidden="true" />
      <span>{toolLabels[tool]}</span>
      <small>{description}</small>
    </button>
  )
}

function captionFor(game: RoomAxiomsGame): string {
  if (game.hoveredCell) {
    const mark = game.marks.get(game.hoveredCell)
    const observedKind = game.observedKind(game.hoveredCell)
    const stateText = game.revealed.has(game.hoveredCell)
      ? observedKind === null
        ? '已揭示'
        : cellLabels[observedKind]
      : mark === 'guest'
        ? '玩家标记：访客？'
        : mark === 'safe'
          ? '玩家标记：安全？'
          : '尚未调查'
    return `${game.hoveredCell} · ${stateText}`
  }

  if (game.selectedRule) return '蓝框是这条规则会看的格子；金框是规则的起点物品。'
  return '选中规则，可以查看规则生效的格子。右键格子可快速切换笔记。'
}

function cellAria(
  cellId: CellId,
  revealed: boolean,
  kind: keyof typeof cellLabels | null,
  mark: 'guest' | 'safe' | undefined,
): string {
  if (revealed) return `${cellId}，已揭示，${kind === null ? '未知' : cellLabels[kind]}`
  if (mark === 'guest') return `${cellId}，未知，玩家标记为访客`
  if (mark === 'safe') return `${cellId}，未知，玩家标记为安全`
  return `${cellId}，未知，未标记`
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
