import type { RoomAxiomsGame } from '../../hooks/useRoomAxiomsGame'

interface MobileTabsProps {
  readonly game: RoomAxiomsGame
}

export function MobileTabs({ game }: MobileTabsProps) {
  return (
    <nav className="mobile-tabs" aria-label="移动端面板">
      <button
        type="button"
        className={game.mobilePanel === 'rules' ? 'active' : ''}
        onClick={() => game.setMobilePanel('rules')}
      >
        规则
      </button>
      <button
        type="button"
        className={game.mobilePanel === 'board' ? 'active' : ''}
        onClick={() => game.setMobilePanel('board')}
      >
        棋盘
      </button>
      <button
        type="button"
        className={game.mobilePanel === 'evidence' ? 'active' : ''}
        onClick={() => game.setMobilePanel('evidence')}
      >
        证据
      </button>
    </nav>
  )
}

