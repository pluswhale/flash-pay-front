import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useUIStore } from './store/uiStore'

import { LoginPage }    from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'

import { RequestsPage }    from './pages/app/RequestsPage'
import { RequestDetailPage } from './pages/app/RequestDetailPage'
import { OperatorCRM }       from './pages/operator/OperatorCRM'
import { InvitesPage }       from './pages/admin/InvitesPage'
import { OperatorsPage }     from './pages/admin/OperatorsPage'

import { RouteGuard } from './components/shared/RouteGuard'
import { Role }       from './types/api'

export default function App() {
  const theme = useUIStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <BrowserRouter basename="/flash-pay-front">
      <Routes>
        {/* ── Public ─────────────────────────────────────────────────────── */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Client ─────────────────────────────────────────────────────── */}
        <Route
          path="/app/requests"
          element={
            <RouteGuard requiredRole={Role.CLIENT}>
              <RequestsPage />
            </RouteGuard>
          }
        />
        <Route
          path="/app/requests/:id"
          element={
            <RouteGuard requiredRole={Role.CLIENT}>
              <RequestDetailPage />
            </RouteGuard>
          }
        />

        {/* ── Operator ───────────────────────────────────────────────────── */}
        <Route
          path="/operator/queue"
          element={
            <RouteGuard requiredRole={Role.OPERATOR} noShell>
              <OperatorCRM />
            </RouteGuard>
          }
        />

        {/* ── Admin ──────────────────────────────────────────────────────── */}
        <Route
          path="/admin/invites"
          element={
            <RouteGuard requiredRole={Role.ADMIN}>
              <InvitesPage />
            </RouteGuard>
          }
        />
        <Route
          path="/admin/operators"
          element={
            <RouteGuard requiredRole={Role.ADMIN}>
              <OperatorsPage />
            </RouteGuard>
          }
        />

        {/* ── Catch-all → login ───────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
