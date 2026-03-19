import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, TrendingUp, Zap, Search } from 'lucide-react'
import { CORRIDORS } from '../data/corridors'
import { useUIStore } from '../store/uiStore'
import { useTranslation } from '../hooks/useTranslation'
import { cn } from '../components/shared/cn'

type FilterType = 'all' | 'crypto' | 'fiat'

const CRYPTO_CODES = new Set(['BTC', 'ETH', 'USDT', 'TON'])

export function CorridorsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setPendingCorridor } = useUIStore()

  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')

  const filtered = CORRIDORS.filter((c) => {
    const matchSearch = !search ||
      c.from.toLowerCase().includes(search.toLowerCase()) ||
      c.to.toLowerCase().includes(search.toLowerCase()) ||
      c.fromName.toLowerCase().includes(search.toLowerCase()) ||
      c.toName.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ||
      (filter === 'crypto' && (CRYPTO_CODES.has(c.from) || CRYPTO_CODES.has(c.to))) ||
      (filter === 'fiat' && !CRYPTO_CODES.has(c.from) && !CRYPTO_CODES.has(c.to))
    return matchSearch && matchFilter
  })

  const handleExchange = (from: string, to: string) => {
    setPendingCorridor({ from, to })
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-app pt-20 sm:pt-24 pb-16 px-4 sm:px-6">
      <div className="fixed inset-0 bg-mesh-brand pointer-events-none opacity-40" />
      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4',
            'bg-blue-100 border border-blue-200 text-blue-600',
            'dark:bg-[#5B8CFF]/15 dark:border-[#5B8CFF]/25 dark:text-[#7AAEFF]',
          )}>
            <TrendingUp size={11} />
            {CORRIDORS.length} active directions
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-3">
            {t.corridors.title}
          </h1>
          <p className="text-gray-500 dark:text-white/45 max-w-lg mx-auto">{t.corridors.subtitle}</p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className={cn(
            'flex items-center gap-2 flex-1 px-4 py-2.5 rounded-2xl border',
            'bg-white border-gray-200',
            'dark:bg-[#1a2235] dark:border-white/10',
          )}>
            <Search size={14} className="text-gray-400 dark:text-white/30 shrink-0" />
            <input
              type="text"
              placeholder="Search currency or direction…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30"
            />
          </div>
          <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/6">
            {(['all', 'crypto', 'fiat'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize',
                  filter === f
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-[#1e2d4a] dark:text-white'
                    : 'text-gray-500 dark:text-white/40',
                )}
              >
                {f === 'all' ? t.corridors.filterAll : f === 'crypto' ? t.corridors.filterCrypto : t.corridors.filterFiat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((corridor, i) => (
            <motion.div
              key={corridor.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4 }}
              className={cn(
                'relative p-5 rounded-3xl border overflow-hidden cursor-pointer group transition-all',
                'bg-white border-gray-200 hover:border-blue-300 hover:shadow-lg',
                'dark:bg-[#1a2235] dark:border-white/10 dark:hover:border-[#5B8CFF]/35 dark:hover:shadow-[0_8px_24px_rgba(91,140,255,0.15)]',
              )}
            >
              {/* Gradient top bar */}
              <div className={cn(
                'absolute top-0 left-0 right-0 h-1 opacity-60 group-hover:opacity-100 transition-opacity bg-gradient-to-r',
                corridor.gradient,
              )} />

              {/* Currencies */}
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-base font-black',
                  'bg-gray-50 border border-gray-200',
                  'dark:bg-[#253050] dark:border-white/12',
                )}>
                  <span className="text-xl leading-none">{corridor.fromFlag}</span>
                  <span className="text-sm text-gray-700 dark:text-white">{corridor.from}</span>
                </div>
                <ArrowRight size={14} className="text-[#5B8CFF] shrink-0" />
                <div className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-base font-black',
                  'bg-gray-50 border border-gray-200',
                  'dark:bg-[#253050] dark:border-white/12',
                )}>
                  <span className="text-xl leading-none">{corridor.toFlag}</span>
                  <span className="text-sm text-gray-700 dark:text-white">{corridor.to}</span>
                </div>
                {corridor.popular && (
                  <span className={cn(
                    'ml-auto text-[9px] font-black px-2 py-0.5 rounded-full shrink-0',
                    'bg-amber-100 text-amber-600 border border-amber-200',
                    'dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/20',
                  )}>
                    HOT
                  </span>
                )}
              </div>

              {/* Names */}
              <p className="text-xs text-gray-500 dark:text-white/40 mb-3">
                {corridor.fromName} → {corridor.toName}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className={cn('p-2.5 rounded-xl', 'bg-gray-50 dark:bg-[#253050]')}>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/30 mb-1">Rate</p>
                  <p className="text-xs font-black text-gray-900 dark:text-white">
                    {corridor.rate < 1
                      ? corridor.rate.toFixed(4)
                      : corridor.rate.toLocaleString()}
                  </p>
                </div>
                <div className={cn('p-2.5 rounded-xl', 'bg-gray-50 dark:bg-[#253050]')}>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/30 mb-1">Volume</p>
                  <p className="text-xs font-black text-gray-900 dark:text-white">{corridor.volume}</p>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => handleExchange(corridor.from, corridor.to)}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-black transition-all',
                  'bg-gradient-brand text-white shadow-[0_2px_8px_rgba(91,140,255,0.3)]',
                  'hover:shadow-[0_4px_16px_rgba(91,140,255,0.5)]',
                )}
              >
                <Zap size={12} />
                {t.corridors.exchange}
                <ArrowRight size={11} />
              </button>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 dark:text-white/25">
            No corridors match your search.
          </div>
        )}
      </div>
    </div>
  )
}
