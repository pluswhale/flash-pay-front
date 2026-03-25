import { io, Socket } from 'socket.io-client'

// In production (docker) the WS server is on the same origin served by nginx.
// An empty string makes socket.io connect to the current page's origin.
const WS_URL = import.meta.env.VITE_WS_URL || ''

let socket: Socket | null = null

/**
 * Return the existing socket (regardless of connection state — it will
 * auto-reconnect). Create a new one only on the very first call or after
 * an explicit disconnectSocket().
 *
 * BUG FIX: the previous check `socket?.connected` caused a new socket to be
 * created on every temporary disconnect, destroying all event listeners.
 */
export function getSocket(accessToken: string): Socket {
  if (socket) return socket

  socket = io(`${WS_URL}/ws`, {
    auth:                 { token: accessToken },
    transports:           ['websocket'],
    autoConnect:          true,
    reconnection:         true,
    reconnectionAttempts: 15,
    reconnectionDelay:    1000,
    reconnectionDelayMax: 5000,
  })

  socket.on('connect', () => {
    console.debug('[WS] connected:', socket?.id)
  })

  socket.on('disconnect', (reason) => {
    console.debug('[WS] disconnected:', reason)
  })

  socket.on('connect_error', (err) => {
    console.error('[WS] connection error:', err.message)
  })

  // WS4: After all reconnection attempts are exhausted, notify the UI so it
  // can show a "connection lost — reload" banner instead of silently failing.
  socket.on('reconnect_failed', () => {
    console.error('[WS] reconnection failed — all attempts exhausted')
    window.dispatchEvent(new Event('ws:reconnect_failed'))
  })

  return socket
}

/**
 * M9: Update the auth token used for future reconnect attempts.
 *
 * When the API interceptor silently rotates the access token (401 retry),
 * the existing socket singleton still carries the old token. If the socket
 * disconnects and tries to re-authenticate, the server would reject the
 * stale JWT. Calling this function after every token refresh keeps the
 * socket's auth up-to-date without tearing down the current connection.
 *
 * If the socket is already disconnected (e.g., brief network outage), it is
 * reconnected immediately with the fresh token.
 */
export function updateSocketToken(newToken: string): void {
  if (!socket) return
  socket.auth = { token: newToken }
  // Only force a reconnect if the socket is sitting idle-disconnected.
  // If it is currently connected, the new token is picked up on the next
  // natural reconnect without disrupting the live session.
  if (!socket.connected) {
    socket.connect()
  }
}

export function disconnectSocket(): void {
  socket?.disconnect()
  socket = null
}

export function getActiveSocket(): Socket | null {
  return socket
}
