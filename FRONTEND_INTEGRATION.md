# Frontend Integration Prompt

> Paste this entire file to your AI assistant when working on frontend integration.

---

## Context

You are integrating a **React + TypeScript** frontend with a **NestJS backend** for an OTC Exchange CRM.
The backend is already fully built and running. Your job is to wire the frontend to it.

---

## 1. BACKEND OVERVIEW

| Property | Value |
|----------|-------|
| REST base URL | `http://localhost:3000/api/v1` |
| WebSocket URL | `http://localhost:3000/ws` (namespace `/ws`) |
| Swagger UI | `http://localhost:3000/docs` |
| Auth mechanism | JWT — HTTP-only cookie `access_token` (primary) OR `Authorization: Bearer <token>` header |
| Response envelope | Every response is `{ data: T, timestamp: string }` |
| Error shape | `{ statusCode, timestamp, path, message }` |

---

## 2. TYPESCRIPT TYPES

Copy these types to your frontend (e.g. `src/types/api.ts`):

```typescript
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
  id: string;
  role: Role;
  phone: string;
  email: string | null;       // set during registration (optional)
  isPhoneVerified: boolean;
  telegramId: string | null;
  telegramUsername: string | null;
  referralCode: string;
  referredById: string | null;
  createdAt: string;
}

export interface Client {
  id: string;
  userId: string;
  user: User;
  name: string;
  level: ClientLevel;
  createdAt: string;
}

export interface OtcRequest {
  id: string;
  clientId: string;
  client: Client;
  operatorId: string | null;
  operator: User | null;
  status: RequestStatus;
  directionFrom: string;
  directionTo: string;
  amount: number;
  currency: string;
  city: string | null;
  country: string | null;
  payoutMethod: string | null;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  requestId: string;
  senderType: SenderType;
  senderId: string | null;
  content: string;
  createdAt: string;
}

export interface Invite {
  id: string;
  code: string;
  role: Role.CLIENT | Role.OPERATOR;
  expiresAt: string;
  usedAt: string | null;
  usedById: string | null;
  createdById: string;
  createdAt: string;
}

export interface EventLog {
  id: string;
  requestId: string;
  eventType: string;
  actorId: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
}

// ─── API response wrapper ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  timestamp: string;
}

export interface ApiError {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string | Record<string, string[]>;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse extends AuthTokens {
  user: User;
}

export interface LoginResponse extends AuthTokens {
  user: User;
}
```

---

## 3. API CLIENT SETUP

Use `axios` with an interceptor to unwrap the `{ data }` envelope and handle 401 refresh.

```typescript
// src/lib/api.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,         // send / receive HTTP-only cookies
  headers: { 'Content-Type': 'application/json' },
});

// Unwrap { data, timestamp } envelope automatically
api.interceptors.response.use(
  (res) => { res.data = res.data.data; return res; },
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const stored = localStorage.getItem('refresh_token');
      if (stored) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken: stored,
          }, { withCredentials: true });

          // Store new tokens
          localStorage.setItem('refresh_token', data.data.refreshToken);
          original.headers['Authorization'] = `Bearer ${data.data.accessToken}`;
          return api(original);
        } catch {
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  },
);
```

---

## 4. AUTH FLOW

The backend supports **three ways** to log in. All return the same `LoginResponse` shape.

| Method | Endpoint | When to use |
|--------|----------|-------------|
| Phone + SMS code | `POST /auth/login` | Primary / default |
| Email or phone + password | `POST /auth/login/password` | User set a password at registration |
| Register via invite | `POST /auth/register` | First-time registration only |

---

### 4a. Registration flow (invite-only, 2 steps)

