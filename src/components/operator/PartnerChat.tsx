import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, Send, Building2 } from 'lucide-react'
import { useDealStore } from '../../store/dealStore'
import { useTranslation } from '../../hooks/useTranslation'
import { cn } from '../shared/cn'

interface PartnerChatProps {
  dealId: string | null
}

export function PartnerChat({ dealId }: PartnerChatProps) {
  const { t } = useTranslation()
  const { getDeal, addPartnerMessage } = useDealStore()
  const [expanded, setExpanded] = useState(false)
  const [input, setInput] = useState('')

  const deal = dealId ? getDeal(dealId) : null
  const messages = deal?.partnerMessages ?? []
  const unread = messages.filter((m) => !m.isRead && m.from === 'partner').length

  const send = () => {
    if (!input.trim() || !dealId) return
    addPartnerMessage(dealId, {
      from: 'operator',
      text: input.trim(),
      timestamp: new Date(),
      isRead: true,
    })
    setInput('')
    setTimeout(() => {
      addPartnerMessage(dealId, {
        from: 'partner',
        text: `Rate confirmed: ${(92 + Math.random()).toFixed(4)} RUB/USDT. Ready to execute.`,
        timestamp: new Date(),
        isRead: false,
      })
    }, 1800)
  }

  return (
    <div className="border-t border-white/6 bg-[#0d1525]/70 shrink-0">
      {/* Toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Building2 size={12} className="text-[#5B8CFF]/70" />
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-wide">{t.operator.partnerChat}</span>
          {unread > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#7C5CFF] text-white text-[9px] flex items-center justify-center font-black">
              {unread}
            </span>
          )}
        </div>
        <ChevronUp
          size={12}
          className={cn('text-white/25 transition-transform duration-200', !expanded && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 200, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            {/* Messages */}
            <div className="h-36 overflow-y-auto px-4 py-2 space-y-2">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-xs text-white/20">No partner messages</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={cn('flex', msg.from === 'operator' ? 'justify-end' : 'justify-start')}>
                    <div className={cn(
                      'max-w-[80%] px-3 py-1.5 rounded-xl text-xs',
                      msg.from === 'operator'
                        ? 'bg-[#7C5CFF]/70 text-white'
                        : 'bg-white/8 text-white/70 border border-white/6',
                    )}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="px-3 pb-3 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Message partner…"
                disabled={!dealId}
                className={cn(
                  'flex-1 min-w-0 px-3 py-2 rounded-xl text-xs',
                  'bg-white/5 border border-white/8 text-white placeholder-white/25',
                  'outline-none focus:border-[#7C5CFF]/40 transition-colors',
                  'disabled:opacity-40',
                )}
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={send}
                disabled={!dealId}
                className="w-8 h-8 rounded-xl bg-[#7C5CFF] text-white flex items-center justify-center disabled:opacity-40 shadow-glow-purple"
              >
                <Send size={12} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
