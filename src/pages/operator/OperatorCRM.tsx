/**
 * OperatorCRM — unified CRM workbench.
 *
 * Route:  /operator/queue
 * Layout: Left (request queue) | Center (chat) | Right (request details)
 * Mobile: bottom nav + slide-in drawers.
 *
 * Merges visual style from the old OperatorPage prototype with real
 * backend data from view-model hooks (React Query + Socket.IO).
 */
import { useState, useEffect }                      from 'react'
import { motion, AnimatePresence }                  from 'framer-motion'
import {
  Activity, MessageCircle, SlidersHorizontal,
  LayoutList, Search, Clock, User, X, Loader2,
  LogOut, Inbox,
}                                                   from 'lucide-react'
import { useQueryClient }                           from '@tanstack/react-query'
import {
  useOperatorQueueViewModel,
  useStatusTransitionViewModel,
}                                                   from '../../hooks/view-models/useOperatorViewModel'
import { useRequestDetailViewModel }                from '../../hooks/view-models/useRequestViewModel'
import { useChatViewModel }                         from '../../hooks/view-models/useChatViewModel'
import { ChatContainer }                            from '../../components/chat/ChatContainer'
import { RequestStatusBadge }                       from '../../components/request/RequestStatusBadge'
import { StatusTransitionButton }                   from '../../components/request/StatusTransitionButton'
import { useSessionStore }                          from '../../store/sessionStore'
import { logout as apiLogout }                      from '../../api/auth.service'
import { disconnectSocket }                         from '../../lib/socket'
import { RequestStatus }                            from '../../types/api'
import { cn }                                       from '../../components/shared/cn'
import type { OtcRequest, EventLog }                from '../../types/api'

// ─── Constants ────────────────────────────────────────────────────────────────

const QUICK_REPLIES = [
  'Принял заявку в работу',
  'Ожидайте реквизиты',
  'Перевод отправлен',
  'Уточните детали',
]

const FILTERS: Array<{ label: string; value: RequestStatus | undefined }> = [
  { label: 'Все',       value: undefined },
  { label: 'Новые',     value: RequestStatus.NEW },
  { label: 'Назначены', value: RequestStatus.ASSIGNED },
  { label: 'В работе',  value: RequestStatus.IN_PROGRESS },
  { label: 'Завершены', value: RequestStatus.COMPLETED },
  { label: 'Отменены',  value: RequestStatus.CANCELLED },
]

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'только что'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}м`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}ч`
  return `${Math.floor(h / 24)}д`
}

// ─── OperatorCRM (main) ────────────────────────────────────────────────────────

