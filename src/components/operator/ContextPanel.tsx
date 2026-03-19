import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, TrendingUp, Quote, CheckCircle2, RefreshCw, AlertTriangle, X } from 'lucide-react'
import { useDealStore } from '../../store/dealStore'
import { StatusBadge } from '../shared/StatusBadge'
import { Button } from '../shared/Button'
import { mockApi } from '../../services/mockApi'
import { useTranslation } from '../../hooks/useTranslation'
import { cn } from '../shared/cn'
import type { DealStatus } from '../../types'

interface ContextPanelProps {
  dealId: string | null
  onClose?: () => void
}

type Tab = 'client' | 'deal' | 'rfq'

const STATUS_ORDER: DealStatus[] = ['AWAITING_PAYMENT', 'IN_PROGRESS', 'PAYMENT_RECEIVED', 'VERIFICATION', 'PAYOUT_SENT', 'COMPLETED']

export function ContextPanel({ dealId, onClose }: ContextPanelProps) {
  const { t } = useTranslation()
  const { getDeal, updateDealStatus, setPartnerQuote } = useDealStore()
  const [activeTab, setActiveTab] = useState<Tab>('client')
  const [isRequestingRFQ, setIsRequestingRFQ] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)

  const deal = dealId ? getDeal(dealId) : null

  useEffect(() => { setShowStatusMenu(false) }, [dealId])

  const handleRequestRFQ = async () => {
    if (!dealId) return
    setIsRequestingRFQ(true)
    const quote = await mockApi.requestRFQ(dealId)
    setPartnerQuote(dealId, {
      provider: quote.provider,
      rate: quote.rate,
      validUntil: new Date(Date.now() + 5 * 60 * 1000),
    })
    setIsRequestingRFQ(false)
  }

  const statusLabels: Record<DealStatus, string> = {
    NEW: t.status.NEW, AWAITING_PAYMENT: t.status.AWAITING_PAYMENT,
    IN_PROGRESS: t.status.IN_PROGRESS, PAYMENT_RECEIVED: t.status.PAYMENT_RECEIVED,
    VERIFICATION: t.status.VERIFICATION, PAYOUT_SENT: t.status.PAYOUT_SENT,
    COMPLETED: t.status.COMPLETED, CANCELLED: t.status.CANCELLED,
    REFUND: t.status.REFUND, EXPIRED: t.status.EXPIRED,
  }

  const tabs = [
    { id: 'client' as Tab, label: 'Client', icon: User },
    { id: 'deal' as Tab, label: 'Deal', icon: TrendingUp },
    { id: 'rfq' as Tab, label: 'RFQ', icon: Quote },
  ]

  if (!deal) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <User size={24} className="text-white/15 mb-3" />
        <p className="text-xs text-white/25 leading-relaxed">Select a deal to view client & deal details</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header + tabs */}
      <div className="shrink-0 border-b border-white/6">
        <div className="flex items-center justify-between px-3 pt-3 pb-2">
          <span className="text-xs font-black text-white/40 uppercase tracking-widest">Details</span>
          {onClose && (
            <button onClick={onClose} className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/10 transition-all">
              <X size={11} />
            </button>
          )}
        </div>
        <div className="flex gap-1 px-2 pb-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-[11px] font-bold transition-all duration-150',
                activeTab === id
                  ? 'bg-gradient-brand text-white shadow-glow-brand-sm'
                  : 'text-white/35 hover:text-white/60 hover:bg-white/5',
              )}
            >
              <Icon size={11} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* CLIENT TAB */}
          {activeTab === 'client' && (
            <motion.div
              key="client"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.12 }}
              className="p-3 space-y-3"
            >
              {/* Client card */}
              <div className={cn(
                'flex items-center gap-3 p-3 rounded-2xl',
                'bg-gradient-to-r from-[#5B8CFF]/10 to-[#7C5CFF]/8 border border-[#5B8CFF]/15',
              )}>
                <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-sm font-black text-white shadow-glow-brand-sm shrink-0">
                  {deal.clientName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-white truncate">{deal.clientName}</p>
                  <p className="text-[11px] text-white/40 truncate">{deal.clientEmail}</p>
                </div>
              </div>

              {/* Risk score */}
              <div className="bg-white/3 border border-white/6 rounded-2xl p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40">{t.operator.riskScore}</span>
                  <div className="flex items-center gap-1.5">
                    {deal.riskScore > 60 && <AlertTriangle size={11} className="text-red-400" />}
                    <span className={cn(
                      'text-sm font-black',
                      deal.riskScore < 30 ? 'text-emerald-300' : deal.riskScore < 60 ? 'text-amber-300' : 'text-red-300',
                    )}>
                      {deal.riskScore}
                    </span>
                    <span className="text-[10px] text-white/25">/100</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${deal.riskScore}%` }}
                    transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
                    className={cn(
                      'h-full rounded-full',
                      deal.riskScore < 30 ? 'bg-gradient-emerald' : deal.riskScore < 60 ? 'bg-gradient-amber' : 'bg-gradient-rose',
                    )}
                  />
                </div>
              </div>

              {/* Volume */}
              <div className="bg-white/3 border border-white/6 rounded-2xl p-3">
                <p className="text-[11px] text-white/35 mb-1">{t.operator.volume30d}</p>
                <p className="font-black text-lg text-white">${deal.volume30d.toLocaleString()}</p>
              </div>

              {/* High value alert */}
              {deal.isHighValue && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-red-500/10 border border-red-500/20">
                  <AlertTriangle size={12} className="text-red-400 shrink-0" />
                  <p className="text-xs font-semibold text-red-300">HIGH VALUE — RED Request</p>
                </div>
              )}
            </motion.div>
          )}

          {/* DEAL TAB */}
          {activeTab === 'deal' && (
            <motion.div
              key="deal"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.12 }}
              className="p-3 space-y-3"
            >
              {/* Deal info rows */}
              <div className="bg-white/3 border border-white/6 rounded-2xl overflow-hidden">
                {[
                  { label: 'Deal ID', value: deal.id, mono: true },
                  { label: 'Amount', value: `${deal.sendAmount} ${deal.sendCurrency}`, mono: false },
                  { label: 'Payout', value: `${deal.receiveAmount.toLocaleString()} ${deal.receiveCurrency}`, highlight: true },
                ].map(({ label, value, mono, highlight }) => (
                  <div key={label} className="flex items-center justify-between px-3 py-2.5 border-b border-white/5 last:border-0">
                    <span className="text-[11px] text-white/35">{label}</span>
                    <span className={cn(
                      'text-xs font-semibold',
                      mono && 'font-mono',
                      highlight ? 'text-gradient-brand' : 'text-white/75',
                    )}>
                      {value}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[11px] text-white/35">Status</span>
                  <StatusBadge status={deal.status} label={statusLabels[deal.status]} size="xs" />
                </div>
              </div>

              {/* Quick actions */}
              <div className="space-y-2">
                <Button
                  variant="success"
                  size="sm"
                  fullWidth
                  onClick={() => deal.status === 'IN_PROGRESS' && updateDealStatus(deal.id, 'PAYMENT_RECEIVED')}
                  disabled={deal.status !== 'IN_PROGRESS'}
                  className="gap-1.5 text-xs"
                >
                  <CheckCircle2 size={13} />
                  {t.operator.confirmReceipt}
                </Button>

                {/* Status selector */}
                <div className="relative">
                  <Button
                    variant="success"
                    size="sm"
                    fullWidth
                    onClick={() => setShowStatusMenu((v) => !v)}
                    disabled={deal.status === 'COMPLETED' || deal.status === 'CANCELLED'}
                    className="gap-1.5 text-xs justify-between dark:bg-surface-2 0 dark:border-surface-border dark:text-black dark:hover:bg-surface-2"
                  >
                    <div className="flex items-center gap-1.5 !text-black">
                      <RefreshCw size={12} />
                      {t.operator.updateStatus}
                    </div>
                    <span className={cn('transition-transform', showStatusMenu && 'rotate-180')}>▾</span>
                  </Button>

                  <AnimatePresence>
                    {showStatusMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.97 }}
                        className={cn(
                          'absolute bottom-full mb-1 left-0 right-0 rounded-2xl overflow-hidden z-20',
                          'glass-bright shadow-glass-lg',
                        )}
                      >
                        {STATUS_ORDER.filter((s) => s !== deal.status).map((status) => (
                          <button
                            key={status}
                            onClick={() => { updateDealStatus(deal.id, status); setShowStatusMenu(false) }}
                            className="w-full px-3 py-2.5 text-left flex items-center gap-2 hover:bg-[#5B8CFF]/12 transition-colors"
                          >
                            <StatusBadge status={status} label={statusLabels[status]} size="xs" />
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Button
                  variant="danger"
                  size="sm"
                  fullWidth
                  onClick={() => updateDealStatus(deal.id, 'CANCELLED')}
                  disabled={deal.status === 'COMPLETED' || deal.status === 'CANCELLED'}
                  className="gap-1.5 text-xs"
                >
                  <X size={12} />
                  Cancel Deal
                </Button>
              </div>
            </motion.div>
          )}

          {/* RFQ TAB */}
          {activeTab === 'rfq' && (
            <motion.div
              key="rfq"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.12 }}
              className="p-3 space-y-3"
            >
              <p className="text-xs text-white/35 leading-relaxed">
                Request live quotes from liquidity partners for the best execution rate.
              </p>

              {deal.partnerQuote ? (
                <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-300">Quote Received</span>
                  </div>
                  {[
                    { label: 'Provider', value: deal.partnerQuote.provider },
                    { label: 'Rate', value: `${deal.partnerQuote.rate.toFixed(4)} ${deal.receiveCurrency}`, bold: true },
                    {
                      label: 'Valid until',
                      value: deal.partnerQuote.validUntil.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ].map(({ label, value, bold }) => (
                    <div key={label} className="flex justify-between text-xs">
                      <span className="text-white/35">{label}</span>
                      <span className={cn('font-semibold', bold ? 'text-emerald-300' : 'text-white/70')}>{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-white/3 border border-white/6 rounded-2xl">
                  <Quote size={20} className="text-white/15 mx-auto mb-2" />
                  <p className="text-xs text-white/25">No quotes yet</p>
                </div>
              )}

              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={handleRequestRFQ}
                isLoading={isRequestingRFQ}
                className="gap-1.5 text-xs"
              >
                <Quote size={12} />
                {t.operator.requestRFQ}
              </Button>

              {isRequestingRFQ && (
                <p className="text-[11px] text-center text-white/30 animate-pulse">
                  Contacting partners… (~5s)
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
