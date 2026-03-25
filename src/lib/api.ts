import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'

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
          // Store rotated refresh token
          const newTokens = data.data ?? data
          localStorage.setItem('refresh_token', newTokens.refreshToken)
          // Retry original request (cookie is now updated by backend)
          return api(original)
        } catch {
          localStorage.removeItem('refresh_token')
          // Redirect to login — let the app decide the exact path
          window.dispatchEvent(new Event('auth:expired'))
        }
      }
    }
    return Promise.reject(error)
  },
)
