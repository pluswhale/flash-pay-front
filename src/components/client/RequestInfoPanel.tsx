/**
 * RequestInfoPanel — right-column panel that appears after a request is created.
 *
 * Shows:
 *  - Request summary (direction, amount, currency, payout, location)
 *  - Live status badge (kept fresh via WS through useRequestDetailViewModel)
 *  - Embedded live chat — user can send messages without leaving the page
 *  - "Open Full Chat" button → navigates to /app/requests/:id
 *
 * Chat state (live messages, typing) is owned by chatStore and persists across
 * the embedded ↔ full-chat navigation so no messages are lost on route change.
 */
import { useNavigate }               from 'react-router-dom'
import { ArrowRight, Maximize2, Clock } from 'lucide-react'
import { useRequestDetailViewModel } from '../../hooks/view-models/useRequestViewModel'
import { useChatViewModel }          from '../../hooks/view-models/useChatViewModel'
import { RequestStatusBadge }        from '../request/RequestStatusBadge'
import { ChatContainer }             from '../chat/ChatContainer'
import { useSessionStore }           from '../../store/sessionStore'
import type { OtcRequest }           from '../../types/api'

const CLIENT_QUICK_REPLIES = [
  'Отправил оплату',
  'Жду реквизиты',
  'Получил средства',
  'Нужна помощь',
]

interface Props {
  request: OtcRequest
}

// AGENTS.md 6.3 — hoisted static gradient accent bar (no props, never changes)
const topAccentBar = (
  <div
    aria-hidden
    className="absolute inset-x-0 top-0 h-[2px] bg-gradient-brand"
  />
)

export function RequestInfoPanel({ request: initial }: Props) {
  const navigate    = useNavigate()
  const currentUser = useSessionStore((s) => s.user)

  const detail = useRequestDetailViewModel(initial.id)
  const chat   = useChatViewModel(initial.id, 'embedded')

  const req = detail.request ?? initial

  const amount = Number(req.amount).toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

  const createdAt = new Date(req.createdAt).toLocaleString('ru-RU', {
    day:    'numeric',
    month:  'short',
    hour:   '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="flex flex-col gap-3">

      {/* ── Request summary ──────────────────────────────────────────────── */}
      {/* overflow-hidden so the absolute top accent bar is clipped by rounded-2xl */}
      <div className="glass rounded-2xl p-5 overflow-hidden relative">

        {/* 2px brand-to-purple gradient line anchored to the top edge */}
        {topAccentBar}

        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 font-bold text-primary text-sm">
            <span>{req.directionFrom}</span>
            <ArrowRight size={13} className="text-brand shrink-0" />
            <span>{req.directionTo}</span>
          </div>
          <RequestStatusBadge status={req.status} />
        </div>

        <div className="space-y-1.5 text-xs">
          <Row label="Сумма"   value={`${amount} ${req.currency}`} />
          {req.payoutMethod !== null && req.payoutMethod !== undefined ? (
            <Row label="Способ" value={req.payoutMethod} />
          ) : null}
          {(req.country !== null && req.country !== undefined) ||
           (req.city   !== null && req.city   !== undefined) ? (
            <Row
              label="Локация"
              value={[req.country, req.city].filter(Boolean).join(', ')}
            />
          ) : null}
          <Row
            label="Создана"
            value={createdAt}
            icon={<Clock size={10} className="opacity-60" />}
          />
        </div>

        {req.comment !== null && req.comment !== undefined ? (
          <p className="mt-3 text-xs text-muted italic border-t dark:border-white/8 border-gray-100 pt-3">
            {req.comment}
          </p>
        ) : null}
      </div>

      {/* ── Embedded chat ─────────────────────────────────────────────────── */}
      <div className="glass rounded-2xl overflow-hidden flex flex-col">

        {/* Chat header — subtle brand gradient left-to-transparent tint */}
        <div className="flex items-center justify-between px-4 py-3 border-b dark:border-white/8 border-gray-100 shrink-0
                        bg-gradient-to-r from-brand/[0.05] to-transparent dark:from-brand/[0.08] dark:to-transparent">
          <span className="text-xs font-semibold text-secondary">
            Чат с оператором
          </span>
          <button
            type="button"
            onClick={() => navigate(`/app/requests/${req.id}`)}
            className="flex items-center gap-1.5 text-xs text-brand hover:text-brand-purple transition-colors font-medium"
          >
            <Maximize2 size={12} />
            Открыть полный чат
          </button>
        </div>

        {/* Chat body — fixed height so the panel never overflows the viewport.
            ChatContainer is flex-col h-full with MessageList (flex-1 overflow-y-auto)
            + ChatInput (shrink-0) — works correctly inside a fixed-height parent. */}
        <div className="h-72 flex flex-col min-h-0">
          <ChatContainer
            messages={chat.messages}
            isLoading={chat.isLoading}
            isTyping={chat.isTyping}
            currentUserId={currentUser?.id}
            onSend={chat.sendMessage}
            onTyping={chat.sendTyping}
            quickReplies={CLIENT_QUICK_REPLIES}
          />
        </div>

      </div>
    </div>
  )
}

// ── Internal helper ────────────────────────────────────────────────────────────

function Row({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1 text-muted">
        {icon}
        {label}
      </span>
      <span className="font-medium text-secondary text-right">{value}</span>
    </div>
  )
}
