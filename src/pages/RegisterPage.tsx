/**
 * Page: Register
 * Route: /register          — open registration (email + password or phone SMS)
 *        /register?invite=CODE — same page, invite pre-applied
 *
 * Method tabs:
 *  "phone" — phone + SMS code. Email + password optional extras.
 *  "email" — email + password. Single step, no OTP.
 *
 * If ?invite=CODE is present in the URL the invite badge is shown and
 * the code is automatically forwarded to the backend.
 * Without an invite the user is registered as CLIENT.
 */
import { useState }                       from 'react'
import { useSearchParams, Link }          from 'react-router-dom'
import {
  User, Phone, KeyRound, Loader2,
  ArrowRight, Mail, Lock, AtSign,
  TicketCheck, ChevronDown,
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

type Method = 'phone' | 'email'

export function RegisterPage() {
  const [searchParams] = useSearchParams()
  const inviteCode = searchParams.get('invite') ?? undefined

  // Only validate the invite when one is present in the URL
  const invite = useInviteViewModel(inviteCode ?? null)
  const vm     = useRegisterViewModel(inviteCode)

  // Optional fields toggle (email + password for phone method)
  const [showOptional, setShowOptional] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 dark:bg-[#060d1f] bg-gray-50">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
            Q
          </div>
          <h1 className="text-2xl font-bold dark:text-white text-gray-900">Регистрация</h1>
          <p className="mt-1 text-sm dark:text-gray-400 text-gray-500">Создайте аккаунт</p>
        </div>

        {/* Invite badge (shown only when invite is in URL) */}
        {inviteCode && !invite.isInvalid && (
          <div className={[
            'flex items-center gap-2 px-4 py-3 rounded-2xl mb-4 text-sm',
            invite.isValidating
              ? 'dark:bg-white/5 bg-gray-100 dark:text-gray-500 text-gray-400'
              : 'dark:bg-emerald-500/10 bg-emerald-50 border dark:border-emerald-500/20 border-emerald-200 dark:text-emerald-300 text-emerald-700',
          ].join(' ')}>
            <TicketCheck size={15} className="shrink-0" />
            {invite.isValidating ? (
              <span>Проверка инвайта…</span>
            ) : invite.invite ? (
              <span>
                Инвайт принят · роль{' '}
                <span className="font-semibold">
                  {ROLE_LABEL[invite.invite.role] ?? invite.invite.role}
                </span>
              </span>
            ) : null}
          </div>
        )}

        {/* Invalid invite warning (non-blocking) */}
        {inviteCode && invite.isInvalid && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl mb-4 text-sm dark:bg-red-500/10 bg-red-50 border dark:border-red-500/20 border-red-200 dark:text-red-300 text-red-700">
            <TicketCheck size={15} className="shrink-0" />
            Инвайт недействителен — будете зарегистрированы как Клиент
          </div>
        )}

        <div className="rounded-2xl border dark:border-white/10 border-gray-200 dark:bg-white/5 bg-white overflow-hidden">

          {/* Method tabs */}
          <div className="flex border-b dark:border-white/10 border-gray-200">
            {(['phone', 'email'] as Method[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { vm.setAuthMethod(m); setShowOptional(false) }}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  vm.authMethod === m
                    ? 'dark:text-white text-gray-900 border-b-2 border-blue-500'
                    : 'dark:text-gray-500 text-gray-400 hover:dark:text-gray-300 hover:text-gray-600'
                }`}
              >
                {m === 'phone' ? 'По телефону' : 'По email'}
              </button>
            ))}
          </div>

          <div className="p-6 flex flex-col gap-4">

            {/* ── Name (common) ─────────────────────────────────────── */}
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

            {/* ════════════════════════════════════════════════════════
                PHONE METHOD
            ════════════════════════════════════════════════════════ */}
            {vm.authMethod === 'phone' && (
              <>
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

                {/* Optional: email + password */}
                {!vm.codeSent && (
                  <div className="rounded-xl border dark:border-white/8 border-gray-100 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowOptional((v) => !v)}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm dark:text-gray-400 text-gray-500 hover:dark:text-gray-300 hover:text-gray-700 transition-colors"
                    >
                      <span className="font-medium">
                        Добавить email и пароль{' '}
                        <span className="font-normal opacity-60">(необязательно)</span>
                      </span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${showOptional ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {showOptional && (
                      <div className="px-4 pb-4 flex flex-col gap-3 border-t dark:border-white/8 border-gray-100">
                        <p className="text-xs dark:text-gray-500 text-gray-400 pt-3 leading-relaxed">
                          Позволит входить по email или паролю без SMS в будущем.
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

                {/* Send code */}
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

                {/* SMS code + submit */}
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

                    {vm.error && <ErrorBox>{vm.error}</ErrorBox>}

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
              </>
            )}

            {/* ════════════════════════════════════════════════════════
                EMAIL METHOD
            ════════════════════════════════════════════════════════ */}
            {vm.authMethod === 'email' && (
              <>
                {/* Email */}
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

                {/* Password */}
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

                {/* Username (optional) */}
                <div className="rounded-xl border dark:border-white/8 border-gray-100 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowOptional((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm dark:text-gray-400 text-gray-500 hover:dark:text-gray-300 hover:text-gray-700 transition-colors"
                  >
                    <span className="font-medium">
                      Добавить логин{' '}
                      <span className="font-normal opacity-60">(необязательно)</span>
                    </span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${showOptional ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {showOptional && (
                    <div className="px-4 pb-4 flex flex-col gap-3 border-t dark:border-white/8 border-gray-100">
                      <p className="text-xs dark:text-gray-500 text-gray-400 pt-3 leading-relaxed">
                        Уникальный логин для входа вместо email.
                      </p>
                      <Field label="Логин">
                        <InputWithIcon icon={<AtSign size={16} />}>
                          <input
                            type="text"
                            placeholder="johndoe"
                            value={vm.username}
                            onChange={(e) => vm.setUsername(e.target.value)}
                            className={inputCls}
                            autoComplete="username"
                          />
                        </InputWithIcon>
                      </Field>
                    </div>
                  )}
                </div>

                {vm.error && <ErrorBox>{vm.error}</ErrorBox>}

                <PrimaryButton
                  onClick={vm.handleRegister}
                  disabled={!vm.name || !vm.email || !vm.password || vm.isSubmitting}
                  loading={vm.isSubmitting}
                  loadingLabel="Создание аккаунта…"
                >
                  Создать аккаунт
                </PrimaryButton>
              </>
            )}

          </div>
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
