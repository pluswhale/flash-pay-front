import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Copy, Check, Clock, MessageCircle, Shield, ArrowUpDown, ChevronRight, CheckCircle2 } from 'lucide-react'
import { useDealStore } from '../store/dealStore'
import { useTranslation } from '../hooks/useTranslation'
import { useCopy } from '../hooks/useCopy'
import { StatusBadge } from '../components/shared/StatusBadge'
import { Button } from '../components/shared/Button'
import { GlassCard } from '../components/shared/GlassCard'
import { SupportChat } from '../components/client/SupportChat'
import { cn } from '../components/shared/cn'
import type { DealStatus } from '../types'

const STATUS_STEPS: DealStatus[] = [
  'AWAITING_PAYMENT',
  'PAYMENT_RECEIVED',
  'VERIFICATION',
  'PAYOUT_SENT',
  'COMPLETED',
]

const STATUS_LABELS: Record<DealStatus, string> = {
  NEW: 'New',
  AWAITING_PAYMENT: 'Awaiting Payment',
  IN_PROGRESS: 'In Progress',
  PAYMENT_RECEIVED: 'Payment Received',
  VERIFICATION: 'Verification',
  PAYOUT_SENT: 'Payout Sent',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  REFUND: 'Refund',
  EXPIRED: 'Expired',
}

