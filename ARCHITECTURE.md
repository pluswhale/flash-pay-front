# QuickPay — Production Architecture & Development Plan

**Document type:** Technical specification & estimate  
**Version:** 1.0  
**Date:** March 2026  
**Audience:** Engineering team, tech lead, product management

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Audit](#2-current-state-audit)
3. [Target Architecture](#3-target-architecture)
4. [Database Design](#4-database-design)
5. [Backend API Breakdown](#5-backend-api-breakdown)
6. [Real-time Layer (WebSockets)](#6-real-time-layer-websockets)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Background Job System](#8-background-job-system)
9. [Infrastructure & DevOps](#9-infrastructure--devops)
10. [Security](#10-security)
11. [Frontend Integration Changes](#11-frontend-integration-changes)
12. [Feature Breakdown & Estimates](#12-feature-breakdown--estimates)
13. [Team Composition](#13-team-composition)
14. [Risks & Unknowns](#14-risks--unknowns)
15. [Timeline Summary](#15-timeline-summary)

---

## 1. Executive Summary

QuickPay is an OTC cryptocurrency exchange platform with dual surfaces: a client exchange portal and an operator CRM. The current frontend prototype (~4,000 LOC, React 18 + TypeScript) provides a high-fidelity UI with mocked state. All state transitions, authentication, and real-time updates are simulated.

**Goal:** Deliver a production-grade full-stack system in ~14 weeks with a 4–5 person team.

**Core stack recommendation:**

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite (current, extend) |
| API Gateway | Node.js + Fastify |
| Real-time | Socket.IO over WebSocket |
| Background jobs | BullMQ + Redis |
| Database | PostgreSQL (primary) + Redis (cache/sessions) |
| Auth | JWT (access + refresh) + TOTP for operators |
| Deployment | AWS (ECS Fargate + RDS + ElastiCache) |
| CI/CD | GitHub Actions |
| Monitoring | Grafana + Prometheus + Sentry |

---

## 2. Current State Audit

### ✅ Already Built (Frontend Mock)

| Component | File(s) | Status |
|---|---|---|
| Exchange widget (amounts, rate calc, swap) | `ExchangeWidget.tsx` | ✅ Mock |
| Deal creation flow (UI only) | `ExchangeWidget.tsx`, `dealStore.ts` | ✅ Mock |
| Deal window (status, requisites, copy) | `DealWindow.tsx` | ✅ Mock |
| Deal page with timeline | `DealPage.tsx` | ✅ Mock |
| Operator CRM layout | `OperatorPage.tsx` | ✅ Mock |
| Operator request queue | `RequestQueue.tsx` | ✅ Mock |
| Operator chat | `MainChat.tsx` | ✅ Mock |
| Operator context panel / RFQ | `ContextPanel.tsx` | ✅ Mock |
| Partner chat | `PartnerChat.tsx` | ✅ Mock |
| Market rates modal | `RatesModal.tsx` | ✅ Mock |
| Support chat | `SupportChat.tsx` | ✅ Mock |
| Auth modal (login/register, 3 methods) | `AuthPage.tsx`, `QuickAuthModal.tsx` | ✅ Mock |
| Client dashboard (deals, referrals) | `DashboardPage.tsx` | ✅ Mock |
| Currency corridors | `CorridorsPage.tsx`, `corridors.ts` | ✅ Static data |
| Money transfer form | `MoneyTransferForm.tsx` | ✅ UI only |
| Country/city selection | `CountrySelect.tsx` | ✅ Static data |
| i18n (EN/RU) | `i18n/` | ✅ Complete |
| Dark/light theme | `uiStore.ts` | ✅ Complete |
| Deal status machine (types) | `types/index.ts` | ✅ Types only |
| Mock API layer | `services/mockApi.ts` | ✅ Stubs |

### ❌ Not Yet Built (Needs Backend)

- Real authentication (JWT, sessions, refresh tokens)
- Real deal state persistence
- Real-time deal status push (WebSocket)
- Rate fetching from live exchanges (Bybit, Binance, Rapira)
- Payment confirmation flow
- Operator–client messaging (real-time)
- Admin panel
- KYC/KYB integration hooks
- AML screening
- Referral accounting
- Audit log persistence
- Payment requisites pool management
- Background job processing
- Email/SMS/Telegram notifications
- Reporting / transaction history export

---

## 3. Target Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                               │
│  React SPA (Vite)  ←→  Socket.IO client  ←→  REST API calls    │
└─────────────┬───────────────────────────────────────────────────┘
              │ HTTPS / WSS
┌─────────────▼───────────────────────────────────────────────────┐
│                     API GATEWAY TIER                             │
│  AWS ALB  →  ECS (Fastify API)  +  ECS (WS Server)             │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │  Auth Service   │  │  Deal Service   │  │  Rate Service  │  │
│  │  (JWT / roles)  │  │  (state machine)│  │  (aggregator)  │  │
│  └─────────────────┘  └─────────────────┘  └────────────────┘  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │  Chat Service   │  │ Payment Service │  │  Notif Service │  │
│  │  (messages)     │  │  (requisites)   │  │  (email/TG/SMS)│  │
│  └─────────────────┘  └─────────────────┘  └────────────────┘  │
└─────────────┬──────────────────┬──────────────────┬────────────┘
              │                  │                  │
┌─────────────▼──────┐ ┌────────▼────────┐ ┌───────▼───────────┐
│   PostgreSQL (RDS)  │ │  Redis Cluster  │ │   BullMQ Workers  │
│   Primary DB        │ │  Cache/Sessions │ │   (job queues)    │
│   Read replicas     │ │  Pub/Sub for WS │ │                   │
└────────────────────┘ └─────────────────┘ └───────────────────┘
              │
┌─────────────▼──────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│  Bybit API  │  Binance API  │  Rapira API  │  Twilio / SMSC    │
│  Telegram Bot API           │  SendGrid    │  KYC provider     │
└─────────────────────────────────────────────────────────────────┘
```

### Service decomposition

The backend starts as a **modular monolith** (single Fastify app with domain modules) and can be split into microservices later. Early microservice split adds coordination complexity with no benefit at this scale.

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/           # JWT, sessions, roles
│   │   ├── users/          # Profile, KYC status, limits
│   │   ├── deals/          # State machine, audit log
│   │   ├── rates/          # Rate aggregation, corridors
│   │   ├── payments/       # Requisites pool, confirmations
│   │   ├── chat/           # Client-operator messages
│   │   ├── notifications/  # Email, SMS, Telegram
│   │   ├── referrals/      # Tracking, payouts
│   │   └── admin/          # Internal tooling
│   ├── ws/                 # Socket.IO server
│   ├── jobs/               # BullMQ queue definitions
│   ├── workers/            # BullMQ processors
│   ├── db/                 # Prisma schema, migrations
│   ├── lib/                # Shared utilities, errors, logger
│   └── main.ts
├── prisma/
│   └── schema.prisma
├── Dockerfile
└── package.json
```

---

## 4. Database Design

**Choice: PostgreSQL 16**  
Rationale: Financial data requires ACID transactions, foreign key constraints, and audit trails. JSONB for flexible metadata. Row-level security for multi-tenancy.

### Schema

```sql
-- Users (clients, operators, admins)
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  login           VARCHAR(64) UNIQUE NOT NULL,
  phone           VARCHAR(20) UNIQUE,
  telegram_id     BIGINT UNIQUE,
  telegram_handle VARCHAR(64),
  password_hash   TEXT,               -- bcrypt, nullable for OAuth-only
  role            user_role NOT NULL DEFAULT 'client',
  kyc_status      kyc_status NOT NULL DEFAULT 'none',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  referral_code   VARCHAR(16) UNIQUE NOT NULL,
  referred_by     UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TYPE user_role AS ENUM ('client', 'operator', 'admin');
CREATE TYPE kyc_status AS ENUM ('none', 'pending', 'verified', 'rejected');

-- Refresh tokens
CREATE TABLE refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  ip_address  INET,
  user_agent  TEXT,
  revoked_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON refresh_tokens (user_id, revoked_at);

-- Corridors (exchange directions)
CREATE TABLE corridors (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency VARCHAR(10) NOT NULL,
  to_currency   VARCHAR(10) NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  spread_pct    NUMERIC(5,4) NOT NULL DEFAULT 0.01,  -- 1%
  min_amount    NUMERIC(24,8),
  max_amount    NUMERIC(24,8),
  UNIQUE(from_currency, to_currency)
);

-- Rates (fetched from exchanges, stored per tick)
CREATE TABLE rates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corridor_id   UUID NOT NULL REFERENCES corridors(id),
  source        VARCHAR(32) NOT NULL,  -- 'bybit', 'rapira', 'manual'
  bid           NUMERIC(24,8) NOT NULL,
  ask           NUMERIC(24,8) NOT NULL,
  mid           NUMERIC(24,8) GENERATED ALWAYS AS ((bid + ask) / 2) STORED,
  fetched_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON rates (corridor_id, fetched_at DESC);

-- Deals (central entity)
CREATE TABLE deals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         UUID NOT NULL REFERENCES users(id),
  operator_id       UUID REFERENCES users(id),
  corridor_id       UUID NOT NULL REFERENCES corridors(id),
  status            deal_status NOT NULL DEFAULT 'AWAITING_PAYMENT',
  from_currency     VARCHAR(10) NOT NULL,
  to_currency       VARCHAR(10) NOT NULL,
  send_amount       NUMERIC(24,8) NOT NULL,
  receive_amount    NUMERIC(24,8) NOT NULL,
  rate              NUMERIC(24,8) NOT NULL,
  spread_pct        NUMERIC(5,4) NOT NULL,
  rate_locked_until TIMESTAMPTZ NOT NULL,
  payment_method    VARCHAR(64),
  client_ref        VARCHAR(128),       -- wallet address, card, etc.
  risk_score        SMALLINT,
  is_high_value     BOOLEAN NOT NULL DEFAULT false,
  partner_quote     JSONB,
  metadata          JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at      TIMESTAMPTZ,
  cancelled_at      TIMESTAMPTZ,
  expires_at        TIMESTAMPTZ          -- rate lock expiry
);
CREATE TYPE deal_status AS ENUM (
  'AWAITING_PAYMENT', 'PAYMENT_RECEIVED', 'VERIFICATION',
  'PAYOUT_SENT', 'COMPLETED', 'CANCELLED', 'REFUND', 'EXPIRED'
);
CREATE INDEX ON deals (client_id, created_at DESC);
CREATE INDEX ON deals (operator_id, status);
CREATE INDEX ON deals (status, created_at);

-- Payment requisites pool
CREATE TABLE payment_requisites (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency        VARCHAR(10) NOT NULL,
  type            VARCHAR(32) NOT NULL,   -- 'bank', 'crypto', 'card'
  value           TEXT NOT NULL,           -- address, IBAN, card number
  label           VARCHAR(128),
  is_active       BOOLEAN NOT NULL DEFAULT true,
  daily_limit     NUMERIC(24,8),
  used_today      NUMERIC(24,8) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Deal <-> Requisite assignment
CREATE TABLE deal_requisites (
  deal_id       UUID NOT NULL REFERENCES deals(id),
  requisite_id  UUID NOT NULL REFERENCES payment_requisites(id),
  assigned_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(deal_id, requisite_id)
);

-- Audit log (immutable)
CREATE TABLE deal_audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id     UUID NOT NULL REFERENCES deals(id),
  actor_id    UUID REFERENCES users(id),
  actor_role  user_role,
  action      VARCHAR(128) NOT NULL,
  from_status deal_status,
  to_status   deal_status,
  metadata    JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON deal_audit_log (deal_id, created_at DESC);

-- Messages (client ↔ operator)
CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id     UUID NOT NULL REFERENCES deals(id),
  sender_id   UUID NOT NULL REFERENCES users(id),
  sender_role user_role NOT NULL,
  body        TEXT NOT NULL,
  kind        message_kind NOT NULL DEFAULT 'text',
  metadata    JSONB,                    -- attachment URL, etc.
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TYPE message_kind AS ENUM ('text', 'image', 'system', 'status_change');
CREATE INDEX ON messages (deal_id, created_at);

-- Operator partner messages (internal)
CREATE TABLE partner_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id     UUID NOT NULL REFERENCES deals(id),
  operator_id UUID NOT NULL REFERENCES users(id),
  partner_id  UUID REFERENCES users(id),
  body        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Referrals
CREATE TABLE referral_payouts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id   UUID NOT NULL REFERENCES users(id),
  deal_id       UUID NOT NULL REFERENCES deals(id),
  amount        NUMERIC(24,8) NOT NULL,
  currency      VARCHAR(10) NOT NULL DEFAULT 'USDT',
  paid_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Operator shifts
CREATE TABLE operator_shifts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id   UUID NOT NULL REFERENCES users(id),
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at      TIMESTAMPTZ,
  deals_handled INTEGER NOT NULL DEFAULT 0,
  volume_usdt   NUMERIC(24,8) NOT NULL DEFAULT 0
);
```

**Redis usage (ElastiCache):**

| Key pattern | TTL | Purpose |
|---|---|---|
| `session:{userId}` | 15 min | Access token blacklist / fast auth |
| `rate:{corridorId}` | 30 s | Latest rate cache |
| `deal:lock:{dealId}` | 5 s | Distributed deal state lock |
| `req:pool:{currency}` | — | Requisites pool state |
| `ws:rooms:{dealId}` | — | Socket.IO room membership (pub/sub) |
| `ratelimit:{ip}:{endpoint}` | 1 min | Rate limiting |

---

## 5. Backend API Breakdown

**Tech choice: Fastify (Node.js)**  
Rationale: 2–3× faster than Express, native TypeScript support, JSON Schema validation built-in, good plugin ecosystem, proven at scale.

**Alternative considered:** NestJS — adds structure but heavy abstraction; Fastify gives same safety with less overhead.

### REST Endpoints

```
POST   /auth/register              → create user, return tokens
POST   /auth/login                 → credentials/phone/telegram
POST   /auth/refresh               → refresh access token
POST   /auth/logout                → revoke refresh token
POST   /auth/send-otp              → send SMS OTP
POST   /auth/verify-otp            → verify OTP, issue tokens

GET    /users/me                   → own profile
PATCH  /users/me                   → update profile fields
GET    /users/me/deals             → paginated deal history
GET    /users/me/referrals         → referral stats + payouts

GET    /corridors                  → all active corridors
GET    /corridors/:id              → single corridor detail
GET    /rates/current              → current rates for all corridors
GET    /rates/:corridorId          → rate history (OHLC for chart)

POST   /deals                      → create deal (locks rate)
GET    /deals/:id                  → get deal detail
GET    /deals/:id/messages         → paginated messages
POST   /deals/:id/messages         → send message
POST   /deals/:id/confirm-payment  → client marks payment sent
POST   /deals/:id/cancel           → client or operator cancel

# Operator endpoints
GET    /operator/queue             → pending deals (with filters)
POST   /operator/deals/:id/assign → assign deal to self
POST   /operator/deals/:id/status → advance status
POST   /operator/deals/:id/rfq    → request partner quote
GET    /operator/shifts/current    → current shift stats
POST   /operator/shifts/start      → start shift
POST   /operator/shifts/end        → end shift
GET    /operator/rates             → market rates panel

# Admin endpoints
GET    /admin/users                → list + filter users
PATCH  /admin/users/:id/kyc       → update KYC status
GET    /admin/deals                → all deals + filters
GET    /admin/reports/volume       → volume aggregation
POST   /admin/rates/manual         → set manual rate override
GET    /admin/requisites           → pool management
POST   /admin/requisites           → add requisite
PATCH  /admin/requisites/:id       → toggle active / update limits
```

### Key API design decisions

- **Pagination:** cursor-based (not offset) for all list endpoints. Uses `createdAt + id` composite cursor for stability.
- **Rate locking:** `POST /deals` atomically reads current rate, applies spread, stores it, and sets `rate_locked_until = now() + 15 min`.
- **Distributed lock:** Redis `SET NX EX` on `deal:lock:{dealId}` for all status transitions to prevent race conditions.
- **Idempotency keys:** All `POST` mutation endpoints accept `Idempotency-Key` header — stored in Redis for 24h to handle client retries safely.
- **GraphQL consideration:** Rejected. The data model is relational and well-defined. REST + WebSocket covers all use cases without the overhead of a GraphQL layer.

---

## 6. Real-time Layer (WebSockets)

**Choice: Socket.IO** (with `@socket.io/redis-adapter` for horizontal scaling)

### Event map

```typescript
// Server → Client
type ServerEvents = {
  'deal:updated':     { dealId: string; status: DealStatus; updatedAt: string }
  'deal:message':     { dealId: string; message: MessageDTO }
  'deal:rate:expiry': { dealId: string; expiresAt: string }
  'deal:assigned':    { dealId: string; operatorId: string }
  'operator:queue':   { deals: DealSummaryDTO[] }        // full queue refresh
  'operator:deal:new':{ deal: DealSummaryDTO }           // new deal arrives
  'rate:update':      { corridorId: string; rate: RateDTO }
  'notification':     { kind: string; body: string; meta: object }
}

// Client → Server
type ClientEvents = {
  'deal:join':    { dealId: string }     // join deal room
  'deal:leave':   { dealId: string }     // leave deal room
  'message:send': { dealId: string; body: string; kind: 'text' | 'image' }
  'message:read': { dealId: string; messageId: string }
  'operator:shift:ping': {}              // heartbeat for active shift
}
```

### Room strategy

```
Room: deal:{dealId}          → client + assigned operator
Room: operator:queue         → all operators with active shift
Room: user:{userId}          → personal notifications per user
Room: admin                  → admin broadcast room
```

### Horizontal scaling

```
Load Balancer (sticky sessions / IP hash)
    ↓                ↓
WS Server 1      WS Server 2
    └─────────────────┘
        Redis Pub/Sub
    (socket.io-redis-adapter)
```

All WS servers subscribe to Redis pub/sub. When deal status changes in any API pod, it publishes to `deal:{dealId}` Redis channel → all subscribed WS servers emit to their connected clients in that room.

---

## 7. Authentication & Authorization

### Token strategy

```
Access token:   JWT, HS256, 15 min TTL, payload: { sub, role, sessionId }
Refresh token:  Opaque UUID, stored hashed in DB, 30-day TTL, rotated on use
```

**No access token blacklisting** (short TTL means no need). Refresh token rotation invalidates compromised sessions within 15 minutes.

### Role matrix

| Endpoint group | client | operator | admin |
|---|---|---|---|
| `GET /deals/:id` (own) | ✅ | ✅ | ✅ |
| `GET /deals/:id` (others') | ❌ | ✅ (assigned) | ✅ |
| `POST /operator/deals/:id/status` | ❌ | ✅ | ✅ |
| `GET /admin/*` | ❌ | ❌ | ✅ |
| `POST /admin/rates/manual` | ❌ | ❌ | ✅ |

### Operator TOTP (2FA)

Operators must enable TOTP (Google Authenticator / Authy) before first shift. Verified on every `POST /operator/shifts/start`. Use `otpauth` npm library, store encrypted TOTP secret in DB.

### Middleware stack

```typescript
// Fastify middleware order
app.addHook('onRequest', rateLimitPlugin)       // Redis-based per IP
app.addHook('onRequest', verifyJWT)             // sets req.user
app.addHook('onRequest', requireRole(roles))    // RBAC check
app.addHook('onRequest', requireActiveUser)     // account not banned
```

---

## 8. Background Job System

**Choice: BullMQ + Redis**  
Rationale: Tight Redis integration (same infra as cache/pub-sub), excellent TypeScript support, retry policies, dead-letter queues, job scheduling, and visibility via BullBoard dashboard.

### Job queues

```
queue: rate-fetcher          priority: high,  concurrency: 5
  └─ FetchRatesJob           every 30s per corridor
     → fetches Bybit/Rapira APIs
     → stores in rates table
     → publishes to Redis rate:{corridorId}

queue: deal-expiry           priority: high,  concurrency: 20
  └─ CheckRateLockJob        runs at deal.rate_locked_until
     → if deal still AWAITING_PAYMENT → mark EXPIRED
     → send notification to client

queue: deal-simulator        priority: normal (DEV ONLY)
  └─ SimulateOperatorJob     5s after deal created in dev
     → auto-advance status for testing

queue: notifications         priority: normal, concurrency: 10
  └─ SendEmailJob            triggered by deal status changes
  └─ SendSMSJob              triggered by OTP requests, deal events
  └─ SendTelegramJob         Telegram bot notifications

queue: referrals             priority: low,   concurrency: 5
  └─ CalculateReferralJob    on deal COMPLETED
     → calculate 0.5% of volume
     → create referral_payout record

queue: reports               priority: low,   concurrency: 2
  └─ GenerateVolumeReportJob daily at 00:00 UTC
     → aggregate completed deal volume
     → store in reports table or S3

queue: aml-screening         priority: high,  concurrency: 5
  └─ AMLScreenJob            on deal creation
     → check wallet/card against sanctions lists
     → set risk_score on deal
     → flag if score > threshold
```

### Retry policy

```typescript
const defaultJobOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
  removeOnComplete: { count: 1000 },
  removeOnFail:     { count: 5000 },
}
```

### Scheduled jobs (cron)

```
0 * * * *     → pool:reset-daily-limits    (reset requisite daily usage)
*/30 * * * *  → rates:fetch-all            (global rate snapshot even if specific ones fail)
0 0 * * *     → reports:daily-volume       (daily summary)
*/5 * * * *   → deals:check-expired        (safety net for missed expiry jobs)
```

---

## 9. Infrastructure & DevOps

### Cloud: AWS

Rationale: Mature ecosystem, RDS for PostgreSQL with automated backups, ElastiCache for Redis, ECS Fargate for zero-server management, ALB for load balancing.

```
                          ┌─────────────┐
                          │  CloudFront │ (CDN for SPA)
                          └──────┬──────┘
                                 │
                          ┌──────▼──────┐
                          │     ALB     │ (Application Load Balancer)
                          └──┬───────┬──┘
                    HTTPS/WS │       │ REST
              ┌──────────────┘       └──────────────┐
    ┌─────────▼──────────┐            ┌─────────────▼──────────┐
    │  ECS: WS Service   │            │  ECS: API Service      │
    │  (Socket.IO)       │            │  (Fastify REST)        │
    │  2–4 tasks, 0.5vCPU│            │  2–6 tasks, 1vCPU each │
    └─────────┬──────────┘            └─────────────┬──────────┘
              │                                     │
    ┌─────────▼─────────────────────────────────────▼──────────┐
    │                    ECS: Worker Service                    │
    │                    (BullMQ processors)                    │
    │                    2 tasks, 1vCPU each                    │
    └─────────┬─────────────────────────────────────┬──────────┘
              │                                     │
    ┌─────────▼──────────┐            ┌─────────────▼──────────┐
    │  RDS PostgreSQL     │            │  ElastiCache Redis     │
    │  db.t4g.medium      │            │  cache.t4g.medium      │
    │  Multi-AZ, 1 replica│            │  Cluster mode off      │
    └────────────────────┘            └────────────────────────┘
```

### Environment tiers

| Environment | Purpose | Infra |
|---|---|---|
| `local` | Developer machine | Docker Compose (Postgres + Redis) |
| `dev` | Integration testing, auto-deployed on `main` push | ECS single-task, shared RDS |
| `staging` | Pre-release validation, production data shape | ECS multi-task, separate RDS |
| `production` | Live users | ECS multi-task, Multi-AZ RDS |

### Docker Compose (local dev)

```yaml
services:
  api:
    build: ./backend
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgres://qp:qp@postgres:5432/quickpay
      REDIS_URL: redis://redis:6379
    depends_on: [postgres, redis]
  
  worker:
    build: ./backend
    command: node dist/workers/index.js
    depends_on: [postgres, redis]
  
  postgres:
    image: postgres:16-alpine
    environment: { POSTGRES_USER: qp, POSTGRES_PASSWORD: qp, POSTGRES_DB: quickpay }
    volumes: ["pg_data:/var/lib/postgresql/data"]
  
  redis:
    image: redis:7-alpine
    volumes: ["redis_data:/data"]
  
  bullboard:
    image: deadly0/bull-board
    ports: ["3001:3000"]
    environment: { REDIS_HOST: redis }
```

### CI/CD (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main, staging]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: npm ci
      - name: Type check
        run: npx tsc --noEmit
      - name: Unit tests
        run: npm test
      - name: Integration tests
        run: docker compose -f docker-compose.test.yml up --exit-code-from api
  
  build:
    needs: test
    steps:
      - name: Build Docker image
        run: docker build -t $ECR_REGISTRY/quickpay-api:$SHA .
      - name: Push to ECR
        run: docker push $ECR_REGISTRY/quickpay-api:$SHA
  
  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/staging'
    steps:
      - name: Update ECS service
        run: aws ecs update-service --cluster quickpay-staging --service api --force-new-deployment
  
  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: production    # requires manual approval in GitHub
    steps:
      - name: Run DB migrations
        run: aws ecs run-task ... -- npx prisma migrate deploy
      - name: Blue/green deploy via ECS
        run: aws ecs update-service --cluster quickpay-prod --service api
```

### Environment variables (managed via AWS Secrets Manager)

```bash
# Core
DATABASE_URL=
REDIS_URL=
JWT_SECRET=           # 64-byte random, rotated quarterly
JWT_REFRESH_SECRET=
APP_ENV=              # local | dev | staging | production

# External APIs
BYBIT_API_KEY=
BYBIT_API_SECRET=
RAPIRA_API_KEY=
TELEGRAM_BOT_TOKEN=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
SENDGRID_API_KEY=

# Monitoring
SENTRY_DSN=

# Feature flags
ENABLE_AML_SCREENING=true
ENABLE_KYC=false      # phase 2
```

### Monitoring & Observability

```
Metrics:     Prometheus (custom metrics) → Grafana dashboards
Logs:        Pino (structured JSON) → CloudWatch → Grafana Loki
Errors:      Sentry (frontend + backend, with release tracking)
APM:         OpenTelemetry → Grafana Tempo (distributed traces)
Uptime:      AWS Route53 health checks + PagerDuty alerts
DB:          pgBadger + RDS Performance Insights
Queue:       BullBoard (BullMQ UI) — internal only, behind basic auth
```

**Key dashboards to build:**
- Deal funnel: created → completed conversion rate by corridor
- P50/P95/P99 API response times per endpoint
- Active WebSocket connections over time
- Queue depth per job type
- Rate fetch latency per exchange source
- Error rate by module

**Alerting rules:**
- API error rate > 1% for 5 min → PagerDuty
- Deal stuck in AWAITING_PAYMENT > 30 min → Slack + operator notification
- Rate fetch failing for > 2 min → PagerDuty (blocks deal creation)
- Queue depth > 500 jobs → Slack warning
- DB connection pool > 80% → Slack warning

---

## 10. Security

### Input validation

All API inputs validated with JSON Schema (Fastify native) before reaching business logic. TypeBox used for schema-type sync.

```typescript
const createDealSchema = Type.Object({
  corridorId:    Type.String({ format: 'uuid' }),
  sendAmount:    Type.Number({ minimum: 10, maximum: 500000 }),
  paymentMethod: Type.String({ maxLength: 64 }),
  clientRef:     Type.Optional(Type.String({ maxLength: 128 })),
})
```

### Rate limiting

```
POST /auth/*        → 5 req/min per IP
POST /deals         → 10 req/min per user
GET  /rates/*       → 60 req/min per IP
*    /admin/*       → 30 req/min per user
```

### Security headers (via `@fastify/helmet`)

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: [configured per env]
```

### Sensitive data

- Passwords: bcrypt, cost factor 12
- TOTP secrets: AES-256-GCM encrypted at rest (KMS key)
- Payment requisite values: AES-256-GCM encrypted in DB
- PII (phone, telegram): stored, never logged
- Card numbers: masked in logs (4276 **** **** 5678)
- All logs: scrubbed for tokens, passwords, card data

### CORS

```typescript
fastify.register(cors, {
  origin: ['https://quickpay.io', 'https://app.quickpay.io'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
})
```

### Database security

- RDS in private subnet, no public access
- Separate DB users: `api_rw` (app), `api_ro` (read replicas), `migrator` (CI/CD only)
- Row-level security for multi-tenant isolation (future)
- Automated daily backups, 7-day retention, tested monthly restore

---

## 11. Frontend Integration Changes

The frontend mock layer needs to be replaced with real API calls. Key changes:

### Replace mockApi.ts

```typescript
// src/services/api.ts  (new — replaces mockApi.ts)
import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

// Interceptor: attach Bearer token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Interceptor: auto-refresh on 401
api.interceptors.response.use(null, async (error) => {
  if (error.response?.status === 401) {
    const ok = await useAuthStore.getState().refreshToken()
    if (ok) return api.request(error.config)
    useAuthStore.getState().logout()
  }
  return Promise.reject(error)
})
```

### Socket.IO client

```typescript
// src/services/socket.ts
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function connectSocket(token: string) {
  socket = io(import.meta.env.VITE_WS_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  })

  socket.on('deal:updated', (payload) => {
    useDealStore.getState().syncDeal(payload)
  })
  socket.on('deal:message', (payload) => {
    useDealStore.getState().addMessage(payload.dealId, payload.message)
  })
  socket.on('rate:update', (payload) => {
    useRateStore.getState().updateRate(payload)
  })

  return socket
}

export const joinDeal = (dealId: string) => socket?.emit('deal:join', { dealId })
export const leaveDeal = (dealId: string) => socket?.emit('deal:leave', { dealId })
```

### Auth store updates

The existing `authStore.ts` mock needs to make real API calls:

```typescript
login: async (login, password) => {
  const { data } = await api.post('/auth/login', { login, password })
  set({ user: data.user, accessToken: data.accessToken })
  // refresh token is httpOnly cookie, no JS access
  connectSocket(data.accessToken)
  return true
}
```

### React Query for server state

Add `@tanstack/react-query` for data fetching, caching, and background refetch:

```typescript
// src/hooks/useDeal.ts
export function useDeal(id: string) {
  return useQuery({
    queryKey: ['deal', id],
    queryFn: () => api.get(`/deals/${id}`).then(r => r.data),
    staleTime: 0,  // always refetch (WS keeps fresh anyway)
    refetchOnWindowFocus: false,
  })
}

// src/hooks/useDeals.ts
export function useDeals(filters: DealFilters) {
  return useInfiniteQuery({
    queryKey: ['deals', filters],
    queryFn: ({ pageParam }) => api.get('/users/me/deals', { params: { cursor: pageParam, ...filters } }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}
```

### Environment config

```bash
# .env.local
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000

# .env.production
VITE_API_URL=https://api.quickpay.io
VITE_WS_URL=wss://api.quickpay.io
```

---

## 12. Feature Breakdown & Estimates

> **Assumptions:**
> - Mid-to-senior team (1 lead, 2 backend, 1 frontend, 1 DevOps)
> - 8-hour working days
> - Estimates include: design, implementation, unit tests, code review
> - Estimates do NOT include: business requirements clarification, design system changes
> - All features use the current frontend mock as specification

---

### Phase 1 — Foundation (Weeks 1–3)

| Task | Owner | Days | Notes |
|---|---|---|---|
| Backend project scaffold (Fastify, TS, Prisma, Docker) | BE Lead | 2 | Monorepo setup, linting, CI skeleton |
| PostgreSQL schema + Prisma setup | BE | 2 | All tables, indexes, types |
| Redis connection + caching layer | BE | 1 | |
| JWT auth (login/register — credentials) | BE | 3 | Access + refresh tokens, bcrypt |
| Phone OTP auth (Twilio) | BE | 2 | |
| Telegram auth (bot + webhook) | BE | 2 | |
| Auth API integration (frontend) | FE | 3 | Replace mockStore, real tokens, interceptors |
| GitHub Actions CI pipeline | DevOps | 2 | test + build + Docker |
| Dev environment (ECS + RDS + ElastiCache) | DevOps | 2 | Terraform or CDK |
| Socket.IO server setup + Redis adapter | BE | 2 | Auth handshake, room setup |
| Socket.IO client integration (frontend) | FE | 2 | Connect on login, auto-reconnect |
| **Phase 1 Total** | | **23 days** | **~4.6 weeks with 1 person each** |

---

### Phase 2 — Core Deal Flow (Weeks 4–7)

| Task | Owner | Days | Notes |
|---|---|---|---|
| Rate aggregation service (Bybit + Rapira) | BE | 4 | Polling + normalization + spread |
| Rate BullMQ worker + Redis cache | BE | 2 | |
| `POST /deals` — create with rate lock | BE | 3 | Atomic rate lock, requisite assignment |
| Requisites pool management | BE | 2 | Assignment, daily limit tracking |
| Deal state machine + transitions API | BE | 4 | All status hops, guard conditions |
| Distributed lock (Redis) for state transitions | BE | 1 | |
| Audit log recording | BE | 1 | |
| Deal expiry BullMQ worker | BE | 2 | |
| `POST /deals/:id/confirm-payment` | BE | 1 | |
| `POST /deals/:id/cancel` | BE | 1 | |
| WebSocket: deal status push to client | BE | 2 | |
| Frontend: replace deal creation mock | FE | 3 | API call + WS subscription |
| Frontend: real-time status updates | FE | 2 | WS listener → React Query invalidation |
| Frontend: deal page with live timeline | FE | 2 | |
| Frontend: rate display (live from WS) | FE | 1 | |
| **Phase 2 Total** | | **31 days** | |

---

### Phase 3 — Messaging & Operator CRM (Weeks 7–9)

| Task | Owner | Days | Notes |
|---|---|---|---|
| Messages API (send, list, read) | BE | 2 | |
| WebSocket: real-time message delivery | BE | 2 | |
| Operator queue API + WS push | BE | 2 | Deals visible to operators on shift |
| Operator deal assignment | BE | 1 | |
| Operator status advancement API | BE | 1 | |
| Operator RFQ (partner quote request) | BE | 2 | Mock partner, real timing |
| Operator shift tracking | BE | 1 | |
| Frontend: real chat (client ↔ operator) | FE | 3 | Replace SupportChat mock |
| Frontend: operator queue live updates | FE | 2 | |
| Frontend: operator CRM fully connected | FE | 3 | All actions wired to API |
| **Phase 3 Total** | | **19 days** | |

---

### Phase 4 — Notifications, Referrals, Dashboard (Weeks 9–11)

| Task | Owner | Days | Notes |
|---|---|---|---|
| Email notifications (SendGrid) | BE | 2 | Deal events, status changes |
| SMS notifications (Twilio) | BE | 1 | Payment confirmation, OTP |
| Telegram bot notifications | BE | 2 | Optional, high value add |
| Notification BullMQ worker | BE | 1 | |
| Referral calculation worker | BE | 2 | 0.5% on deal completion |
| Referral API endpoints | BE | 1 | |
| User dashboard API (deals history, stats) | BE | 2 | Paginated, filterable |
| Frontend: dashboard connected to real data | FE | 3 | Replace Zustand mock with RQ |
| Frontend: referral block live | FE | 1 | |
| Frontend: notification toasts from WS | FE | 1 | |
| **Phase 4 Total** | | **16 days** | |

---

### Phase 5 — Security, Admin, Production (Weeks 11–14)

| Task | Owner | Days | Notes |
|---|---|---|---|
| Operator TOTP 2FA | BE | 2 | |
| AML screening (basic sanctions check) | BE | 3 | OFAC list or paid API |
| Rate limiting (all endpoints) | BE | 1 | |
| Input validation hardening | BE | 1 | |
| Admin user management API | BE | 2 | |
| Admin deal oversight API | BE | 2 | |
| Admin rate manual override | BE | 1 | |
| Admin requisites pool management | BE | 1 | |
| Production ECS + RDS + CloudFront setup | DevOps | 3 | Terraform, multi-AZ |
| Staging environment | DevOps | 2 | |
| Sentry integration (FE + BE) | DevOps | 1 | |
| Grafana + Prometheus setup | DevOps | 2 | |
| CloudWatch + Loki log pipeline | DevOps | 1 | |
| PagerDuty alerting | DevOps | 1 | |
| Load testing (k6) | BE Lead | 2 | Identify bottlenecks |
| Security audit (internal) | BE Lead | 2 | OWASP Top 10 checklist |
| Penetration test (external vendor) | External | — | Budget separately |
| **Phase 5 Total** | | **27 days** | |

---

### Summary

| Phase | Duration | Engineering Days |
|---|---|---|
| Phase 1: Foundation | Weeks 1–3 | 23 |
| Phase 2: Core Deal Flow | Weeks 4–7 | 31 |
| Phase 3: Messaging & CRM | Weeks 7–9 | 19 |
| Phase 4: Notifications & Dashboard | Weeks 9–11 | 16 |
| Phase 5: Security & Production | Weeks 11–14 | 27 |
| **Total** | **14 weeks** | **116 engineering days** |

> With a 4-person team (2 BE, 1 FE, 1 DevOps), phases run in parallel:
> 116 person-days ÷ 4 people = ~29 calendar days of sustained parallel work.
> Coordination overhead (standups, reviews, blockers) adds ~30% → **~14 weeks** is realistic.

---

## 13. Team Composition

| Role | Count | Responsibilities |
|---|---|---|
| **Tech Lead / Backend** | 1 | Architecture decisions, PR reviews, backend modules: auth, deals, state machine |
| **Backend Engineer** | 1 | Rate aggregation, jobs/workers, notifications, admin API |
| **Frontend Engineer** | 1 | API integration (replace all mocks), React Query, Socket.IO client, admin UI |
| **DevOps / Platform** | 1 | CI/CD, Terraform, ECS, monitoring, alerting, secrets management |
| **(Optional) QA** | 0.5 | E2E tests (Playwright), API integration tests, regression suite |

**Tech Lead responsibilities beyond coding:**
- Approves all DB schema changes
- Reviews all auth and security-sensitive PRs
- Owns incident response during staging/prod issues
- Maintains ADR (Architecture Decision Records)

---

## 14. Risks & Unknowns

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Rate API reliability** (Bybit/Rapira downtime) | Medium | High | Cache last known rate, fallback to manual rate, alert operator |
| **WebSocket scaling** (many simultaneous operators) | Low | Medium | Redis adapter handles horizontal scale; load test early |
| **Payment fraud / fake confirmations** | Medium | High | Operator must verify screenshot; never auto-confirm; AML screening |
| **Regulatory requirements unknown** | High | High | Consult compliance counsel before KYC launch; keep KYC pluggable |
| **DB connection pool exhaustion under load** | Low | High | PgBouncer in transaction mode in front of RDS; pool limit alerting |
| **Redis single point of failure** | Low | High | ElastiCache with replica; Redis Cluster for prod; graceful degradation |
| **Telegram bot rate limits** | Low | Low | Queue all TG messages; exponential backoff |
| **Scope creep (admin, reports, KYC)** | High | Medium | Strict phase gates; admin v1 is read-only; KYC is phase 2+ |
| **Third-party KYC vendor integration** | Low | Medium | Treat as external spike (3 days); Sumsub or Onfido are standard |
| **Mobile app demand** | Unknown | Medium | Keep REST API clean; React Native can reuse API layer; design mobile-first (already done) |

### Unknown decisions requiring business input

1. **Which payment processors?** — determines requisite pool design
2. **KYC thresholds** — what triggers verification? $50K or lower?
3. **AML requirements** — do you need OFAC-only or more comprehensive sanctions?
4. **Telegram bot scope** — notifications only or full deal management via bot?
5. **Operator compensation model** — does the system need to track operator commissions?
6. **Multi-currency settlement** — do operators settle in USDT or in the local currency?
7. **Partner exchange integration** — is Rapira a real API partner? Needs contract + API docs.

---

## 15. Timeline Summary

```
Week 1–3   ████████████████████  Foundation (auth, DB, WS skeleton, CI/CD)
Week 4–7   ████████████████████  Core Deal Flow (rates, deals, state machine)
Week 7–9   ████████████          Messaging & Operator CRM
Week 9–11  █████████████         Notifications, Referrals, Dashboard
Week 11–14 ████████████████████  Security hardening, Admin, Production deploy
           ─────────────────────
           Total: ~14 weeks to production-ready MVP
```

**Go-live checklist (minimum for launch):**
- [x] Auth (all 3 methods)
- [x] Deal creation with rate lock
- [x] Real-time status updates
- [x] Client ↔ Operator chat
- [x] Email notifications on key events
- [x] Operator CRM fully functional
- [x] Security headers + rate limiting
- [x] Sentry error tracking
- [x] Production infrastructure (Multi-AZ, backups)
- [ ] KYC verification ← Phase 2
- [ ] Automated reports ← Phase 2
- [ ] Admin panel v2 ← Phase 2
- [ ] Mobile app ← Phase 3

---

*Document maintained by Tech Lead. Update this file when architecture decisions change. All significant deviations from this plan should be recorded in `/docs/adr/` as Architecture Decision Records.*
