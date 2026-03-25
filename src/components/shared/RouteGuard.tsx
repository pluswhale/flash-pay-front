/**
 * RouteGuard — auth + role guard for all protected routes.
 *
 * On every mount:
 *  1. Checks if session store has a user (fast, in-memory).
 *  2. If not, calls GET /auth/me (cookie-based) to rehydrate.
 *  3. If /auth/me fails → redirect to /login.
 *  4. If user lacks the required role → redirect to role home.
 *  5. On first load after page refresh, refreshes the accessToken
 *     (for Socket.IO) using the stored refreshToken.
 */
import { useEffect } from 'react'
import { Navigate }  from 'react-router-dom'
import { useQuery }  from '@tanstack/react-query'
import { Loader2 }   from 'lucide-react'
import { queryKeys }     from '../../lib/query-keys'
import { getMe, refreshTokens } from '../../api/auth.service'
import { getSocket, updateSocketToken } from '../../lib/socket'
import { useSessionStore }      from '../../store/sessionStore'
import { AppShell }             from './AppShell'
import { Role }                 from '../../types/api'
import type { User }            from '../../types/api'

interface Props {
  children:      React.ReactNode
  requiredRole?: Role | Role[]
  /** When true, renders children directly without wrapping in AppShell.
   *  Use for full-screen pages that provide their own layout (e.g. OperatorCRM). */
  noShell?:      boolean
}

export function RouteGuard({ children, requiredRole, noShell = false }: Props) {
  const { user, accessToken, setSession, setUser, clearSession } = useSessionStore()

  // ── Hydrate user from /auth/me when store is empty (page refresh) ───────────
  const meQuery = useQuery<User>({
    queryKey: queryKeys.auth.me(),
    queryFn:  getMe,
    retry:    false,
    enabled:  !user,
    staleTime: 5 * 60 * 1000,
  })

  const currentUser = user ?? meQuery.data

  // ── Sync getMe result into store ────────────────────────────────────────────
  useEffect(() => {
    if (meQuery.data && !user) {
      setUser(meQuery.data)
    }
  }, [meQuery.data, user, setUser])

  // ── Refresh accessToken for Socket.IO when none is in memory ────────────────
  useEffect(() => {
    if (!currentUser) return
    if (accessToken) {
      // Already have token — ensure WS is connected
      getSocket(accessToken)
      return
    }
    const stored = localStorage.getItem('refresh_token')
    if (!stored) return

    refreshTokens(stored)
      .then((tokens) => {
        localStorage.setItem('refresh_token', tokens.refreshToken)
        setSession(currentUser, tokens.accessToken)
        // M9: if a stale socket singleton already exists (e.g. hot-reload or
        // component remount before disconnect), update its auth token first so
        // it won't reconnect with an expired JWT.
        updateSocketToken(tokens.accessToken)
        getSocket(tokens.accessToken)
      })
      .catch(() => {
        // Refresh failed — clear everything and let the redirect happen
        localStorage.removeItem('refresh_token')
        clearSession()
      })
  }, [currentUser, accessToken, setSession, clearSession])

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (!user && meQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-[#060d1f] bg-gray-50">
        <Loader2 size={24} className="animate-spin dark:text-blue-400 text-blue-600" />
      </div>
    )
  }

  // ── Not authenticated ────────────────────────────────────────────────────────
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  // ── Role check ───────────────────────────────────────────────────────────────
  if (requiredRole) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!allowed.includes(currentUser.role as Role)) {
      return <Navigate to={roleHome(currentUser.role as Role)} replace />
    }
  }

  if (noShell) {
    return <>{children}</>
  }

  return (
    <AppShell>
      {children}
    </AppShell>
  )
}

export function roleHome(role: Role): string {
  switch (role) {
    case Role.OPERATOR: return '/operator/queue'
    case Role.ADMIN:    return '/admin/invites'
    default:            return '/app/requests'
  }
}
