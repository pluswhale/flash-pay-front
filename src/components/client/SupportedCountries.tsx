import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, ArrowRight, X } from 'lucide-react'
import { TRANSFER_COUNTRIES } from '../../data/transfers'
import type { TransferCountry } from '../../data/transfers'
import { cn } from '../shared/cn'

// ─── Country card ────────────────────────────────────────────

interface CountryCardProps {
  country: TransferCountry
  isSelected: boolean
  onClick: () => void
}

function CountryCard({ country, isSelected, onClick }: CountryCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04, y: -3 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 380, damping: 24 }}
      className={cn(
        'relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200 cursor-pointer',
        'shrink-0 min-w-[100px] sm:min-w-0',
        isSelected
          ? [
              'border-[#5B8CFF] shadow-[0_6px_20px_rgba(91,140,255,0.25)]',
              // Light: blue tint, Dark: solid dark-blue surface
              'bg-blue-100',
              'dark:bg-[#1e2f5e] dark:border-[#5B8CFF]/60',
            ].join(' ')
          : [
              // Light: solid white card
              'bg-white border-gray-200 hover:border-blue-300',
              'hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)]',
              // Dark: solid dark surface — NOT opacity-based
              'dark:bg-[#1a2235] dark:border-white/10',
              'dark:hover:border-white/20 dark:hover:bg-[#1e2a42]',
            ].join(' '),
      )}
    >
      {/* Flag */}
      <span className="text-3xl leading-none">{country.flag}</span>

      {/* Name + currency */}
      <div className="text-center">
        <p className="text-xs font-bold leading-tight text-gray-900 dark:text-white">
          {country.shortName}
        </p>
        <p className="text-[10px] mt-0.5 text-gray-500 dark:text-white/45">{country.currencyCode}</p>
      </div>

      {/* Active indicator dot */}
      {isSelected && (
        <motion.div
          layoutId="country-indicator"
          className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#5B8CFF] shadow-[0_0_6px_rgba(91,140,255,0.8)]"
        />
      )}

      {/* City count badge */}
      <div className={cn(
        'text-[9px] font-bold px-2 py-0.5 rounded-full',
        isSelected
          ? 'bg-[#5B8CFF] text-white'
          : 'bg-gray-100 text-gray-500 dark:bg-[#253050] dark:text-white/40',
      )}>
        {country.cities.length} cities
      </div>
    </motion.button>
  )
}

// ─── Expanded detail panel ───────────────────────────────────

interface DetailPanelProps {
  country: TransferCountry
  onClose: () => void
}

function DetailPanel({ country, onClose }: DetailPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0, y: -8 }}
      animate={{ opacity: 1, height: 'auto', y: 0 }}
      exit={{ opacity: 0, height: 0, y: -8 }}
      transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
      className="overflow-hidden"
    >
      <div className={cn(
        'p-5 rounded-2xl border',
        // Light: clean white card
        'bg-white border-gray-200',
        // Dark: solid dark surface
        'dark:bg-[#131d32] dark:border-white/12',
      )}>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-2xl flex items-center justify-center text-2xl',
              'bg-gray-50 border border-gray-200',
              'dark:bg-[#1e2d4a] dark:border-white/12',
            )}>
              {country.flag}
            </div>
            <div>
              <p className="font-black text-sm text-gray-900 dark:text-white">{country.name}</p>
              <p className="text-[11px] text-gray-500 dark:text-white/40">
                {country.cities.length} destinations · {country.currency}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center transition-colors',
              'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700',
              'dark:bg-[#253050] dark:text-white/50 dark:hover:bg-[#2e3d6a] dark:hover:text-white',
            )}
          >
            <X size={14} />
          </button>
        </div>

        {/* City grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {country.cities.map((city, i) => (
            <motion.div
              key={city.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ x: 3 }}
              className={cn(
                'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all cursor-pointer',
                // Light
                'bg-gray-50 border-gray-200 text-gray-700',
                'hover:border-blue-300 hover:bg-blue-50 hover:text-[#5B8CFF]',
                // Dark — solid surfaces
                'dark:bg-[#1e2d4a] dark:border-white/10 dark:text-white/80',
                'dark:hover:bg-[#253d6a] dark:hover:border-[#5B8CFF]/40 dark:hover:text-white',
              )}
            >
              <MapPin size={11} className="text-[#5B8CFF] shrink-0" />
              <span className="font-semibold truncate">{city.name}</span>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className={cn(
          'mt-4 pt-3 border-t flex items-center justify-between',
          'border-gray-100 dark:border-white/8',
        )}>
          <p className="text-[11px] text-gray-500 dark:text-white/35">
            Cash pickup & bank transfer available
          </p>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#5B8CFF] cursor-pointer hover:text-[#7AAEFF]">
            Get rates <ArrowRight size={10} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main export ─────────────────────────────────────────────

export function SupportedCountries() {
  const [selected, setSelected] = useState<string | null>(null)

  const toggle = (id: string) => setSelected((s) => (s === id ? null : id))
  const selectedCountry = TRANSFER_COUNTRIES.find((c) => c.id === selected) ?? null

  return (
    <div className="space-y-4">
      {/* Cards — horizontal scroll on mobile, grid on desktop */}
      <div className="flex sm:grid sm:grid-cols-4 md:grid-cols-8 gap-3 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
        {TRANSFER_COUNTRIES.map((country) => (
          <CountryCard
            key={country.id}
            country={country}
            isSelected={selected === country.id}
            onClick={() => toggle(country.id)}
          />
        ))}
      </div>

      {/* Detail panel */}
      <AnimatePresence mode="wait">
        {selectedCountry && (
          <DetailPanel
            key={selectedCountry.id}
            country={selectedCountry}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>

      {/* Hint */}
      <AnimatePresence>
        {!selected && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-[11px] text-gray-400 dark:text-white/25"
          >
            Tap a country to see available destinations
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
