import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpDown, Timer, Sparkles, Shield, Zap, TrendingUp } from 'lucide-react'
import { CurrencySelector } from './CurrencySelector'
import { QuickAuthModal } from './QuickAuthModal'
import { Button } from '../shared/Button'
import { useCountdown } from '../../hooks/useCountdown'
import { useDealStore, getRate, CURRENCIES_LIST } from '../../store/dealStore'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import { useTranslation } from '../../hooks/useTranslation'
import { cn } from '../shared/cn'

interface ExchangeWidgetProps {
  onDealCreated: (id: string) => void
}

export function ExchangeWidget({ onDealCreated }: ExchangeWidgetProps) {
  const { t } = useTranslation()
  const createDeal = useDealStore((s) => s.createDeal)
  const { user } = useAuthStore()
  const { pendingCorridor, setPendingCorridor } = useUIStore()

  const [sendCurrency, setSendCurrency] = useState('USDT')
  const [receiveCurrency, setReceiveCurrency] = useState('RUB')
  const [sendAmount, setSendAmount] = useState('1000')
  const [receiveAmount, setReceiveAmount] = useState('')
  const [receiveAnimKey, setReceiveAnimKey] = useState(0)
  const [isCreating, setIsCreating] = useState(false)
  const [showQuickAuth, setShowQuickAuth] = useState(false)
  const prevReceive = useRef('')

  const rate = getRate(sendCurrency, receiveCurrency)
  const { display, progress, reset } = useCountdown(900)
  const sendCurr = CURRENCIES_LIST.find((c) => c.code === sendCurrency)
  const receiveCurr = CURRENCIES_LIST.find((c) => c.code === receiveCurrency)

  // Apply pending corridor selection from the Corridors block
  useEffect(() => {
    if (!pendingCorridor) return
    const { from, to } = pendingCorridor
    // Only apply if both currencies exist in our list
    const fromExists = CURRENCIES_LIST.some((c) => c.code === from)
    const toExists = CURRENCIES_LIST.some((c) => c.code === to)
    if (fromExists) setSendCurrency(from)
    if (toExists) setReceiveCurrency(to)
    setPendingCorridor(null)
  }, [pendingCorridor, setPendingCorridor])

  useEffect(() => {
    const amt = parseFloat(sendAmount) || 0
    const newReceive = (amt * rate).toFixed(2)
    if (newReceive !== prevReceive.current) {
      setReceiveAmount(newReceive)
      setReceiveAnimKey((k) => k + 1)
      prevReceive.current = newReceive
    }
  }, [sendAmount, sendCurrency, receiveCurrency, rate])

  const swap = () => {
    setSendCurrency(receiveCurrency)
    setReceiveCurrency(sendCurrency)
    setSendAmount(receiveAmount)
    setReceiveAmount(sendAmount)
  }

  const executeDeal = async (clientName: string) => {
    setIsCreating(true)
    await new Promise((r) => setTimeout(r, 500))
    const id = createDeal({
      clientName,
      clientEmail: user?.login ?? '',
      sendCurrency,
      sendAmount: parseFloat(sendAmount) || 0,
      receiveCurrency,
      receiveAmount: parseFloat(receiveAmount) || 0,
      rate,
      paymentMethod: 'Card',
    })
    setIsCreating(false)
    onDealCreated(id)
  }

  const handleCreate = async () => {
    if (user) {
      // Logged in — create immediately
      await executeDeal(user.name)
    } else {
      // Not logged in — show quick auth, then create
      setShowQuickAuth(true)
    }
  }

  const handleAuthSuccess = async () => {
    setShowQuickAuth(false)
    // Wait for store to update, then use fresh user
    await new Promise((r) => setTimeout(r, 50))
    const freshUser = useAuthStore.getState().user
    if (freshUser) await executeDeal(freshUser.name)
  }

  return (
    <div className="space-y-4 w-full">
      {/* ─── Rate lock timer ─────────────────────────────────── */}
      <div className={cn(
        'flex items-center justify-between px-4 py-2.5 rounded-2xl',
        'bg-blue-50 border border-blue-200',
        'dark:bg-surface-2 dark:border-[#5B8CFF]/15',
      )}>
        <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-[#7AAEFF]">
          <Timer size={12} />
          <span className="font-medium">{t.exchange.rateLock}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1 rounded-full bg-blue-200 dark:bg-white/8 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-brand"
              style={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>
          <span className="font-mono font-bold text-blue-600 dark:text-[#7AAEFF] text-xs tabular-nums">{display}</span>
          <button
            onClick={reset}
            className="text-[10px] text-gray-400 hover:text-[#5B8CFF] transition-colors"
            title="Reset timer"
          >↺</button>
        </div>
      </div>

      {/* ─── Send block ────────────────────────────────────── */}
      <div className={cn(
        'rounded-2xl border p-4 transition-all duration-200',
        'bg-gray-50 border-gray-200 focus-within:border-blue-400 focus-within:shadow-[0_0_0_3px_rgba(91,140,255,0.12)]',
        'dark:bg-[#1a2235] dark:border-[#1a2235] dark:focus-within:border-[#5B8CFF]/60 dark:focus-within:shadow-[0_0_0_3px_rgba(91,140,255,0.2)]',
      )}>
        <p className="text-[11px] font-semibold text-gray-400 dark:text-white/40 uppercase tracking-widest mb-3">
          {t.exchange.youSend}
        </p>
        <div className="flex items-center gap-3 mb-3">
          <input
            type="number"
            value={sendAmount}
            onChange={(e) => setSendAmount(e.target.value)}
            placeholder="0.00"
            className={cn(
              'flex-1 min-w-0 bg-transparent outline-none caret-[#5B8CFF]',
              'text-3xl sm:text-4xl font-black',
              'text-gray-900 placeholder-gray-300',
              'dark:text-white dark:placeholder-white/20',
            )}
          />
          <div className={cn(
            'shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-bold',
            'bg-white border-gray-200 text-gray-700',
            'dark:bg-surface-2 dark:border-white/18 dark:text-white',
          )}>
            {sendCurrency}
            <span className="opacity-40">{sendCurr?.icon}</span>
          </div>
        </div>
        <CurrencySelector value={sendCurrency} onChange={setSendCurrency} label="Network / Asset" exclude={receiveCurrency} />
      </div>

      {/* ─── Swap button ───────────────────────────────────── */}
      <div className="flex items-center justify-center -my-1">
        <motion.button
          onClick={swap}
          whileTap={{ rotate: 180 }}
          whileHover={{ scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-brand shadow-[0_2px_12px_rgba(91,140,255,0.4)] hover:shadow-[0_4px_20px_rgba(91,140,255,0.55)]"
        >
          <ArrowUpDown size={15} className="text-white" />
        </motion.button>
      </div>

      {/* ─── Receive block ─────────────────────────────────── */}
      <div className={cn(
        'rounded-2xl border p-4',
        'bg-blue-50 border-blue-200',
        'dark:bg-[#5B8CFF]/5 dark:border-[#5B8CFF]/15',
      )}>
        <p className="text-[11px] font-semibold text-gray-400 dark:text-white/40 uppercase tracking-widest mb-3">
          {t.exchange.youReceive}
        </p>
        <div className="flex items-center gap-3 mb-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={receiveAnimKey}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 min-w-0 text-3xl sm:text-4xl font-black text-gradient-brand"
            >
              {receiveAmount || '0.00'}
            </motion.div>
          </AnimatePresence>
          <div className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-bold bg-blue-100 border-blue-200 text-blue-700 dark:bg-[#5B8CFF]/12 dark:border-[#5B8CFF]/25 dark:text-[#7AAEFF]">
            {receiveCurrency}
            <span className="opacity-50">{receiveCurr?.icon}</span>
          </div>
        </div>
        <CurrencySelector value={receiveCurrency} onChange={setReceiveCurrency} label="Payout Method" exclude={sendCurrency} />
      </div>

      {/* ─── Rate row ──────────────────────────────────────── */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-white/40">
          <TrendingUp size={12} />
          <span>{t.exchange.rate}</span>
        </div>
        <span className="text-xs font-semibold text-gray-700 dark:text-white/70">
          1 {sendCurrency} = {rate.toLocaleString()} {receiveCurrency}
        </span>
      </div>

      {/* ─── CTA ──────────────────────────────────────────── */}
      <Button
        variant="primary"
        size="xl"
        fullWidth
        onClick={handleCreate}
        isLoading={isCreating}
        className="mt-2 font-black tracking-wide h-14 text-base"
      >
        <Zap size={17} />
        {user ? t.exchange.createDeal : t.exchange.signInToCreate}
      </Button>

      {/* ─── Trust indicators ─────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        {[
          { icon: Shield,   label: t.exchange.secure },
          { icon: Zap,      label: t.exchange.instant },
          { icon: Sparkles, label: t.exchange.bestRate },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center justify-center gap-1.5 py-2">
            <Icon size={12} className="text-[#5B8CFF] shrink-0" />
            <span className="text-[11px] text-gray-400 dark:text-white/40 leading-tight">{label}</span>
          </div>
        ))}
      </div>

      {/* ─── Quick Auth Modal ─────────────────────────────── */}
      <AnimatePresence>
        {showQuickAuth && (
          <QuickAuthModal
            onClose={() => setShowQuickAuth(false)}
            onSuccess={handleAuthSuccess}
            title={t.exchange.signInToCreate}
            description="Quick registration — no email required. Deal data is preserved."
          />
        )}
      </AnimatePresence>
    </div>
  )
}
