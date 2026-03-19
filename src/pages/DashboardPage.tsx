import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User, Wallet, Clock, Gift, Shield, Edit3, Plus,
  CheckCircle, AlertCircle, ChevronRight, Copy, Check,
  ArrowUpDown, TrendingUp, Search, Filter,
} from 'lucide-react'
import { useDealStore } from '../store/dealStore'
import { useAuthStore } from '../store/authStore'
import { useTranslation } from '../hooks/useTranslation'
import { useCopy } from '../hooks/useCopy'
import { StatusBadge } from '../components/shared/StatusBadge'
import { Button } from '../components/shared/Button'
import { GlassCard } from '../components/shared/GlassCard'
import { cn } from '../components/shared/cn'
import type { DealStatus } from '../types'

type FilterStatus = 'all' | 'active' | 'completed' | 'cancelled'

const KYC_COLORS: Record<string, string> = {
  none: 'text-gray-400',
  pending: 'text-amber-500',
  verified: 'text-emerald-500',
}
const KYC_ICONS: Record<string, React.ElementType> = {
  none: AlertCircle,
  pending: Clock,
  verified: CheckCircle,
}

export function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const deals = useDealStore((s) => s.deals)
  const { copy, copied } = useCopy()

  const [tab, setTab] = useState<'deals' | 'profile' | 'payout' | 'referral'>('deals')
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [search, setSearch] = useState('')

  if (!user) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-500 dark:text-white/40">Please sign in to view your dashboard.</p>
          <Button variant="primary" onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    )
  }

  const KycIcon = KYC_ICONS[user.kycStatus]

  const ACTIVE_STATUSES: DealStatus[] = ['AWAITING_PAYMENT', 'IN_PROGRESS', 'PAYMENT_RECEIVED', 'VERIFICATION', 'PAYOUT_SENT']

  const filteredDeals = deals.filter((d) => {
    const matchSearch = !search || d.id.toLowerCase().includes(search.toLowerCase()) ||
      d.sendCurrency.toLowerCase().includes(search.toLowerCase()) ||
      d.receiveCurrency.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ||
      (filter === 'active' && ACTIVE_STATUSES.includes(d.status)) ||
      (filter === 'completed' && d.status === 'COMPLETED') ||
      (filter === 'cancelled' && (d.status === 'CANCELLED' || d.status === 'REFUND'))
    return matchSearch && matchFilter
  })

  const referralUrl = `https://quickpay.io/ref/${user.referralCode}`

  return (
    <div className="min-h-screen bg-app pt-20 sm:pt-24 pb-16 px-4 sm:px-6">
      <div className="fixed inset-0 bg-mesh-brand pointer-events-none opacity-40" />
      <div className="relative z-10 max-w-5xl mx-auto">

        {/* ─── Header ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-[0_4px_14px_rgba(91,140,255,0.4)]">
              <span className="font-black text-xl text-white">{user.name[0].toUpperCase()}</span>
            </div>
            <div>
              <p className="text-[11px] text-gray-400 dark:text-white/35 font-medium">{t.dashboard.welcome}</p>
              <h1 className="font-black text-xl text-gray-900 dark:text-white">{user.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn('flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border', KYC_COLORS[user.kycStatus],
              'bg-white border-gray-200 dark:bg-[#1a2235] dark:border-white/10')}>
              <KycIcon size={12} />
              {t.dashboard[`kyc${user.kycStatus.charAt(0).toUpperCase() + user.kycStatus.slice(1)}` as keyof typeof t.dashboard]}
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="text-xs">Sign Out</Button>
          </div>
        </motion.div>

        {/* ─── Stats ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: ArrowUpDown, label: t.dashboard.dealsCount, value: user.totalDeals || deals.length, color: 'text-[#5B8CFF]', bg: 'bg-blue-50 dark:bg-[#1a2235]' },
            { icon: TrendingUp,  label: t.dashboard.totalExchanged, value: `$${(user.totalVolume || 0).toLocaleString()}`, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-[#0f2020]' },
            { icon: Gift,        label: t.dashboard.referralBonus, value: `$${Math.floor((deals.length * 5) || 0)}`, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-[#1a1535]' },
            { icon: Shield,      label: t.dashboard.kycStatus, value: user.kycStatus.charAt(0).toUpperCase() + user.kycStatus.slice(1), color: KYC_COLORS[user.kycStatus], bg: 'bg-gray-50 dark:bg-[#1a2235]' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('p-4 rounded-2xl border border-gray-200 dark:border-white/8', bg)}
            >
              <Icon size={16} className={cn('mb-2', color)} />
              <p className="text-[10px] text-gray-400 dark:text-white/35 font-medium uppercase tracking-wide">{label}</p>
              <p className="font-black text-lg text-gray-900 dark:text-white mt-0.5">{value}</p>
            </motion.div>
          ))}
        </div>

        {/* ─── Tab nav ────────────────────────────────────── */}
        <div className={cn(
          'flex gap-1 p-1 rounded-2xl mb-6 overflow-x-auto',
          'bg-gray-100 dark:bg-white/6',
        )}>
          {([
            { id: 'deals',   icon: ArrowUpDown, label: t.dashboard.recentDeals },
            { id: 'profile', icon: User,        label: t.dashboard.profile },
            { id: 'payout',  icon: Wallet,      label: t.dashboard.payoutDetails },
            { id: 'referral',icon: Gift,        label: t.dashboard.referral },
          ] as const).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0',
                tab === id
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-[#1e2d4a] dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-white/40 dark:hover:text-white/60',
              )}
            >
              <Icon size={11} />
              {label}
            </button>
          ))}
        </div>

        {/* ─── Deals tab ──────────────────────────────────── */}
        {tab === 'deals' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className={cn(
                'flex items-center gap-2 flex-1 px-3 py-2.5 rounded-xl border',
                'bg-white border-gray-200 dark:bg-[#1a2235] dark:border-white/10',
              )}>
                <Search size={13} className="text-gray-400 dark:text-white/30 shrink-0" />
                <input
                  type="text"
                  placeholder={t.dashboard.searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30"
                />
              </div>
              <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/6">
                {([
                  { id: 'all',       label: t.dashboard.filterAll },
                  { id: 'active',    label: t.dashboard.filterActive },
                  { id: 'completed', label: t.dashboard.filterCompleted },
                  { id: 'cancelled', label: t.dashboard.filterCancelled },
                ] as const).map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setFilter(id)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap',
                      filter === id
                        ? 'bg-white text-gray-900 shadow-sm dark:bg-[#1e2d4a] dark:text-white'
                        : 'text-gray-500 dark:text-white/40',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {filteredDeals.length === 0 ? (
              <GlassCard variant="elevated">
                <div className="text-center py-12 space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-white/6 flex items-center justify-center mx-auto">
                    <Filter size={24} className="text-gray-300 dark:text-white/20" />
                  </div>
                  <p className="font-bold text-gray-500 dark:text-white/40">{t.dashboard.noDeals}</p>
                  <p className="text-xs text-gray-400 dark:text-white/25">{t.dashboard.noDealsDesc}</p>
                  <Link to="/">
                    <Button variant="primary" size="sm" className="mt-2">Create Exchange Deal</Button>
                  </Link>
                </div>
              </GlassCard>
            ) : (
              <div className="space-y-2">
                {filteredDeals.map((deal, i) => (
                  <motion.div
                    key={deal.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link to={`/deal/${deal.id}`}>
                      <div className={cn(
                        'flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer',
                        'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md',
                        'dark:bg-[#1a2235] dark:border-white/8 dark:hover:border-[#5B8CFF]/30',
                      )}>
                        <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shrink-0">
                          <ArrowUpDown size={14} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-black text-gray-900 dark:text-white truncate">{deal.id}</p>
                            <StatusBadge status={deal.status} />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-white/40">
                            {deal.sendAmount.toLocaleString()} {deal.sendCurrency} → {deal.receiveAmount.toLocaleString()} {deal.receiveCurrency}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-gray-400 dark:text-white/30">
                            {new Date(deal.createdAt).toLocaleDateString()}
                          </p>
                          <ChevronRight size={13} className="text-gray-400 dark:text-white/30 ml-auto mt-1" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Profile tab ────────────────────────────────── */}
        {tab === 'profile' && (
          <GlassCard variant="elevated">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-black text-base text-gray-900 dark:text-white">{t.dashboard.profile}</h2>
                <button className={cn(
                  'flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all',
                  'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200',
                  'dark:bg-white/6 dark:border-white/8 dark:text-white/60 dark:hover:bg-white/10',
                )}>
                  <Edit3 size={11} /> Edit
                </button>
              </div>
              {[
                { label: 'Username', value: user.login },
                { label: 'Phone', value: user.phone ?? '— not set' },
                { label: 'Telegram', value: user.telegram ?? '— not set' },
                { label: 'Account ID', value: user.id },
                { label: 'Member since', value: new Date(user.createdAt).toLocaleDateString() },
              ].map(({ label, value }) => (
                <div key={label} className={cn(
                  'flex items-center justify-between py-3 border-b last:border-b-0',
                  'border-gray-100 dark:border-white/6',
                )}>
                  <span className="text-xs font-semibold text-gray-400 dark:text-white/35 uppercase tracking-wide">{label}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
                </div>
              ))}
              <div className={cn(
                'p-4 rounded-2xl border mt-2',
                'bg-amber-50 border-amber-200',
                'dark:bg-amber-500/10 dark:border-amber-500/25',
              )}>
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">KYC Verification Required</p>
                <p className="text-xs text-amber-500 dark:text-amber-400/70">Complete verification to increase your limits to unlimited.</p>
                <Button variant="primary" size="sm" className="mt-2 bg-amber-500 shadow-amber-500/30">Start Verification</Button>
              </div>
            </div>
          </GlassCard>
        )}

        {/* ─── Payout tab ─────────────────────────────────── */}
        {tab === 'payout' && (
          <GlassCard variant="elevated">
            <div className="space-y-4">
              <h2 className="font-black text-base text-gray-900 dark:text-white">{t.dashboard.payoutDetails}</h2>

              <p className="text-xs text-gray-400 dark:text-white/35">Wallets</p>
              <div className={cn(
                'flex items-center justify-center gap-2 py-8 rounded-2xl border-2 border-dashed',
                'border-gray-200 dark:border-white/8',
              )}>
                <Plus size={14} className="text-gray-300 dark:text-white/20" />
                <span className="text-sm text-gray-400 dark:text-white/30">{t.dashboard.addWallet}</span>
              </div>

              <p className="text-xs text-gray-400 dark:text-white/35 mt-2">Bank Accounts</p>
              <div className={cn(
                'flex items-center justify-center gap-2 py-8 rounded-2xl border-2 border-dashed',
                'border-gray-200 dark:border-white/8',
              )}>
                <Plus size={14} className="text-gray-300 dark:text-white/20" />
                <span className="text-sm text-gray-400 dark:text-white/30">{t.dashboard.addBankAccount}</span>
              </div>
            </div>
          </GlassCard>
        )}

        {/* ─── Referral tab ───────────────────────────────── */}
        {tab === 'referral' && (
          <GlassCard variant="elevated">
            <div className="space-y-5">
              <div className="text-center pb-2">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-[0_4px_16px_rgba(124,92,255,0.4)]">
                  <Gift size={24} className="text-white" />
                </div>
                <h2 className="font-black text-xl text-gray-900 dark:text-white">{t.dashboard.referral}</h2>
                <p className="text-sm text-gray-500 dark:text-white/40 mt-1">Earn 0.5% on every deal your referrals make</p>
              </div>

              <div className={cn(
                'flex items-center gap-2 p-3 rounded-2xl border',
                'bg-gray-50 border-gray-200',
                'dark:bg-[#1a2235] dark:border-white/10',
              )}>
                <code className="flex-1 text-xs font-mono text-gray-700 dark:text-white/70 truncate">{referralUrl}</code>
                <button
                  onClick={() => copy(referralUrl)}
                  className={cn(
                    'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                    copied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#5B8CFF] text-white hover:bg-[#4A7AEE]',
                  )}
                >
                  {copied ? <Check size={11} /> : <Copy size={11} />}
                  {copied ? t.deal.copied : t.dashboard.copyLink}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Total Referrals', value: '0', icon: User },
                  { label: 'Earned', value: '$0.00', icon: TrendingUp },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className={cn('p-4 rounded-2xl border', 'bg-violet-50 border-violet-100', 'dark:bg-[#1a1535] dark:border-violet-500/20')}>
                    <Icon size={16} className="text-violet-500 mb-2" />
                    <p className="text-xs text-gray-400 dark:text-white/35">{label}</p>
                    <p className="font-black text-xl text-gray-900 dark:text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  )
}
