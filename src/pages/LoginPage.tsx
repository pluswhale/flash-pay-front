/**
 * Page: Login
 * Route: /login  (public)
 *
 * Two modes:
 *  "sms"      — Phone + SMS OTP  (POST /auth/login)
 *  "password" — Login + Password (POST /auth/login/password)
 */
import { useState }    from 'react'
import { Link }        from 'react-router-dom'
import { Phone, KeyRound, Lock, AtSign } from 'lucide-react'
import {
  useLoginViewModel,
  usePasswordLoginViewModel,
} from '../hooks/view-models/useAuthViewModel'
import { Button } from '../ui'
import { Input  } from '../ui'
import { Card   } from '../ui'

type Tab = 'sms' | 'password'

export function LoginPage() {
  const [tab, setTab] = useState<Tab>('sms')

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-app">
      <div className="w-full max-w-sm animate-fade-in">

        {/* ── Brand ─────────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-brand shadow-glow-brand-sm flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 select-none">
            Q
          </div>
          <h1 className="text-2xl font-bold text-primary">QuickPay</h1>
          <p className="mt-1 text-sm text-muted">Войдите в аккаунт</p>
        </div>

        {/* ── Card ──────────────────────────────────────────────── */}
        <Card variant="glass-bright" padding="none">

          {/* Tab switcher */}
          <div className="flex border-b dark:border-white/8 border-gray-200/80">
            {(['sms', 'password'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={[
                  'flex-1 py-3.5 text-sm font-medium transition-colors',
                  tab === t
                    ? 'text-primary border-b-2 border-brand'
                    : 'text-muted hover:text-secondary',
                ].join(' ')}
              >
                {t === 'sms' ? 'SMS-код' : 'Пароль'}
              </button>
            ))}
          </div>

          <div className="p-6">
            {tab === 'sms' ? <SmsLoginForm /> : <PasswordLoginForm />}
          </div>
        </Card>

        <p className="text-center text-sm text-muted mt-6">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-brand hover:underline font-medium">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  )
}

// ─── SMS tab ──────────────────────────────────────────────────────────────────

function SmsLoginForm() {
  const vm = useLoginViewModel()

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Номер телефона"
        type="tel"
        placeholder="+7 999 000 00 00"
        value={vm.phone}
        onChange={(e) => vm.setPhone(e.target.value)}
        prefix={<Phone size={16} />}
        autoComplete="tel"
      />

      {!vm.codeSent && (
        <Button
          type="button"
          fullWidth
          size="lg"
          onClick={vm.handleSendCode}
          disabled={!vm.phone}
          isLoading={vm.isSending}
          loadingLabel="Отправка…"
        >
          Получить код
        </Button>
      )}

      {vm.codeSent && (
        <>
          <Input
            label="Код из SMS"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={vm.code}
            onChange={(e) => vm.setCode(e.target.value)}
            prefix={<KeyRound size={16} />}
            hint="В dev-режиме код виден в терминале бэкенда."
            autoFocus
            className="tracking-widest"
            suffix={
              <button
                type="button"
                onClick={vm.handleSendCode}
                className="text-xs text-brand hover:underline whitespace-nowrap pr-1"
              >
                Повторно
              </button>
            }
          />

          {vm.error && <ErrorBox>{vm.error}</ErrorBox>}

          <Button
            type="button"
            fullWidth
            size="lg"
            onClick={vm.handleLogin}
            disabled={!vm.code}
            isLoading={vm.isSubmitting}
            loadingLabel="Вход…"
          >
            Войти
          </Button>
        </>
      )}
    </div>
  )
}

// ─── Password tab ─────────────────────────────────────────────────────────────

function PasswordLoginForm() {
  const vm = usePasswordLoginViewModel()

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Телефон, Email или Логин"
        type="text"
        placeholder="+7 999 … или email@example.com"
        value={vm.loginField}
        onChange={(e) => vm.setLoginField(e.target.value)}
        prefix={<AtSign size={16} />}
        autoComplete="username"
      />

      <Input
        label="Пароль"
        type="password"
        placeholder="Ваш пароль"
        value={vm.password}
        onChange={(e) => vm.setPassword(e.target.value)}
        prefix={<Lock size={16} />}
        autoComplete="current-password"
        onKeyDown={(e) => e.key === 'Enter' && vm.handleLogin()}
      />

      {vm.error && <ErrorBox>{vm.error}</ErrorBox>}

      <Button
        type="button"
        fullWidth
        size="lg"
        onClick={vm.handleLogin}
        disabled={!vm.loginField || !vm.password}
        isLoading={vm.isSubmitting}
        loadingLabel="Вход…"
      >
        Войти
      </Button>

      <p className="text-xs text-muted text-center leading-relaxed">
        Пароль задаётся при регистрации. Если не задан — используйте вход по SMS.
      </p>
    </div>
  )
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-red-400 bg-red-500/10 rounded-xl px-4 py-2.5 border border-red-500/20">
      {children}
    </p>
  )
}
