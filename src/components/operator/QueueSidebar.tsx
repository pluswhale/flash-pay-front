/**
 * QueueSidebar — desktop left column (hidden on mobile via "hidden sm:flex").
 * Thin wrapper: owns the <aside> styling and delegates content to QueueList.
 */
import { QueueList }        from './QueueList'
import type { QueueListProps } from './QueueList'

export function QueueSidebar(props: QueueListProps) {
  return (
    <aside className="hidden sm:flex flex-col w-64 shrink-0 bg-[#0f1726]/80 backdrop-blur-xl border-r border-white/6">
      <QueueList {...props} />
    </aside>
  )
}
