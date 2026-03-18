import { Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '../../store/uiStore'
import { cn } from './cn'

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, toggleTheme } = useUIStore()
  const isDark = theme === 'dark'

  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.9 }}
      className={cn(
        'relative w-12 h-6 rounded-full p-0.5 transition-all duration-300',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8CFF]/60',
        isDark
          ? 'bg-gradient-brand shadow-glow-brand-sm'
          : 'bg-gradient-to-r from-amber-300 to-orange-400',
        className
      )}
      aria-label="Toggle theme"
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 600, damping: 35 }}
        className={cn(
          'w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm',
          isDark ? 'translate-x-6' : 'translate-x-0'
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div key="moon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <Moon size={10} className="text-indigo-600" />
            </motion.div>
          ) : (
            <motion.div key="sun"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <Sun size={10} className="text-amber-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.button>
  )
}
