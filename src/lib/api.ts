import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { updateSocketToken } from './socket'
import { useSessionStore } from '../store/sessionStore'

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1'

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,        // send / receive HTTP-only cookies
  headers: { 'Content-Type': 'application/json' },
})

// ─── Request: attach Bearer token if stored ───────────────────────────────────
api.interceptors.request.use((config) => {
  // Access token lives in HTTP-only cookie (set by backend).
  // If the backend also accepts Bearer (for WS auth exchange), we DON'T
  // store it here — only refreshToken goes to localStorage.
  return config
})

// ─── Response: unwrap { data, timestamp } envelope ───────────────────────────
api.interceptors.response.use(
  (res) => {
    // Backend always returns { data: T, timestamp: string }
    // Unwrap so callers receive T directly
    if (res.data && typeof res.data === 'object' && 'data' in res.data) {
      res.data = res.data.data
    }
    return res
  },
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const stored = localStorage.getItem('refresh_token')

      if (stored) {
        try {
          const { data } = await axios.post(
            `${BASE_URL}/auth/refresh`,
            { refreshToken: stored },
            { withCredentials: true },
          )
          const newTokens = data.data ?? data
          localStorage.setItem('refresh_token', newTokens.refreshToken)

          // M9: After silent token rotation, keep the WebSocket singleton and
          // the session store in sync. The socket carries the access token in
          // its handshake auth — without this update, the next reconnect (after
          // a network hiccup) would use the expired JWT and be rejected.
          if (newTokens.accessToken) {
            updateSocketToken(newTokens.accessToken)
            useSessionStore.getState().setAccessToken(newTokens.accessToken)
          }

          // Retry original request (cookie is now updated by backend)
          return api(original)
        } catch {
          localStorage.removeItem('refresh_token')
          window.dispatchEvent(new Event('auth:expired'))
        }
      }
    }
    return Promise.reject(error)
  },
)
