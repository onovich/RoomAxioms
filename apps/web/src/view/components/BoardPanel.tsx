import { Circle, Flag, Search } from 'lucide-react'
import { columnsForWidth } from '@room-axioms/domain'
import { cellLabels, toolLabels } from '../../data/case004'
import type { CellId } from '@room-axioms/domain'
import type { RoomAxiomsGame } from '../../hooks/useRoomAxiomsGame'
import type { Tool } from '../types'
import { ObjectIcon } from './ObjectIcon'

interface BoardPanelProps {
  readonly game: RoomAxiomsGame
}

export function BoardPanel({ game }: BoardPanelProps) {
  const columns = columnsForWidth(game.puzzle.board.width)

  return (
    <section className="board-panel" data-panel="board" aria-labelledby="boardHeading">
      <div className="board-heading">
        <div>
          <span className="eyebrow">固定世界 · 客观揭示</span>
          <h2 id="boardHeading">客房调查区域</h2>
        </div>
        <div className="mode-badge">当前工具：{toolLabels[game.tool]}</div>
      </div>

      <div className="board-stage">
        <div className="board-coordinates" role="grid" aria-label="4乘4调查棋盘">
          <div className="coordinate-label" aria-hidden="true" />
          {columns.map((column) => (
            <div className="coordinate-label" key={column} aria-hidden="true">
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
      <div className="coordinate-label" aria-hidden="true">
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
      onContextMenu={(event) => {
        event.preventDefault()
        game.cycleMark(cellId)
      }}
      onMouseEnter={() => game.setHoveredCell(cellId)}
      onMouseLeave={() => game.setHoveredCell(null)}
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
    tool === 'inspect' ? '揭示客观物件' : tool === 'guest' ? '可撤销的判断' : '铅笔式笔记'

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

  if (game.selectedRule) return '蓝色描边为所选规则的实际棋盘内范围；金色描边为已揭示主体。'
  return '选择一条规则可查看其作用范围。右键格子可循环访客/安全笔记。'
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
