/**
 * API layer — Chat service (REST history only).
 * Real-time messages are handled via Socket.IO in the chat view model.
 */
import { api } from '../lib/api'
import type { Message } from '../types/api'

/** Fetch the full message history for a request on component mount */
export const getChatHistory = (requestId: string) =>
  api.get<Message[]>(`/requests/${requestId}/messages`).then((r) => r.data)
