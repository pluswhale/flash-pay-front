/**
 * Pure component — single chat message bubble.
 */
import { SenderType } from '../../types/api'
import type { Message } from '../../types/api'

interface Props {
  message:        Message
  currentUserId?: string
}

export function MessageItem({ message, currentUserId }: Props) {
  const isMine   = message.senderId === currentUserId
  const isSystem = message.senderType === SenderType.SYSTEM

  const time = new Date(message.createdAt).toLocaleTimeString('ru-RU', {
    hour:   '2-digit',
    minute: '2-digit',
  })

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-muted px-3 py-1 rounded-full dark:bg-white/5 bg-gray-100">
          {message.content}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div className={[
        'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
        isMine
          // Own messages: brand gradient bubble
          ? 'bg-gradient-brand text-white rounded-br-sm shadow-[0_2px_8px_rgba(91,140,255,0.3)]'
          // Other: glass surface
          : 'dark:bg-white/8 bg-gray-100 dark:border dark:border-white/8 text-secondary rounded-bl-sm',
      ].join(' ')}>
        {!isMine && (
          <p className="text-[10px] mb-1 font-semibold opacity-55 capitalize tracking-wide">
            {message.senderType}
          </p>
        )}
        <p className="leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
        <p className={`text-xs mt-1 ${isMine ? 'text-white/60' : 'text-muted'}`}>
          {time}
        </p>
      </div>
    </div>
  )
}
