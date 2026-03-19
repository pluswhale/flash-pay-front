import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Send, ChevronDown, Check, ArrowUpDown } from 'lucide-react'
import { CountrySelect, CitySelect } from './CountrySelect'
import { Button } from '../shared/Button'
import { TRANSFER_COUNTRIES, TRANSFER_CURRENCIES } from '../../data/transfers'
import { cn } from '../shared/cn'

// ─── Inline currency picker ──────────────────────────────────

function CurrencyPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = TRANSFER_CURRENCIES.find((c) => c.code === value)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative shrink-0">
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.97 }}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-bold transition-all',
          // Light
          'bg-white border-gray-300 text-gray-800 hover:border-blue-400 hover:bg-blue-50',
          // Dark
          'dark:bg-[#253050] dark:border-white/20 dark:text-white dark:hover:border-[#5B8CFF]/60 dark:hover:bg-[#2e3d6a]',
        )}
      >
        <span className="text-base leading-none">{selected?.flag}</span>
        <span className="text-sm font-bold">{selected?.code}</span>
        <ChevronDown
          size={12}
          className={cn(
            'text-gray-400 dark:text-white/50 transition-transform duration-200',
            open && 'rotate-180 text-[#5B8CFF] dark:text-[#5B8CFF]',
          )}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.13 }}
            className="absolute right-0 top-full mt-2 w-48 rounded-2xl overflow-hidden dropdown-surface z-[200]"
          >
            <div className="max-h-56 overflow-y-auto py-1">
              {TRANSFER_CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => { onChange(c.code); setOpen(false) }}
                  className={cn(
                    'flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors',
                    value === c.code
                      ? 'bg-blue-50 dark:bg-[#5B8CFF]/20'
                      : 'hover:bg-gray-50 dark:hover:bg-white/8',
                  )}
                >
                  <span className="text-base shrink-0 leading-none">{c.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 dark:text-white">{c.code}</p>
                    <p className="text-[10px] text-gray-500 dark:text-white/45 truncate">{c.name}</p>
                  </div>
                  {value === c.code && <Check size={11} className="text-[#5B8CFF] shrink-0" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main form ───────────────────────────────────────────────

export function MoneyTransferForm() {
  const [fromCountry, setFromCountry] = useState<string | null>(null)
  const [fromCity, setFromCity]       = useState<string | null>(null)
  const [toCountry, setToCountry]     = useState<string | null>(null)
  const [toCity, setToCity]           = useState<string | null>(null)
  const [amount, setAmount]           = useState('')
  const [currency, setCurrency]       = useState('USD')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted]     = useState(false)

  const fromData   = TRANSFER_COUNTRIES.find((c) => c.id === fromCountry)
  const toData     = TRANSFER_COUNTRIES.find((c) => c.id === toCountry)
  const fromCities = fromData?.cities ?? []
  const toCities   = toData?.cities   ?? []

  const handleFromCountry = (id: string) => { setFromCountry(id); setFromCity(null) }
  const handleToCountry   = (id: string) => { setToCountry(id);   setToCity(null) }

  const swapDirections = () => {
    const fc = fromCountry, tc = toCountry, fci = fromCity, tci = toCity
    setFromCountry(tc); setToCountry(fc)
    setFromCity(tci);   setToCity(fci)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 900))
    setIsSubmitting(false)
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3500)
  }

  const isValid = !!fromCountry && !!fromCity && !!toCountry && !!toCity && parseFloat(amount) > 0

  return (
    <div className="space-y-4">

      {/* ─── FROM / TO panels ──────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">

        {/* FROM */}
        <div className={cn(
          'p-4 rounded-2xl border space-y-3',
          'bg-gray-50 border-gray-200',
          'dark:bg-[#1a2235] dark:border-white/10',
        )}>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#5B8CFF] shadow-[0_0_6px_rgba(91,140,255,0.6)]" />
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-white/40">
              From
            </span>
          </div>
          <CountrySelect
            value={fromCountry}
            onChange={handleFromCountry}
            options={TRANSFER_COUNTRIES}
            label="Country"
          />
          <CitySelect
            value={fromCity}
            onChange={setFromCity}
            cities={fromCities}
            label="City"
            disabled={!fromCountry}
          />
        </div>

        {/* Swap button (mobile only, sits between the two panels) */}
        <div className="flex justify-center sm:hidden">
          <motion.button
            onClick={swapDirections}
            whileTap={{ rotate: 180 }}
            whileHover={{ scale: 1.12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="w-9 h-9 rounded-xl bg-gradient-brand text-white flex items-center justify-center shadow-[0_2px_12px_rgba(91,140,255,0.45)]"
          >
            <ArrowUpDown size={14} />
          </motion.button>
        </div>

        {/* TO */}
        <div className={cn(
          'p-4 rounded-2xl border space-y-3',
          'bg-blue-50 border-blue-200',
          'dark:bg-[#1a2540] dark:border-[#5B8CFF]/25',
        )}>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-white/40">
              To
            </span>
          </div>
          <CountrySelect
            value={toCountry}
            onChange={handleToCountry}
            options={TRANSFER_COUNTRIES}
            label="Country"
          />
          <CitySelect
            value={toCity}
            onChange={setToCity}
            cities={toCities}
            label="City"
            disabled={!toCountry}
          />
        </div>
      </div>

      {/* ─── Route summary bar ─────────────────────────────── */}
      <AnimatePresence>
        {fromCountry && toCountry && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className={cn(
              'flex items-center justify-center gap-3 py-2.5 px-4 rounded-2xl border',
              // Light: subtle blue tint
              'bg-blue-50 border-blue-100',
              // Dark: solid dark surface — no opacity-based bg-white trick
              'dark:bg-[#1a2235] dark:border-white/10',
            )}
          >
            <span className="text-lg leading-none">{fromData?.flag}</span>
            <span className="text-xs font-semibold text-gray-600 dark:text-white/60">
              {fromData?.shortName}
            </span>
            <ArrowRight size={13} className="text-[#5B8CFF]" />
            <span className="text-xs font-semibold text-gray-600 dark:text-white/60">
              {toData?.shortName}
            </span>
            <span className="text-lg leading-none">{toData?.flag}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Amount + Currency ─────────────────────────────── */}
      <div className={cn(
        'flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200',
        // Light
        'bg-white border-gray-200',
        'focus-within:border-blue-400 focus-within:shadow-[0_0_0_3px_rgba(91,140,255,0.12)]',
        // Dark — solid surface, no opacity trick
        'dark:bg-[#1a2235] dark:border-white/12',
        'dark:focus-within:border-[#5B8CFF]/60 dark:focus-within:shadow-[0_0_0_3px_rgba(91,140,255,0.2)]',
      )}>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-1 text-gray-400 dark:text-white/35">
            Amount
          </p>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className={cn(
              'w-full bg-transparent outline-none caret-[#5B8CFF]',
              'text-3xl sm:text-4xl font-black',
              'text-gray-900 placeholder-gray-300',
              'dark:text-white dark:placeholder-white/20',
            )}
          />
        </div>
        <CurrencyPicker value={currency} onChange={setCurrency} />
      </div>

      {/* ─── CTA ───────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="h-14 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold bg-emerald-500 text-white shadow-[0_4px_16px_rgba(34,197,94,0.4)]"
          >
            ✓ Request sent — operator will contact you shortly
          </motion.div>
        ) : (
          <motion.div key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Button
              variant="primary"
              size="xl"
              fullWidth
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={!isValid}
              className="h-14 font-black tracking-wide text-base"
            >
              <Send size={17} />
              Exchange Currency
              <ArrowRight size={17} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {!isValid && !submitted && (
        <p className="text-center text-[11px] text-gray-400 dark:text-white/25">
          Select origin, destination, and enter amount to continue
        </p>
      )}
    </div>
  )
}
