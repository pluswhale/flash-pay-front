/**
 * OperatorHeader — top bar of the operator CRM.
 * Displays: mobile queue toggle | brand | active-count + clock | detail toggle | user phone | logout
 * Pure UI: no hooks, no state, all callbacks provided by the view model.
 */
import {
  Activity, LayoutList, SlidersHorizontal, LogOut,
} from 'lucide-react'
import { cn } from '../shared/cn'

interface Props {
  activeCount:        number
  now:                Date
  userPhone?:         string
  hasSelectedRequest: boolean
  showQueueDrawer:    boolean
  showDetailDrawer:   boolean
  onToggleQueue:      () => void
  onToggleDetail:     () => void
  onLogout:           () => void
}

export function OperatorHeader({
  activeCount, now, userPhone,
  hasSelectedRequest, showQueueDrawer, showDetailDrawer,
  onToggleQueue, onToggleDetail, onLogout,
}: Props) {
  return (
    <header className={cn(
      'relative z-30 shrink-0 flex items-center justify-between h-14 px-3 sm:px-5',
      'bg-[#0d1525]/90 backdrop-blur-xl border-b border-white/6',
    )}>

      {/* Left: mobile queue toggle + brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleQueue}
          className={cn(
            'sm:hidden w-8 h-8 rounded-xl flex items-center justify-center transition-all',
            'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70',
            showQueueDrawer && 'bg-[#5B8CFF]/20 text-[#5B8CFF]',
          )}
        >
          <LayoutList size={14} />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#5B8CFF] to-[#7C5CFF] flex items-center justify-center shadow-lg shrink-0">
            <Activity size={13} className="text-white" />
          </div>
          <span className="font-black text-sm text-white hidden sm:block">QuickPay CRM</span>
        </div>
      </div>

      {/* Center: live stats (desktop only) */}
      <div className="hidden md:flex items-center gap-6">
        <div className="text-center">
          <p className="font-black text-sm text-[#7AAEFF]">{activeCount}</p>
          <p className="text-[10px] text-white/25 uppercase tracking-wide">Активных</p>
        </div>
        <div className="text-center">
          <p className="font-mono font-black text-sm text-white/60">
            {now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-[10px] text-white/25 uppercase tracking-wide">Время</p>
        </div>
      </div>

      {/* Right: mobile detail toggle + user phone + logout */}
      <div className="flex items-center gap-2">
        {hasSelectedRequest && (
          <button
            onClick={onToggleDetail}
            className={cn(
              'md:hidden w-8 h-8 rounded-xl flex items-center justify-center transition-all',
              'bg-white/5 text-white/40 hover:bg-white/10',
              showDetailDrawer && 'bg-[#5B8CFF]/20 text-[#5B8CFF]',
            )}
          >
            <SlidersHorizontal size={14} />
          </button>
        )}
        <span className="hidden sm:block text-xs text-white/35 max-w-[120px] truncate">
          {userPhone}
        </span>
        <button
          onClick={onLogout}
          className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 text-white/40 hover:bg-red-500/20 hover:text-red-400 transition-all"
          title="Выйти"
        >
          <LogOut size={14} />
        </button>
      </div>
    </header>
  )
}
