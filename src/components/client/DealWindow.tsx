import { motion } from 'framer-motion'
import { Copy, CheckCircle2, Clock, Zap, ExternalLink, ArrowRight, ArrowLeft } from 'lucide-react'
import { useDealStore } from '../../store/dealStore'
import { StatusBadge } from '../shared/StatusBadge'
import { SupportChat } from './SupportChat'
import { useCopy } from '../../hooks/useCopy'
import { useTranslation } from '../../hooks/useTranslation'
import { cn } from '../shared/cn'
import type { DealStatus } from '../../types'

interface DealWindowProps {
  dealId: string
  onBack?: () => void
}

const STATUS_ORDER: DealStatus[] = ['NEW', 'IN_PROGRESS', 'PAYMENT_RECEIVED', 'COMPLETED']

const stepInfo: Record<DealStatus, { icon: typeof Zap }> = {
  NEW:              { icon: Clock },
  IN_PROGRESS:      { icon: Zap },
  PAYMENT_RECEIVED: { icon: CheckCircle2 },
  COMPLETED:        { icon: CheckCircle2 },
  CANCELLED:        { icon: Clock },
}

export function DealWindow({ dealId, onBack }: DealWindowProps) {
  const { t } = useTranslation()
  const getDeal = useDealStore((s) => s.getDeal)
  const { copied, copy } = useCopy()
  const deal = getDeal(dealId)

  if (!deal) return null

  const statusLabels: Record<DealStatus, string> = {
    NEW: t.status.NEW,
    IN_PROGRESS: t.status.IN_PROGRESS,
    PAYMENT_RECEIVED: t.status.PAYMENT_RECEIVED,
    COMPLETED: t.status.COMPLETED,
    CANCELLED: t.status.CANCELLED,
  }

  const stepIdx = STATUS_ORDER.indexOf(deal.status)
  const isCompleted = deal.status === 'COMPLETED'

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      className="space-y-5 w-full"
    >
      {/* ─── Back nav ──────────────────────────────────────── */}
      {onBack && (
        <div className="flex items-center gap-2 -mb-1">
          <motion.button
            onClick={onBack}
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
              'text-gray-500 hover:text-gray-800 hover:bg-gray-100',
              'dark:text-white/40 dark:hover:text-white/80 dark:hover:bg-white/8',
            )}
          >
            <ArrowLeft size={13} />
            Back to Exchange
          </motion.button>
          <span className="text-gray-300 dark:text-white/15 text-xs">/</span>
          <span className="text-xs text-gray-400 dark:text-white/35 font-mono">Deal {deal.id}</span>
        </div>
      )}

      {/* ─── Deal header ───────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-gray-400 dark:text-white/35 uppercase tracking-widest mb-1">
            {t.deal.id}
          </p>
          <p className="font-mono font-black text-xl text-gray-900 dark:text-white leading-none">
            {deal.id}
          </p>
        </div>
        <StatusBadge status={deal.status} label={statusLabels[deal.status]} size="md" pulse={!isCompleted} />
      </div>

      {/* ─── Progress stepper ──────────────────────────────── */}
      <div className="relative flex items-center">
        <div className="absolute inset-x-0 top-4 h-px bg-gray-200 dark:bg-white/8" />
        <motion.div
          className="absolute top-4 left-0 h-px bg-gradient-brand"
          initial={{ width: '0%' }}
          animate={{ width: `${(stepIdx / (STATUS_ORDER.length - 1)) * 100}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
        <div className="relative flex justify-between w-full">
          {STATUS_ORDER.map((step, i) => {
            const done = i <= stepIdx
            const { icon: Icon } = stepInfo[step]
            return (
              <div key={step} className="flex flex-col items-center gap-2 z-10">
                <motion.div
                  animate={done ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                    done
                      ? 'bg-gradient-brand border-[#5B8CFF] shadow-[0_2px_8px_rgba(91,140,255,0.5)]'
                      : 'bg-gray-100 border-gray-200 dark:bg-white/5 dark:border-white/15',
                  )}
                >
                  <Icon size={13} className={done ? 'text-white' : 'text-gray-300 dark:text-white/25'} />
                </motion.div>
                <span className={cn(
                  'text-[10px] font-semibold text-center max-w-14 leading-tight',
                  done ? 'text-[#5B8CFF]' : 'text-gray-300 dark:text-white/25',
                )}>
                  {statusLabels[step]}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── Exchange summary ──────────────────────────────── */}
      <div className={cn(
        'rounded-2xl border p-4',
        'bg-gray-50 border-gray-200',
        'dark:bg-surface-2 dark:border-surface-border',
      )}>
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="text-2xl font-black text-gray-900 dark:text-white">
              {deal.sendAmount.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5 font-medium">{deal.sendCurrency}</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-[0_2px_8px_rgba(91,140,255,0.4)]">
              <ArrowRight size={14} className="text-white" />
            </div>
            <span className="text-[10px] text-gray-300 dark:text-white/30">×{deal.rate.toLocaleString()}</span>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-gradient-brand">
              {deal.receiveAmount.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5 font-medium">{deal.receiveCurrency}</p>
          </div>
        </div>
      </div>

      {/* ─── Requisites ────────────────────────────────────── */}
      {!isCompleted && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 dark:text-white/40 uppercase tracking-wide">
            {t.deal.sendTo}
          </p>
          <div className={cn(
            'flex items-center gap-3 p-3.5 rounded-2xl border',
            'bg-gray-50 border-gray-200',
            'dark:bg-surface-2 dark:border-surface-border',
          )}>
            <p className="flex-1 min-w-0 font-mono text-xs text-gray-700 dark:text-white/70 break-all leading-relaxed">
              {deal.requisites}
            </p>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => copy(deal.requisites)}
              className={cn(
                'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
                copied
                  ? 'bg-emerald-500 text-white'
                  : 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200 dark:bg-[#5B8CFF]/15 dark:text-[#7AAEFF] dark:border-[#5B8CFF]/20 dark:hover:bg-[#5B8CFF]/25',
              )}
            >
              {copied ? <CheckCircle2 size={11} /> : <Copy size={11} />}
              {copied ? t.deal.copied : t.deal.copyAddress}
            </motion.button>
          </div>
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400/80">
            <Clock size={11} />
            <span>{t.deal.waitingPayment}</span>
          </div>
        </div>
      )}

      {/* ─── Completed state ───────────────────────────────── */}
      {isCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-3xl text-center space-y-3 bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/8 dark:border-emerald-500/20"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-emerald mx-auto flex items-center justify-center shadow-[0_4px_16px_rgba(34,197,94,0.4)]">
            <CheckCircle2 size={24} className="text-white" />
          </div>
          <p className="font-bold text-lg text-emerald-700 dark:text-emerald-300">{t.deal.completed}</p>
          <p className="text-sm text-gray-500 dark:text-white/50">
            {deal.receiveAmount.toLocaleString()} {deal.receiveCurrency} sent to your wallet
          </p>
        </motion.div>
      )}

      {/* ─── Quick links ───────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2">
        <motion.a
          href={`https://t.me/quickpay_bot?start=${deal.id}`}
          target="_blank" rel="noopener noreferrer"
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 dark:bg-[#229ED9]/10 dark:text-[#5BC8F5] dark:border-[#229ED9]/20 dark:hover:bg-[#229ED9]/20 transition-colors"
        >
          <ExternalLink size={12} />
          {t.deal.exchangeViaTelegram}
        </motion.a>
        <motion.a
          href={`https://wa.me/79001234567?text=Deal+${deal.id}`}
          target="_blank" rel="noopener noreferrer"
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-[#25D366]/10 dark:text-[#25D366] dark:border-[#25D366]/20 dark:hover:bg-[#25D366]/20 transition-colors"
        >
          <ExternalLink size={12} />
          {t.deal.exchangeViaWhatsApp}
        </motion.a>
      </div>

      <SupportChat dealId={dealId} />
    </motion.div>
  )
}
