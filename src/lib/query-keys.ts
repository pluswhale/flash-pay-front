import type { RequestStatus } from '../types/api'

/**
 * Centralized React Query key factory.
 *
 * Rules:
 * - All keys are arrays for granular invalidation.
 * - Keys are ordered from most general → most specific.
 * - Pass `undefined` for optional params you want to omit.
 *
 * Usage:
 *   queryKey: queryKeys.requests.my()
 *   queryKey: queryKeys.requests.detail(id)
 *   invalidate: queryClient.invalidateQueries({ queryKey: queryKeys.requests.all() })
 */
export const queryKeys = {
  // ─── Auth ──────────────────────────────────────────────────────────────────
  auth: {
    all:  ()           => ['auth']                  as const,
    me:   ()           => ['auth', 'me']            as const,
  },

  // ─── Invites ───────────────────────────────────────────────────────────────
  invites: {
    all:    ()          => ['invites']              as const,
    list:   ()          => ['invites', 'list']      as const,
    detail: (code: string) => ['invites', code]     as const,
  },

  // ─── Requests (OTC) ────────────────────────────────────────────────────────
  requests: {
    all:    ()                          => ['requests']                         as const,
    // Client view: own requests
    my:     ()                          => ['requests', 'my']                   as const,
    // Operator/admin view: all requests, optionally filtered by status
    queue:  (status?: RequestStatus)    => ['requests', 'queue', status]        as const,
    // Single request detail
    detail: (id: string)                => ['requests', 'detail', id]           as const,
    // Event log for a request
    events: (id: string)                => ['requests', 'events', id]           as const,
  },

  // ─── Chat ──────────────────────────────────────────────────────────────────
  chat: {
    all:     ()           => ['chat']                       as const,
    history: (requestId: string) => ['chat', requestId]    as const,
  },

  // ─── Admin ─────────────────────────────────────────────────────────────────
  admin: {
    all:       ()  => ['admin']                 as const,
    operators: ()  => ['admin', 'operators']    as const,
    invites:   ()  => ['admin', 'invites']      as const,
  },
} as const
