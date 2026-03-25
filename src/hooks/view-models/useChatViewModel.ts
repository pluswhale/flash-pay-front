/**
 * ViewModel: Chat
 *
 * Combines:
 *  - useQuery  → REST history (fetched once, staleTime=Infinity)
 *  - Socket.IO → real-time new messages and typing indicator
 *
 * Fixed issues:
 *  1. Message dedup: was using a mutated Ref during render — replaced with useMemo.
 *  2. Socket init race: was calling getActiveSocket() which returned null because
 *     child effects run before parent effects (RouteGuard). Now gets accessToken
 *     from sessionStore and calls getSocket() directly.
 *  3. Reconnect: re-joins the room on every socket reconnect.
 */
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useQuery }          from '@tanstack/react-query'
import { queryKeys }         from '../../lib/query-keys'
import { getErrorMessage }   from '../../lib/handle-error'
import { getChatHistory }    from '../../api/chat.service'
import { getSocket }         from '../../lib/socket'
import { useSessionStore }   from '../../store/sessionStore'
import type { Message }      from '../../types/api'

export function useChatViewModel(requestId: string) {
  const accessToken = useSessionStore((s) => s.accessToken)

  // ── REST history ────────────────────────────────────────────────────────────
  const { data: history, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.chat.history(requestId),
    queryFn:  () => getChatHistory(requestId),
    enabled:  Boolean(requestId),
    staleTime: Infinity,   // WS keeps it fresh; REST is only the seed
  })

  // ── Live messages arriving through the socket ──────────────────────────────
  const [liveMessages, setLiveMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping]         = useState(false)
  const typingTimer = useRef<ReturnType<typeof setTimeout>>()

  // ── Merge & deduplicate via useMemo (NOT a mutated Ref during render) ───────
  //
  // Previous implementation used `seenIds = useRef(new Set())` mutated inside
  // the render function. After history loaded (render N), every ID was already
  // in the Set, so render N+1 produced an empty `allMessages` array.
  //
  // Correct approach: build a Map keyed by id on every render. O(n) and pure.
  const allMessages = useMemo(() => {
    const map = new Map<string, Message>()

    for (const msg of (history ?? [])) {
      map.set(msg.id, msg)
    }
    // Live messages override history (same id = same message, keeps live fresh)
    for (const msg of liveMessages) {
      map.set(msg.id, msg)
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
  }, [history, liveMessages])

  // ── Socket subscriptions ────────────────────────────────────────────────────
  //
  // BUG FIX: Was calling getActiveSocket() which returned null because React
  // runs child effects before parent (RouteGuard) effects. Now we call
  // getSocket(accessToken) directly — it returns the existing singleton or
  // creates one, ensuring the socket is always available here.
  useEffect(() => {
    if (!requestId || !accessToken) return

    const sock = getSocket(accessToken)

    const joinRoom = () => sock.emit('join:request', requestId)

    // Join immediately + re-join after every reconnect (server forgets rooms)
    joinRoom()
    sock.on('connect', joinRoom)

    const onMessage = (msg: Message) => {
      setLiveMessages((prev) => {
        // Deduplicate at the setState level too (belt-and-suspenders)
        if (prev.some((m) => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    }

    const onTyping = () => {
      setIsTyping(true)
      clearTimeout(typingTimer.current)
      typingTimer.current = setTimeout(() => setIsTyping(false), 2500)
    }

    sock.on('message:new', onMessage)
    sock.on('typing',      onTyping)

    return () => {
      sock.emit('leave:request', requestId)
      sock.off('connect',      joinRoom)
      sock.off('message:new',  onMessage)
      sock.off('typing',       onTyping)
      clearTimeout(typingTimer.current)
      setIsTyping(false)
      setLiveMessages([])
    }
  }, [requestId, accessToken])

  // ── Outgoing actions ────────────────────────────────────────────────────────
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
