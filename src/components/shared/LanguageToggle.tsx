import { motion } from 'framer-motion'
import { useUIStore } from '../../store/uiStore'
import { cn } from './cn'

export function LanguageToggle({ className }: { className?: string }) {
  const { language, setLanguage } = useUIStore()

  return (
    <div className={cn(
      'flex rounded-xl overflow-hidden p-0.5 gap-0.5',
      'border border-gray-200 bg-gray-100',
      'dark:border-white/10 dark:bg-white/5',
      className
    )}>
      {(['en', 'ru'] as const).map((lang) => (
        <motion.button
          key={lang}
          onClick={() => setLanguage(lang)}
          whileTap={{ scale: 0.93 }}
          className={cn(
            'px-2.5 py-1 text-xs font-bold uppercase rounded-lg transition-all duration-150',
            language === lang
              ? 'bg-gradient-brand text-white shadow-[0_1px_6px_rgba(91,140,255,0.4)]'
              : [
                'text-gray-500 hover:text-gray-700 hover:bg-gray-200',
                'dark:text-white/40 dark:hover:text-white/70 dark:hover:bg-white/8',
              ].join(' ')
          )}
        >
          {lang}
        </motion.button>
      ))}
    </div>
  )
}
