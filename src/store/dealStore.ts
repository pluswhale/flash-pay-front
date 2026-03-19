import { create } from 'zustand'
import type { Deal, DealStatus, DealLog, Message } from '../types'

const CURRENCIES = ['BTC', 'ETH', 'USDT', 'TON', 'USD', 'EUR', 'RUB']

function generateId(): string {
  return `QP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

function generateRequisites(currency: string): string {
  if (currency === 'BTC') return '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf'
  if (currency === 'ETH' || currency === 'USDT') return '0x742d35Cc6634C0532925a3b8D4C9C1e3b2d74E42'
  if (currency === 'TON') return 'UQCmraSVR5JFxD5KZrXbZYklH_2LLvfRJHC7a7sPzZjg8'
  return '4276 3800 1234 5678'
}

const SEED_MESSAGES: Message[] = [
  {
    id: 'm1',
    from: 'system',
    text: 'Deal created. Waiting for client payment.',
    timestamp: new Date(Date.now() - 120000),
    isRead: true,
  },
]

interface DealState {
  deals: Deal[]
  activeDealId: string | null
  clientDealId: string | null

  createDeal: (params: {
    clientName: string
    clientEmail: string
    sendCurrency: string
    sendAmount: number
    receiveCurrency: string
    receiveAmount: number
    rate: number
    paymentMethod: string
  }) => string

  updateDealStatus: (id: string, status: DealStatus) => void
  addMessage: (id: string, msg: Omit<Message, 'id'>) => void
  addPartnerMessage: (id: string, msg: Omit<Message, 'id'>) => void
  markMessagesRead: (id: string) => void
  setActiveDeal: (id: string | null) => void
  setPartnerQuote: (id: string, quote: Deal['partnerQuote']) => void
  getDeal: (id: string) => Deal | undefined
  addLog: (id: string, log: Omit<DealLog, 'id'>) => void
}

export const useDealStore = create<DealState>((set, get) => ({
  deals: [],
  activeDealId: null,
  clientDealId: null,

  createDeal: (params) => {
    const id = generateId()
    const now = new Date()
    const deal: Deal = {
      id,
      status: 'AWAITING_PAYMENT',
      clientName: params.clientName,
      clientEmail: params.clientEmail,
      sendCurrency: params.sendCurrency,
      sendAmount: params.sendAmount,
      receiveCurrency: params.receiveCurrency,
      receiveAmount: params.receiveAmount,
      rate: params.rate,
      rateLocked: true,
      rateLockExpiry: new Date(now.getTime() + 15 * 60 * 1000),
      paymentMethod: params.paymentMethod,
      requisites: generateRequisites(params.sendCurrency),
      createdAt: now,
      updatedAt: now,
      messages: [...SEED_MESSAGES],
      partnerMessages: [],
      logs: [{ id: 'l1', action: 'Deal created', timestamp: now, actor: 'system' }],
      riskScore: Math.floor(Math.random() * 40) + 10,
      volume30d: Math.floor(Math.random() * 50000) + 1000,
      isHighValue: params.sendAmount > 5000,
    }
    set((s) => ({
      deals: [deal, ...s.deals],
      clientDealId: id,
    }))
    return id
  },

  updateDealStatus: (id, status) =>
    set((s) => ({
      deals: s.deals.map((d) =>
        d.id === id ? { ...d, status, updatedAt: new Date() } : d
      ),
    })),

  addMessage: (id, msg) =>
    set((s) => ({
      deals: s.deals.map((d) =>
        d.id === id
          ? {
              ...d,
              messages: [...d.messages, { ...msg, id: `m${Date.now()}` }],
              updatedAt: new Date(),
            }
          : d
      ),
    })),

  addPartnerMessage: (id, msg) =>
    set((s) => ({
      deals: s.deals.map((d) =>
        d.id === id
          ? {
              ...d,
              partnerMessages: [...d.partnerMessages, { ...msg, id: `pm${Date.now()}` }],
            }
          : d
      ),
    })),

  markMessagesRead: (id) =>
    set((s) => ({
      deals: s.deals.map((d) =>
        d.id === id
          ? { ...d, messages: d.messages.map((m) => ({ ...m, isRead: true })) }
          : d
      ),
    })),

  setActiveDeal: (id) => set({ activeDealId: id }),

  setPartnerQuote: (id, quote) =>
    set((s) => ({
      deals: s.deals.map((d) => (d.id === id ? { ...d, partnerQuote: quote } : d)),
    })),

  getDeal: (id) => get().deals.find((d) => d.id === id),

  addLog: (id, log) =>
    set((s) => ({
      deals: s.deals.map((d) =>
        d.id === id
          ? { ...d, logs: [...(d.logs ?? []), { ...log, id: `l${Date.now()}` }], updatedAt: new Date() }
          : d
      ),
    })),
}))

export const CURRENCIES_LIST = [
  { code: 'USDT', name: 'Tether', network: 'TRC20', icon: '₮', type: 'crypto' as const },
  { code: 'BTC', name: 'Bitcoin', network: 'BTC', icon: '₿', type: 'crypto' as const },
  { code: 'ETH', name: 'Ethereum', network: 'ERC20', icon: 'Ξ', type: 'crypto' as const },
  { code: 'TON', name: 'Toncoin', network: 'TON', icon: '💎', type: 'crypto' as const },
  { code: 'RUB', name: 'Russian Ruble', icon: '₽', type: 'fiat' as const },
  { code: 'USD', name: 'US Dollar', icon: '$', type: 'fiat' as const },
  { code: 'EUR', name: 'Euro', icon: '€', type: 'fiat' as const },
]

export const RATES: Record<string, number> = {
  'USDT-RUB': 92.5,
  'BTC-RUB': 8750000,
  'ETH-RUB': 320000,
  'TON-RUB': 580,
  'USDT-USD': 1.0,
  'BTC-USDT': 95000,
  'ETH-USDT': 3450,
  'RUB-USDT': 0.0108,
  // THB corridors
  'USDT-THB': 36.5,
  'USD-THB': 36.2,
  'RUB-THB': 0.39,
  // AED corridor
  'USDT-AED': 3.67,
  // CNY corridors
  'RUB-CNY': 0.079,
  'USDT-CNY': 7.25,
  'USD-CNY': 7.24,
}

export function getRate(from: string, to: string): number {
  const key = `${from}-${to}`
  const revKey = `${to}-${from}`
  if (RATES[key]) return RATES[key]
  if (RATES[revKey]) return 1 / RATES[revKey]
  return 1
}
