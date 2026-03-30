/**
 * Page: Register
 * Route: /register          — open registration (email + password or phone SMS)
 *        /register?invite=CODE — same page, invite pre-applied
 *
 * Method tabs:
 *  "phone" — phone + SMS code.  Email + password optional extras.
 *  "email" — email + password.  Username optional extra.
 *
 * If ?invite=CODE is present the invite badge is shown and the code is
 * automatically forwarded to the backend.
 */
import { useState }                       from 'react'
import { useSearchParams, Link }          from 'react-router-dom'
import {
  User, Phone, KeyRound, ArrowRight,
  Mail, Lock, AtSign, TicketCheck, ChevronDown,
} from 'lucide-react'
import {
  useInviteViewModel,
  useRegisterViewModel,
} from '../hooks/view-models/useAuthViewModel'
import { Button } from '../ui'
import { Input  } from '../ui'
import { Card   } from '../ui'

const ROLE_LABEL: Record<string, string> = {
  client:   'Клиент',
  operator: 'Оператор',
  admin:    'Администратор',
}

type Method = 'phone' | 'email'

export function RegisterPage() {
  const [searchParams]  = useSearchParams()
  const inviteCode      = searchParams.get('invite') ?? undefined

  const invite = useInviteViewModel(inviteCode ?? null)
  const vm     = useRegisterViewModel(inviteCode)

  const [showOptional, setShowOptional] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-app">
      <div className="w-full max-w-sm animate-fade-in">

        {/* ── Brand ─────────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-brand shadow-glow-brand-sm flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 select-none">
            Q
          </div>
          <h1 className="text-2xl font-bold text-primary">Регистрация</h1>
          <p className="mt-1 text-sm text-muted">Создайте аккаунт</p>
        </div>

        {/* ── Invite badge ───────────────────────────────────────── */}
        {inviteCode && !invite.isInvalid && (
          <div className={[
            'flex items-center gap-2 px-4 py-3 rounded-2xl mb-4 text-sm',
            invite.isValidating
              ? 'dark:bg-white/5 bg-gray-100 text-muted'
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

        {inviteCode && invite.isInvalid && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl mb-4 text-sm dark:bg-red-500/10 bg-red-50 border dark:border-red-500/20 border-red-200 dark:text-red-300 text-red-700">
            <TicketCheck size={15} className="shrink-0" />
            Инвайт недействителен — будете зарегистрированы как Клиент
          </div>
        )}

        {/* ── Card ──────────────────────────────────────────────── */}
        <Card variant="glass-bright" padding="none">

          {/* Method tabs */}
          <div className="flex border-b dark:border-white/8 border-gray-200/80">
            {(['phone', 'email'] as Method[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { vm.setAuthMethod(m); setShowOptional(false) }}
                className={[
                  'flex-1 py-3.5 text-sm font-medium transition-colors',
                  vm.authMethod === m
                    ? 'text-primary border-b-2 border-brand'
                    : 'text-muted hover:text-secondary',
                ].join(' ')}
              >
                {m === 'phone' ? 'По телефону' : 'По email'}
              </button>
            ))}
          </div>

          <div className="p-6 flex flex-col gap-4">

            {/* Name (common) */}
            <Input
              label="Имя"
              type="text"
              placeholder="Иван Иванов"
              value={vm.name}
              onChange={(e) => vm.setName(e.target.value)}
              prefix={<User size={16} />}
              autoComplete="name"
            />

            {/* ── PHONE METHOD ───────────────────────────────────── */}
            {vm.authMethod === 'phone' && (
              <>
                <Input
                  label="Номер телефона"
                  type="tel"
                  placeholder="+7 999 000 00 00"
                  value={vm.phone}
                  onChange={(e) => vm.setPhone(e.target.value)}
                  prefix={<Phone size={16} />}
                  disabled={vm.codeSent}
                  autoComplete="tel"
                />

                {/* Optional email + password toggle */}
                {!vm.codeSent && (
                  <OptionalSection
                    title="Добавить email и пароль"
                    open={showOptional}
                    onToggle={() => setShowOptional((v) => !v)}
                  >
                    <p className="text-xs text-muted leading-relaxed mb-3">
                      Позволит входить по email или паролю без SMS в будущем.
                    </p>
                    <div className="flex flex-col gap-3">
                      <Input
                        label="Email"
                        type="email"
                        placeholder="email@example.com"
                        value={vm.email}
                        onChange={(e) => vm.setEmail(e.target.value)}
                        prefix={<Mail size={16} />}
                        autoComplete="email"
                      />
                      <Input
                        label="Пароль"
                        type="password"
                        placeholder="Минимум 8 символов"
                        value={vm.password}
                        onChange={(e) => vm.setPassword(e.target.value)}
                        prefix={<Lock size={16} />}
                        autoComplete="new-password"
                      />
                    </div>
                  </OptionalSection>
                )}

                {!vm.codeSent && (
                  <Button
                    type="button"
                    fullWidth
                    size="lg"
                    onClick={vm.handleSendCode}
                    disabled={!vm.phone || !vm.name}
                    isLoading={vm.isSending}
                    loadingLabel="Отправка…"
                  >
                    <ArrowRight size={16} />
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
                      onClick={vm.handleRegister}
                      disabled={!vm.code}
                      isLoading={vm.isSubmitting}
                      loadingLabel="Создание аккаунта…"
                    >
                      Создать аккаунт
                    </Button>
                  </>
                )}
              </>
            )}

            {/* ── EMAIL METHOD ───────────────────────────────────── */}
            {vm.authMethod === 'email' && (
              <>
                <Input
                  label="Email"
                  type="email"
                  placeholder="email@example.com"
                  value={vm.email}
                  onChange={(e) => vm.setEmail(e.target.value)}
                  prefix={<Mail size={16} />}
                  autoComplete="email"
                />

                <Input
                  label="Пароль"
                  type="password"
                  placeholder="Минимум 8 символов"
                  value={vm.password}
                  onChange={(e) => vm.setPassword(e.target.value)}
                  prefix={<Lock size={16} />}
                  autoComplete="new-password"
                />

                <OptionalSection
                  title="Добавить логин"
                  open={showOptional}
                  onToggle={() => setShowOptional((v) => !v)}
                >
                  <p className="text-xs text-muted leading-relaxed mb-3">
                    Уникальный логин для входа вместо email.
                  </p>
                  <Input
                    label="Логин"
                    type="text"
                    placeholder="johndoe"
                    value={vm.username}
                    onChange={(e) => vm.setUsername(e.target.value)}
                    prefix={<AtSign size={16} />}
                    autoComplete="username"
                  />
                </OptionalSection>

                {vm.error && <ErrorBox>{vm.error}</ErrorBox>}

                <Button
                  type="button"
                  fullWidth
                  size="lg"
                  onClick={vm.handleRegister}
                  disabled={!vm.name || !vm.email || !vm.password}
                  isLoading={vm.isSubmitting}
                  loadingLabel="Создание аккаунта…"
                >
                  Создать аккаунт
                </Button>
              </>
            )}

          </div>
        </Card>

        <p className="text-center text-sm text-muted mt-6">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-brand hover:underline font-medium">
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function OptionalSection({
  title,
  open,
  onToggle,
  children,
}: {
  title:    string
  open:     boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border dark:border-white/8 border-gray-200/80 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-secondary hover:text-primary transition-colors"
      >
        <span className="font-medium">
          {title}{' '}
          <span className="font-normal opacity-55">(необязательно)</span>
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="px-4 pb-4 border-t dark:border-white/8 border-gray-200/80 pt-3">
          {children}
        </div>
      )}
    </div>
  )
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-red-400 bg-red-500/10 rounded-xl px-4 py-2.5 border border-red-500/20">
      {children}
    </p>
  )
}
