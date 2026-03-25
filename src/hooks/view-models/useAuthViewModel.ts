/**
 * ViewModel: Auth
 *
 * Owns ALL auth logic:
 * - Invite validation on mount (/register?invite=CODE)
 * - OTP phone flow: send code → verify
 * - Login & registration mutations
 * - Session persistence via sessionStore + localStorage (refreshToken)
 * - Logout (clears store + cookie + WS)
 */
import { useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { queryKeys }       from '../../lib/query-keys'
import { getErrorMessage } from '../../lib/handle-error'
import { getSocket, disconnectSocket } from '../../lib/socket'
import {
  validateInvite,
  sendCode,
  register,
  login,
  loginWithPassword,
  logout as logoutApi,
  getMe,
} from '../../api/auth.service'
import { useSessionStore } from '../../store/sessionStore'
import { roleHome }        from '../../components/shared/RouteGuard'
import type { User, Invite, Role } from '../../types/api'

// ─── Invite validation (used only on /register page) ─────────────────────────

export function useInviteViewModel(code: string | null) {
  const inviteQuery = useQuery({
    queryKey: queryKeys.invites.detail(code ?? ''),
    queryFn:  () => validateInvite(code!),
    enabled:  Boolean(code),
    retry:    false,
    staleTime: Infinity,
  })

  return {
    invite:       inviteQuery.data as Invite | undefined,
    isValidating: inviteQuery.isLoading,
    isInvalid:    inviteQuery.isError,
    inviteError:  inviteQuery.error ? getErrorMessage(inviteQuery.error) : null,
  }
}

// ─── OTP / SMS flow (shared by login & register) ─────────────────────────────

export function useOtpViewModel() {
  const [phone, setPhone]       = useState('')
  const [code, setCode]         = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [otpError, setOtpError] = useState<string | null>(null)

  const sendMutation = useMutation({
    mutationFn: () => sendCode(phone),
    onSuccess:  () => { setCodeSent(true); setOtpError(null) },
    onError:    (err) => setOtpError(getErrorMessage(err)),
  })

  const handleSendCode = useCallback(() => {
    setOtpError(null)
    sendMutation.mutate()
  }, [sendMutation])

  return {
    phone, setPhone,
    code,  setCode,
    codeSent,
    isSending: sendMutation.isPending,
    otpError,
    handleSendCode,
  }
}

// ─── Registration ViewModel ───────────────────────────────────────────────────

export function useRegisterViewModel(inviteCode: string) {
  const navigate    = useNavigate()
  const setSession  = useSessionStore((s) => s.setSession)
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const otp = useOtpViewModel()

  const registerMutation = useMutation({
    mutationFn: () => register({
      phone: otp.phone,
      code: otp.code,
      inviteCode,
      name,
      email:    email.trim()    || undefined,
      password: password.trim() || undefined,
    }),
    onSuccess: (data) => {
      localStorage.setItem('refresh_token', data.refreshToken)
      setSession(data.user, data.accessToken)
      getSocket(data.accessToken)
      navigate(roleHome(data.user.role as Role))
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const handleRegister = useCallback(() => {
    if (!name.trim() || !otp.code) { setError('Заполните все поля'); return }
    if (password && password.length < 8) { setError('Пароль должен быть не менее 8 символов'); return }
    setError(null)
    registerMutation.mutate()
  }, [name, otp.code, password, registerMutation])

  return {
    ...otp,
    name, setName,
    email, setEmail,
    password, setPassword,
    isSubmitting: registerMutation.isPending,
    error: error ?? otp.otpError,
    handleRegister,
  }
}

// ─── Password Login ViewModel ─────────────────────────────────────────────────

export function usePasswordLoginViewModel() {
  const navigate   = useNavigate()
  const setSession = useSessionStore((s) => s.setSession)
  const [loginField, setLoginField] = useState('')
  const [password, setPassword]     = useState('')
  const [error, setError]           = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => loginWithPassword({ login: loginField, password }),
    onSuccess: (data) => {
      localStorage.setItem('refresh_token', data.refreshToken)
      setSession(data.user, data.accessToken)
      getSocket(data.accessToken)
      navigate(roleHome(data.user.role as Role))
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const handleLogin = useCallback(() => {
    if (!loginField.trim() || !password) { setError('Заполните все поля'); return }
    setError(null)
    mutation.mutate()
  }, [loginField, password, mutation])

  return {
    loginField, setLoginField,
    password, setPassword,
    isSubmitting: mutation.isPending,
    error,
    handleLogin,
  }
}

// ─── Login ViewModel ──────────────────────────────────────────────────────────

export function useLoginViewModel() {
  const navigate   = useNavigate()
  const setSession = useSessionStore((s) => s.setSession)
  const [error, setError] = useState<string | null>(null)
  const otp = useOtpViewModel()

  const loginMutation = useMutation({
    mutationFn: () => login(otp.phone, otp.code),
    onSuccess: (data) => {
      localStorage.setItem('refresh_token', data.refreshToken)
      setSession(data.user, data.accessToken)
      getSocket(data.accessToken)
      navigate(roleHome(data.user.role as Role))
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const handleLogin = useCallback(() => {
    if (!otp.code) { setError('Введите код из SMS'); return }
    setError(null)
    loginMutation.mutate()
  }, [otp.code, loginMutation])

  return {
    ...otp,
    isSubmitting: loginMutation.isPending,
    error: error ?? otp.otpError,
    handleLogin,
  }
}

// ─── Session ViewModel (call at app root for global auth expiry handler) ──────

export function useSessionViewModel() {
  const queryClient = useQueryClient()
  const navigate    = useNavigate()
  const clearSession = useSessionStore((s) => s.clearSession)

  const meQuery = useQuery<User>({
    queryKey: queryKeys.auth.me(),
    queryFn:  getMe,
    retry:    false,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    const handler = () => {
      queryClient.clear()
      clearSession()
      disconnectSocket()
      navigate('/login')
    }
    window.addEventListener('auth:expired', handler)
    return () => window.removeEventListener('auth:expired', handler)
  }, [queryClient, clearSession, navigate])

  const handleLogout = useCallback(async () => {
    try { await logoutApi() } catch { /* ignore */ }
    localStorage.removeItem('refresh_token')
    queryClient.clear()
    clearSession()
    disconnectSocket()
    navigate('/login')
  }, [queryClient, clearSession, navigate])

  return {
    currentUser:  meQuery.data as User | undefined,
    isLoadingMe:  meQuery.isLoading,
    isAuthed:     meQuery.isSuccess && Boolean(meQuery.data),
    handleLogout,
  }
}
