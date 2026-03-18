import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, AlertTriangle, Clock, Search } from 'lucide-react'
import { useState } from 'react'
import { useDealStore } from '../../store/dealStore'
import { StatusBadge } from '../shared/StatusBadge'
import { useTranslation } from '../../hooks/useTranslation'
import { cn } from '../shared/cn'
import type { DealStatus } from '../../types'

interface RequestQueueProps {
  activeDealId: string | null
  onSelectDeal: (id: string) => void
  shiftActive: boolean
}

export function RequestQueue({ activeDealId, onSelectDeal, shiftActive }: RequestQueueProps) {
  const { t } = useTranslation()
  const deals = useDealStore((s) => s.deals)
  const [search, setSearch] = useState('')

  const filtered = deals.filter(
    (d) =>
      search === '' ||
      d.clientName.toLowerCase().includes(search.toLowerCase()) ||
      d.id.toLowerCase().includes(search.toLowerCase())
  )

  const statusLabels: Record<DealStatus, string> = {
    NEW: t.status.NEW, IN_PROGRESS: t.status.IN_PROGRESS,
    PAYMENT_RECEIVED: t.status.PAYMENT_RECEIVED, COMPLETED: t.status.COMPLETED, CANCELLED: t.status.CANCELLED,
  }

  const timeAgo = (date: Date) => {
    const s = Math.floor((Date.now() - date.getTime()) / 1000)
    if (s < 60) return 'just now'
    const m = Math.floor(s / 60)
    if (m < 60) return `${m}m`
    return `${Math.floor(m / 60)}h`
  }

  const unreadCount = (id: string) => {
    const deal = deals.find((d) => d.id === id)
    return deal?.messages.filter((m) => !m.isRead && m.from === 'client').length ?? 0
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black text-white/50 uppercase tracking-widest">Queue</span>
          {shiftActive && filtered.length > 0 && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#5B8CFF]/20 text-[#7AAEFF] font-bold">
              {filtered.length}
            </span>
          )}
        </div>
        {shiftActive && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/8">
            <Search size={11} className="text-white/25 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="flex-1 bg-transparent text-xs text-white placeholder-white/25 outline-none"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-1.5">
        {!shiftActive ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-10 px-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
              <Clock size={20} className="text-white/20" />
            </div>
            <p className="text-xs text-white/30 leading-relaxed">{t.operator.shiftNotStarted}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-10 px-4">
            <MessageCircle size={28} className="text-white/15" />
            <p className="text-xs text-white/30">{t.operator.noDeals}</p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((deal, i) => {
              const unread = unreadCount(deal.id)
              const isActive = deal.id === activeDealId

              return (
                <motion.button
                  key={deal.id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => onSelectDeal(deal.id)}
                  className={cn(
                    'w-full text-left p-3 rounded-2xl transition-all duration-200',
                    'border-l-2',
                    deal.isHighValue
                      ? 'border-l-red-500 bg-red-500/8 hover:bg-red-500/12'
                      : isActive
                      ? 'border-l-[#5B8CFF] bg-[#5B8CFF]/12'
                      : 'border-l-transparent bg-white/3 hover:bg-white/6',
                  )}
                >
                  <div className="flex items-start justify-between gap-1.5 mb-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {deal.isHighValue && (
                        <AlertTriangle size={11} className="text-red-400 shrink-0" />
                      )}
                      <span className="font-bold text-xs text-white truncate">
                        {deal.clientName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {unread > 0 && (
                        <span className="w-4 h-4 rounded-full bg-[#5B8CFF] text-white text-[9px] flex items-center justify-center font-black">
                          {unread}
                        </span>
                      )}
                      <span className="text-[10px] text-white/25">{timeAgo(deal.createdAt)}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-white/40 mb-2 font-medium">
                    {deal.sendAmount.toLocaleString()} {deal.sendCurrency}
                    {' → '}
                    {deal.receiveAmount.toLocaleString()} {deal.receiveCurrency}
                  </p>

                  <StatusBadge status={deal.status} label={statusLabels[deal.status]} size="xs" />
                </motion.button>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
