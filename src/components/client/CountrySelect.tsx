import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../shared/cn'
import type { TransferCountry, TransferCity } from '../../data/transfers'

// ─── Country Select ──────────────────────────────────────────

interface CountrySelectProps {
  value: string | null
  onChange: (id: string) => void
  options: TransferCountry[]
  label: string
  placeholder?: string
}

export function CountrySelect({
  value,
  onChange,
  options,
  label,
  placeholder = 'Select country',
}: CountrySelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find((c) => c.id === value)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative w-full">
      <p className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 text-gray-500 dark:text-white/40">
        {label}
      </p>

      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.99 }}
        className={cn(
          'flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl border transition-all duration-200 focus:outline-none',
          open
            ? [
                'border-[#5B8CFF] bg-blue-100',
                'dark:border-[#5B8CFF]/70 dark:bg-[#253060]',
              ].join(' ')
            : [
                'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50',
                'dark:bg-[#202c45] dark:border-white/12 dark:hover:border-white/22 dark:hover:bg-[#253055]',
              ].join(' '),
        )}
      >
        {selected ? (
          <>
            <span className="text-xl shrink-0 leading-none">{selected.flag}</span>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{selected.name}</p>
              <p className="text-[10px] text-gray-500 dark:text-white/40">{selected.currencyCode}</p>
            </div>
          </>
        ) : (
          <>
            <MapPin size={14} className="text-gray-400 dark:text-white/30 shrink-0" />
            <span className="flex-1 text-left text-sm text-gray-400 dark:text-white/35">{placeholder}</span>
          </>
        )}
        <ChevronDown
          size={13}
          className={cn(
            'shrink-0 transition-transform duration-200 text-gray-400 dark:text-white/35',
            open && 'rotate-180 !text-[#5B8CFF]',
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
            className="absolute top-full mt-2 w-full rounded-2xl overflow-hidden dropdown-surface z-[200]"
          >
            <div className="max-h-52 overflow-y-auto py-1">
              {options.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { onChange(c.id); setOpen(false) }}
                  className={cn(
                    'flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors',
                    value === c.id
                      ? 'bg-blue-50 dark:bg-[#5B8CFF]/20'
                      : 'hover:bg-gray-50 dark:hover:bg-white/8',
                  )}
                >
                  <span className="text-lg shrink-0 leading-none">{c.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{c.name}</p>
                    <p className="text-[10px] text-gray-500 dark:text-white/40">{c.currency}</p>
                  </div>
                  {value === c.id && <Check size={13} className="text-[#5B8CFF] shrink-0" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── City Select ────────────────────────────────────────────

interface CitySelectProps {
  value: string | null
  onChange: (id: string) => void
  cities: TransferCity[]
  label: string
  disabled?: boolean
}

export function CitySelect({ value, onChange, cities, label, disabled }: CitySelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = cities.find((c) => c.id === value)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (disabled || cities.length === 0) {
    return (
      <div className="relative w-full">
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 text-gray-500 dark:text-white/40">
          {label}
        </p>
        <div className={cn(
          'flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border cursor-not-allowed opacity-40',
          'bg-gray-100 border-gray-200',
          'dark:bg-[#161f33] dark:border-white/8',
        )}>
          <MapPin size={13} className="text-gray-400 dark:text-white/25 shrink-0" />
          <span className="text-sm text-gray-400 dark:text-white/30">Select country first</span>
        </div>
      </div>
    )
  }

  return (
    <div ref={ref} className="relative w-full">
      <p className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 text-gray-500 dark:text-white/40">
        {label}
      </p>

      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.99 }}
        className={cn(
          'flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl border transition-all duration-200 focus:outline-none',
          open
            ? [
                'border-[#5B8CFF] bg-blue-100',
                'dark:border-[#5B8CFF]/70 dark:bg-[#253060]',
              ].join(' ')
            : [
                'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50',
                'dark:bg-[#202c45] dark:border-white/12 dark:hover:border-white/22 dark:hover:bg-[#253055]',
              ].join(' '),
        )}
      >
        {selected ? (
          <>
            <MapPin size={13} className="text-[#5B8CFF] shrink-0" />
            <span className="flex-1 text-left text-sm font-semibold text-gray-900 dark:text-white">
              {selected.name}
            </span>
          </>
        ) : (
          <>
            <MapPin size={13} className="text-gray-400 dark:text-white/30 shrink-0" />
            <span className="flex-1 text-left text-sm text-gray-400 dark:text-white/35">Select city</span>
          </>
        )}
        <ChevronDown
          size={13}
          className={cn(
            'shrink-0 transition-transform duration-200 text-gray-400 dark:text-white/35',
            open && 'rotate-180 !text-[#5B8CFF]',
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
            className="absolute top-full mt-2 w-full rounded-2xl overflow-hidden dropdown-surface z-[200]"
          >
            <div className="max-h-44 overflow-y-auto py-1">
              {cities.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { onChange(c.id); setOpen(false) }}
                  className={cn(
                    'flex items-center gap-3 w-full px-3.5 py-2.5 text-left transition-colors',
                    value === c.id
                      ? 'bg-blue-50 dark:bg-[#5B8CFF]/20'
                      : 'hover:bg-gray-50 dark:hover:bg-white/8',
                  )}
                >
                  <MapPin
                    size={12}
                    className={cn(
                      'shrink-0',
                      value === c.id ? 'text-[#5B8CFF]' : 'text-gray-400 dark:text-white/30',
                    )}
                  />
                  <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">{c.name}</span>
                  {value === c.id && <Check size={12} className="text-[#5B8CFF] shrink-0" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
