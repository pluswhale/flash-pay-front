/**
 * Pure component — scrollable message list.
 * Auto-scrolls to bottom on new messages.
 *
 * Telegram-style grouping: messages from the same sender are spaced
 * tightly (mt-0.5) while a new sender group gets more breathing room (mt-3).
 * System messages always break the visual group.
 */
import { useEffect, useRef } from 'react'
import { Loader2 }           from 'lucide-react'
import { MessageItem }       from './MessageItem'
import { SenderType }        from '../../types/api'
import type { Message }      from '../../types/api'

interface Props {
  messages:      Message[]
  isLoading:     boolean
  isTyping:      boolean
  currentUserId?: string
}

export function MessageList({ messages, isLoading, isTyping, currentUserId }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={20} className="animate-spin dark:text-blue-400 text-blue-600" />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto flex flex-col px-4 py-4">
      {messages.map((msg, i) => {
        const prev     = messages[i - 1]
        const isSystem = msg.senderType === SenderType.SYSTEM
        const wasSystem = prev?.senderType === SenderType.SYSTEM

        // New group when: first message, sender changes, or either side is a system pill
        const isNewGroup = i === 0
          || isSystem
          || wasSystem
          || prev.senderId !== msg.senderId

        return (
          <div key={msg.id} className={i === 0 ? undefined : isNewGroup ? 'mt-3' : 'mt-0.5'}>
            <MessageItem message={msg} currentUserId={currentUserId} />
          </div>
        )
      })}

      {isTyping && (
        <div className="flex justify-start mt-3">
          {/* Matches incoming bubble: white card (light) / glass (dark) */}
          <div className="rounded-2xl rounded-bl-sm px-4 py-3
                          bg-white border border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)]
                          dark:bg-white/10 dark:border-white/10 dark:shadow-none">
            <span className="flex gap-1 items-center">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-white/50 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
