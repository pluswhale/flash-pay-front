import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  User, LogOut, LayoutDashboard, Zap, ArrowRight,
  Send, Globe, Building2, UserCheck, ArrowRightLeft,
  Shield, TrendingUp, ChevronRight,
} from 'lucide-react'
import { ExchangeWidget } from '../components/client/ExchangeWidget'
import { DealWindow } from '../components/client/DealWindow'
import { ClientDashboard } from '../components/client/ClientDashboard'
import { AuthModal } from '../components/client/AuthModal'
import { MoneyTransferForm } from '../components/client/MoneyTransferForm'
import { SupportedCountries } from '../components/client/SupportedCountries'
import { GlassCard } from '../components/shared/GlassCard'
import { Button } from '../components/shared/Button'
import { useTranslation } from '../hooks/useTranslation'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'
import { POPULAR_CORRIDORS } from '../data/corridors'
import { cn } from '../components/shared/cn'

export function ClientPage() {
  const { t } = useTranslation()
  const { user, logout } = useAuthStore()
  const { setPendingCorridor } = useUIStore()

  const [activeDealId, setActiveDealId] = useState<string | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [view, setView] = useState<'exchange' | 'dashboard'>('exchange')

  const exchangeRef = useRef<HTMLDivElement>(null)

  const handleDealCreated = (id: string) => setActiveDealId(id)
  const handleSelectDeal = (id: string) => { setActiveDealId(id); setView('exchange') }
  const handleBack = () => setActiveDealId(null)

  const handleCorridorClick = (from: string, to: string) => {
    setPendingCorridor({ from, to })
    exchangeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Keep legacy login for the old auth modal (used if user wants full auth)
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-app">
      <div className="fixed inset-0 bg-mesh-brand pointer-events-none opacity-60" />

      <div className="relative z-10 pt-20 sm:pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">

          {/* ─── Hero ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10 sm:mb-14"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-5',
                'bg-blue-100 border border-blue-200 text-blue-700',
                'dark:bg-surface-2 dark:border-[#5B8CFF]/20 dark:text-[#7AAEFF]',
              )}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live · 50,000+ clients · Avg 3 min execution
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-4 leading-tight tracking-tight">
              {t.exchange.title.split(' ').slice(0, 2).join(' ')}{' '}
              <span className="text-gradient-brand">
                {t.exchange.title.split(' ').slice(2).join(' ')}
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-500 dark:text-white/45 max-w-xl mx-auto leading-relaxed">
              {t.exchange.subtitle}
            </p>

            {/* User bar */}
            <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className={cn(
                      'flex items-center gap-2.5 px-4 py-2 rounded-2xl border text-xs font-medium',
                      'bg-white border-gray-200 text-gray-600 hover:border-blue-300',
                      'dark:bg-white/5 dark:border-white/8 dark:text-white/60',
                    )}
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-brand flex items-center justify-center text-[11px] font-black text-white">
                      {user.name[0].toUpperCase()}
                    </div>
                    {user.name}
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => setView(view === 'exchange' ? 'dashboard' : 'exchange')}>
                    <LayoutDashboard size={12} />
                    {view === 'exchange' ? t.nav.dashboard : t.nav.exchange}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={logout}>
                    <LogOut size={12} />
                  </Button>
                </>
              ) : loggedInEmail ? (
                <>
                  <div className={cn(
                    'flex items-center gap-2.5 px-4 py-2 rounded-2xl border text-xs font-medium',
                    'bg-white border-gray-200 text-gray-600',
                    'dark:bg-white/5 dark:border-white/8 dark:text-white/60',
                  )}>
                    <div className="w-6 h-6 rounded-full bg-gradient-brand flex items-center justify-center text-[11px] font-black text-white">
                      {loggedInEmail[0].toUpperCase()}
                    </div>
                    {loggedInEmail}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setView(view === 'exchange' ? 'dashboard' : 'exchange')}>
                    <LayoutDashboard size={12} />
                    {view === 'exchange' ? t.nav.dashboard : t.nav.exchange}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setLoggedInEmail(null); setView('exchange') }}>
                    <LogOut size={12} />
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setShowAuthModal(true)}>
                  <User size={12} />
                  {t.auth.login}
                </Button>
              )}
            </div>
          </motion.div>

          {/* ─── Dashboard View ──────────────────────────────── */}
          {view === 'dashboard' && (user || loggedInEmail) ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
              <GlassCard variant="elevated">
                <ClientDashboard
                  email={user?.login ?? loggedInEmail ?? ''}
                  onSelectDeal={handleSelectDeal}
                />
              </GlassCard>
            </motion.div>
          ) : (
            <>
              {/* ─── Exchange + Deal 2-col ──────────────────── */}
              <div
                id="exchange-widget"
                ref={exchangeRef}
                className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-8 max-w-4xl mx-auto scroll-mt-28"
              >
                <motion.div
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.45 }}
                >
                  <GlassCard variant="elevated" noPadding>
                    <div className="p-5 sm:p-6">
                      <div className="flex items-center gap-2 mb-5">
                        <div className="w-7 h-7 rounded-xl bg-gradient-brand flex items-center justify-center shadow-[0_2px_8px_rgba(91,140,255,0.4)]">
                          <Zap size={13} className="text-white" />
                        </div>
                        <h2 className="font-black text-base text-gray-900 dark:text-white">Exchange</h2>
                      </div>
                      <ExchangeWidget onDealCreated={handleDealCreated} />
                    </div>
                  </GlassCard>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.45 }}
                >
                  <AnimatePresence mode="wait">
                    {activeDealId ? (
                      <GlassCard key="deal" variant="elevated" noPadding>
                        <div className="p-5 sm:p-6">
                          <DealWindow dealId={activeDealId} onBack={handleBack} />
                        </div>
                      </GlassCard>
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className={cn(
                          'h-full min-h-[460px] rounded-3xl border-2 border-dashed',
                          'flex flex-col items-center justify-center gap-5 text-center p-8',
                          'border-gray-200 bg-white/60',
                          'dark:border-white/10 dark:bg-[#111827]/60',
                        )}
                      >
                        <motion.div
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                          className={cn(
                            'w-20 h-20 rounded-3xl flex items-center justify-center',
                            'bg-blue-100 border border-blue-200',
                            'dark:bg-[#5B8CFF]/20 dark:border-[#5B8CFF]/35',
                          )}
                        >
                          <ArrowRight size={32} className="text-blue-400 dark:text-[#5B8CFF]/50" />
                        </motion.div>
                        <div>
                          <p className="text-sm font-semibold text-gray-400 dark:text-white/30 mb-1.5">
                            Your deal will appear here
                          </p>
                          <p className="text-xs text-gray-300 dark:text-white/20 leading-relaxed max-w-52">
                            Fill in the exchange form and tap "Create Deal" to get started
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-300 dark:text-white/15">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Operators online now
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* ─── Info Banner ────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
                className="mt-8 max-w-4xl mx-auto"
              >
                <div className={cn(
                  'relative overflow-hidden rounded-3xl border p-5 sm:p-6',
                  'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200',
                  'dark:from-[#141f3a] dark:to-[#1a2040] dark:border-[#5B8CFF]/25',
                )}>
                  {/* BG decoration */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#5B8CFF]/10 to-violet-500/10 rounded-full blur-2xl -translate-y-8 translate-x-8 pointer-events-none" />

                  <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center shrink-0 shadow-[0_4px_14px_rgba(91,140,255,0.4)]">
                      <Shield size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-sm text-gray-900 dark:text-white mb-1">
                        {t.infoBanner.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-white/45 leading-relaxed">
                        {t.infoBanner.desc}
                      </p>
                    </div>

                    {/* Two client type pills */}
                    <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                      <div className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-2xl border text-xs',
                        'bg-white border-gray-200', 'dark:bg-[#1e2d4a] dark:border-white/10',
                      )}>
                        <UserCheck size={13} className="text-[#5B8CFF]" />
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{t.infoBanner.individual}</p>
                          <p className="text-gray-400 dark:text-white/35 text-[10px]">{t.infoBanner.individualDesc}</p>
                        </div>
                      </div>
                      <div className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-2xl border text-xs',
                        'bg-white border-gray-200', 'dark:bg-[#1e2d4a] dark:border-white/10',
                      )}>
                        <Building2 size={13} className="text-violet-500" />
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{t.infoBanner.corporate}</p>
                          <p className="text-gray-400 dark:text-white/35 text-[10px]">{t.infoBanner.corporateDesc}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ─── Currency Corridors ──────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 }}
                className="mt-8 max-w-4xl mx-auto"
              >
                <GlassCard variant="elevated" noPadding>
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#5B8CFF] to-[#7C5CFF] flex items-center justify-center shadow-[0_2px_8px_rgba(91,140,255,0.4)]">
                          <ArrowRightLeft size={13} className="text-white" />
                        </div>
                        <div>
                          <h2 className="font-black text-base text-gray-900 dark:text-white">{t.corridors.title}</h2>
                          <p className="text-[11px] text-gray-400 dark:text-white/35">{t.corridors.subtitle}</p>
                        </div>
                      </div>
                      <Link
                        to="/corridors"
                        className="flex items-center gap-1 text-xs font-semibold text-[#5B8CFF] hover:text-[#7AAEFF] transition-colors"
                      >
                        {t.corridors.viewAll}
                        <ChevronRight size={13} />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {POPULAR_CORRIDORS.map((corridor) => (
                        <motion.button
                          key={corridor.id}
                          onClick={() => handleCorridorClick(corridor.from, corridor.to)}
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          transition={{ type: 'spring', stiffness: 380, damping: 24 }}
                          className={cn(
                            'relative p-3.5 rounded-2xl border text-left overflow-hidden group transition-all cursor-pointer',
                            'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md',
                            'dark:bg-[#1a2235] dark:border-white/10 dark:hover:border-[#5B8CFF]/35',
                          )}
                        >
                          {/* Gradient accent bar */}
                          <div className={cn(
                            'absolute top-0 left-0 right-0 h-0.5 opacity-70 group-hover:opacity-100 transition-opacity bg-gradient-to-r',
                            corridor.gradient,
                          )} />

                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-lg leading-none">{corridor.fromFlag}</span>
                            <ArrowRight size={10} className="text-gray-400 dark:text-white/30 shrink-0" />
                            <span className="text-lg leading-none">{corridor.toFlag}</span>
                            {corridor.popular && (
                              <span className={cn(
                                'ml-auto text-[8px] font-black px-1.5 py-0.5 rounded-full',
                                'bg-amber-100 text-amber-600 border border-amber-200',
                                'dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/20',
                              )}>
                                HOT
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-black text-gray-900 dark:text-white">
                            {corridor.from} → {corridor.to}
                          </p>
                          <p className="text-[10px] text-gray-400 dark:text-white/35 mt-0.5">
                            {corridor.volume}
                          </p>
                          <div className={cn(
                            'mt-2 flex items-center gap-1 text-[10px] font-bold',
                            'text-[#5B8CFF]',
                          )}>
                            <TrendingUp size={9} />
                            {corridor.rate < 1
                              ? `1 ${corridor.from} = ${corridor.rate} ${corridor.to}`
                              : `1 ${corridor.from} = ${corridor.rate.toLocaleString()} ${corridor.to}`}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* ─── Money Transfers ────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.36 }}
                className="mt-6 sm:mt-8 max-w-4xl mx-auto"
              >
                <GlassCard variant="elevated" noPadding>
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-[0_2px_8px_rgba(124,92,255,0.4)]">
                        <Send size={13} className="text-white" />
                      </div>
                      <div>
                        <h2 className="font-black text-base text-gray-900 dark:text-white">Money Transfers</h2>
                        <p className="text-[11px] text-gray-400 dark:text-white/35 mt-0.5">
                          Cash & bank transfers worldwide · Same-day execution
                        </p>
                      </div>
                      <div className={cn(
                        'ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold',
                        'bg-violet-100 text-violet-600 border border-violet-200',
                        'dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/25',
                      )}>
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                        Live
                      </div>
                    </div>
                    <MoneyTransferForm />
                  </div>
                </GlassCard>
              </motion.div>

              {/* ─── Supported Countries ─────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 sm:mt-8 max-w-4xl mx-auto"
              >
                <GlassCard variant="elevated" noPadding>
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-[0_2px_8px_rgba(16,185,129,0.4)]">
                        <Globe size={13} className="text-white" />
                      </div>
                      <div>
                        <h2 className="font-black text-base text-gray-900 dark:text-white">Supported Countries</h2>
                        <p className="text-[11px] text-gray-400 dark:text-white/35 mt-0.5">Click a country to view cities & routes</p>
                      </div>
                      <div className={cn(
                        'ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold',
                        'bg-emerald-100 text-emerald-600 border border-emerald-200',
                        'dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/25',
                      )}>
                        8 countries
                      </div>
                    </div>
                    <SupportedCountries />
                  </div>
                </GlassCard>
              </motion.div>

              {/* ─── Feature cards ───────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.44 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 sm:mt-10 max-w-4xl mx-auto"
              >
                {[
                  { emoji: '📊', title: 'Real OTC Rates', desc: 'Aggregated from top exchanges. Best execution guaranteed.', light: 'bg-blue-50 border-blue-100', dark: 'dark:bg-[#1a2540] dark:border-[#5B8CFF]/30' },
                  { emoji: '👤', title: 'Personal Operator', desc: 'Every deal is handled by a dedicated expert for maximum security.', light: 'bg-sky-50 border-sky-100', dark: 'dark:bg-[#0f2030] dark:border-[#00D4FF]/25' },
                  { emoji: '⚡', title: 'Instant Support', desc: '24/7 support responding within 2 minutes on every deal.', light: 'bg-emerald-50 border-emerald-100', dark: 'dark:bg-[#0f2020] dark:border-emerald-500/30' },
                ].map(({ emoji, title, desc, light, dark }) => (
                  <div key={title} className={cn('p-5 rounded-3xl border', light, dark)}>
                    <div className="text-3xl mb-3">{emoji}</div>
                    <h3 className="font-black text-sm text-gray-900 dark:text-white mb-1.5">{title}</h3>
                    <p className="text-xs text-gray-500 dark:text-white/40 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onSuccess={(email) => { setLoggedInEmail(email); setShowAuthModal(false) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
