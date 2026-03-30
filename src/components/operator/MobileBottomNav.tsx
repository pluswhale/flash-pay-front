/**
 * MobileBottomNav — bottom tab bar, visible only on mobile (sm:hidden).
 * Three tabs: Queue | Chat | Details. Badges show active request count.
 * Pure UI: no state, callbacks wired by OperatorCRM.
 */
import { LayoutList, MessageCircle, SlidersHorizontal } from 'lucide-react'

interface Props {
  activeCount:   number
  onShowQueue:   () => void
  onShowChat:    () => void
  onShowDetail:  () => void
}

export function MobileBottomNav({ activeCount, onShowQueue, onShowChat, onShowDetail }: Props) {
  const tabs = [
    { icon: LayoutList,        label: 'Очередь', action: onShowQueue,  count: activeCount },
    { icon: MessageCircle,     label: 'Чат',     action: onShowChat,   count: 0 },
    { icon: SlidersHorizontal, label: 'Детали',  action: onShowDetail, count: 0 },
  ] as const

  return (
    <nav className="sm:hidden shrink-0 flex items-center justify-around px-4 py-2 bg-[#0d1525]/95 border-t border-white/6">
      {tabs.map(({ icon: Icon, label, action, count }) => (
        <button
          key={label}
          onClick={action}
          className="relative flex flex-col items-center gap-1 px-4 py-1 text-white/40 hover:text-white/70 transition-colors"
        >
          <Icon size={16} />
          <span className="text-[10px] font-semibold">{label}</span>
          {count > 0 && (
            <span className="absolute -top-0.5 right-2 w-3.5 h-3.5 rounded-full bg-[#5B8CFF] text-white text-[8px] flex items-center justify-center font-black">
              {count}
            </span>
          )}
        </button>
      ))}
    </nav>
  )
}
