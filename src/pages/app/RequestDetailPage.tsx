/**
 * Page: Client — Request Detail + Full Chat
 * Route: /app/requests/:id
 *
 * Layout (desktop):
 *  ┌────────────────────────────────┬──────────────────┐
 *  │  Chat column (flex-1)          │  Info sidebar    │
 *  │  ┌── sub-header ─────────────┐ │  (w-72, hidden   │
 *  │  │ ← Назад | direction+status│ │   on mobile)     │
 *  │  └───────────────────────────┘ │                  │
 *  │  Messages (overflow-y-auto)    │  - direction     │
 *  │                                │  - amount        │
 *  │  [sticky input]                │  - status        │
 *  └────────────────────────────────┴──────────────────┘
 *
 * On mobile: sidebar is hidden; amount is shown inline in the sub-header.
 *
 * Back link returns to /app/requests?requestId=:id so the right-side panel
 * and chatStore messages are still visible when the user navigates back.
 */
import { memo }                      from 'react'
import { useParams, Link }           from 'react-router-dom'
import { ArrowLeft, ArrowRight, Loader2, AlertCircle, Clock, FileText } from 'lucide-react'
import { useRequestDetailViewModel } from '../../hooks/view-models/useRequestViewModel'
import { useChatViewModel }          from '../../hooks/view-models/useChatViewModel'
import { ChatContainer }             from '../../components/chat/ChatContainer'
import { RequestStatusBadge }        from '../../components/request/RequestStatusBadge'
import { useSessionStore }           from '../../store/sessionStore'
import type { OtcRequest }           from '../../types/api'

const CLIENT_QUICK_REPLIES = [
  'Отправил оплату',
  'Жду реквизиты',
  'Получил средства',
  'Нужна помощь',
]

// AppShell header is h-14 (3.5rem). Page fills the rest.
const PAGE_HEIGHT = 'calc(100vh - 3.5rem)'

export function RequestDetailPage() {
  const { id = '' }  = useParams<{ id: string }>()
  const currentUser  = useSessionStore((s) => s.user)
  const detail       = useRequestDetailViewModel(id)
  const chat         = useChatViewModel(id, 'fullscreen')

  if (detail.isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ height: PAGE_HEIGHT }}>
        <Loader2 size={24} className="animate-spin text-brand" />
      </div>
    )
  }

  if (detail.isError || !detail.request) {
    return (
      <div className="flex items-center justify-center px-4" style={{ height: PAGE_HEIGHT }}>
        <div className="text-center max-w-sm">
          <AlertCircle size={40} className="mx-auto mb-4 text-muted" />
          <p className="text-secondary mb-4">{detail.errorMessage ?? 'Заявка не найдена'}</p>
          <Link to="/app/requests" className="text-sm text-brand hover:underline">
            Вернуться к заявкам
          </Link>
        </div>
      </div>
    )
  }

  const req = detail.request

  return (
    <div className="flex" style={{ height: PAGE_HEIGHT }}>

      {/* ── Chat column ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">

        {/* Sub-header */}
        <div className="flex items-center gap-3 px-4 py-2.5 shrink-0
                        border-b dark:border-white/8 border-gray-200
                        dark:bg-surface-0/60 bg-white/80 backdrop-blur-sm">
          <Link
            to={`/app/requests?requestId=${id}`}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors shrink-0"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">Назад</span>
          </Link>

          <div className="flex-1 flex items-center gap-2 min-w-0 overflow-hidden">
            <span className="font-semibold text-sm text-primary truncate">
              {req.directionFrom} → {req.directionTo}
            </span>
            <RequestStatusBadge status={req.status} />
          </div>

          {/* Amount visible on mobile where the sidebar is hidden */}
          <span className="text-xs text-muted shrink-0 lg:hidden">
            {Number(req.amount).toLocaleString('ru-RU')} {req.currency}
          </span>
        </div>

        {/* Chat body — fills remaining height */}
        <div className="flex-1 min-h-0">
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

      {/* ── Info sidebar (lg+) ──────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-72 shrink-0
                        border-l dark:border-white/8 border-gray-200
                        overflow-y-auto">
        <RequestInfoSidebar req={req} />
      </aside>

    </div>
  )
}

// ── Internal memoized sidebar ──────────────────────────────────────────────────
// AGENTS.md Rule 5.5 — extracted so it only re-renders when req changes (WS status update),
// not on every chat message arrival.

const RequestInfoSidebar = memo(function RequestInfoSidebar({ req }: { req: OtcRequest }) {
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
    <div className="flex flex-col gap-3 p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted pt-1">
        Информация о заявке
      </p>

      <div className="glass rounded-2xl p-4 flex flex-col gap-3">

        {/* Direction + status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-bold text-sm text-primary">
            <span>{req.directionFrom}</span>
            <ArrowRight size={12} className="text-muted shrink-0" />
            <span>{req.directionTo}</span>
          </div>
          <RequestStatusBadge status={req.status} />
        </div>

        <div className="h-px dark:bg-white/8 bg-gray-100" />

        {/* Info rows */}
        <div className="flex flex-col gap-2.5">
          <InfoRow label="Сумма"   value={`${amount} ${req.currency}`} />
          {req.payoutMethod && (
            <InfoRow label="Способ" value={req.payoutMethod} />
          )}
          {(req.country || req.city) && (
            <InfoRow
              label="Локация"
              value={[req.country, req.city].filter(Boolean).join(', ')}
            />
          )}
          <InfoRow
            label="Создана"
            value={createdAt}
            icon={<Clock size={10} className="opacity-50" />}
          />
        </div>

        {req.comment && (
          <>
            <div className="h-px dark:bg-white/8 bg-gray-100" />
            <div className="flex items-start gap-2">
              <FileText size={12} className="text-muted shrink-0 mt-0.5" />
              <p className="text-xs text-muted italic leading-relaxed">{req.comment}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
})

// ── Internal helper ────────────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="flex items-center gap-1 text-muted shrink-0">
        {icon}
        {label}
      </span>
      <span className="font-medium text-secondary text-right">{value}</span>
    </div>
  )
}
