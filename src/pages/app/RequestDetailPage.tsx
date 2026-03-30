/**
 * Page: Client — Request Detail + Chat
 * Route: /app/requests/:id
 *
 * The chat is constrained to max-w-4xl and centered — Telegram-Web style.
 * The Back link returns to /app/requests?requestId=:id so the right-side
 * panel is still visible when the user navigates back.
 */
import { useParams, Link }              from 'react-router-dom'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { useRequestDetailViewModel }    from '../../hooks/view-models/useRequestViewModel'
import { useChatViewModel }             from '../../hooks/view-models/useChatViewModel'
import { ChatContainer }                from '../../components/chat/ChatContainer'
import { RequestStatusBadge }           from '../../components/request/RequestStatusBadge'
import { useSessionStore }              from '../../store/sessionStore'

const CLIENT_QUICK_REPLIES = [
  'Отправил оплату',
  'Жду реквизиты',
  'Получил средства',
  'Нужна помощь',
]

export function RequestDetailPage() {
  const { id = '' }  = useParams<{ id: string }>()
  const currentUser  = useSessionStore((s) => s.user)
  const detail       = useRequestDetailViewModel(id)
  const chat         = useChatViewModel(id)

  if (detail.isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-brand" />
      </div>
    )
  }

  if (detail.isError || !detail.request) {
    return (
      <div className="flex-1 flex items-center justify-center py-24 px-4">
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
    /*
     * Outer: fills the remaining viewport height below the AppShell header.
     * Inner: centered, max 896px wide — matches the requests page container.
     * This gives the same Telegram-Web feel: centered chat box, not full-bleed.
     */
    <div className="flex justify-center" style={{ height: 'calc(100vh - 3.5rem)' }}>
      <div className="w-full max-w-4xl flex flex-col">

        {/* ── Sub-header ─────────────────────────────────────────────────────── */}
        <div className="border-b dark:border-white/8 border-gray-200 px-4 py-2.5 flex items-center gap-3 dark:bg-surface-0/50 bg-white/80 backdrop-blur-sm shrink-0">
          {/* Back goes to requests list with the requestId preserved in URL */}
          <Link
            to={`/app/requests?requestId=${id}`}
            className="flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors shrink-0"
          >
            <ArrowLeft size={15} /> Назад
          </Link>

          <div className="flex-1 flex items-center gap-2 min-w-0 overflow-hidden">
            <span className="font-semibold text-primary truncate text-sm">
              {req.directionFrom} → {req.directionTo}
            </span>
            <RequestStatusBadge status={req.status} />
          </div>

          <span className="text-xs text-muted shrink-0 hidden sm:block">
            {Number(req.amount).toLocaleString('ru-RU')} {req.currency}
          </span>
        </div>

        {/* ── Chat (fills remaining height) ──────────────────────────────────── */}
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
    </div>
  )
}
