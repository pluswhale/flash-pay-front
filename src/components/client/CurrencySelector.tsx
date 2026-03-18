import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { CURRENCIES_LIST } from '../../store/dealStore'
import { cn } from '../shared/cn'

const SYMBOLS: Record<string, string> = {
  BTC: '₿', ETH: 'Ξ', USDT: '₮', TON: '◈', RUB: '₽', USD: '$', EUR: '€',
}

const ICON_COLORS: Record<string, string> = {
  BTC:  'bg-gradient-to-br from-orange-400 to-amber-500',
  ETH:  'bg-gradient-to-br from-indigo-400 to-purple-500',
  USDT: 'bg-gradient-to-br from-emerald-400 to-teal-500',
  TON:  'bg-gradient-to-br from-sky-400 to-blue-500',
  RUB:  'bg-gradient-to-br from-blue-500 to-red-500',
  USD:  'bg-gradient-to-br from-emerald-500 to-teal-600',
  EUR:  'bg-gradient-to-br from-blue-500 to-indigo-600',
}

interface CurrencySelectorProps {
  value: string
  onChange: (code: string) => void
  label: string
  exclude?: string
}

function CryptoIcon({ code }: { code: string }) {
  return (
    <div className={cn(
      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm',
      ICON_COLORS[code] ?? 'bg-gradient-brand',
    )}>
      {SYMBOLS[code] ?? code[0]}
    </div>
  )
}

export function CurrencySelector({ value, onChange, label, exclude }: CurrencySelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const options = CURRENCIES_LIST.filter(
    (c) => c.code !== exclude &&
      (search === '' ||
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.name.toLowerCase().includes(search.toLowerCase()))
  )
  const selected = CURRENCIES_LIST.find((c) => c.code === value)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative w-full">
      {/* Label */}
      <p className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 text-gray-400 dark:text-white/40">
        {label}
      </p>

      {/* Trigger */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.99 }}
        className={cn(
          'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200',
          'border focus:outline-none',
          open
            ? 'border-[#5B8CFF] bg-blue-50 dark:border-[#5B8CFF]/60 dark:bg-[#5B8CFF]/10'
            : [
              'bg-gray-50 border-gray-200 hover:border-blue-300 hover:bg-blue-50/40',
              'dark:bg-white/5 dark:border-white/10 dark:hover:border-white/18 dark:hover:bg-transparent',
            ].join(' '),
        )}
      >
        <CryptoIcon code={selected?.code ?? ''} />

        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-sm text-gray-900 dark:text-white">{selected?.code}</span>
            {selected?.network && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-200 text-gray-500 dark:bg-white/10 dark:text-white/50">
                {selected.network}
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 dark:text-white/40 truncate">{selected?.name}</p>
        </div>

        <ChevronDown
          size={14}
          className={cn(
            'transition-transform duration-200 shrink-0',
            'text-gray-400 dark:text-white/30',
            open && 'rotate-180 text-[#5B8CFF] dark:text-[#5B8CFF]',
          )}
        />
      </motion.button>

      {/* Dropdown — OPAQUE, above everything */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.13 }}
            className={cn(
              'absolute top-full mt-2 w-full rounded-2xl overflow-hidden',
              'dropdown-surface',
              'z-[200]',          // very high z-index — above modal overlays too
            )}
          >
            {/* Search bar */}
            <div className="p-2 border-b border-gray-100 dark:border-white/8">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5">
                <Search size={12} className="text-gray-400 dark:text-white/30 shrink-0" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="flex-1 bg-transparent text-xs text-gray-800 placeholder-gray-400 outline-none dark:text-white dark:placeholder-white/30"
                />
              </div>
            </div>

            {/* List */}
            <div className="max-h-52 overflow-y-auto py-1">
              {options.length === 0 ? (
                <p className="text-center text-xs text-gray-400 dark:text-white/30 py-6">No results</p>
              ) : (
                options.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => { onChange(c.code); setOpen(false); setSearch('') }}
                    className={cn(
                      'flex items-center gap-3 w-full px-3 py-2.5 transition-colors text-left',
                      value === c.code
                        ? 'bg-blue-50 dark:bg-[#5B8CFF]/15'
                        : 'hover:bg-gray-50 dark:hover:bg-surface-2',
                    )}
                  >
                    <CryptoIcon code={c.code} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-sm text-gray-900 dark:text-white">{c.code}</span>
                        {c.network && (
                          <span className="text-[10px] px-1 py-0.5 rounded bg-gray-200 text-gray-500 dark:bg-white/10 dark:text-white/40">
                            {c.network}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 dark:text-white/40 truncate">{c.name}</p>
                    </div>
                    {value === c.code && <Check size={13} className="text-[#5B8CFF] shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
