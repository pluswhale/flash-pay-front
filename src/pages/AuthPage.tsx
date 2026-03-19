import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, User, Phone, Send, Eye, EyeOff, Lock, CheckCircle, ArrowLeft } from 'lucide-react'
import { Button } from '../components/shared/Button'
import { useAuthStore } from '../store/authStore'
import { useTranslation } from '../hooks/useTranslation'
import { cn } from '../components/shared/cn'
import type { AuthMethod } from '../types'

const inputCls = cn(
  'w-full px-4 py-3.5 rounded-2xl border text-sm outline-none transition-all duration-200',
  'bg-white border-gray-200 text-gray-900 placeholder-gray-400',
  'focus:border-[#5B8CFF] focus:shadow-[0_0_0_3px_rgba(91,140,255,0.15)]',
  'dark:bg-[#1a2a45] dark:border-white/12 dark:text-white dark:placeholder-white/30',
  'dark:focus:border-[#5B8CFF]/60 dark:focus:shadow-[0_0_0_3px_rgba(91,140,255,0.2)]',
)

export function AuthPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { login, register, isLoading } = useAuthStore()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [method, setMethod] = useState<AuthMethod>('credentials')
  const [loginVal, setLoginVal] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [telegram, setTelegram] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [smsSent, setSmsSent] = useState(false)
  const [smsCode, setSmsCode] = useState('')
  const [error, setError] = useState('')

  const tabs: { id: AuthMethod; icon: React.ElementType; label: string }[] = [
    { id: 'credentials', icon: User,  label: t.auth.username },
    { id: 'phone',       icon: Phone, label: t.auth.phone },
    { id: 'telegram',    icon: Send,  label: 'Telegram' },
  ]

  const handleSubmit = async () => {
    setError('')
    let ok = false

    if (mode === 'login') {
      if (method === 'credentials') ok = await login(loginVal, password)
      else if (method === 'phone') ok = await login(phone, '')
      else if (method === 'telegram') ok = await login(telegram, '')
    } else {
      if (method === 'phone' && !smsSent) { setSmsSent(true); return }
      ok = await register({ method, login: loginVal, password, phone, telegram })
    }

    if (ok) { navigate('/dashboard') }
    else { setError('Invalid credentials. Try again.') }
  }

  return (
    <div className="min-h-screen bg-app flex items-center justify-center px-4 py-24">
      <div className="fixed inset-0 bg-mesh-brand pointer-events-none opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70 mb-6 transition-colors"
        >
          <ArrowLeft size={13} />
          {t.common.back} to Exchange
        </Link>

        <div className={cn(
          'rounded-3xl overflow-hidden border',
          'bg-white border-gray-200 shadow-2xl',
          'dark:bg-[#0f1726] dark:border-white/10 dark:shadow-[0_30px_80px_rgba(0,0,0,0.5)]',
        )}>
          {/* Brand header */}
          <div className="bg-gradient-brand p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
              <Zap size={24} className="text-white" />
            </div>
            <h1 className="font-black text-xl text-white">QuickPay</h1>
            <p className="text-sm text-white/70 mt-1">OTC Exchange Platform</p>
          </div>

          <div className={cn('border-b flex', 'border-gray-100 dark:border-white/8')}>
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={cn(
                  'flex-1 py-3.5 text-sm font-bold transition-all',
                  mode === m
                    ? 'text-[#5B8CFF] border-b-2 border-[#5B8CFF]'
                    : 'text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60',
                )}
              >
                {m === 'login' ? t.auth.login : t.auth.register}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-4">
            {/* Auth method tabs */}
            <div className={cn('flex gap-1 p-1 rounded-2xl', 'bg-gray-100 dark:bg-white/6')}>
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
                  <span className="hidden sm:block">{label.split(' ')[0]}</span>
                </button>
              ))}
            </div>

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
                    <input type="text" placeholder={t.auth.username} value={loginVal} onChange={(e) => setLoginVal(e.target.value)} className={inputCls} />
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        placeholder={t.auth.password}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={cn(inputCls, 'pr-12')}
                      />
                      <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
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
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                          <CheckCircle size={12} /> Code sent to {phone} (use any 4 digits for mock)
                        </p>
                        <input
                          type="text"
                          placeholder={t.auth.smsCode}
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

            {error && <p className="text-sm text-red-500 dark:text-red-400 font-medium">{error}</p>}

            <div className="flex items-center gap-2 my-1">
              <div className="flex-1 h-px bg-gray-200 dark:bg-white/8" />
              <span className="text-[10px] text-gray-400 dark:text-white/25 font-medium uppercase tracking-wider">
                {mode === 'register' ? (
                  <span className="flex items-center gap-1"><Lock size={9} /> {t.auth.noEmailRequired}</span>
                ) : t.common.or}
              </span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-white/8" />
            </div>

            <Button variant="primary" fullWidth size="xl" onClick={handleSubmit} isLoading={isLoading} className="h-13 font-black">
              {method === 'phone' && mode === 'register' && !smsSent ? t.auth.sendCode : (mode === 'login' ? t.auth.login : t.auth.register)}
            </Button>

            <p className="text-center text-xs text-gray-400 dark:text-white/30">
              {mode === 'login' ? t.auth.dontHaveAccount : t.auth.alreadyHaveAccount}{' '}
              <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-[#5B8CFF] font-semibold hover:underline">
                {mode === 'login' ? t.auth.register : t.auth.login}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
