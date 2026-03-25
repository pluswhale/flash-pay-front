/**
 * Pure component — scrollable message list.
 * Auto-scrolls to bottom on new messages.
 */
import { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { MessageItem } from './MessageItem'
import type { Message } from '../../types/api'

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
    <div className="flex-1 overflow-y-auto flex flex-col gap-2 px-4 py-4">
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} currentUserId={currentUserId} />
      ))}

      {isTyping && (
        <div className="flex justify-start">
          <div className="dark:bg-white/10 bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2.5">
            <span className="flex gap-1 items-center">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full dark:bg-gray-400 bg-gray-500 animate-bounce"
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
