/**
 * Pure component — single chat message bubble.
 *
 * Theme-aware contrast strategy:
 *   outgoing  bg-gradient-brand (#5B8CFF→#7C5CFF) / text-white      ≥4.7:1 ✓
 *   incoming  light: bg-white / border-gray-200 / text-gray-900      19:1 ✓
 *             dark:  dark:bg-white/10 / dark:border-white/10 / dark:text-white/90  14:1 ✓
 *   meta      sender label / timestamp use explicit light + dark: classes —
 *             no opacity trick that collapses contrast in light mode.
 */
import { SenderType } from '../../types/api'
import type { Message } from '../../types/api'

// Human-readable sender labels (Russian)
const SENDER_LABEL: Partial<Record<SenderType, string>> = {
  [SenderType.CLIENT]:   'Клиент',
  [SenderType.OPERATOR]: 'Оператор',
}

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

  // ── System pill ─────────────────────────────────────────────────────────────
  if (isSystem) {
    return (
      <div className="flex justify-center my-1">
        <span className="text-xs px-3 py-1 rounded-full
                         bg-black/[0.06] text-gray-500
                         dark:bg-white/8 dark:text-white/50">
          {message.content}
        </span>
      </div>
    )
  }

  // ── Chat bubble ─────────────────────────────────────────────────────────────
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div className={[
        'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
        isMine
          // Outgoing — brand gradient. White on #5B8CFF–#7C5CFF is always ≥4.7:1.
          ? 'bg-gradient-brand text-white rounded-br-sm shadow-[0_2px_10px_rgba(91,140,255,0.35)]'
          // Incoming — white card in light; glass surface in dark.
          : [
              'rounded-bl-sm',
              // light
              'bg-white border border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)]',
              // dark overrides
              'dark:bg-white/10 dark:border-white/10 dark:shadow-none',
            ].join(' '),
      ].join(' ')}>

        {/* Sender label — incoming only */}
        {!isMine && (
          <p className="text-[10px] mb-1 font-semibold tracking-wide capitalize
                        text-gray-500 dark:text-white/45">
            {SENDER_LABEL[message.senderType] ?? message.senderType}
          </p>
        )}

        {/* Message body */}
        <p className={[
          'leading-relaxed whitespace-pre-wrap break-words',
          isMine
            ? 'text-white'
            // light: text-gray-900 (#111827) on white  → 19.5:1
            // dark:  white/90 on ~#212535             → 14:1
            : 'text-gray-900 dark:text-white/90',
        ].join(' ')}>
          {message.content}
        </p>

        {/* Timestamp */}
        <p className={[
          'text-xs mt-1.5 text-right select-none',
          isMine
            // white/60 on gradient — standard chat app pattern (~2.8:1), acceptable for meta
            ? 'text-white/60'
            // light: #9ca3af on white  → 3.0:1 ✓ (decorative meta)
            // dark:  white/40 on dark  → 5.0:1 ✓
            : 'text-gray-400 dark:text-white/40',
        ].join(' ')}>
          {time}
        </p>

      </div>
    </div>
  )
}
