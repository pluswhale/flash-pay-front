/**
 * ChatSection — center column of the operator CRM.
 * Shows either:
 *   - A chat area (sub-header with request context + ChatContainer)
 *   - An empty state prompt when no request is selected
 *
 * Pure UI: receives pre-loaded data and callbacks from the view model.
 */
import { MessageCircle, Loader2 } from 'lucide-react'
import { ChatContainer }          from '../chat/ChatContainer'
import { RequestStatusBadge }     from '../request/RequestStatusBadge'
import type { OtcRequest, Message } from '../../types/api'

const QUICK_REPLIES = [
  'Принял заявку в работу',
  'Ожидайте реквизиты',
  'Перевод отправлен',
  'Уточните детали',
]

interface ChatVm {
  messages:    Message[]
  isLoading:   boolean
  isTyping:    boolean
  sendMessage: (content: string) => void
  sendTyping:  () => void
}

interface Props {
  request:       OtcRequest | undefined
  chat:          ChatVm
  currentUserId: string | undefined
}

export function ChatSection({ request, chat, currentUserId }: Props) {
  if (!request && !chat.isLoading) {
    return <EmptyChatState />
  }

  return (
    <div className="flex flex-col h-full">

      {/* Sub-header: request context */}
      <div className="shrink-0 px-4 py-2.5 bg-[#0d1525]/70 border-b border-white/6 flex items-center gap-3">
        {request ? (
          <>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-white truncate">
                {request.client.name}
              </p>
              <p className="text-[11px] text-white/35 truncate">
                {request.directionFrom} → {request.directionTo}
                {' · '}
                {Number(request.amount).toLocaleString('ru-RU')} {request.currency}
              </p>
            </div>
            <RequestStatusBadge status={request.status} />
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Loader2 size={12} className="animate-spin text-white/30" />
            <span className="text-xs text-white/30">Загрузка заявки…</span>
          </div>
        )}
      </div>

      {/* Chat fills the rest */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ChatContainer
          messages={chat.messages}
          isLoading={chat.isLoading}
          isTyping={chat.isTyping}
          currentUserId={currentUserId}
          onSend={chat.sendMessage}
          onTyping={chat.sendTyping}
          quickReplies={QUICK_REPLIES}
        />
      </div>
    </div>
  )
}

function EmptyChatState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center">
        <MessageCircle size={28} className="text-white/15" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white/30 mb-1">Выберите заявку</p>
        <p className="text-xs text-white/20">Нажмите на заявку слева, чтобы открыть чат</p>
      </div>
    </div>
  )
}
