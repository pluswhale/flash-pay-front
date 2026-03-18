import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, Send, Eye, EyeOff } from 'lucide-react'
import { Button } from '../shared/Button'
import { useTranslation } from '../../hooks/useTranslation'
import { cn } from '../shared/cn'

interface AuthModalProps {
  onClose: () => void
  onSuccess: (email: string) => void
}

export function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!email.includes('@')) e.email = 'Enter a valid email'
    if (password.length < 6) e.password = 'At least 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 700))
    setLoading(false)
    onSuccess(email)
  }

  const inputBase = cn(
    'flex items-center rounded-2xl border transition-all duration-200',
    'bg-white border-gray-300',
    'focus-within:border-[#5B8CFF] focus-within:shadow-[0_0_0_3px_rgba(91,140,255,0.15)]',
    'dark:bg-white/5 dark:border-white/10',
    'dark:focus-within:border-[#5B8CFF]/60 dark:focus-within:shadow-[0_0_0_3px_rgba(91,140,255,0.2)]',
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 24 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className={cn(
          'w-full max-w-sm rounded-3xl overflow-hidden',
          /* Light */
          'bg-white border border-gray-200 shadow-2xl',
          /* Dark */
          'dark:bg-[#0f1a2e] dark:border-white/10 dark:shadow-[0_30px_80px_rgba(0,0,0,0.5)]',
        )}
      >
        {/* Brand header */}
        <div className="relative bg-gradient-brand px-6 py-8 text-center overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-xl" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/8 blur-xl" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors z-10"
          >
            <X size={14} className="text-white" />
          </button>
          <div className="relative w-14 h-14 rounded-2xl bg-white/20 mx-auto mb-3 flex items-center justify-center">
            <Mail size={22} className="text-white" />
          </div>
          <h2 className="text-xl font-black text-white relative">
            {mode === 'login' ? t.auth.login : t.auth.register}
          </h2>
          <p className="text-sm text-white/65 mt-1 relative">
            {mode === 'login' ? 'Welcome back to QuickPay' : 'Start exchanging in seconds'}
          </p>
        </div>

        <div className="p-6 space-y-3">
          {/* Telegram OAuth */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              'w-full flex items-center justify-center gap-3 py-3 rounded-2xl text-sm font-semibold transition-colors',
              'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100',
              'dark:bg-[#229ED9]/12 dark:text-[#5BC8F5] dark:border-[#229ED9]/25 dark:hover:bg-[#229ED9]/22',
            )}
          >
            <Send size={15} />
            {t.auth.continueWithTelegram}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/8" />
            <span className="text-[11px] text-gray-400 dark:text-white/25 font-medium">{t.auth.orContinueWith}</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/8" />
          </div>

          {/* Email */}
          <div>
            <div className={cn(inputBase, errors.email && 'border-red-400 dark:border-red-500/60')}>
              <Mail size={15} className="ml-4 text-gray-400 dark:text-white/25 shrink-0" />
              <input
                type="email"
                placeholder={t.auth.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent px-3 py-3.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/25 outline-none"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500 pl-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <div className={cn(inputBase, errors.password && 'border-red-400 dark:border-red-500/60')}>
              <Lock size={15} className="ml-4 text-gray-400 dark:text-white/25 shrink-0" />
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder={t.auth.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="flex-1 bg-transparent px-3 py-3.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/25 outline-none"
              />
              <button
                onClick={() => setShowPwd((v) => !v)}
                className="pr-4 text-gray-300 dark:text-white/25 hover:text-gray-500 dark:hover:text-white/50 transition-colors"
              >
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500 pl-1">{errors.password}</p>}
          </div>

          <Button variant="primary" fullWidth size="lg" onClick={handleSubmit} isLoading={loading} className="font-black">
            {mode === 'login' ? t.auth.login : t.auth.register}
          </Button>

          <p className="text-center text-xs text-gray-400 dark:text-white/35">
            {mode === 'login' ? t.auth.dontHaveAccount : t.auth.alreadyHaveAccount}{' '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrors({}) }}
              className="text-[#5B8CFF] font-semibold hover:text-[#7C5CFF] transition-colors"
            >
              {mode === 'login' ? t.auth.register : t.auth.login}
            </button>
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
