import { io, Socket } from 'socket.io-client'
import type { OtcRequest, Message } from '../types/api'

const WS_URL = import.meta.env.VITE_WS_URL ?? 'http://localhost:3000'

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
  if (socket) return socket          // ← return existing instance always

  socket = io(`${WS_URL}/ws`, {
    auth:              { token: accessToken },
    transports:        ['websocket'],
    autoConnect:       true,
    reconnection:      true,
    reconnectionAttempts: 15,
    reconnectionDelay: 1000,
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

  return socket
}

export function disconnectSocket(): void {
  socket?.disconnect()
  socket = null
}

export function getActiveSocket(): Socket | null {
  return socket
}
