import { motion } from 'framer-motion'
import { X, TrendingUp, RefreshCw, Zap } from 'lucide-react'
import { useOperatorStore } from '../../store/operatorStore'
import { useTranslation } from '../../hooks/useTranslation'
import { cn } from '../shared/cn'

interface RatesModalProps {
  onClose: () => void
}

export function RatesModal({ onClose }: RatesModalProps) {
  const { t } = useTranslation()
  const { marketRates } = useOperatorStore()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/65 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.88, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.88, y: 20, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        // Always dark — this is a trading desk panel
        className="w-full max-w-md rounded-3xl overflow-hidden bg-[#0f1726] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-emerald flex items-center justify-center shadow-glow-emerald">
              <TrendingUp size={14} className="text-white" />
            </div>
            <div>
              <h2 className="font-black text-sm text-white">{t.operator.rates}</h2>
              <p className="text-[11px] text-white/35">Live feeds</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-white/6 text-white/50 border border-white/10 hover:bg-white/12 hover:text-white/80 transition-colors">
              <RefreshCw size={11} />
              Refresh
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/8 hover:bg-white/16 flex items-center justify-center transition-colors"
            >
              <X size={13} className="text-white/60" />
            </button>
          </div>
        </div>

        {/* Rate list */}
        <div className="p-4 space-y-2">
          {marketRates.map((rate) => (
            <motion.div
              key={rate.pair}
              whileHover={{ x: 2 }}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/4 border border-white/8 hover:bg-white/7 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#5B8CFF]/15 border border-[#5B8CFF]/20 flex items-center justify-center">
                  <Zap size={13} className="text-[#5B8CFF]" />
                </div>
                <div>
                  <p className="font-bold text-sm text-white">{rate.pair}</p>
                  <span className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded font-semibold',
                    rate.source === 'bybit'
                      ? 'bg-amber-500/18 text-amber-300'
                      : 'bg-[#5B8CFF]/18 text-[#7AAEFF]',
                  )}>
                    {rate.source.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/45">
                  Bid <span className="font-bold text-emerald-400">{rate.bid.toLocaleString()}</span>
                </p>
                <p className="text-xs text-white/45">
                  Ask <span className="font-bold text-red-400">{rate.ask.toLocaleString()}</span>
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="px-5 pb-4">
          <p className="text-[11px] text-center text-white/22">
            Auto-refreshed every 30s from Bybit & Rapira API feeds
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
