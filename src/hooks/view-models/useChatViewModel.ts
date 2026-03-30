/**
 * ViewModel: Chat
 *
 * Combines:
 *  - useQuery  → REST history (fetched once, staleTime=Infinity)
 *  - chatStore → live WS messages + active view state (persists across routes)
 *  - Socket.IO → real-time messages and typing indicator
 *
 * State ownership
 * ───────────────
 *  REST messages   React Query cache (deduplicated, shared across instances)
 *  Live messages   chatStore.liveMessagesByRequestId
 *                  Survives component unmount — the embedded panel and the
 *                  fullscreen page share the same accumulated message list
 *                  without triggering a second REST round-trip.
 *  Typing          chatStore.typingByRequestId (same reason)
 *  Active view     chatStore.activeRequestId + chatStore.chatMode
 *                  Tracks which request + mode is currently in view so any
 *                  component can read this state without prop-drilling.
 *
 * Single WebSocket connection guarantee
 * ─────────────────────────────────────
 *  getSocket() returns a module-level singleton — one Socket instance for the
 *  entire page lifetime. The embedded panel and fullscreen page are on
 *  mutually exclusive routes (React Router v6 unmounts the old route before
 *  mounting the new one) so socket listeners are never duplicated.
 *
 * @param requestId  The request room to subscribe to.
 * @param mode       'embedded' (right-panel) or 'fullscreen' (dedicated route).
 *                   Optional — defaults to 'embedded'. Adding it here avoids
 *                   prop-drilling the mode down to every consumer; the store
 *                   becomes the single source of truth.
 */
import { useEffect, useRef, useCallback, useMemo } from 'react'
import { useQuery }        from '@tanstack/react-query'
import { queryKeys }       from '../../lib/query-keys'
import { getErrorMessage } from '../../lib/handle-error'
import { getChatHistory }  from '../../api/chat.service'
import { getSocket }       from '../../lib/socket'
import { useSessionStore } from '../../store/sessionStore'
import {
  useChatStore,
  EMPTY_MESSAGES,
  type ChatMode,
} from '../../store/chatStore'
import type { Message } from '../../types/api'

export function useChatViewModel(
  requestId: string,
  mode: ChatMode = 'embedded',
) {
  const accessToken = useSessionStore((s) => s.accessToken)

  // ── Store actions (Zustand actions are stable — safe in dep arrays) ───────
  const appendLiveMessage  = useChatStore((s) => s.appendLiveMessage)
  const setTyping          = useChatStore((s) => s.setTyping)
  const setActiveChatView  = useChatStore((s) => s.setActiveChatView)
  const clearActiveChatView = useChatStore((s) => s.clearActiveChatView)

  // ── Store selectors ───────────────────────────────────────────────────────
  // AGENTS.md 5.4: EMPTY_MESSAGES constant prevents new [] ref each render.
  const liveMessages = useChatStore(
    (s) => s.liveMessagesByRequestId[requestId] ?? EMPTY_MESSAGES,
  )
  const isTyping = useChatStore(
    (s) => s.typingByRequestId[requestId] ?? false,
  )

  // ── Track active chat view in the store ───────────────────────────────────
  // Any component (e.g. a header breadcrumb, nav guard) can read
  // chatStore.activeRequestId / chatStore.chatMode without prop drilling.
  useEffect(() => {
    if (!requestId) return
    setActiveChatView(requestId, mode)
    return () => {
      // Guard: only clear if WE are still the active view — prevents the
      // outgoing route's cleanup from clobbering the incoming route's state.
      clearActiveChatView(requestId, mode)
    }
  }, [requestId, mode, setActiveChatView, clearActiveChatView])

  // ── REST history ──────────────────────────────────────────────────────────
  const { data: history, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.chat.history(requestId),
    queryFn:  () => getChatHistory(requestId),
    enabled:  Boolean(requestId),
    staleTime: Infinity,  // WS keeps data fresh; REST is only the initial seed.
  })

  // ── Merge & deduplicate (pure, no side-effects during render) ─────────────
  const allMessages = useMemo(() => {
    const map = new Map<string, Message>()
    for (const msg of (history ?? [])) map.set(msg.id, msg)
    // Live WS messages override stale REST entries with the same id.
    for (const msg of liveMessages) map.set(msg.id, msg)
    return Array.from(map.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
  }, [history, liveMessages])

  // ── Socket subscriptions ──────────────────────────────────────────────────
  // getSocket() returns the module-level singleton — this effect only adds
  // and removes named handlers, never creates a new WS connection.
  const typingTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!requestId || !accessToken) return

    const sock = getSocket(accessToken)

    const joinRoom = () => sock.emit('join:request', requestId)
    joinRoom()
    // Re-join on every reconnect — server drops rooms on disconnect.
    sock.on('connect', joinRoom)

    const onMessage = (msg: Message) => appendLiveMessage(requestId, msg)

    const onTyping = () => {
      setTyping(requestId, true)
      clearTimeout(typingTimer.current)
      typingTimer.current = setTimeout(() => setTyping(requestId, false), 2500)
    }

    sock.on('message:new', onMessage)
    sock.on('typing',      onTyping)

    return () => {
      sock.emit('leave:request', requestId)
      sock.off('connect',      joinRoom)
      sock.off('message:new',  onMessage)
      sock.off('typing',       onTyping)
      clearTimeout(typingTimer.current)
      // Guard: only clear typing if no other instance took over this requestId.
      // useChatStore.getState() reads current state without subscribing.
      const { activeRequestId } = useChatStore.getState()
      if (activeRequestId !== requestId) setTyping(requestId, false)
      // NOTE: liveMessages are intentionally NOT cleared.
      // They persist in chatStore so embedded ↔ fullscreen navigation never
      // discards messages received during the session.
    }
  }, [requestId, accessToken, appendLiveMessage, setTyping])

  // ── Outgoing actions ──────────────────────────────────────────────────────
  const sendMessage = useCallback((content: string) => {
    if (!content.trim() || !accessToken) return
    const sock = getSocket(accessToken)
    sock.emit('message:send', { requestId, content })
  }, [requestId, accessToken])

  const sendTyping = useCallback(() => {
    if (!accessToken) return
    const sock = getSocket(accessToken)
    sock.emit('typing', requestId)
  }, [requestId, accessToken])

  return {
    messages:     allMessages,
    isTyping,
    isLoading,
    isError,
    errorMessage: isError ? getErrorMessage(error) : null,
    sendMessage,
    sendTyping,
  }
}
