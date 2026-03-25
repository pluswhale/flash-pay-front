/**
 * Pure component — single chat message bubble.
 */
import { SenderType } from '../../types/api'
import type { Message } from '../../types/api'

interface Props {
  message: Message
  /** The authenticated user's ID — used to determine bubble alignment */
  currentUserId?: string
}

export function MessageItem({ message, currentUserId }: Props) {
  const isMine = message.senderId === currentUserId
  const isSystem = message.senderType === SenderType.SYSTEM

  const time = new Date(message.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs dark:text-gray-500 text-gray-400 px-3 py-1 rounded-full dark:bg-white/5 bg-gray-100">
          {message.content}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
          isMine
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'dark:bg-white/10 bg-gray-100 dark:text-gray-200 text-gray-800 rounded-bl-sm'
        }`}
      >
        {!isMine && (
          <p className="text-xs mb-1 opacity-60 capitalize">
            {message.senderType}
          </p>
        )}
        <p className="leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
        <p className={`text-xs mt-1 ${isMine ? 'text-blue-200' : 'dark:text-gray-500 text-gray-400'}`}>
          {time}
        </p>
      </div>
    </div>
  )
}