function Timer({ expiry }: { expiry: Date }) {
  const [remaining, setRemaining] = useState('')
  useEffect(() => {
    const update = () => {
      const diff = new Date(expiry).getTime() - Date.now()
      if (diff <= 0) { setRemaining('Expired'); return }
      const m = Math.floor(diff / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setRemaining(`${m}:${s.toString().padStart(2, '0')}`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [expiry])
  return <span className="font-mono font-bold text-[#5B8CFF]">{remaining}</span>
}

export function DealPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const getDeal = useDealStore((s) => s.getDeal)
  const updateDealStatus = useDealStore((s) => s.updateDealStatus)
  const addLog = useDealStore((s) => s.addLog)
  const { copy, copied } = useCopy()
  const [showChat, setShowChat] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [paid, setPaid] = useState(false)

  const deal = id ? getDeal(id) : undefined

  const handleConfirmPayment = async () => {
    if (!deal) return
    setIsPaying(true)
    await new Promise((r) => setTimeout(r, 1000))
    updateDealStatus(deal.id, 'PAYMENT_RECEIVED')
    addLog(deal.id, { action: 'Client confirmed payment', timestamp: new Date(), actor: 'client' })
    setIsPaying(false)
    setPaid(true)
    // Simulate operator verification
    setTimeout(() => {
      updateDealStatus(deal.id, 'VERIFICATION')
      addLog(deal.id, { action: 'Operator verification started', timestamp: new Date(), actor: 'operator' })
    }, 3000)
    setTimeout(() => {
      updateDealStatus(deal.id, 'PAYOUT_SENT')
      addLog(deal.id, { action: 'Payout sent', timestamp: new Date(), actor: 'system' })
    }, 8000)
    setTimeout(() => {
      updateDealStatus(deal.id, 'COMPLETED')
      addLog(deal.id, { action: 'Deal completed', timestamp: new Date(), actor: 'system' })
    }, 12000)
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-app flex flex-col items-center justify-center gap-4 pt-20">
        <p className="text-gray-400 dark:text-white/40">Deal not found.</p>
        <Link to="/"><Button variant="outline">Back to Exchange</Button></Link>
      </div>
    )
  }

  const currentStepIndex = STATUS_STEPS.indexOf(deal.status as DealStatus)

  return (
    <div className="min-h-screen bg-app pt-20 sm:pt-24 pb-16 px-4 sm:px-6">
      <div className="fixed inset-0 bg-mesh-brand pointer-events-none opacity-40" />
      <div className="relative z-10 max-w-3xl mx-auto">

        {/* Back */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70 mb-5 transition-colors"
          >
            <ArrowLeft size={13} /> {t.common.back}
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-5"
        >
          <div>
            <p className="text-[11px] text-gray-400 dark:text-white/35 font-medium mb-1">{t.deal.id}</p>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-xl text-gray-900 dark:text-white">{deal.id}</h1>
              <StatusBadge status={deal.status} />
            </div>
          </div>
          <button
            onClick={() => setShowChat((v) => !v)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all',
              'bg-white border-gray-200 text-gray-600 hover:border-blue-300',
              'dark:bg-[#1a2235] dark:border-white/10 dark:text-white/60',
            )}
          >
            <MessageCircle size={13} />
            {t.deal.support}
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">

            {/* ─── Rate lock ───────────────────────────── */}
            {deal.rateLocked && deal.status === 'AWAITING_PAYMENT' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'flex items-center justify-between p-3.5 rounded-2xl border',
                  'bg-blue-50 border-blue-200',
                  'dark:bg-[#1a2235] dark:border-[#5B8CFF]/25',
                )}
              >
                <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-[#7AAEFF]">
                  <Clock size={12} />
                  <span className="font-semibold">{t.deal.rateLockExpiry}</span>
                </div>
                <Timer expiry={deal.rateLockExpiry} />
              </motion.div>
            )}

            {/* ─── Summary card ─────────────────────── */}
            <GlassCard variant="elevated">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-xl bg-gradient-brand flex items-center justify-center">
                    <ArrowUpDown size={13} className="text-white" />
                  </div>
                  <span className="font-black text-sm text-gray-900 dark:text-white">Exchange Summary</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'You Send', value: `${deal.sendAmount.toLocaleString()} ${deal.sendCurrency}` },
                    { label: 'You Receive', value: `${deal.receiveAmount.toLocaleString()} ${deal.receiveCurrency}` },
                    { label: 'Rate', value: `1 ${deal.sendCurrency} = ${deal.rate.toLocaleString()} ${deal.receiveCurrency}` },
                    { label: 'Created', value: new Date(deal.createdAt).toLocaleString() },
                  ].map(({ label, value }) => (
                    <div key={label} className={cn('p-3 rounded-xl', 'bg-gray-50 dark:bg-[#1a2235]')}>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-white/30 mb-1">{label}</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* ─── Requisites ───────────────────────── */}
            {(deal.status === 'AWAITING_PAYMENT' || deal.status === 'IN_PROGRESS') && (
              <GlassCard variant="elevated">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-white/35 mb-3">
                  {t.deal.sendTo}
                </p>
                <div className={cn(
                  'flex items-center gap-3 p-3.5 rounded-xl border',
                  'bg-gray-50 border-gray-200',
                  'dark:bg-[#1a2235] dark:border-white/10',
                )}>
                  <Shield size={14} className="text-[#5B8CFF] shrink-0" />
                  <code className="flex-1 text-xs font-mono text-gray-700 dark:text-white/70 break-all">{deal.requisites}</code>
                  <button
                    onClick={() => copy(deal.requisites)}
                    className={cn(
                      'shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all',
                      copied ? 'bg-emerald-500 text-white' : 'bg-[#5B8CFF] text-white hover:bg-[#4A7AEE]',
                    )}
                  >
                    {copied ? <Check size={10} /> : <Copy size={10} />}
                    {copied ? 'Copied' : t.deal.copyAddress}
                  </button>
                </div>

                {!paid && (
                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    onClick={handleConfirmPayment}
                    isLoading={isPaying}
                    className="mt-3 h-12 font-black"
                  >
                    <CheckCircle2 size={16} />
                    {t.deal.confirmPayment}
                  </Button>
                )}
              </GlassCard>
            )}

            {/* ─── Timeline ─────────────────────────── */}
            <GlassCard variant="elevated">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-white/35 mb-4">
                {t.deal.timeline}
              </p>
              <div className="space-y-0">
                {STATUS_STEPS.map((step, i) => {
                  const done = currentStepIndex > i || deal.status === 'COMPLETED'
                  const active = i === currentStepIndex
                  return (
                    <div key={step} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0',
                          done  ? 'bg-emerald-500 border-emerald-500' :
                          active ? 'bg-[#5B8CFF] border-[#5B8CFF] animate-pulse' :
                          'bg-white border-gray-300 dark:bg-[#1a2235] dark:border-white/20',
                        )}>
                          {done ? <Check size={11} className="text-white" /> :
                           active ? <div className="w-2 h-2 rounded-full bg-white" /> :
                           <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-white/20" />}
                        </div>
                        {i < STATUS_STEPS.length - 1 && (
                          <div className={cn('w-0.5 h-6 mt-0.5', done ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-white/10')} />
                        )}
                      </div>
                      <div className="pb-5">
                        <p className={cn(
                          'text-sm font-semibold',
                          done || active ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-white/30',
                        )}>
                          {STATUS_LABELS[step]}
                        </p>
                        {active && (
                          <p className="text-[11px] text-[#5B8CFF] font-medium mt-0.5">In progress…</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </GlassCard>

            {/* ─── Action log ───────────────────────── */}
            {deal.logs && deal.logs.length > 0 && (
              <GlassCard variant="default">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-white/35 mb-3">Activity Log</p>
                <div className="space-y-2">
                  {[...deal.logs].reverse().map((log) => (
                    <div key={log.id} className="flex items-start gap-2 text-xs">
                      <span className="text-gray-400 dark:text-white/30 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="text-gray-700 dark:text-white/70">{log.action}</span>
                      <span className={cn(
                        'ml-auto text-[10px] font-bold shrink-0 px-1.5 py-0.5 rounded-full',
                        log.actor === 'system'   ? 'bg-gray-100 text-gray-500 dark:bg-white/8 dark:text-white/40' :
                        log.actor === 'operator' ? 'bg-blue-100 text-blue-600 dark:bg-[#5B8CFF]/15 dark:text-[#7AAEFF]' :
                                                   'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
                      )}>
                        {log.actor}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>

          {/* ─── Sidebar ──────────────────────────────── */}
          <div className="space-y-4">
            <GlassCard variant="elevated">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-white/35 mb-3">Client</p>
              <p className="font-black text-sm text-gray-900 dark:text-white">{deal.clientName}</p>
              {deal.clientEmail && <p className="text-xs text-gray-400 dark:text-white/35">{deal.clientEmail}</p>}
            </GlassCard>

            <GlassCard variant="elevated">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-white/35 mb-3">Quick Actions</p>
              <div className="space-y-2">
                <Link to="/" className={cn(
                  'flex items-center justify-between w-full px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all',
                  'bg-white border-gray-200 text-gray-700 hover:border-blue-300',
                  'dark:bg-[#1a2235] dark:border-white/10 dark:text-white/70',
                )}>
                  New Exchange
                  <ChevronRight size={12} />
                </Link>
                <button onClick={() => setShowChat((v) => !v)} className={cn(
                  'flex items-center justify-between w-full px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all',
                  'bg-white border-gray-200 text-gray-700 hover:border-blue-300',
                  'dark:bg-[#1a2235] dark:border-white/10 dark:text-white/70',
                )}>
                  Support Chat
                  <MessageCircle size={12} />
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {showChat && (
        <div className="fixed bottom-6 right-6 z-50">
          <SupportChat dealId={deal.id} />
        </div>
      )}
    </div>
  )
}
