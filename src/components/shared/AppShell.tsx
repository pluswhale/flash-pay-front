/**
 * AppShell — layout wrapper for all authenticated pages.
 * Provides a minimal top navigation bar with role-aware links and logout.
 */
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, ClipboardList, Users, TicketCheck, ListOrdered, Moon, Sun } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useSessionStore } from '../../store/sessionStore'
import { useUIStore }      from '../../store/uiStore'
import { disconnectSocket } from '../../lib/socket'
import { logout as logoutApi } from '../../api/auth.service'
import { Role } from '../../types/api'

interface Props {
  children: React.ReactNode
}

export function AppShell({ children }: Props) {
  const navigate     = useNavigate()
  const queryClient  = useQueryClient()
  const user         = useSessionStore((s) => s.user)
  const clearSession = useSessionStore((s) => s.clearSession)
  const { theme, toggleTheme } = useUIStore()

  const handleLogout = async () => {
    try { await logoutApi() } catch { /* ignore */ }
    localStorage.removeItem('refresh_token')
    queryClient.clear()
    clearSession()
    disconnectSocket()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col dark:bg-[#060d1f] bg-gray-50">
      {/* ── Top nav ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 dark:bg-[#060d1f]/95 bg-white/95 backdrop-blur-sm border-b dark:border-white/10 border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
          {/* Brand */}
          <Link to={homeForRole(user?.role)} className="flex items-center gap-2 shrink-0">
            <span className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">Q</span>
            <span className="font-semibold text-sm dark:text-white text-gray-900">QuickPay</span>
          </Link>

          {/* Role-based nav links */}
          <nav className="flex-1 flex items-center gap-1">
            {user?.role === Role.CLIENT && (
              <NavLink to="/app/requests" icon={<ClipboardList size={15} />} label="Мои заявки" />
            )}
            {user?.role === Role.OPERATOR && (
              <NavLink to="/operator/queue" icon={<ListOrdered size={15} />} label="Очередь заявок" />
            )}
            {user?.role === Role.ADMIN && (
              <>
                <NavLink to="/admin/invites"   icon={<TicketCheck size={15} />} label="Инвайты" />
                <NavLink to="/admin/operators" icon={<Users size={15} />}       label="Операторы" />
              </>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg dark:text-gray-400 text-gray-500 hover:dark:text-white hover:text-gray-900 transition-colors"
              title="Переключить тему"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {user && (
              <span className="text-xs dark:text-gray-400 text-gray-500 hidden sm:block">
                {user.phone}
              </span>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs dark:text-gray-400 text-gray-500 hover:dark:text-white hover:text-gray-900 dark:hover:bg-white/5 hover:bg-gray-100 transition-colors"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Page content ─────────────────────────────────────────────────────── */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}

function NavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm dark:text-gray-300 text-gray-700 hover:dark:bg-white/5 hover:bg-gray-100 transition-colors"
    >
      {icon}
      {label}
    </Link>
  )
}

function homeForRole(role?: Role): string {
  switch (role) {
    case Role.OPERATOR: return '/operator/queue'
    case Role.ADMIN:    return '/admin/invites'
    default:            return '/app/requests'
  }
}
