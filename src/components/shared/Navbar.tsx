import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, LayoutDashboard, ArrowRightLeft, HelpCircle, User, LogOut, Menu, X } from 'lucide-react'
import { ThemeSwitcher } from './ThemeSwitcher'
import { LanguageToggle } from './LanguageToggle'
import { useTranslation } from '../../hooks/useTranslation'
import { useAuthStore } from '../../store/authStore'
import { cn } from './cn'

export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, logout } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { to: '/',          label: t.nav.exchange,   icon: Zap },
    { to: '/corridors', label: t.nav.corridors,  icon: ArrowRightLeft },
    { to: '/faq',       label: t.nav.faq,        icon: HelpCircle },
    { to: '/operator',  label: t.nav.operator,   icon: LayoutDashboard },
  ]

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 pt-3"
    >
      <div className="max-w-6xl mx-auto">
        <div className={cn(
          'flex items-center justify-between px-4 sm:px-5 py-2.5 rounded-2xl',
          'bg-white border border-gray-200 shadow-sm',
          'dark:bg-[#0d1525]/95 dark:border-white/10 dark:backdrop-blur-xl dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]',
        )}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-[0_2px_8px_rgba(91,140,255,0.4)]">
              <Zap size={15} className="text-white" />
            </div>
            <span className="font-black text-base text-gradient-brand hidden sm:block">QuickPay</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200',
                    active
                      ? 'bg-gradient-brand text-white shadow-[0_2px_10px_rgba(91,140,255,0.4)]'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-white/45 dark:hover:text-white/80 dark:hover:bg-white/6',
                  )}
                >
                  <Icon size={12} />
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <LanguageToggle className="hidden sm:flex" />
            <ThemeSwitcher />

            {/* User button */}
            {user ? (
              <div className="relative hidden md:flex items-center gap-1">
                <Link
                  to="/dashboard"
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
                    'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200',
                    'dark:bg-white/8 dark:text-white/75 dark:border-white/10 dark:hover:bg-white/14',
                  )}
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-brand flex items-center justify-center text-[10px] font-black text-white">
                    {user.name[0].toUpperCase()}
                  </div>
                  <span className="max-w-[80px] truncate">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className={cn(
                    'w-7 h-7 rounded-xl flex items-center justify-center transition-colors',
                    'text-gray-400 hover:text-red-500 hover:bg-red-50',
                    'dark:text-white/30 dark:hover:text-red-400 dark:hover:bg-red-500/10',
                  )}
                >
                  <LogOut size={12} />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className={cn(
                  'hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
                  'bg-gradient-brand text-white shadow-[0_2px_8px_rgba(91,140,255,0.35)]',
                  'hover:shadow-[0_4px_14px_rgba(91,140,255,0.5)]',
                )}
              >
                <User size={11} />
                {t.common.signIn}
              </Link>
            )}

            {/* Mobile burger */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className={cn(
                'md:hidden w-8 h-8 rounded-xl flex items-center justify-center',
                'bg-gray-100 text-gray-600 dark:bg-white/8 dark:text-white/70',
              )}
            >
              {menuOpen ? <X size={14} /> : <Menu size={14} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'mt-2 rounded-2xl overflow-hidden border',
                'bg-white border-gray-200 shadow-xl',
                'dark:bg-[#0f1726] dark:border-white/10',
              )}
            >
              {links.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-5 py-3.5 text-sm font-semibold transition-colors border-b last:border-b-0',
                      'border-gray-100 dark:border-white/6',
                      active
                        ? 'text-[#5B8CFF] bg-blue-50 dark:bg-[#5B8CFF]/10'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-white/70 dark:hover:bg-white/5',
                    )}
                  >
                    <Icon size={15} />
                    {label}
                  </Link>
                )
              })}
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)} className={cn(
                    'flex items-center gap-3 px-5 py-3.5 text-sm font-semibold transition-colors border-t',
                    'border-gray-100 dark:border-white/6',
                    'text-gray-700 hover:bg-gray-50 dark:text-white/70 dark:hover:bg-white/5',
                  )}>
                    <User size={15} />
                    {user.name}
                  </Link>
                  <button onClick={() => { handleLogout(); setMenuOpen(false) }} className={cn(
                    'flex items-center gap-3 px-5 py-3.5 text-sm font-semibold w-full text-left transition-colors',
                    'text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10',
                  )}>
                    <LogOut size={15} />
                    {t.common.signOut}
                  </button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setMenuOpen(false)} className={cn(
                  'flex items-center gap-3 px-5 py-3.5 text-sm font-bold transition-colors',
                  'text-[#5B8CFF] hover:bg-blue-50 dark:hover:bg-[#5B8CFF]/10',
                )}>
                  <User size={15} />
                  {t.common.signIn}
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}
