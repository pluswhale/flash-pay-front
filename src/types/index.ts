export type DealStatus = 'NEW' | 'IN_PROGRESS' | 'PAYMENT_RECEIVED' | 'COMPLETED' | 'CANCELLED'

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
  paymentMethod: string
  requisites: string
  createdAt: Date
  updatedAt: Date
  messages: Message[]
  partnerMessages: Message[]
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

export type Theme = 'light' | 'dark'
export type Language = 'en' | 'ru'
