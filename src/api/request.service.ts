/**
 * API layer — OTC Request service.
 * Pure functions. No state. No hooks.
 */
import { api } from '../lib/api'
import type { OtcRequest, RequestStatus, EventLog, CreateRequestDto } from '../types/api'

// ─── Client endpoints ─────────────────────────────────────────────────────────

/** Create a new OTC exchange request */
export const createRequest = (payload: CreateRequestDto) =>
  api.post<OtcRequest>('/requests', payload).then((r) => r.data)

/** Fetch the authenticated client's own requests */
export const getMyRequests = () =>
  api.get<OtcRequest[]>('/requests/my').then((r) => r.data)

// ─── Operator / Admin endpoints ───────────────────────────────────────────────

/** Fetch all requests, optionally filtered by status */
export const getAllRequests = (status?: RequestStatus) =>
  api.get<OtcRequest[]>('/requests', {
    params: status ? { status } : {},
  }).then((r) => r.data)

/** Fetch a single request by ID */
export const getRequest = (id: string) =>
  api.get<OtcRequest>(`/requests/${id}`).then((r) => r.data)

/** Advance a request to the next status (operator action) */
export const updateRequestStatus = (id: string, status: RequestStatus) =>
  api.patch<OtcRequest>(`/requests/${id}/status`, { status }).then((r) => r.data)

// ─── Admin endpoints ──────────────────────────────────────────────────────────

/** Assign an operator to a request (admin only) */
export const assignOperator = (requestId: string, operatorId: string) =>
  api.patch<OtcRequest>(`/requests/${requestId}/assign`, { operatorId }).then((r) => r.data)

/** Fetch the event / audit log for a request */
export const getRequestEvents = (id: string) =>
  api.get<EventLog[]>(`/requests/${id}/events`).then((r) => r.data)
