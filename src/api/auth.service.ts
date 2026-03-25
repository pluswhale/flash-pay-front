/**
 * API layer — Auth service.
 * Pure functions. No state. No hooks. No side effects beyond the HTTP call.
 */
import { api } from '../lib/api'
import type {
  Invite,
  LoginResponse,
  RegisterResponse,
  AuthTokens,
  User,
  RegisterDto,
  LoginWithPasswordDto,
} from '../types/api'

// ─── Invite validation ────────────────────────────────────────────────────────

/** Validate an invite code when user lands on /register?invite=CODE */
export const validateInvite = (code: string) =>
  api.get<Invite>(`/invite/${code}`).then((r) => r.data)

// ─── Registration (invite-only, 3-step) ──────────────────────────────────────

/** Step 1: Request an SMS one-time code to the user's phone */
export const sendCode = (phone: string) =>
  api.post<{ message: string }>('/auth/send-code', { phone }).then((r) => r.data)

/** Step 2: Complete registration — also logs the user in */
export const register = (payload: RegisterDto) =>
  api.post<RegisterResponse>('/auth/register', payload).then((r) => r.data)

// ─── Login (existing user, 2-step) ───────────────────────────────────────────

// Step 1: sendCode (same function above)

/** Step 2: Exchange verified SMS code for tokens */
export const login = (phone: string, code: string) =>
  api.post<LoginResponse>('/auth/login', { phone, code }).then((r) => r.data)

/** Login with email-or-phone + password (no SMS needed) */
export const loginWithPassword = (payload: LoginWithPasswordDto) =>
  api.post<LoginResponse>('/auth/login/password', payload).then((r) => r.data)

// ─── Session management ───────────────────────────────────────────────────────

/** Invalidate the current session server-side */
export const logout = () =>
  api.post<void>('/auth/logout').then((r) => r.data)

/** Fetch the currently authenticated user */
export const getMe = () =>
  api.post<User>('/auth/me').then((r) => r.data)

/** Rotate tokens using a stored refresh token */
export const refreshTokens = (refreshToken: string) =>
  api.post<AuthTokens>('/auth/refresh', { refreshToken }).then((r) => r.data)
