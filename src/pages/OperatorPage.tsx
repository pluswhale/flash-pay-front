import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Play, Square, Activity, LayoutList, SlidersHorizontal, X } from 'lucide-react'
import { RequestQueue } from '../components/operator/RequestQueue'
import { MainChat } from '../components/operator/MainChat'
import { ContextPanel } from '../components/operator/ContextPanel'
import { PartnerChat } from '../components/operator/PartnerChat'
import { RatesModal } from '../components/operator/RatesModal'
import { Button } from '../components/shared/Button'
import { ThemeSwitcher } from '../components/shared/ThemeSwitcher'
import { LanguageToggle } from '../components/shared/LanguageToggle'
import { useOperatorStore } from '../store/operatorStore'
import { useDealStore } from '../store/dealStore'
import { useTranslation } from '../hooks/useTranslation'
import { cn } from '../components/shared/cn'

export function OperatorPage() {
  const { t } = useTranslation()
  const { operator, shiftActive, startShift, endShift, showRatesModal, setShowRatesModal } = useOperatorStore()
  const deals = useDealStore((s) => s.deals)
  const [activeDealId, setActiveDealId] = useState<string | null>(null)

  // Mobile panel state: 'queue' | 'chat' | 'details'
  const [mobilePanel, setMobilePanel] = useState<'queue' | 'chat' | 'details'>('queue')
  const [showQueue, setShowQueue] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const handleSelectDeal = (id: string) => {
    setActiveDealId(id)
    useDealStore.getState().setActiveDeal(id)
    useDealStore.getState().markMessagesRead(id)
    if (!shiftActive) startShift()
    setShowQueue(false)
    setMobilePanel('chat')
  }

  const activeCount = deals.filter((d) => d.status !== 'COMPLETED' && d.status !== 'CANCELLED').length
  const completedCount = deals.filter((d) => d.status === 'COMPLETED').length

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#0B0F1A' }}>
      {/* Animated background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: [
            'radial-gradient(ellipse at 15% 20%, rgba(91,140,255,0.12) 0px, transparent 50%)',
            'radial-gradient(ellipse at 85% 80%, rgba(124,92,255,0.10) 0px, transparent 50%)',
            'radial-gradient(ellipse at 80% 10%, rgba(0,212,255,0.06) 0px, transparent 40%)',
          ].join(', '),
        }}
      />

      {/* Top bar */}
      <div className={cn(
        'relative z-30 shrink-0 flex items-center justify-between h-14 px-3 sm:px-5',
        'bg-[#0d1525]/90 backdrop-blur-xl',
        'border-b border-white/6',
      )}>
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile queue toggle */}
          <button
            onClick={() => setShowQueue((v) => !v)}
            className={cn(
              'sm:hidden w-8 h-8 rounded-xl flex items-center justify-center transition-all',
              'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70',
              showQueue && 'bg-[#5B8CFF]/20 text-[#5B8CFF]',
            )}
          >
            <LayoutList size={14} />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-brand-sm shrink-0">
              <Activity size={13} className="text-white" />
            </div>
            <span className="font-black text-sm text-white hidden sm:block">QuickPay CRM</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 ml-1">
            <div className="h-4 w-px bg-white/10" />
            <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-black text-white shadow-glow-brand-sm shrink-0">
              {operator.avatar}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-bold text-white/80 leading-none">{operator.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className={cn('w-1.5 h-1.5 rounded-full', shiftActive ? 'bg-emerald-400 animate-pulse' : 'bg-white/20')} />
                <p className="text-[10px] text-white/30">{shiftActive ? 'On shift' : 'Off shift'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Center stats */}
        <div className="hidden lg:flex items-center gap-6">
          {[
            { label: 'Active', value: activeCount, color: 'text-[#7AAEFF]' },
            { label: 'Completed', value: completedCount, color: 'text-emerald-300' },
            { label: 'Time', value: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), color: 'text-white/60', mono: true },
          ].map(({ label, value, color, mono }) => (
            <div key={label} className="text-center">
              <p className={cn('font-black text-sm', color, mono && 'font-mono')}>{value}</p>
              <p className="text-[10px] text-white/25 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <LanguageToggle className="hidden lg:flex" />
          <ThemeSwitcher className="hidden sm:flex" />

          <button
            onClick={() => setShowRatesModal(true)}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all bg-white/8 text-white/65 border border-white/12 hover:bg-white/14 hover:text-white/90"
          >
            <TrendingUp size={12} />
            <span className="hidden md:inline">{t.operator.rates}</span>
          </button>

          {shiftActive ? (
            <Button variant="danger" size="sm" onClick={endShift} className="gap-1 text-xs">
              <Square size={11} />
              <span className="hidden sm:inline">{t.operator.endShift}</span>
            </Button>
          ) : (
            <Button variant="success" size="sm" onClick={startShift} className="gap-1 text-xs">
              <Play size={11} />
              <span className="hidden sm:inline">{t.operator.startShift}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main layout */}
      <div className="relative z-10 flex-1 flex overflow-hidden">

        {/* LEFT SIDEBAR — Queue (desktop always visible, mobile as overlay) */}
        {/* Desktop */}
        <div className={cn(
          'hidden sm:flex flex-col w-56 shrink-0',
          'bg-[#0f1726]/80 backdrop-blur-xl',
          'border-r border-white/6',
        )}>
          <RequestQueue activeDealId={activeDealId} onSelectDeal={handleSelectDeal} shiftActive={shiftActive} />
        </div>

        {/* Mobile Queue Drawer */}
        <AnimatePresence>
          {showQueue && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="sm:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowQueue(false)}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                className={cn(
                  'sm:hidden fixed inset-y-14 left-0 z-50 w-64',
                  'bg-[#0f1726] border-r border-white/8',
                  'flex flex-col',
                )}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
                  <span className="text-xs font-black text-white/50 uppercase tracking-widest">Queue</span>
                  <button onClick={() => setShowQueue(false)} className="w-6 h-6 rounded-lg bg-white/8 flex items-center justify-center text-white/40">
                    <X size={12} />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <RequestQueue activeDealId={activeDealId} onSelectDeal={handleSelectDeal} shiftActive={shiftActive} />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* CENTER — Chat */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <MainChat
            dealId={activeDealId}
            onTogglePanel={() => setShowDetails((v) => !v)}
          />
          <PartnerChat dealId={activeDealId} />
        </div>

        {/* RIGHT SIDEBAR — Context Panel (desktop always visible, mobile as overlay) */}
        {/* Desktop */}
        <div className={cn(
          'hidden md:flex flex-col w-60 shrink-0',
          'bg-[#0f1726]/80 backdrop-blur-xl',
          'border-l border-white/6',
        )}>
          <ContextPanel dealId={activeDealId} />
        </div>

        {/* Mobile Details Drawer */}
        <AnimatePresence>
          {showDetails && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowDetails(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                className={cn(
                  'md:hidden fixed inset-y-14 right-0 z-50 w-72',
                  'bg-[#0f1726] border-l border-white/8',
                  'flex flex-col',
                )}
              >
                <ContextPanel dealId={activeDealId} onClose={() => setShowDetails(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile bottom nav */}
      <div className="sm:hidden shrink-0 flex items-center justify-around px-4 py-2 bg-[#0d1525]/95 border-t border-white/6">
        {[
          { icon: LayoutList, label: 'Queue', action: () => { setShowQueue(true); setShowDetails(false) }, count: activeCount },
          { icon: Activity, label: 'Chat', action: () => { setShowQueue(false); setShowDetails(false) }, count: 0 },
          { icon: SlidersHorizontal, label: 'Details', action: () => { setShowDetails(true); setShowQueue(false) }, count: 0 },
        ].map(({ icon: Icon, label, action, count }) => (
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
      </div>

      <AnimatePresence>
        {showRatesModal && <RatesModal onClose={() => setShowRatesModal(false)} />}
      </AnimatePresence>
    </div>
  )
}
