/**
 * ViewModel: Operator
 *
 * - Fetch all requests with optional status filter
 * - Listen for real-time request:new and request:updated via Socket.IO
 * - Update request status (transition buttons driven by ALLOWED_TRANSITIONS)
 *
 * BUG FIX: was calling getActiveSocket() which returned null because
 * child effects run before RouteGuard (parent) effects. Now uses
 * getSocket(accessToken) directly.
 */
import { useEffect, useCallback } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { queryKeys }       from '../../lib/query-keys'
import { getErrorMessage } from '../../lib/handle-error'
import {
  getAllRequests,
  updateRequestStatus,
} from '../../api/request.service'
import { getSocket }          from '../../lib/socket'
import { useSessionStore }    from '../../store/sessionStore'
import {
  RequestStatus,
  ALLOWED_TRANSITIONS,
} from '../../types/api'
import type { OtcRequest } from '../../types/api'

// ─── Operator: request queue ──────────────────────────────────────────────────

export function useOperatorQueueViewModel(statusFilter?: RequestStatus) {
  const queryClient = useQueryClient()
  const accessToken = useSessionStore((s) => s.accessToken)

  const { data: requests, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.requests.queue(statusFilter),
    queryFn:  () => getAllRequests(statusFilter),
    staleTime: 60_000,
  })

  useEffect(() => {
    if (!accessToken) return

    const sock = getSocket(accessToken)

    const onNew = (req: OtcRequest) => {
      queryClient.setQueryData<OtcRequest[]>(
        queryKeys.requests.queue(statusFilter),
        (prev) => (prev ? [req, ...prev] : [req]),
      )
      queryClient.setQueryData(queryKeys.requests.detail(req.id), req)
    }

    const onUpdated = (req: OtcRequest) => {
      queryClient.setQueryData<OtcRequest[]>(
        queryKeys.requests.queue(statusFilter),
        (prev) => prev?.map((r) => r.id === req.id ? { ...r, ...req, client: { ...r.client, ...req.client } } : r) ?? [req],
      )
      // Merge so nested objects omitted by the socket payload are preserved
      queryClient.setQueryData<OtcRequest>(
        queryKeys.requests.detail(req.id),
        (prev) => prev ? { ...prev, ...req, client: { ...prev.client, ...req.client } } : req,
      )
    }

    sock.on('request:new',     onNew)
    sock.on('request:updated', onUpdated)

    return () => {
      sock.off('request:new',     onNew)
      sock.off('request:updated', onUpdated)
    }
  }, [queryClient, statusFilter, accessToken])

  return {
    requests:     requests ?? [],
    isLoading,
    isError,
    errorMessage: isError ? getErrorMessage(error) : null,
  }
}

// ─── Operator: status transitions ─────────────────────────────────────────────

export function useStatusTransitionViewModel(requestId: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ status }: { status: RequestStatus }) =>
      updateRequestStatus(requestId, status),
    onSuccess: (updated) => {
      // Merge with existing cache so deeply nested objects (e.g. client.user)
      // that the PATCH response may omit are preserved from the previous full load.
      queryClient.setQueryData<OtcRequest>(
        queryKeys.requests.detail(requestId),
        (prev) => prev ? { ...prev, ...updated, client: { ...prev.client, ...updated.client } } : updated,
      )
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all() })
    },
  })

  const handleTransition = useCallback(
    (status: RequestStatus) => mutation.mutate({ status }),
    [mutation],
  )

  const getAllowedTransitions = useCallback(
    (currentStatus: RequestStatus): RequestStatus[] =>
      ALLOWED_TRANSITIONS[currentStatus] ?? [],
    [],
  )

  return {
    handleTransition,
    getAllowedTransitions,
    isTransitioning: mutation.isPending,
    transitionError: mutation.isError ? getErrorMessage(mutation.error) : null,
  }
}
