/**
 * Page: Register (invite-only)
 * Route: /register?invite=CODE  (public)
 *
 * Flow:
 *  1. Validate invite code (auto, from URL param).
 *  2. User fills: Name (required), Phone (required),
 *                 Email (optional), Password (optional).
 *  3. Request SMS code → enter code → register.
 *
 * Email + password are optional. If provided they enable
 * password-based login (POST /auth/login/password) in the future.
 */
import { useState }                           from 'react'
import { useSearchParams, Link }              from 'react-router-dom'
import {
  User, Phone, KeyRound, Loader2,
  ArrowRight, AlertCircle, Mail, Lock, ChevronDown,
} from 'lucide-react'
import {
  useInviteViewModel,
  useRegisterViewModel,
} from '../hooks/view-models/useAuthViewModel'

const ROLE_LABEL: Record<string, string> = {
  client:   'Клиент',
  operator: 'Оператор',
  admin:    'Администратор',
}

export function RegisterPage() {
  const [searchParams] = useSearchParams()
  const code   = searchParams.get('invite')
  const invite = useInviteViewModel(code)
  const vm     = useRegisterViewModel(code ?? '')

  // Optional section expand state
  const [showOptional, setShowOptional] = useState(false)

  if (!code) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 dark:bg-[#060d1f] bg-gray-50">
        <div className="text-center max-w-sm">
          <AlertCircle size={40} className="mx-auto mb-4 dark:text-gray-500 text-gray-400" />
          <h2 className="text-lg font-semibold dark:text-white text-gray-900 mb-2">Необходим инвайт</h2>
          <p className="text-sm dark:text-gray-400 text-gray-500 mb-6">
            Регистрация только по приглашению. Обратитесь к администратору.
          </p>
          <Link to="/login" className="text-sm dark:text-blue-400 text-blue-600 hover:underline">Войти</Link>
        </div>
      </div>
    )
  }

  if (invite.isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-[#060d1f] bg-gray-50">
        <Loader2 size={24} className="animate-spin dark:text-blue-400 text-blue-600" />
      </div>
    )
  }

  if (invite.isInvalid) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 dark:bg-[#060d1f] bg-gray-50">
        <div className="text-center max-w-sm">
          <AlertCircle size={40} className="mx-auto mb-4 text-red-400" />
          <h2 className="text-lg font-semibold dark:text-white text-gray-900 mb-2">Инвайт недействителен</h2>
          <p className="text-sm dark:text-gray-400 text-gray-500">{invite.inviteError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 dark:bg-[#060d1f] bg-gray-50">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
            Q
          </div>
          <h1 className="text-2xl font-bold dark:text-white text-gray-900">Регистрация</h1>
          {invite.invite && (
            <p className="mt-1 text-sm dark:text-gray-400 text-gray-500">
              Роль:{' '}
              <span className="font-medium dark:text-gray-200 text-gray-700">
                {ROLE_LABEL[invite.invite.role] ?? invite.invite.role}
              </span>
            </p>
          )}
        </div>

        <div className="rounded-2xl border dark:border-white/10 border-gray-200 dark:bg-white/5 bg-white p-6 flex flex-col gap-4">

          {/* ── Required fields ────────────────────────────────────────────── */}

          {/* Name */}
          <Field label="Имя">
            <InputWithIcon icon={<User size={16} />}>
              <input
                type="text"
                placeholder="Иван Иванов"
                value={vm.name}
                onChange={(e) => vm.setName(e.target.value)}
                className={inputCls}
              />
            </InputWithIcon>
          </Field>

          {/* Phone */}
          <Field label="Номер телефона">
            <InputWithIcon icon={<Phone size={16} />}>
              <input
                type="tel"
                placeholder="+7 999 000 00 00"
                value={vm.phone}
                onChange={(e) => vm.setPhone(e.target.value)}
                disabled={vm.codeSent}
                className={inputCls}
              />
            </InputWithIcon>
          </Field>

          {/* ── Optional: email + password (collapsible) ──────────────────── */}
          {!vm.codeSent && (
            <div className="rounded-xl border dark:border-white/8 border-gray-100 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowOptional((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm dark:text-gray-400 text-gray-500 hover:dark:text-gray-300 hover:text-gray-700 transition-colors"
              >
                <span className="font-medium">Добавить email и пароль <span className="font-normal opacity-60">(необязательно)</span></span>
                <ChevronDown
                  size={15}
                  className={`transition-transform duration-200 ${showOptional ? 'rotate-180' : ''}`}
                />
              </button>

              {showOptional && (
                <div className="px-4 pb-4 flex flex-col gap-3 border-t dark:border-white/8 border-gray-100">
                  <p className="text-xs dark:text-gray-500 text-gray-400 pt-3 leading-relaxed">
                    Если заполните, сможете входить по email/телефону и паролю без SMS.
                  </p>

                  <Field label="Email">
                    <InputWithIcon icon={<Mail size={16} />}>
                      <input
                        type="email"
                        placeholder="email@example.com"
                        value={vm.email}
                        onChange={(e) => vm.setEmail(e.target.value)}
                        className={inputCls}
                        autoComplete="email"
                      />
                    </InputWithIcon>
                  </Field>

                  <Field label="Пароль">
                    <InputWithIcon icon={<Lock size={16} />}>
                      <input
                        type="password"
                        placeholder="Минимум 8 символов"
                        value={vm.password}
                        onChange={(e) => vm.setPassword(e.target.value)}
                        className={inputCls}
                        autoComplete="new-password"
                      />
                    </InputWithIcon>
                  </Field>
                </div>
              )}
            </div>
          )}

          {/* ── Send code ─────────────────────────────────────────────────── */}
          {!vm.codeSent && (
            <PrimaryButton
              onClick={vm.handleSendCode}
              disabled={!vm.phone || !vm.name || vm.isSending}
              loading={vm.isSending}
              loadingLabel="Отправка…"
            >
              <ArrowRight size={16} />
              Получить код
            </PrimaryButton>
          )}

          {/* ── SMS code + submit ──────────────────────────────────────────── */}
          {vm.codeSent && (
            <>
              <Field
                label="Код из SMS"
                action={
                  <button
                    type="button"
                    onClick={vm.handleSendCode}
                    className="text-xs dark:text-blue-400 text-blue-600 hover:underline"
                  >
                    Отправить повторно
                  </button>
                }
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

              {vm.error && (
                <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
                  {vm.error}
                </p>
              )}

              <PrimaryButton
                onClick={vm.handleRegister}
                disabled={!vm.code || vm.isSubmitting}
                loading={vm.isSubmitting}
                loadingLabel="Создание аккаунта…"
              >
                Создать аккаунт
              </PrimaryButton>
            </>
          )}
        </div>

        <p className="text-center text-sm dark:text-gray-500 text-gray-400 mt-6">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="dark:text-blue-400 text-blue-600 hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
}

// ─── Shared primitives ────────────────────────────────────────────────────────

const inputCls =
  'w-full bg-transparent dark:text-white text-gray-900 dark:placeholder-gray-500 placeholder-gray-400 focus:outline-none text-sm disabled:opacity-50'

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
