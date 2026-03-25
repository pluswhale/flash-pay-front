/**
 * Backend session store.
 * Holds the authenticated User from the NestJS backend.
 *
 * accessToken lives in-memory ONLY (never localStorage) — it is used
 * for the Socket.IO handshake. The HTTP-only cookie carries it for all REST calls.
 *
 * On page refresh the accessToken is lost; RouteGuard refreshes it via the
 * stored refreshToken before reconnecting the WebSocket.
 */
import { create } from 'zustand'
import type { User } from '../types/api'

interface SessionState {
  user: User | null
  accessToken: string | null

  setSession:    (user: User, accessToken: string) => void
  setUser:       (user: User) => void
  // M9: update only the access token (e.g. after silent token rotation by
  // the API interceptor) without touching the User object.
  setAccessToken: (accessToken: string) => void
  clearSession:  () => void
}

export const useSessionStore = create<SessionState>()((set) => ({
  user:        null,
  accessToken: null,

  setSession:    (user, accessToken) => set({ user, accessToken }),
  setUser:       (user)              => set({ user }),
  setAccessToken: (accessToken)      => set({ accessToken }),
  clearSession:  ()                  => set({ user: null, accessToken: null }),
}))
