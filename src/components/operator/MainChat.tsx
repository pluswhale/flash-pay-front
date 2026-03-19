import { useState, useRef, useEffect } from 'react'
import { Send, Phone, Calculator, Paperclip, Smile, Hash } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDealStore } from '../../store/dealStore'
import { StatusBadge } from '../shared/StatusBadge'
import { useTranslation } from '../../hooks/useTranslation'
import { cn } from '../shared/cn'
import type { DealStatus } from '../../types'

const HOT_PHRASES = [
  { key: '/hello', text: 'Hello! I am your personal operator. How can I help you today?' },
  { key: '/rate', text: 'Current rate: 1 USDT = 92.5 RUB. Rate is locked for 15 minutes.' },
  { key: '/requisites', text: 'Please send funds to the address indicated in your deal window.' },
  { key: '/done', text: 'Your exchange has been completed! Funds have been sent to your wallet.' },
  { key: '/wait', text: 'Your payment has been received. We are processing your exchange now.' },
  { key: '/docs', text: 'For transactions above $10,000, we may require identity verification.' },
  { key: '/delay', text: 'We apologize for the delay. Your request is being processed and will be completed shortly.' },
  { key: '/confirm', text: 'Please confirm you have sent the funds and provide the transaction hash.' },
]

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-sm bg-white/8 border border-white/6 w-fit">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#5B8CFF]/60 typing-dot"
          style={{ animationDelay: `${i * 160}ms` }}
        />
      ))}
    </div>
  )
}

interface MainChatProps {
  dealId: string | null
  onTogglePanel?: () => void
}

