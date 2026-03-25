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
import {
  Phone, KeyRound, ArrowRight, Loader2,
  Lock, AtSign,
} from 'lucide-react'
import {
  useLoginViewModel,
  usePasswordLoginViewModel,
} from '../hooks/view-models/useAuthViewModel'

type Tab = 'sms' | 'password'

export function LoginPage() {
  const [tab, setTab] = useState<Tab>('sms')

  return (
    <div className="min-h-screen flex items-center justify-center px-4 dark:bg-[#060d1f] bg-gray-50">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
            Q
          </div>
          <h1 className="text-2xl font-bold dark:text-white text-gray-900">QuickPay</h1>
          <p className="mt-1 text-sm dark:text-gray-400 text-gray-500">Войдите в аккаунт</p>
        </div>

        <div className="rounded-2xl border dark:border-white/10 border-gray-200 dark:bg-white/5 bg-white overflow-hidden">
          {/* Tab switcher */}
          <div className="flex border-b dark:border-white/10 border-gray-200">
            {(['sms', 'password'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  tab === t
                    ? 'dark:text-white text-gray-900 dark:border-b-2 border-b-2 border-blue-500'
                    : 'dark:text-gray-500 text-gray-400 hover:dark:text-gray-300 hover:text-gray-600'
                }`}
              >
                {t === 'sms' ? 'SMS-код' : 'Пароль'}
              </button>
            ))}
          </div>

          <div className="p-6">
            {tab === 'sms' ? <SmsLoginForm /> : <PasswordLoginForm />}
          </div>
        </div>

        <p className="text-center text-sm dark:text-gray-500 text-gray-400 mt-6">
          Нет аккаунта?{' '}
          <Link to="/register" className="dark:text-blue-400 text-blue-600 hover:underline">
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
      {/* Phone */}
      <Field label="Номер телефона">
        <InputWithIcon icon={<Phone size={16} />}>
          <input
            type="tel"
            placeholder="+7 999 000 00 00"
            value={vm.phone}
            onChange={(e) => vm.setPhone(e.target.value)}
            className={inputCls}
          />
        </InputWithIcon>
      </Field>

      {/* Send code button */}
      {!vm.codeSent && (
        <PrimaryButton
          onClick={vm.handleSendCode}
          disabled={!vm.phone || vm.isSending}
          loading={vm.isSending}
          loadingLabel="Отправка…"
        >
          <ArrowRight size={16} />
          Получить код
        </PrimaryButton>
      )}

      {/* Code input + login */}
      {vm.codeSent && (
        <>
          <Field
            label="Код из SMS"
            action={<ResendLink onClick={vm.handleSendCode} />}
          >
            <InputWithIcon icon={<KeyRound size={16} />}>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={vm.code}
                onChange={(e) => vm.setCode(e.target.value)}
                autoFocus
                className={`${inputCls} tracking-widest`}
              />
            </InputWithIcon>
            <p className="text-xs dark:text-gray-500 text-gray-400">
              В dev-режиме код виден в терминале бэкенда.
            </p>
          </Field>

          {vm.error && <ErrorBox>{vm.error}</ErrorBox>}

          <PrimaryButton
            onClick={vm.handleLogin}
            disabled={!vm.code || vm.isSubmitting}
            loading={vm.isSubmitting}
            loadingLabel="Вход…"
          >
            Войти
          </PrimaryButton>
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
      <Field label="Телефон, Email или Логин">
        <InputWithIcon icon={<AtSign size={16} />}>
          <input
            type="text"
            placeholder="+7 999 … или email@example.com или логин"
            value={vm.loginField}
            onChange={(e) => vm.setLoginField(e.target.value)}
            className={inputCls}
            autoComplete="username"
          />
        </InputWithIcon>
      </Field>

      <Field label="Пароль">
        <InputWithIcon icon={<Lock size={16} />}>
          <input
            type="password"
            placeholder="Ваш пароль"
            value={vm.password}
            onChange={(e) => vm.setPassword(e.target.value)}
            className={inputCls}
            autoComplete="current-password"
            onKeyDown={(e) => e.key === 'Enter' && vm.handleLogin()}
          />
        </InputWithIcon>
      </Field>

      {vm.error && <ErrorBox>{vm.error}</ErrorBox>}

      <PrimaryButton
        onClick={vm.handleLogin}
        disabled={!vm.loginField || !vm.password || vm.isSubmitting}
        loading={vm.isSubmitting}
        loadingLabel="Вход…"
      >
        Войти
      </PrimaryButton>

      <p className="text-xs dark:text-gray-500 text-gray-400 text-center leading-relaxed">
        Пароль задаётся при регистрации. Если не задан — используйте вход по SMS.
      </p>
    </div>
  )
}

// ─── Shared primitives ────────────────────────────────────────────────────────

const inputCls =
  'w-full bg-transparent dark:text-white text-gray-900 dark:placeholder-gray-500 placeholder-gray-400 focus:outline-none text-sm'

function Field({
  label,
  action,
  children,
}: {
  label:    string
  action?:  React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium dark:text-gray-300 text-gray-700">{label}</label>
        {action}
      </div>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  )
}

function InputWithIcon({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative flex items-center">
      <span className="absolute left-3 dark:text-gray-500 text-gray-400 pointer-events-none">
        {icon}
      </span>
      <div className="w-full pl-10 pr-4 py-3 rounded-xl border dark:border-white/10 border-gray-200 dark:bg-white/5 bg-gray-50">
        {children}
      </div>
    </div>
  )
}

function ResendLink({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-xs dark:text-blue-400 text-blue-600 hover:underline">
      Отправить повторно
    </button>
  )
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{children}</p>
  )
}

function PrimaryButton({
  onClick,
  disabled,
  loading,
  loadingLabel,
  children,
}: {
  onClick:      () => void
  disabled:     boolean
  loading:      boolean
  loadingLabel: string
  children:     React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading
        ? <><Loader2 size={16} className="animate-spin" />{loadingLabel}</>
        : children
      }
    </button>
  )
}
