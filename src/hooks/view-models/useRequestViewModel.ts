/**
 * ViewModel: OTC Request
 *
 * Client-facing logic:
 * - Fetch own requests (with React Query caching)
 * - Create a new request (mutation + cache invalidation)
 * - Access a single request by ID with real-time status updates via WS
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
  createRequest,
  getMyRequests,
  getRequest,
  getRequestEvents,
} from '../../api/request.service'
import { getSocket }        from '../../lib/socket'
import { useSessionStore }  from '../../store/sessionStore'
import type { CreateRequestDto, OtcRequest } from '../../types/api'

// ─── Client: own request list ─────────────────────────────────────────────────

export function useMyRequestsViewModel() {
  const { data: requests, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.requests.my(),
    queryFn:  getMyRequests,
    staleTime: 30_000,
  })

  return {
    requests:     requests ?? [],
    isLoading,
    isError,
    errorMessage: isError ? getErrorMessage(error) : null,
  }
}

// ─── Client: create request ───────────────────────────────────────────────────

export function useCreateRequestViewModel() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.my() })
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all() })
    },
  })

  const handleCreate = useCallback(
    (formData: CreateRequestDto) => mutation.mutate(formData),
    [mutation],
  )

  return {
    handleCreate,
    createdRequest: mutation.data,
    isSubmitting:   mutation.isPending,
    isSuccess:      mutation.isSuccess,
    errorMessage:   mutation.isError ? getErrorMessage(mutation.error) : null,
    reset:          mutation.reset,
  }
}

// ─── Shared: single request detail with real-time WS status updates ──────────

export function useRequestDetailViewModel(id: string) {
  const queryClient = useQueryClient()
  const accessToken = useSessionStore((s) => s.accessToken)

  const requestQuery = useQuery({
    queryKey: queryKeys.requests.detail(id),
    queryFn:  () => getRequest(id),
    enabled:  Boolean(id),
    staleTime: 10_000,
    refetchInterval: 30_000,   // polling fallback if WS is unavailable
  })

  const eventsQuery = useQuery({
    queryKey: queryKeys.requests.events(id),
    queryFn:  () => getRequestEvents(id),
    enabled:  Boolean(id),
    staleTime: 30_000,
  })

  // ── Real-time status updates via socket ─────────────────────────────────────
  // Both client and operator pages use this hook.
  // When the operator changes the request status, the WS server emits
  // `request:updated`. We patch the React Query cache immediately so the
  // status badge in the client chat header updates without any polling lag.
  useEffect(() => {
    if (!id || !accessToken) return

    const sock = getSocket(accessToken)

    const onUpdated = (req: OtcRequest) => {
      if (req.id !== id) return
      // Merge so nested objects omitted by the socket payload are preserved
      queryClient.setQueryData<OtcRequest>(
        queryKeys.requests.detail(id),
        (prev) => prev ? { ...prev, ...req, client: { ...prev.client, ...req.client } } : req,
      )
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.events(id) })
    }

    sock.on('request:updated', onUpdated)

    return () => {
      sock.off('request:updated', onUpdated)
    }
  }, [id, accessToken, queryClient])

  return {
    request:      requestQuery.data,
    events:       eventsQuery.data ?? [],
    isLoading:    requestQuery.isLoading,
    isError:      requestQuery.isError,
    errorMessage: requestQuery.isError ? getErrorMessage(requestQuery.error) : null,
  }
}
