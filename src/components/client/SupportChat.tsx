import { useState, useRef, useEffect } from 'react'
import { Send, MessageCircle, X, Paperclip } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDealStore } from '../../store/dealStore'
import { useTranslation } from '../../hooks/useTranslation'
import { cn } from '../shared/cn'

interface SupportChatProps {
  dealId: string
}

function TypingIndicator() {
  return (
    <div className={cn(
      'flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-sm w-fit',
      'bg-gray-100 dark:bg-white/8',
    )}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-white/40 typing-dot"
          style={{ animationDelay: `${i * 160}ms` }}
        />
      ))}
    </div>
  )
}

export function SupportChat({ dealId }: SupportChatProps) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const { t } = useTranslation()
  const { getDeal, addMessage } = useDealStore()
  const bottomRef = useRef<HTMLDivElement>(null)

  const deal = getDeal(dealId)
  const messages = deal?.messages ?? []

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, open])

  const send = () => {
    if (!input.trim()) return
    addMessage(dealId, { from: 'client', text: input.trim(), timestamp: new Date(), isRead: false })
    setInput('')
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      addMessage(dealId, {
        from: 'operator',
        text: 'Thank you for reaching out! Your request is being processed. We will update you shortly.',
        timestamp: new Date(),
        isRead: false,
      })
    }, 2200)
  }

  const unread = messages.filter((m) => !m.isRead && m.from === 'operator').length

  return (
    <>
      {/* Trigger button */}
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-colors',
          'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100',
          'dark:bg-[#5B8CFF]/15 dark:text-[#7AAEFF] dark:border-[#5B8CFF]/20 dark:hover:bg-[#5B8CFF]/25',
        )}
      >
        <MessageCircle size={15} />
        {t.deal.support}
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={cn(
              'fixed bottom-6 right-4 sm:right-6 z-[100] w-[calc(100vw-2rem)] sm:w-80 rounded-3xl overflow-hidden',
              /* Light */
              'bg-white border border-gray-200 shadow-xl',
              /* Dark */
              'dark:bg-[#0f1a2e] dark:border-white/10 dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)]',
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-brand">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Support Chat</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    <p className="text-xs text-white/70">Online · avg reply 2 min</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
              >
                <X size={13} className="text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="h-60 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-transparent">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                  <MessageCircle size={28} className="text-gray-300 dark:text-white/20" />
                  <p className="text-xs text-gray-400 dark:text-white/30">Send a message to start chatting</p>
                </div>
              )}
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex', msg.from === 'client' ? 'justify-end' : 'justify-start')}
                >
                  <div className={cn(
                    'max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm',
                    msg.from === 'client'
                      ? 'bg-gradient-brand text-white rounded-br-sm'
                      : msg.from === 'system'
                      ? 'text-gray-400 dark:text-white/30 text-xs italic w-full text-center py-1 px-0 bg-transparent'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm dark:bg-white/8 dark:border-white/8 dark:text-white/85'
                  )}>
                    <p className="leading-relaxed">{msg.text}</p>
                    {msg.from !== 'system' && (
                      <p className={cn('text-[10px] mt-1 opacity-50', msg.from === 'client' && 'text-right')}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <TypingIndicator />
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div className="px-3 py-3 border-t border-gray-200 dark:border-white/8 flex items-center gap-2 bg-white dark:bg-transparent">
              <button className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60 transition-colors">
                <Paperclip size={13} />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Type a message…"
                className={cn(
                  'flex-1 min-w-0 px-3 py-2 rounded-xl text-sm outline-none transition-all',
                  'bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-400',
                  'focus:border-[#5B8CFF] focus:bg-white focus:shadow-[0_0_0_2px_rgba(91,140,255,0.15)]',
                  'dark:bg-white/5 dark:border-white/8 dark:text-white dark:placeholder-white/25 dark:focus:border-[#5B8CFF]/40 dark:caret-[#5B8CFF]',
                )}
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={send}
                className="w-8 h-8 rounded-xl bg-gradient-brand text-white flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(91,140,255,0.4)]"
              >
                <Send size={13} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
