/**
 * QueueList — search bar + filter chips + scrollable request list.
 * Reused inside both QueueSidebar (desktop) and QueueDrawer (mobile).
 * Pure UI: no hooks, no state, no side effects.
 */
import { AnimatePresence }    from 'framer-motion'
import { Search, Inbox, Loader2 } from 'lucide-react'
import { QueueItem }          from './QueueItem'
import { cn }                 from '../shared/cn'
import { RequestStatus }      from '../../types/api'
import type { OtcRequest }    from '../../types/api'

const FILTERS: Array<{ label: string; value: RequestStatus | undefined }> = [
  { label: 'Все',       value: undefined },
  { label: 'Новые',     value: RequestStatus.NEW },
  { label: 'Назначены', value: RequestStatus.ASSIGNED },
  { label: 'В работе',  value: RequestStatus.IN_PROGRESS },
  { label: 'Завершены', value: RequestStatus.COMPLETED },
  { label: 'Отменены',  value: RequestStatus.CANCELLED },
]

export interface QueueListProps {
  requests:       OtcRequest[]
  isLoading:      boolean
  selectedId:     string | null
  filter:         RequestStatus | undefined
  search:         string
  onFilterChange: (f: RequestStatus | undefined) => void
  onSearchChange: (s: string) => void
  onSelect:       (id: string) => void
}

export function QueueList({
  requests, isLoading, selectedId,
  filter, search,
  onFilterChange, onSearchChange, onSelect,
}: QueueListProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Header row: title + count badge */}
      <div className="px-3 pt-3 pb-2 shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-white/50 uppercase tracking-widest">Очередь</span>
          {requests.length > 0 && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#5B8CFF]/20 text-[#7AAEFF] font-bold">
              {requests.length}
            </span>
          )}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/8">
          <Search size={11} className="text-white/25 shrink-0" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Поиск..."
            className="flex-1 bg-transparent text-xs text-white placeholder-white/25 outline-none"
          />
        </div>

        {/* Filter chips (horizontally scrollable) */}
        <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-hide">
          {FILTERS.map(({ label, value }) => (
            <button
              key={label}
              type="button"
              onClick={() => onFilterChange(value)}
              className={cn(
                'shrink-0 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all',
                filter === value
                  ? 'bg-[#5B8CFF]/30 text-[#7AAEFF] border border-[#5B8CFF]/40'
                  : 'bg-white/5 text-white/35 hover:bg-white/10 hover:text-white/55 border border-transparent',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable item list */}
      <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={20} className="animate-spin text-white/20" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-4">
            <Inbox size={28} className="text-white/15" />
            <p className="text-xs text-white/30">Заявок нет</p>
          </div>
        ) : (
          <AnimatePresence>
            {requests.map((req, i) => (
              <QueueItem
                key={req.id}
                request={req}
                isActive={req.id === selectedId}
                index={i}
                onSelect={onSelect}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
