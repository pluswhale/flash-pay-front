// ─── Enums ────────────────────────────────────────────────────────────────────

export enum Role {
  CLIENT   = 'client',
  OPERATOR = 'operator',
  ADMIN    = 'admin',
}

export enum RequestStatus {
  NEW         = 'NEW',
  ASSIGNED    = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED   = 'COMPLETED',
  CANCELLED   = 'CANCELLED',
}

export enum SenderType {
  CLIENT   = 'client',
  OPERATOR = 'operator',
  SYSTEM   = 'system',
}

export enum ClientLevel {
  NEW     = 'new',
  REGULAR = 'regular',
  VIP     = 'vip',
}

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface User {
  id: string
  role: Role
  phone: string | null
  email: string | null
  username: string | null
  isPhoneVerified: boolean
  telegramId: string | null
  telegramUsername: string | null
  referralCode: string
  referredById: string | null
  createdAt: string
}

export interface Client {
  id: string
  userId: string
  user: User
  name: string
  level: ClientLevel
  createdAt: string
}

export interface OtcRequest {
  id: string
  clientId: string
  client: Client
  operatorId: string | null
  operator: User | null
  status: RequestStatus
  directionFrom: string
  directionTo: string
  amount: number
  currency: string
  city: string | null
  country: string | null
  payoutMethod: string | null
  comment: string | null
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  conversationId: string
  requestId: string
  senderType: SenderType
  senderId: string | null
  content: string
  createdAt: string
}

export interface Invite {
  id: string
  code: string
  role: Role.CLIENT | Role.OPERATOR
  expiresAt: string
  usedAt: string | null
  usedById: string | null
  createdById: string
  createdAt: string
}

export interface EventLog {
  id: string
  requestId: string
  eventType: string
  actorId: string | null
  payload: Record<string, unknown>
  createdAt: string
}

// ─── API response wrapper ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  timestamp: string
}

export interface ApiError {
  statusCode: number
  timestamp: string
  path: string
  message: string | Record<string, string[]>
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface RegisterResponse extends AuthTokens {
  user: User
}

export interface LoginResponse extends AuthTokens {
  user: User
}

// ─── DTOs (request payloads) ──────────────────────────────────────────────────

export interface CreateRequestDto {
  directionFrom: string
  directionTo: string
  amount: number
  currency: string
  city?: string
  country?: string
  payoutMethod?: string
  comment?: string
}

export interface RegisterDto {
  authMethod: 'phone' | 'email'
  name: string
  // Phone method
  phone?: string
  code?: string
  // Email method
  email?: string
  password?: string
  // Optional for both
  username?: string
  inviteCode?: string
}

export interface LoginWithPasswordDto {
  login: string    // phone OR email
  password: string
}

export interface CreateInviteDto {
  role: Role.CLIENT | Role.OPERATOR
  expiresInHours?: number
}

// ─── Status machine ───────────────────────────────────────────────────────────

export const ALLOWED_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  [RequestStatus.NEW]:         [RequestStatus.ASSIGNED, RequestStatus.CANCELLED],
  [RequestStatus.ASSIGNED]:    [RequestStatus.IN_PROGRESS, RequestStatus.CANCELLED],
  [RequestStatus.IN_PROGRESS]: [RequestStatus.COMPLETED, RequestStatus.CANCELLED],
  [RequestStatus.COMPLETED]:   [],
  [RequestStatus.CANCELLED]:   [],
}
