import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogOut, LayoutDashboard, Zap, ArrowRight } from 'lucide-react'
import { ExchangeWidget } from '../components/client/ExchangeWidget'
import { DealWindow } from '../components/client/DealWindow'
import { ClientDashboard } from '../components/client/ClientDashboard'
import { AuthModal } from '../components/client/AuthModal'
import { GlassCard } from '../components/shared/GlassCard'
import { Button } from '../components/shared/Button'
import { useTranslation } from '../hooks/useTranslation'
import { cn } from '../components/shared/cn'

export function ClientPage() {
  const { t } = useTranslation()
  const [activeDealId, setActiveDealId] = useState<string | null>(null)
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [view, setView] = useState<'exchange' | 'dashboard'>('exchange')

  const handleDealCreated = (id: string) => setActiveDealId(id)
  const handleSelectDeal = (id: string) => { setActiveDealId(id); setView('exchange') }
  const handleBack = () => setActiveDealId(null)

  return (
    <div className="min-h-screen bg-app">
      {/* Background overlay */}
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
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500  animate-pulse" />
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
            <div className="flex items-center justify-center gap-2 mt-6">
              {loggedInEmail ? (
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
                    {view === 'exchange' ? 'Dashboard' : 'Exchange'}
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
          {view === 'dashboard' && loggedInEmail ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-lg mx-auto"
            >
              <GlassCard variant="elevated">
                <ClientDashboard email={loggedInEmail} onSelectDeal={handleSelectDeal} />
              </GlassCard>
            </motion.div>
          ) : (
            /* ─── Exchange + Deal 2-col ──────────────────────── */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-8 max-w-4xl mx-auto">

              {/* Left: Exchange widget */}
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

              {/* Right: Deal window or empty state */}
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
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
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
          )}

          {/* ─── Feature cards ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-14 max-w-4xl mx-auto"
          >
            {[
              {
                emoji: '📊',
                title: 'Real OTC Rates',
                desc: 'Aggregated from top exchanges. Best execution guaranteed.',
                light: 'bg-blue-50 border-blue-100',
                dark: 'dark:bg-[#1a2540] dark:border-[#5B8CFF]/30',
              },
              {
                emoji: '👤',
                title: 'Personal Operator',
                desc: 'Every deal is handled by a dedicated expert for maximum security.',
                light: 'bg-sky-50 border-sky-100',
                dark: 'dark:bg-[#0f2030] dark:border-[#00D4FF]/25',
              },
              {
                emoji: '⚡',
                title: 'Instant Support',
                desc: '24/7 support responding within 2 minutes on every deal.',
                light: 'bg-emerald-50 border-emerald-100',
                dark: 'dark:bg-[#0f2020] dark:border-emerald-500/30',
              },
            ].map(({ emoji, title, desc, light, dark }) => (
              <div
                key={title}
                className={cn('p-5 rounded-3xl border', light, dark)}
              >
                <div className="text-3xl mb-3">{emoji}</div>
                <h3 className="font-black text-sm text-gray-900 dark:text-white mb-1.5">{title}</h3>
                <p className="text-xs text-gray-500 dark:text-white/40 leading-relaxed">{desc}</p>
              </div>
            ))}
          </motion.div>
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
