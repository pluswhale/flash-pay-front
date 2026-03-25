/**
 * RequestInfoPanel — right-column panel that appears after a request is created.
 *
 * Shows:
 *  - Request summary (direction, amount, currency, payout, location)
 *  - Live status badge (kept fresh via WS through useRequestDetailViewModel)
 *  - Mini chat preview (last 3 messages via useChatViewModel)
 *  - "Open Chat" button → navigates to full chat page
 */
import { useNavigate }                   from 'react-router-dom'
import { ArrowRight, MessageCircle, Loader2, Clock } from 'lucide-react'
import { useRequestDetailViewModel }     from '../../hooks/view-models/useRequestViewModel'
import { useChatViewModel }              from '../../hooks/view-models/useChatViewModel'
import { RequestStatusBadge }            from '../request/RequestStatusBadge'
import { SenderType }                    from '../../types/api'
import type { OtcRequest }               from '../../types/api'

interface Props {
  request: OtcRequest
}

export function RequestInfoPanel({ request: initial }: Props) {
  const navigate = useNavigate()

  // Keep status live via WS; fall back to initial data while loading
  const detail = useRequestDetailViewModel(initial.id)
  const chat   = useChatViewModel(initial.id)

  const req            = detail.request ?? initial
  const recentMessages = chat.messages.slice(-3)

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

      {/* ── Request summary ──────────────────────────────────────────── */}
      <div className="rounded-2xl border dark:border-white/10 border-gray-200 dark:bg-white/5 bg-white p-5">

        {/* Direction + status row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 font-bold dark:text-white text-gray-900 text-sm">
            <span>{req.directionFrom}</span>
            <ArrowRight size={13} className="dark:text-gray-500 text-gray-400 shrink-0" />
            <span>{req.directionTo}</span>
          </div>
          <RequestStatusBadge status={req.status} />
        </div>

        {/* Details */}
        <div className="space-y-1.5 text-xs">
          <Row label="Сумма"   value={`${amount} ${req.currency}`} />
          {req.payoutMethod && <Row label="Способ" value={req.payoutMethod} />}
          {(req.country || req.city) && (
            <Row
              label="Локация"
              value={[req.country, req.city].filter(Boolean).join(', ')}
            />
          )}
          <Row
            label="Создана"
            value={createdAt}
            icon={<Clock size={10} className="opacity-60" />}
          />
        </div>

        {req.comment && (
          <p className="mt-3 text-xs dark:text-gray-500 text-gray-400 italic border-t dark:border-white/8 border-gray-100 pt-3">
            {req.comment}
          </p>
        )}
      </div>

      {/* ── Mini chat ────────────────────────────────────────────────── */}
      <div className="rounded-2xl border dark:border-white/10 border-gray-200 dark:bg-white/5 bg-white overflow-hidden">

        {/* Chat header */}
        <div className="flex items-center justify-between px-4 py-3 border-b dark:border-white/8 border-gray-100">
          <div className="flex items-center gap-2">
            <MessageCircle size={13} className="text-blue-500" />
            <span className="text-xs font-semibold dark:text-gray-300 text-gray-700">
              Чат с оператором
            </span>
          </div>
          {chat.isTyping && (
            <span className="text-[10px] dark:text-blue-400 text-blue-500 animate-pulse font-medium">
              печатает…
            </span>
          )}
        </div>

        {/* Messages preview */}
        <div className="px-4 py-3 min-h-[88px] flex flex-col justify-center">
          {chat.isLoading ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 size={16} className="animate-spin dark:text-gray-600 text-gray-400" />
            </div>
          ) : recentMessages.length === 0 ? (
            <p className="text-xs dark:text-gray-600 text-gray-400 text-center">
              Сообщений пока нет — оператор скоро напишет
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {recentMessages.map((msg) => {
                const isClient = msg.senderType === SenderType.CLIENT
                const isSystem = msg.senderType === SenderType.SYSTEM
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={[
                        'max-w-[85%] px-3 py-1.5 rounded-xl text-xs leading-relaxed',
                        isSystem
                          ? 'w-full max-w-full text-center dark:bg-white/5 bg-gray-100 dark:text-gray-500 text-gray-400 italic'
                          : isClient
                            ? 'dark:bg-blue-600/25 bg-blue-50 dark:text-blue-200 text-blue-800 rounded-br-sm'
                            : 'dark:bg-white/8 bg-gray-50 border dark:border-white/8 border-gray-200 dark:text-gray-300 text-gray-700 rounded-bl-sm',
                      ].join(' ')}
                    >
                      {msg.content}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={() => navigate(`/app/requests/${req.id}`)}
            className={[
              'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl',
              'bg-blue-600 text-white text-xs font-semibold',
              'hover:bg-blue-500 transition-colors',
            ].join(' ')}
          >
            <MessageCircle size={13} />
            Открыть чат
          </button>
        </div>
      </div>
    </div>
  )
}

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
      <span className="flex items-center gap-1 dark:text-gray-500 text-gray-400">
        {icon}
        {label}
      </span>
      <span className="font-medium dark:text-gray-300 text-gray-700 text-right">{value}</span>
    </div>
  )
}
