/**
 * Page: Client — Request Detail + Chat
 * Route: /app/requests/:id
 *
 * Main view after creating a request — chat occupies the full screen.
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
        <Loader2 size={24} className="animate-spin dark:text-blue-400 text-blue-600" />
      </div>
    )
  }

  if (detail.isError || !detail.request) {
    return (
      <div className="flex-1 flex items-center justify-center py-24 px-4">
        <div className="text-center max-w-sm">
          <AlertCircle size={40} className="mx-auto mb-4 dark:text-gray-500 text-gray-400" />
          <p className="dark:text-gray-300 text-gray-700 mb-4">{detail.errorMessage ?? 'Заявка не найдена'}</p>
          <Link to="/app/requests" className="text-sm dark:text-blue-400 text-blue-600 hover:underline">
            Вернуться к заявкам
          </Link>
        </div>
      </div>
    )
  }

  const req = detail.request

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 3.5rem)' }}>
      {/* ── Sub-header ───────────────────────────────────────────────────── */}
      <div className="border-b dark:border-white/10 border-gray-200 px-4 py-2.5 flex items-center gap-3">
        <Link
          to="/app/requests"
          className="flex items-center gap-1 text-sm dark:text-gray-400 text-gray-500 hover:dark:text-white hover:text-gray-900 transition-colors shrink-0"
        >
          <ArrowLeft size={15} /> Назад
        </Link>

        <div className="flex-1 flex items-center gap-2 min-w-0 overflow-hidden">
          <span className="font-semibold dark:text-white text-gray-900 truncate text-sm">
            {req.directionFrom} → {req.directionTo}
          </span>
          <RequestStatusBadge status={req.status} />
        </div>

        <span className="text-xs dark:text-gray-500 text-gray-400 shrink-0 hidden sm:block">
          {Number(req.amount).toLocaleString('ru-RU')} {req.currency}
        </span>
      </div>

      {/* ── Chat (fills remaining height) ─────────────────────────────────── */}
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
  )
}