export function MainChat({ dealId, onTogglePanel }: MainChatProps) {
  const { t } = useTranslation()
  const { getDeal, addMessage, markMessagesRead } = useDealStore()
  const [input, setInput] = useState('')
  const [showPhrases, setShowPhrases] = useState(false)
  const [phraseFilter, setPhraseFilter] = useState('')
  const [calcResult, setCalcResult] = useState<string | null>(null)
  const [showTyping, setShowTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const deal = dealId ? getDeal(dealId) : null

  useEffect(() => {
    if (dealId) markMessagesRead(dealId)
  }, [dealId, deal?.messages.length])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [deal?.messages.length, showTyping])

  const handleInputChange = (value: string) => {
    setInput(value)

    if (value.startsWith('/')) {
      setShowPhrases(true)
      setPhraseFilter(value.slice(1))
    } else {
      setShowPhrases(false)
    }

    const mathRegex = /^[\d\s+\-*/.()\^]+$/
    if (mathRegex.test(value) && /[+\-*/]/.test(value)) {
      try {
        // eslint-disable-next-line no-new-func
        const result = Function('"use strict"; return (' + value + ')')()
        if (typeof result === 'number' && isFinite(result)) {
          setCalcResult(`= ${result.toLocaleString()}`)
        } else setCalcResult(null)
      } catch { setCalcResult(null) }
    } else setCalcResult(null)
  }

  const selectPhrase = (phrase: (typeof HOT_PHRASES)[0]) => {
    setInput(phrase.text)
    setShowPhrases(false)
    setCalcResult(null)
    inputRef.current?.focus()
  }

  const send = () => {
    if (!input.trim() || !dealId) return
    addMessage(dealId, {
      from: 'operator',
      text: input.trim(),
      timestamp: new Date(),
      isRead: true,
    })
    setInput('')
    setCalcResult(null)
    setShowPhrases(false)

    // Simulate client typing response occasionally
    if (Math.random() > 0.5) {
      setShowTyping(true)
      setTimeout(() => {
        setShowTyping(false)
        addMessage(dealId, {
          from: 'client',
          text: 'Got it, thank you!',
          timestamp: new Date(),
          isRead: false,
        })
      }, 2500)
    }
  }

  const filteredPhrases = HOT_PHRASES.filter(
    (p) => phraseFilter === '' || p.key.slice(1).startsWith(phraseFilter)
  )

  const statusLabels: Record<DealStatus, string> = {
    NEW: t.status.NEW, AWAITING_PAYMENT: t.status.AWAITING_PAYMENT,
    IN_PROGRESS: t.status.IN_PROGRESS, PAYMENT_RECEIVED: t.status.PAYMENT_RECEIVED,
    VERIFICATION: t.status.VERIFICATION, PAYOUT_SENT: t.status.PAYOUT_SENT,
    COMPLETED: t.status.COMPLETED, CANCELLED: t.status.CANCELLED,
    REFUND: t.status.REFUND, EXPIRED: t.status.EXPIRED,
  }

  if (!deal) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-3xl bg-gradient-brand/15 border border-[#5B8CFF]/20 flex items-center justify-center"
        >
          <Send size={24} className="text-[#5B8CFF]/50" />
        </motion.div>
        <div>
          <p className="font-semibold text-white/40">Select a request from the queue</p>
          <p className="text-sm text-white/20 mt-1.5 leading-relaxed">
            Choose a deal to start the conversation
          </p>
        </div>
      </div>
    )
  }

  const lastMsg = deal.messages[deal.messages.length - 1]

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className={cn(
        'flex items-center justify-between px-4 sm:px-5 py-3.5 shrink-0',
        'border-b border-white/6',
        'bg-[#1a2235]/80 backdrop-blur-sm',
      )}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center text-sm font-black text-white shadow-glow-brand-sm">
              {deal.clientName.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#1a2235]" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-white truncate">{deal.clientName}</p>
            <div className="flex items-center gap-2">
              <p className="text-[11px] text-white/30 font-mono">{deal.id}</p>
              {lastMsg && (
                <p className="text-[11px] text-white/20 hidden sm:block truncate max-w-32">
                  · {lastMsg.text.slice(0, 24)}…
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={deal.status} label={statusLabels[deal.status]} size="sm" />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            className={cn(
              'hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold',
              'bg-emerald-500/12 text-emerald-300 border border-emerald-500/20',
              'hover:bg-emerald-500/20 transition-colors',
            )}
          >
            <Phone size={11} />
            {t.operator.callManager}
          </motion.button>
          {onTogglePanel && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onTogglePanel}
              className="sm:hidden w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/10 transition-all"
            >
              <Hash size={14} />
            </motion.button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {deal.messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'flex',
              msg.from === 'operator' ? 'justify-end' : 'justify-start'
            )}
          >
            {msg.from === 'system' ? (
              <div className="w-full flex justify-center">
                <span className="text-[10px] text-white/25 italic px-4 py-1 rounded-full bg-white/3">
                  {msg.text}
                </span>
              </div>
            ) : (
              <>
                {msg.from !== 'operator' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center text-[11px] font-black text-white mr-2 shrink-0 mt-1 shadow-glow-brand-sm">
                    {deal.clientName.charAt(0)}
                  </div>
                )}
                <div className={cn(
                  'max-w-[75%] px-4 py-2.5 rounded-2xl text-sm',
                  msg.from === 'operator'
                    ? 'bg-gradient-brand text-white rounded-br-sm shadow-glow-brand-sm'
                    : 'bg-white/8 text-white/90 rounded-bl-sm border border-white/6'
                )}>
                  <p className="leading-relaxed">{msg.text}</p>
                  <p className={cn(
                    'text-[10px] mt-1 opacity-50',
                    msg.from === 'operator' ? 'text-right' : '',
                  )}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {msg.from === 'operator' && ' ✓✓'}
                  </p>
                </div>
              </>
            )}
          </motion.div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {showTyping && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="flex items-end gap-2"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center text-[11px] font-black text-white mr-0 shrink-0">
                {deal.clientName.charAt(0)}
              </div>
              <TypingIndicator />
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Hot phrases */}
      <AnimatePresence>
        {showPhrases && filteredPhrases.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className={cn(
              'mx-3 mb-2 rounded-2xl overflow-hidden shrink-0',
              'glass-bright shadow-glass-lg',
            )}
          >
            <div className="px-3 py-2 border-b border-white/6">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Hot Phrases</p>
            </div>
            <div className="max-h-44 overflow-y-auto">
              {filteredPhrases.map((phrase) => (
                <motion.button
                  key={phrase.key}
                  whileHover={{ x: 3 }}
                  onClick={() => selectPhrase(phrase)}
                  className="w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-[#5B8CFF]/12 transition-colors"
                >
                  <span className="text-[11px] font-mono font-bold text-[#5B8CFF] bg-[#5B8CFF]/15 px-2 py-0.5 rounded-lg shrink-0 min-w-[4.5rem]">
                    {phrase.key}
                  </span>
                  <span className="text-xs text-white/50 truncate">{phrase.text}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calculator hint */}
      <AnimatePresence>
        {calcResult && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-3 mb-2 px-4 py-2 rounded-xl flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 shrink-0"
          >
            <Calculator size={13} className="text-amber-400 shrink-0" />
            <span className="text-sm font-mono font-bold text-amber-300">{calcResult}</span>
            <span className="text-xs text-white/25 ml-auto">Press Enter to send</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div className="px-3 py-3 border-t border-white/6 flex items-center gap-2 shrink-0 bg-[#111827]/60">
        <button className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/25 hover:text-white/50 hover:bg-white/10 transition-all shrink-0">
          <Paperclip size={13} />
        </button>
        <button className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/25 hover:text-white/50 hover:bg-white/10 transition-all shrink-0">
          <Smile size={13} />
        </button>
        <div className="flex-1 min-w-0 relative">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Type / for phrases or a math expression…"
            className={cn(
              'w-full px-4 py-2.5 rounded-xl text-sm',
              'bg-white/5 border border-white/8',
              'text-white placeholder-white/25 outline-none caret-[#5B8CFF]',
              'focus:border-[#5B8CFF]/40 transition-colors',
            )}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          onClick={send}
          className="w-9 h-9 rounded-xl bg-gradient-brand text-white flex items-center justify-center shrink-0 shadow-glow-brand-sm hover:shadow-glow-brand transition-shadow"
        >
          <Send size={14} />
        </motion.button>
      </div>
    </div>
  )
}