```typescript
// src/services/auth.service.ts
import { api } from '../lib/api';
import type { LoginResponse, RegisterResponse } from '../types/api';

// Step 1: Request SMS code
export const sendCode = (phone: string) =>
  api.post<{ message: string }>('/auth/send-code', { phone });

// Step 2: Register — verifies SMS code inline, no separate /verify-code call needed
//   email and password are optional.
//   If the user provides them, they can also log in with email/phone + password later.
export const register = (payload: {
  phone: string;
  code: string;        // SMS code from step 1
  inviteCode: string;  // from the invite link ?invite=CODE query param
  name: string;
  email?: string;      // optional — enables password-based login
  password?: string;   // optional — min 8 chars
}) => api.post<RegisterResponse>('/auth/register', payload);
```

---

### 4b. Login — Phone + SMS code (existing user)

```typescript
// Step 1: sendCode(phone)  ← same function as above

// Step 2: Login — verifies SMS code inline
export const loginWithSms = (phone: string, code: string) =>
  api.post<LoginResponse>('/auth/login', { phone, code });
```

---

### 4c. Login — Email or phone + password

```typescript
// No SMS step needed.
// `login` field accepts either phone ("+79991234567") or email ("john@example.com")
export const loginWithPassword = (login: string, password: string) =>
  api.post<LoginResponse>('/auth/login/password', { login, password });
```

> **Important:** This only works for accounts where a `password` was provided during registration.
> If the account has no password, the API returns `401` with message:
> `"This account has no password set. Use phone + SMS code to login."`

---

### 4d. Session management

```typescript
export const logout = () => api.post('/auth/logout');

export const getMe = () => api.post<User>('/auth/me');

export const refreshTokens = (refreshToken: string) =>
  api.post<AuthTokens>('/auth/refresh', { refreshToken });
```

**After any login/register:**
- Store `refreshToken` in `localStorage` (access token goes into an HTTP-only cookie automatically)
- Store `user` object in your auth state (Zustand / Context / Redux)
- The cookie is sent automatically on every subsequent request thanks to `withCredentials: true`

---

### 4e. Recommended Login Page UI

Show two tabs / modes on the login page:

```
┌──────────────────────────────────┐
│  [ SMS Code ]  [ Password ]      │  ← tab switcher
├──────────────────────────────────┤
│ SMS mode:                        │
│   Phone  ___________________     │
│   [Send code]                    │
│   Code   ___________________     │
│   [Login]                        │
├──────────────────────────────────┤
│ Password mode:                   │
│   Phone or Email  ___________    │
│   Password        ___________    │
│   [Login]                        │
└──────────────────────────────────┘
```

```typescript
// Login page logic (React example)
const [mode, setMode] = useState<'sms' | 'password'>('sms');

// SMS mode
const handleSmsLogin = async () => {
  await sendCode(phone);
  // show code input
  const { data } = await loginWithSms(phone, code);
  saveSession(data);
};

// Password mode
const handlePasswordLogin = async () => {
  const { data } = await loginWithPassword(loginField, password);
  saveSession(data);
};

const saveSession = (response: LoginResponse) => {
  localStorage.setItem('refresh_token', response.refreshToken);
  setUser(response.user);
  navigate(response.user.role === 'client' ? '/dashboard' : '/operator');
};
```

---

### 4f. Registration page (with optional password)

```typescript
// On the register page, allow the user to optionally set email + password
const handleRegister = async () => {
  await sendCode(phone);
  // after user enters SMS code:
  const { data } = await register({
    phone,
    code,
    inviteCode,  // from URL ?invite=...
    name,
    email: email || undefined,      // leave out if empty
    password: password || undefined, // leave out if empty
  });
  saveSession(data);
};
```

---

## 5. REQUESTS (Core Domain)

