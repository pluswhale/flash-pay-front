/**
 * Chat store — persists live WebSocket messages and active chat state across
 * route changes, enabling seamless embedded ↔ fullscreen navigation.
 *
 * Why Zustand and not React Query?
 *  REST history is owned by React Query (staleTime=Infinity, deduplicated cache).
 *  Live WS messages arrive outside the fetch cycle — they need a place that
 *  survives component unmount so the embedded panel ↔ full-chat navigation
 *  doesn't lose messages received during the session.
 *
 * Data model
 * ──────────
 *  liveMessagesByRequestId  WS messages per request (keyed — multiple rooms)
 *  typingByRequestId        Typing indicator per request
 *  activeRequestId          Which request the user is currently chatting in
 *  chatMode                 Whether that chat is 'embedded' (right panel) or
 *                           'fullscreen' (dedicated route)
 *
 * Single WebSocket connection
 * ───────────────────────────
 *  socket.ts exports a module-level singleton. getSocket() always returns the
 *  same Socket instance — no matter how many hook instances call it.  The
 *  embedded panel and the fullscreen page are on different routes and never
 *  co-exist in the tree, so socket listeners are never duplicated.
 */
import { create } from 'zustand'
import type { Message } from '../types/api'

export type ChatMode = 'embedded' | 'fullscreen'

// AGENTS.md 5.4 — stable reference prevents selector returning new [] each
// render, which would cascade into useMemo / useEffect dependency re-runs.
export const EMPTY_MESSAGES: Message[] = []

interface ChatStore {
  // ── Live WS messages ─────────────────────────────────────────────────────
  /** REST history lives in React Query cache; this is WS-only, session-scoped. */
  liveMessagesByRequestId: Record<string, Message[]>

  // ── Typing indicators ─────────────────────────────────────────────────────
  typingByRequestId: Record<string, boolean>

  // ── Active chat view ──────────────────────────────────────────────────────
  /** Which request the user is currently chatting in (null = no chat open). */
  activeRequestId: string | null
  /** UI rendering mode for the active chat. */
  chatMode: ChatMode | null

  // ── Actions ───────────────────────────────────────────────────────────────
  appendLiveMessage:  (requestId: string, msg: Message) => void
  setTyping:          (requestId: string, typing: boolean) => void
  /** Called on mount — marks this requestId + mode as the active chat view. */
  setActiveChatView:  (requestId: string, mode: ChatMode) => void
  /**
   * Called on unmount — clears active view only if this instance is still the
   * active one. Guards against the race where the incoming route's mount effect
   * runs before the outgoing route's cleanup effect, which would otherwise
   * clear the state just set by the new mount.
   */
  clearActiveChatView: (requestId: string, mode: ChatMode) => void
}

export const useChatStore = create<ChatStore>()((set) => ({
  liveMessagesByRequestId: {},
  typingByRequestId:       {},
  activeRequestId:         null,
  chatMode:                null,

  // ── Live message append (idempotent — WS can replay on reconnect) ──────────
  appendLiveMessage: (requestId, msg) =>
    set((s) => {
      const existing = s.liveMessagesByRequestId[requestId] ?? []
      if (existing.some((m) => m.id === msg.id)) return s
      return {
        liveMessagesByRequestId: {
          ...s.liveMessagesByRequestId,
          [requestId]: [...existing, msg],
        },
      }
    }),

  setTyping: (requestId, typing) =>
    set((s) => ({
      typingByRequestId: { ...s.typingByRequestId, [requestId]: typing },
    })),

  setActiveChatView: (requestId, mode) =>
    set({ activeRequestId: requestId, chatMode: mode }),

  // Guard: only clear if this instance is still the current active chat view.
  // Prevents a late-running cleanup from one route from wiping state that
  // was already set by the incoming route's mount effect.
  clearActiveChatView: (requestId, mode) =>
    set((s) => {
      if (s.activeRequestId !== requestId || s.chatMode !== mode) return s
      return { activeRequestId: null, chatMode: null }
    }),
}))
