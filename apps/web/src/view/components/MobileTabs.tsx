import type { RoomAxiomsGame } from '../../hooks/useRoomAxiomsGame'
import { scenePanels } from '../../theme/vocabulary'

interface MobileTabsProps {
  readonly game: RoomAxiomsGame
}

export function MobileTabs({ game }: MobileTabsProps) {
  return (
    <nav className="mobile-tabs" aria-label="移动端现场面板">
      <button
        type="button"
        className={game.mobilePanel === 'rules' ? 'active' : ''}
        onClick={() => game.setMobilePanel('rules')}
      >
        {scenePanels.rules}
      </button>
      <button
        type="button"
        className={game.mobilePanel === 'board' ? 'active' : ''}
        onClick={() => game.setMobilePanel('board')}
      >
        {scenePanels.map}
      </button>
      <button
        type="button"
        className={game.mobilePanel === 'evidence' ? 'active' : ''}
        onClick={() => game.setMobilePanel('evidence')}
      >
        {scenePanels.record}
      </button>
    </nav>
  )
}