```typescript
// src/services/request.service.ts
import { api } from '../lib/api';
import type { OtcRequest, RequestStatus, EventLog } from '../types/api';

// ─── Client app ───────────────────────────────────────────────────────────────

export const createRequest = (payload: {
  directionFrom: string;
  directionTo: string;
  amount: number;
  currency: string;
  city?: string;
  country?: string;
  payoutMethod?: string;
  comment?: string;
}) => api.post<OtcRequest>('/requests', payload);

export const getMyRequests = () =>
  api.get<OtcRequest[]>('/requests/my');

// ─── Operator app ─────────────────────────────────────────────────────────────

export const getAllRequests = (status?: RequestStatus) =>
  api.get<OtcRequest[]>('/requests', { params: status ? { status } : {} });

export const getRequest = (id: string) =>
  api.get<OtcRequest>(`/requests/${id}`);

export const updateRequestStatus = (id: string, status: RequestStatus) =>
  api.patch<OtcRequest>(`/requests/${id}/status`, { status });

// ─── Admin only ───────────────────────────────────────────────────────────────

export const assignOperator = (requestId: string, operatorId: string) =>
  api.patch<OtcRequest>(`/requests/${requestId}/assign`, { operatorId });

// Clients can call this for their own requests; operators/admins for any request
export const getRequestEvents = (id: string) =>
  api.get<EventLog[]>(`/requests/${id}/events`);
```

---

## 6. CHAT (REST history + Socket.IO realtime)

### REST — fetch history on mount

```typescript
// src/services/chat.service.ts
import { api } from '../lib/api';
import type { Message } from '../types/api';

export const getChatHistory = (requestId: string) =>
  api.get<Message[]>(`/requests/${requestId}/messages`);
```

### Socket.IO — realtime messaging

```typescript
// src/lib/socket.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(accessToken: string): Socket {
  if (socket?.connected) return socket;

  socket = io('http://localhost:3000/ws', {
    auth: { token: accessToken },    // JWT from login/register response
    transports: ['websocket'],
    autoConnect: true,
  });

  socket.on('connect_error', (err) => {
    console.error('[WS] connection error:', err.message);
  });

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
```

```typescript
// src/hooks/useChat.ts
import { useEffect, useRef, useState } from 'react';
import { getSocket } from '../lib/socket';
import type { Message } from '../types/api';

export function useChat(requestId: string, accessToken: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const socket = getSocket(accessToken);

    // Join the room for this specific request
    socket.emit('join:request', requestId);

    // Listen for new messages
    socket.on('message:new', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Listen for typing indicator
    socket.on('typing', () => {
      setIsTyping(true);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setIsTyping(false), 2000);
    });

    return () => {
      socket.emit('leave:request', requestId);
      socket.off('message:new');
      socket.off('typing');
    };
  }, [requestId, accessToken]);

  const sendMessage = (content: string) => {
    const socket = getSocket(accessToken);
    socket.emit('message:send', { requestId, content });
  };

  const sendTyping = () => {
    const socket = getSocket(accessToken);
    socket.emit('typing', requestId);
  };

  return { messages, isTyping, sendMessage, sendTyping };
}
```

### Operator queue — listen for new requests

```typescript
// In the operator's request list component:
useEffect(() => {
  const socket = getSocket(accessToken);

  socket.on('request:new', (req: OtcRequest) => {
    // Add to list or show notification
  });

  socket.on('request:updated', (req: OtcRequest) => {
    // Update existing request in list
  });

  return () => {
    socket.off('request:new');
    socket.off('request:updated');
  };
}, [accessToken]);
```

---

## 7. ADMIN ENDPOINTS

```typescript
// src/services/admin.service.ts
import { api } from '../lib/api';
import type { Invite, User } from '../types/api';
import type { Role } from '../types/api';

export const createInvite = (payload: {
  role: Role.CLIENT | Role.OPERATOR;
  expiresInHours?: number;
}) => api.post<Invite>('/admin/invites', payload);

export const listInvites = () =>
  api.get<Invite[]>('/admin/invites');

export const listOperators = () =>
  api.get<User[]>('/admin/operators');
```

---

## 8. ERROR HANDLING

```typescript
// src/lib/handle-error.ts
import { AxiosError } from 'axios';
import type { ApiError } from '../types/api';

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError | undefined;
    if (!apiError) return 'Network error. Please try again.';

    const { message } = apiError;

    if (typeof message === 'string') return message;

    // Validation errors come as { field: ['msg1', 'msg2'] }
    if (typeof message === 'object') {
      return Object.values(message).flat().join(', ');
    }
  }
  return 'An unexpected error occurred.';
}
```

