import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Copy, QrCode, CheckCircle2, Link2, ArrowUpRight } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useDealStore } from '../../store/dealStore'
import { StatusBadge } from '../shared/StatusBadge'
import { Button } from '../shared/Button'
import { useCopy } from '../../hooks/useCopy'
import { useTranslation } from '../../hooks/useTranslation'
import { cn } from '../shared/cn'
import type { DealStatus } from '../../types'

interface ClientDashboardProps {
  email: string
  onSelectDeal: (id: string) => void
}

const REFERRAL_LINK = 'https://quickpay.io/ref/abc123'

export function ClientDashboard({ email, onSelectDeal }: ClientDashboardProps) {
  const { t } = useTranslation()
  const deals = useDealStore((s) => s.deals)
  const { copied, copy } = useCopy()
  const [showQR, setShowQR] = useState(false)

  const totalVolume = deals.reduce((acc, d) => acc + d.sendAmount, 0)

  const statusLabels: Record<DealStatus, string> = {
    NEW: t.status.NEW, AWAITING_PAYMENT: t.status.AWAITING_PAYMENT,
    IN_PROGRESS: t.status.IN_PROGRESS, PAYMENT_RECEIVED: t.status.PAYMENT_RECEIVED,
    VERIFICATION: t.status.VERIFICATION, PAYOUT_SENT: t.status.PAYOUT_SENT,
    COMPLETED: t.status.COMPLETED, CANCELLED: t.status.CANCELLED,
    REFUND: t.status.REFUND, EXPIRED: t.status.EXPIRED,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 dark:text-white/35 font-medium">{t.dashboard.welcome},</p>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">{email.split('@')[0]}</h2>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center text-white font-black shadow-[0_2px_8px_rgba(91,140,255,0.4)]">
          {email[0].toUpperCase()}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t.dashboard.totalExchanged, value: `$${totalVolume.toLocaleString()}`, icon: TrendingUp, gradient: 'from-[#5B8CFF] to-[#7C5CFF]' },
          { label: t.dashboard.dealsCount, value: deals.length, icon: CheckCircle2, gradient: 'from-[#00D4FF] to-[#5B8CFF]' },
          { label: t.dashboard.referralBonus, value: '$24.50', icon: Link2, gradient: 'from-emerald-500 to-teal-500' },
        ].map(({ label, value, icon: Icon, gradient }) => (
          <div key={label} className={cn(
            'text-center p-3 rounded-2xl border',
            'bg-gray-50 border-gray-200',
            'dark:bg-white/4 dark:border-white/6',
          )}>
            <div className={cn('w-8 h-8 rounded-xl bg-gradient-to-br mx-auto mb-2 flex items-center justify-center shadow-sm', gradient)}>
              <Icon size={14} className="text-white" />
            </div>
            <p className="text-base font-black text-gray-900 dark:text-white">{value}</p>
            <p className="text-[10px] text-gray-400 dark:text-white/35 leading-tight mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent deals */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black text-gray-400 dark:text-white/40 uppercase tracking-widest">{t.dashboard.recentDeals}</h3>
          {deals.length > 0 && (
            <span className="text-[11px] text-gray-300 dark:text-white/25">{deals.length} total</span>
          )}
        </div>
        {deals.length === 0 ? (
          <div className={cn(
            'text-center py-8 rounded-2xl border-2 border-dashed',
            'bg-gray-50 border-gray-200',
            'dark:bg-white/2 dark:border-white/8',
          )}>
            <p className="text-xs text-gray-400 dark:text-white/25">No deals yet. Create your first exchange!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {deals.map((deal) => (
              <motion.button
                key={deal.id}
                onClick={() => onSelectDeal(deal.id)}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.99 }}
                className={cn(
                  'w-full text-left p-3.5 rounded-2xl transition-all border',
                  'bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-200',
                  'dark:bg-white/3 dark:border-white/6 dark:hover:bg-[#5B8CFF]/8 dark:hover:border-[#5B8CFF]/15',
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-gray-500 dark:text-white/60">{deal.id}</span>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={deal.status} label={statusLabels[deal.status]} size="xs" />
                    <ArrowUpRight size={12} className="text-gray-300 dark:text-white/20" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-white/50">
                    {deal.sendAmount.toLocaleString()} {deal.sendCurrency} → {deal.receiveAmount.toLocaleString()} {deal.receiveCurrency}
                  </span>
                  <span className="text-gray-300 dark:text-white/25 text-[10px]">{deal.createdAt.toLocaleDateString()}</span>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Referral */}
      <div className={cn(
        'p-4 rounded-2xl space-y-3 border',
        'bg-blue-50 border-blue-100',
        'dark:bg-gradient-to-br dark:from-[#5B8CFF]/8 dark:to-[#7C5CFF]/6 dark:border-[#5B8CFF]/15',
      )}>
        <div className="flex items-center gap-2">
          <Link2 size={14} className="text-[#5B8CFF]" />
          <h3 className="text-xs font-bold text-gray-600 dark:text-white/60">{t.dashboard.referral}</h3>
        </div>
        <div className={cn(
          'flex items-center gap-2 px-3 py-2.5 rounded-xl border',
          'bg-white border-gray-200',
          'dark:bg-white/5 dark:border-white/8',
        )}>
          <p className="flex-1 min-w-0 text-[11px] font-mono text-gray-500 dark:text-white/50 truncate">{REFERRAL_LINK}</p>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => copy(REFERRAL_LINK)}
            className={cn(
              'shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all',
              copied
                ? 'bg-emerald-500 text-white'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-[#5B8CFF]/20 dark:text-[#7AAEFF] dark:hover:bg-[#5B8CFF]/30',
            )}
          >
            {copied ? <CheckCircle2 size={11} /> : <Copy size={11} />}
            {copied ? t.deal.copied : t.dashboard.copyLink}
          </motion.button>
        </div>

        <Button variant="ghost" size="sm" onClick={() => setShowQR((v) => !v)} className="w-full gap-2 text-xs">
          <QrCode size={13} />
          {t.dashboard.shareQR}
        </Button>

        <AnimatePresence>
          {showQR && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex justify-center overflow-hidden pt-1"
            >
              <div className="p-3 bg-white rounded-2xl shadow-md">
                <QRCodeSVG value={REFERRAL_LINK} size={148} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
