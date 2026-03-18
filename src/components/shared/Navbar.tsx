import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, LayoutDashboard } from 'lucide-react'
import { ThemeSwitcher } from './ThemeSwitcher'
import { LanguageToggle } from './LanguageToggle'
import { useTranslation } from '../../hooks/useTranslation'
import { cn } from './cn'

export function Navbar() {
  const location = useLocation()
  const { t } = useTranslation()

  const links = [
    { to: '/', label: t.nav.exchange, icon: Zap },
    { to: '/operator', label: t.nav.operator, icon: LayoutDashboard },
  ]

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 pt-3"
    >
      <div className="max-w-6xl mx-auto">
        <div className={cn(
          'flex items-center justify-between px-4 sm:px-5 py-2.5 rounded-2xl',
          /* Light */
          'bg-white border border-gray-200 shadow-sm',
          /* Dark — solid enough to read against any bg */
          'dark:bg-[#0d1525]/95 dark:border-white/10 dark:backdrop-blur-xl dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]',
        )}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-[0_2px_8px_rgba(91,140,255,0.4)]">
              <Zap size={15} className="text-white" />
            </div>
            <span className="font-black text-base text-gradient-brand hidden sm:block">QuickPay</span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200',
                    active
                      ? 'bg-gradient-brand text-white shadow-[0_2px_10px_rgba(91,140,255,0.4)]'
                      : [
                        'text-gray-500 hover:text-gray-800 hover:bg-gray-100',
                        'dark:text-white/45 dark:hover:text-white/80 dark:hover:bg-surface-2',
                      ].join(' ')
                  )}
                >
                  <Icon size={13} />
                  <span className="hidden sm:block">{label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <LanguageToggle className="hidden sm:flex" />
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </motion.header>
  )
}