---

## 9. ENVIRONMENT VARIABLES

Add to your frontend's `.env`:

```bash
VITE_API_URL=http://localhost:3000/api/v1
VITE_WS_URL=http://localhost:3000
```

For production replace `localhost:3000` with your domain (nginx proxies `/api/` and `/ws/`).

---

## 10. APP STRUCTURE BY ROLE

After login, route the user based on `user.role`:

| Role | Route | What to show |
|------|-------|-------------|
| `client` | `/app/requests` | `GET /requests/my` list + create form |
| `client` | `/app/requests/:id` | Request detail + chat |
| `operator` | `/operator/queue` | `GET /requests` (WS: `request:new`) |
| `operator` | `/operator/requests/:id` | Detail + chat + status controls |
| `admin` | `/admin/invites` | Generate + list invites |
| `admin` | `/admin/operators` | Operator list |

---

## 11. STATUS MACHINE (UI STATE)

Use this map to decide which status buttons to show:

```typescript
export const ALLOWED_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  [RequestStatus.NEW]:         [RequestStatus.ASSIGNED, RequestStatus.CANCELLED],
  [RequestStatus.ASSIGNED]:    [RequestStatus.IN_PROGRESS, RequestStatus.CANCELLED],
  [RequestStatus.IN_PROGRESS]: [RequestStatus.COMPLETED, RequestStatus.CANCELLED],
  [RequestStatus.COMPLETED]:   [],
  [RequestStatus.CANCELLED]:   [],
};

// Usage in component:
const nextStatuses = ALLOWED_TRANSITIONS[request.status];
// Render a button for each entry in nextStatuses
```

---

## 12. INVITE REGISTRATION PAGE

When user visits `/register?invite=CODE`:

```typescript
// 1. On mount: validate invite (GET /invite/:code)
const inviteCode = new URLSearchParams(location.search).get('invite');
const { data: invite } = await validateInvite(inviteCode);
// Show error if invite expired/used, otherwise show registration form

// 2. User enters phone → send SMS code (POST /auth/send-code)
await sendCode(phone);
// Show input field for the SMS code

// 3. User enters SMS code + name → register  (POST /auth/register)
// NOTE: /register verifies the code inline — do NOT call /verify-code separately
const { data } = await register({ phone, code: smsCode, inviteCode, name });
localStorage.setItem('refresh_token', data.refreshToken);
// Save user to auth state, redirect to role-appropriate home
```

---

## 13. NOTES FOR THE AI ASSISTANT

- **All responses are wrapped** in `{ data, timestamp }` — the axios interceptor above unwraps them, so service functions receive `T` directly.
- **Cookies are HTTP-only** — you cannot read `access_token` from `document.cookie`. Only store `refreshToken` in localStorage.
- **CORS** is configured for `localhost:3001` and `localhost:3002` by default. If your dev server runs on a different port, add it to `.env` → `CORS_ORIGINS` on the backend.
- **WebSocket auth** is done via `socket.io-client` handshake `auth.token`, NOT via a cookie. Pass the `accessToken` string you get back from login/register.
- **Swagger docs** at `http://localhost:3000/docs` — try any endpoint directly in the browser with the "Authorize" button (paste your `accessToken`).
- **SMS codes** are mocked in development — check the **backend terminal** output for the code instead of waiting for a real SMS.
- The `amount` field returns as a decimal string from Postgres — convert with `Number(request.amount)` before display.
- Do **not** store `accessToken` in localStorage — it is already in the HTTP-only cookie. Only `refreshToken` goes to localStorage.
- **`GET /requests/:id/events`** is now accessible by clients too — they can see status change history for their own requests. Clients get a 403 if they try to fetch events for someone else's request.
- **WebSocket `message:send`** — make sure the `requestId` in the payload belongs to a request the user has access to. Clients must own the request; operators must be assigned to it; admins can message on any request.
- When connecting the socket, always pass the raw `accessToken` string (from the login/register response body), **not** the cookie value.