export function OperatorCRM() {
  const [selectedId, setSelectedId]         = useState<string | null>(null)
  const [filter, setFilter]                 = useState<RequestStatus | undefined>(undefined)
  const [search, setSearch]                 = useState('')
  const [showQueueDrawer, setShowQueue]     = useState(false)
  const [showDetailDrawer, setShowDetail]   = useState(false)
  const [now, setNow]                       = useState(new Date())

  const currentUser  = useSessionStore((s) => s.user)
  const clearSession = useSessionStore((s) => s.clearSession)
  const queryClient  = useQueryClient()

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1_000)
    return () => clearInterval(id)
  }, [])

  const queueVm      = useOperatorQueueViewModel(filter)
  const detailVm     = useRequestDetailViewModel(selectedId ?? '')
  const transitionVm = useStatusTransitionViewModel(selectedId ?? '')
  const chatVm       = useChatViewModel(selectedId ?? '')

  const handleSelect = (id: string) => {
    setSelectedId(id)
    setShowQueue(false)
  }

  const handleLogout = async () => {
    try { await apiLogout() } catch { /* ignore */ }
    localStorage.removeItem('refresh_token')
    clearSession()
    queryClient.clear()
    disconnectSocket()
    window.location.href = '/flash-pay-front/login'
  }

  const filteredRequests = (queueVm.requests as OtcRequest[]).filter((r) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      r.client.name.toLowerCase().includes(q) ||
      r.directionFrom.toLowerCase().includes(q) ||
      r.directionTo.toLowerCase().includes(q)
    )
  })

  const activeCount = queueVm.requests.filter(
    (r) => r.status !== RequestStatus.COMPLETED && r.status !== RequestStatus.CANCELLED,
  ).length

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#0B0F1A' }}>

      {/* ── Ambient gradient ─────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: [
            'radial-gradient(ellipse at 15% 20%, rgba(91,140,255,0.10) 0px, transparent 50%)',
            'radial-gradient(ellipse at 85% 80%, rgba(124,92,255,0.08) 0px, transparent 50%)',
          ].join(', '),
        }}
      />

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <header className={cn(
        'relative z-30 shrink-0 flex items-center justify-between h-14 px-3 sm:px-5',
        'bg-[#0d1525]/90 backdrop-blur-xl border-b border-white/6',
      )}>
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowQueue((v) => !v)}
            className={cn(
              'sm:hidden w-8 h-8 rounded-xl flex items-center justify-center transition-all',
              'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70',
              showQueueDrawer && 'bg-[#5B8CFF]/20 text-[#5B8CFF]',
            )}
          >
            <LayoutList size={14} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#5B8CFF] to-[#7C5CFF] flex items-center justify-center shadow-lg shrink-0">
              <Activity size={13} className="text-white" />
            </div>
            <span className="font-black text-sm text-white hidden sm:block">QuickPay CRM</span>
          </div>
        </div>

        {/* Center stats */}
        <div className="hidden md:flex items-center gap-6">
          <div className="text-center">
            <p className="font-black text-sm text-[#7AAEFF]">{activeCount}</p>
            <p className="text-[10px] text-white/25 uppercase tracking-wide">Активных</p>
          </div>
          <div className="text-center">
            <p className="font-mono font-black text-sm text-white/60">
              {now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-[10px] text-white/25 uppercase tracking-wide">Время</p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {selectedId && (
            <button
              onClick={() => setShowDetail((v) => !v)}
              className={cn(
                'md:hidden w-8 h-8 rounded-xl flex items-center justify-center transition-all',
                'bg-white/5 text-white/40 hover:bg-white/10',
                showDetailDrawer && 'bg-[#5B8CFF]/20 text-[#5B8CFF]',
              )}
            >
              <SlidersHorizontal size={14} />
            </button>
          )}
          <span className="hidden sm:block text-xs text-white/35 max-w-[120px] truncate">
            {currentUser?.phone}
          </span>
          <button
            onClick={handleLogout}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 text-white/40 hover:bg-red-500/20 hover:text-red-400 transition-all"
            title="Выйти"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* ── Main 3-column area ────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex overflow-hidden">

        {/* LEFT: queue sidebar (desktop) */}
        <aside className="hidden sm:flex flex-col w-64 shrink-0 bg-[#0f1726]/80 backdrop-blur-xl border-r border-white/6">
          <QueuePanel
            requests={filteredRequests}
            isLoading={queueVm.isLoading}
            selectedId={selectedId}
            filter={filter}
            search={search}
            onFilterChange={setFilter}
            onSearchChange={setSearch}
            onSelect={handleSelect}
          />
        </aside>

        {/* LEFT: queue drawer (mobile) */}
        <AnimatePresence>
          {showQueueDrawer && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="sm:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowQueue(false)}
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                className="sm:hidden fixed inset-y-14 left-0 z-50 w-72 bg-[#0f1726] border-r border-white/8 flex flex-col"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
                  <span className="text-xs font-black text-white/50 uppercase tracking-widest">Очередь</span>
                  <button
                    onClick={() => setShowQueue(false)}
                    className="w-6 h-6 rounded-lg bg-white/8 flex items-center justify-center text-white/40"
                  >
                    <X size={12} />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <QueuePanel
                    requests={filteredRequests}
                    isLoading={queueVm.isLoading}
                    selectedId={selectedId}
                    filter={filter}
                    search={search}
                    onFilterChange={setFilter}
                    onSearchChange={setSearch}
                    onSelect={handleSelect}
                  />
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* CENTER: chat */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {selectedId ? (
            <ChatArea
              request={detailVm.request}
              chat={chatVm}
              currentUserId={currentUser?.id}
            />
          ) : (
            <EmptyChatState />
          )}
        </div>

        {/* RIGHT: details sidebar (desktop) */}
        <aside className="hidden md:flex flex-col w-72 shrink-0 bg-[#0f1726]/80 backdrop-blur-xl border-l border-white/6 overflow-y-auto">
          <DetailsPanel detail={detailVm} transition={transitionVm} />
        </aside>

        {/* RIGHT: details drawer (mobile) */}
        <AnimatePresence>
          {showDetailDrawer && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowDetail(false)}
              />
              <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                className="md:hidden fixed inset-y-14 right-0 z-50 w-80 bg-[#0f1726] border-l border-white/8 flex flex-col overflow-y-auto"
              >
                <DetailsPanel
                  detail={detailVm}
                  transition={transitionVm}
                  onClose={() => setShowDetail(false)}
                />
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* ── Mobile bottom nav ─────────────────────────────────────────────────── */}
      <nav className="sm:hidden shrink-0 flex items-center justify-around px-4 py-2 bg-[#0d1525]/95 border-t border-white/6">
        {[
          { icon: LayoutList,       label: 'Очередь', action: () => { setShowQueue(true);  setShowDetail(false) }, count: activeCount },
          { icon: MessageCircle,    label: 'Чат',     action: () => { setShowQueue(false); setShowDetail(false) }, count: 0 },
          { icon: SlidersHorizontal, label: 'Детали', action: () => { setShowDetail(true); setShowQueue(false)  }, count: 0 },
        ].map(({ icon: Icon, label, action, count }) => (
          <button
            key={label}
            onClick={action}
            className="relative flex flex-col items-center gap-1 px-4 py-1 text-white/40 hover:text-white/70 transition-colors"
          >
            <Icon size={16} />
            <span className="text-[10px] font-semibold">{label}</span>
            {count > 0 && (
              <span className="absolute -top-0.5 right-2 w-3.5 h-3.5 rounded-full bg-[#5B8CFF] text-white text-[8px] flex items-center justify-center font-black">
                {count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}

// ─── QueuePanel ────────────────────────────────────────────────────────────────

interface QueuePanelProps {
  requests:       OtcRequest[]
  isLoading:      boolean
  selectedId:     string | null
  filter:         RequestStatus | undefined
  search:         string
  onFilterChange: (f: RequestStatus | undefined) => void
  onSearchChange: (s: string) => void
  onSelect:       (id: string) => void
}

function QueuePanel({
  requests, isLoading, selectedId,
  filter, search,
  onFilterChange, onSearchChange, onSelect,
}: QueuePanelProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Header */}
      <div className="px-3 pt-3 pb-2 shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-white/50 uppercase tracking-widest">Очередь</span>
          {requests.length > 0 && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#5B8CFF]/20 text-[#7AAEFF] font-bold">
              {requests.length}
            </span>
          )}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/8">
          <Search size={11} className="text-white/25 shrink-0" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Поиск..."
            className="flex-1 bg-transparent text-xs text-white placeholder-white/25 outline-none"
          />
        </div>

        {/* Filter chips (scrollable) */}
        <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-hide">
          {FILTERS.map(({ label, value }) => (
            <button
              key={label}
              type="button"
              onClick={() => onFilterChange(value)}
              className={cn(
                'shrink-0 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all',
                filter === value
                  ? 'bg-[#5B8CFF]/30 text-[#7AAEFF] border border-[#5B8CFF]/40'
                  : 'bg-white/5 text-white/35 hover:bg-white/10 hover:text-white/55 border border-transparent',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={20} className="animate-spin text-white/20" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-4">
            <Inbox size={28} className="text-white/15" />
            <p className="text-xs text-white/30">Заявок нет</p>
          </div>
        ) : (
          <AnimatePresence>
            {requests.map((req, i) => {
              const isActive = req.id === selectedId
              return (
                <motion.button
                  key={req.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => onSelect(req.id)}
                  className={cn(
                    'w-full text-left p-3 rounded-2xl transition-all duration-200 border-l-2',
                    isActive
                      ? 'border-l-[#5B8CFF] bg-[#5B8CFF]/12'
                      : 'border-l-transparent bg-white/3 hover:bg-white/6',
                  )}
                >
                  <div className="flex items-start justify-between gap-1.5 mb-1.5">
                    <span className="font-bold text-xs text-white truncate">{req.client.name}</span>
                    <span className="text-[10px] text-white/25 shrink-0">{timeAgo(req.createdAt)}</span>
                  </div>
                  <p className="text-[11px] text-white/40 mb-2">
                    {req.directionFrom} → {req.directionTo}
                    {' · '}
                    {Number(req.amount).toLocaleString('ru-RU')} {req.currency}
                  </p>
                  <RequestStatusBadge status={req.status} />
                </motion.button>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

// ─── ChatArea ─────────────────────────────────────────────────────────────────

interface ChatAreaProps {
  request:       OtcRequest | undefined
  chat:          ReturnType<typeof useChatViewModel>
  currentUserId: string | undefined
}

function ChatArea({ request, chat, currentUserId }: ChatAreaProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Sub-header with request context */}
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

// ─── DetailsPanel ─────────────────────────────────────────────────────────────

interface DetailsPanelProps {
  detail:     ReturnType<typeof useRequestDetailViewModel>
  transition: ReturnType<typeof useStatusTransitionViewModel>
  onClose?:   () => void
}

function DetailsPanel({ detail, transition, onClose }: DetailsPanelProps) {
  const req = detail.request

  if (!req) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4 py-8">
        <User size={24} className="text-white/15" />
        <p className="text-xs text-white/25 leading-relaxed">
          Выберите заявку, чтобы увидеть детали
        </p>
      </div>
    )
  }

  const nextStatuses = transition.getAllowedTransitions(req.status)

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Panel header */}
      <div className="shrink-0 flex items-center justify-between px-3 pt-3 pb-2 border-b border-white/6">
        <span className="text-xs font-black text-white/40 uppercase tracking-widest">Детали</span>
        {onClose && (
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/10 transition-all"
          >
            <X size={11} />
          </button>
        )}
      </div>

      <div className="flex-1 p-3 space-y-3 overflow-y-auto">

        {/* Client card */}
        <DetailSection title="Клиент">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#5B8CFF]/10 to-[#7C5CFF]/8 border border-[#5B8CFF]/15">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5B8CFF] to-[#7C5CFF] flex items-center justify-center text-sm font-black text-white shrink-0">
              {req.client.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-white truncate">{req.client.name}</p>
              <p className="text-[11px] text-white/40">{req.client.user?.phone}</p>
              {req.client.level && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/8 text-white/40 capitalize">
                  {req.client.level}
                </span>
              )}
            </div>
          </div>
        </DetailSection>

        {/* Request info */}
        <DetailSection title="Заявка">
          <InfoRow label="Направление" value={`${req.directionFrom} → ${req.directionTo}`} />
          <InfoRow
            label="Сумма"
            value={`${Number(req.amount).toLocaleString('ru-RU')} ${req.currency}`}
            highlight
          />
          {req.payoutMethod && <InfoRow label="Способ"  value={req.payoutMethod} />}
          {req.city          && <InfoRow label="Город"  value={req.city} />}
          {req.country       && <InfoRow label="Страна" value={req.country} />}
          {req.comment && (
            <div className="pt-2 border-t border-white/8">
              <p className="text-[10px] text-white/30 mb-1 uppercase tracking-wide">Комментарий</p>
              <p className="text-xs text-white/60 leading-relaxed">{req.comment}</p>
            </div>
          )}
        </DetailSection>

        {/* Status transitions */}
        {nextStatuses.length > 0 && (
          <DetailSection title="Действия">
            <div className="flex flex-col gap-2">
              {nextStatuses.map((status) => (
                <StatusTransitionButton
                  key={status}
                  targetStatus={status}
                  onClick={transition.handleTransition}
                  isLoading={transition.isTransitioning}
                />
              ))}
            </div>
            {transition.transitionError && (
              <p className="mt-2 text-xs text-red-400">{transition.transitionError}</p>
            )}
          </DetailSection>
        )}

        {/* Event log */}
        {detail.events.length > 0 && (
          <DetailSection title="Журнал">
            <ul className="space-y-2">
              {(detail.events as EventLog[]).map((ev) => (
                <li key={ev.id} className="flex items-start gap-2 text-xs">
                  <Clock size={11} className="shrink-0 mt-0.5 text-white/30" />
                  <div>
                    <span className="text-white/55">{ev.eventType}</span>
                    <span className="text-white/25 ml-2">
                      {new Date(ev.createdAt).toLocaleTimeString('ru-RU', {
                        hour:   '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </DetailSection>
        )}
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 overflow-hidden">
      <div className="px-3 pt-2.5 pb-1">
        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{title}</p>
      </div>
      <div className="px-3 pb-3 space-y-2">{children}</div>
    </div>
  )
}

function InfoRow({
  label,
  value,
  highlight = false,
}: {
  label:      string
  value:      string
  highlight?: boolean
}) {
  return (
    <div className="flex justify-between items-center text-xs gap-2">
      <span className="text-white/35 shrink-0">{label}</span>
      <span className={cn(
        'font-semibold text-right',
        highlight ? 'text-[#7AAEFF]' : 'text-white/65',
      )}>
        {value}
      </span>
    </div>
  )
}
