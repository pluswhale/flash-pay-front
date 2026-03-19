import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Phone, Send, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { Button } from '../shared/Button'
import { useAuthStore } from '../../store/authStore'
import { useTranslation } from '../../hooks/useTranslation'
import { cn } from '../shared/cn'
import type { AuthMethod } from '../../types'

interface QuickAuthModalProps {
  onClose: () => void
  onSuccess: () => void
  title?: string
  description?: string
}

export function QuickAuthModal({ onClose, onSuccess, title, description }: QuickAuthModalProps) {
  const { t } = useTranslation()
  const { register, isLoading } = useAuthStore()

  const [method, setMethod] = useState<AuthMethod>('credentials')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [telegram, setTelegram] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [smsSent, setSmsSent] = useState(false)
  const [smsCode, setSmsCode] = useState('')

  const handleSubmit = async () => {
    setError('')
    let ok = false

    if (method === 'credentials') {
      if (!login.trim() || !password) { setError('Please fill in all fields'); return }
      ok = await register({ method, login: login.trim(), password })
    } else if (method === 'phone') {
      if (!smsSent) { setSmsSent(true); return }
      if (!smsCode) { setError('Enter the SMS code'); return }
      ok = await register({ method, phone: phone.trim() })
    } else if (method === 'telegram') {
      if (!telegram.trim()) { setError('Enter your Telegram handle'); return }
      const handle = telegram.startsWith('@') ? telegram : `@${telegram}`
      ok = await register({ method, telegram: handle })
    }

    if (ok) {
      onSuccess()
    } else {
      setError('Registration failed. Try again.')
    }
  }

  const tabs: { id: AuthMethod; icon: React.ElementType; label: string }[] = [
    { id: 'credentials', icon: User,  label: 'Login' },
    { id: 'phone',       icon: Phone, label: 'Phone' },
    { id: 'telegram',    icon: Send,  label: 'Telegram' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 16 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className={cn(
          'relative w-full max-w-md rounded-3xl overflow-hidden',
          'bg-white border border-gray-200 shadow-2xl',
          'dark:bg-[#0f1726] dark:border-white/10 dark:shadow-[0_30px_80px_rgba(0,0,0,0.6)]',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={cn(
          'px-6 pt-6 pb-4 border-b',
          'border-gray-100 dark:border-white/8',
        )}>
          <div className="flex items-start justify-between">
            <div>
              <div className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold mb-2',
                'bg-blue-100 text-blue-600 border border-blue-200',
                'dark:bg-[#5B8CFF]/15 dark:text-[#7AAEFF] dark:border-[#5B8CFF]/25',
              )}>
                <Lock size={9} />
                {t.auth.noEmailRequired}
              </div>
              <h2 className="font-black text-lg text-gray-900 dark:text-white">
                {title ?? t.auth.quickAuth}
              </h2>
              <p className="text-sm text-gray-500 dark:text-white/45 mt-0.5">
                {description ?? t.auth.quickAuthDesc}
              </p>
            </div>
            <button
              onClick={onClose}
              className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ml-4',
                'bg-gray-100 text-gray-400 hover:bg-gray-200',
                'dark:bg-white/8 dark:text-white/50 dark:hover:bg-white/14',
              )}
            >
              <X size={14} />
            </button>
          </div>

          {/* Method tabs */}
          <div className={cn(
            'flex gap-1 mt-4 p-1 rounded-2xl',
            'bg-gray-100 dark:bg-white/6',
          )}>
            {tabs.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => { setMethod(id); setError(''); setSmsSent(false) }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all',
                  method === id
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-[#1e2d4a] dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-white/40 dark:hover:text-white/60',
                )}
              >
                <Icon size={11} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={method}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="space-y-3"
            >
              {method === 'credentials' && (
                <>
                  <input
                    type="text"
                    placeholder={t.auth.username}
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    className={inputCls}
                  />
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder={t.auth.password}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={cn(inputCls, 'pr-10')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30"
                    >
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </>
              )}

              {method === 'phone' && (
                <>
                  <input
                    type="tel"
                    placeholder={t.auth.phone + ' (+7 900 000 0000)'}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={smsSent}
                    className={inputCls}
                  />
                  {smsSent && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                      <p className="text-[11px] text-emerald-500 font-semibold mb-1.5 flex items-center gap-1">
                        <CheckCircle size={11} /> SMS sent to {phone}
                      </p>
                      <input
                        type="text"
                        placeholder={t.auth.smsCode + ' (0000)'}
                        value={smsCode}
                        onChange={(e) => setSmsCode(e.target.value)}
                        maxLength={4}
                        className={inputCls}
                      />
                    </motion.div>
                  )}
                </>
              )}

              {method === 'telegram' && (
                <input
                  type="text"
                  placeholder="@your_handle"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  className={inputCls}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-500 dark:text-red-400 font-medium">{error}</p>
          )}

          {/* Submit */}
          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleSubmit}
            isLoading={isLoading}
            className="h-12 font-black text-sm mt-1"
          >
            {method === 'phone' && !smsSent ? t.auth.sendCode : t.auth.register}
          </Button>

          <p className="text-center text-[11px] text-gray-400 dark:text-white/25">
            By continuing you agree to our{' '}
            <a href="/legal" className="text-[#5B8CFF] hover:underline">Terms of Service</a>
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

const inputCls = cn(
  'w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all duration-200',
  'bg-white border-gray-300 text-gray-900 placeholder-gray-400',
  'focus:border-[#5B8CFF] focus:shadow-[0_0_0_3px_rgba(91,140,255,0.15)]',
  'dark:bg-[#1a2a45] dark:border-white/12 dark:text-white dark:placeholder-white/30',
  'dark:focus:border-[#5B8CFF]/60 dark:focus:shadow-[0_0_0_3px_rgba(91,140,255,0.2)]',
)
