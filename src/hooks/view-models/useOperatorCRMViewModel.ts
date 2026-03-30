/**
 * ViewModel: OperatorCRM page
 *
 * Owns ALL state and orchestration logic for the operator CRM:
 *   - URL-based request selection (useSearchParams)
 *   - Queue filtering & search
 *   - Drawer visibility (mobile)
 *   - Live clock
 *   - Logout
 *   - Derived values (filteredRequests, activeCount)
 *
 * Components receive only plain values and callbacks — no hooks inside them.
 */
import { useState, useEffect }          from 'react'
import { useSearchParams }               from 'react-router-dom'
import { useQueryClient }                from '@tanstack/react-query'
import {
  useOperatorQueueViewModel,
  useStatusTransitionViewModel,
}                                        from './useOperatorViewModel'
import { useRequestDetailViewModel }     from './useRequestViewModel'
import { useChatViewModel }              from './useChatViewModel'
import { useSessionStore }               from '../../store/sessionStore'
import { logout as apiLogout }           from '../../api/auth.service'
import { disconnectSocket }              from '../../lib/socket'
import { RequestStatus }                 from '../../types/api'
import type { OtcRequest }               from '../../types/api'

export function useOperatorCRMViewModel() {
  const [searchParams, setSearchParams]   = useSearchParams()
  const [filter, setFilter]               = useState<RequestStatus | undefined>(undefined)
  const [search, setSearch]               = useState('')
  const [showQueueDrawer, setShowQueue]   = useState(false)
  const [showDetailDrawer, setShowDetail] = useState(false)
  const [now, setNow]                     = useState(new Date())

  // Selected request ID lives in the URL so it survives refresh and tab duplication.
  const selectedId = searchParams.get('requestId')

  const currentUser  = useSessionStore((s) => s.user)
  const clearSession = useSessionStore((s) => s.clearSession)
  const queryClient  = useQueryClient()

  // Live clock — ticks every second for the header time display.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1_000)
    return () => clearInterval(id)
  }, [])

  const queue      = useOperatorQueueViewModel(filter)
  const detail     = useRequestDetailViewModel(selectedId ?? '')
  const transition = useStatusTransitionViewModel(selectedId ?? '')
  const chat       = useChatViewModel(selectedId ?? '')

  // ── Actions ──────────────────────────────────────────────────────────────────

  const selectRequest = (id: string) => {
    setSearchParams({ requestId: id }, { replace: true })
    setShowQueue(false)
  }

  const logout = async () => {
    try { await apiLogout() } catch { /* ignore */ }
    localStorage.removeItem('refresh_token')
    clearSession()
    queryClient.clear()
    disconnectSocket()
    window.location.href = '/flash-pay-front/login'
  }

  // ── Derived values ────────────────────────────────────────────────────────────

  const filteredRequests = (queue.requests as OtcRequest[]).filter((r) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      r.client.name.toLowerCase().includes(q) ||
      r.directionFrom.toLowerCase().includes(q) ||
      r.directionTo.toLowerCase().includes(q)
    )
  })

  const activeCount = queue.requests.filter(
    (r) => r.status !== RequestStatus.COMPLETED && r.status !== RequestStatus.CANCELLED,
  ).length

  // ── Public interface ──────────────────────────────────────────────────────────

  return {
    selectedId,
    queue,
    detail,
    transition,
    chat,
    ui: {
      filter,
      setFilter,
      search,
      setSearch,
      showQueueDrawer,
      setShowQueue,
      showDetailDrawer,
      setShowDetail,
    },
    derived: {
      filteredRequests,
      activeCount,
      now,
      user: currentUser,
    },
    actions: {
      selectRequest,
      logout,
    },
  }
}
