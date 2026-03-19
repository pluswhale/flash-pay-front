export type DealStatus =
  | 'NEW'
  | 'AWAITING_PAYMENT'
  | 'IN_PROGRESS'
  | 'PAYMENT_RECEIVED'
  | 'VERIFICATION'
  | 'PAYOUT_SENT'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUND'
  | 'EXPIRED'

export type Currency = {
  code: string
  name: string
  network?: string
  icon: string
  type: 'crypto' | 'fiat'
}

export type PaymentMethod = {
  id: string
  name: string
  icon: string
  type: 'bank' | 'crypto' | 'ewallet'
}

export type Message = {
  id: string
  from: 'client' | 'operator' | 'partner' | 'system'
  text: string
  timestamp: Date
  isRead: boolean
}

export type DealLog = {
  id: string
  action: string
  timestamp: Date
  actor: 'client' | 'operator' | 'system'
}

export type Deal = {
  id: string
  status: DealStatus
  clientName: string
  clientEmail?: string
  clientTelegram?: string
  sendCurrency: string
  sendAmount: number
  receiveCurrency: string
  receiveAmount: number
  rate: number
  rateLocked: boolean
  rateLockExpiry: Date
  paymentMethod: string
  requisites: string
  createdAt: Date
  updatedAt: Date
  messages: Message[]
  partnerMessages: Message[]
  logs: DealLog[]
  riskScore: number
  volume30d: number
  isHighValue: boolean
  partnerQuote?: {
    provider: string
    rate: number
    validUntil: Date
  }
}

export type Operator = {
  id: string
  name: string
  avatar: string
  shiftActive: boolean
  activeDeals: number
}

export type MarketRate = {
  pair: string
  bid: number
  ask: number
  source: 'bybit' | 'rapira' | 'manual'
  updatedAt: Date
}

export type UserProfile = {
  id: string
  name: string
  login: string
  phone?: string
  telegram?: string
  kycStatus: 'none' | 'pending' | 'verified'
  createdAt: Date
  referralCode: string
  totalDeals: number
  totalVolume: number
}

export type AuthMethod = 'credentials' | 'phone' | 'telegram'

export type Corridor = {
  id: string
  from: string
  to: string
  fromFlag: string
  toFlag: string
  fromName: string
  toName: string
  rate: number
  spread: number
  volume: string
  gradient: string
  popular?: boolean
}

export type Theme = 'light' | 'dark'
export type Language = 'en' | 'ru'
