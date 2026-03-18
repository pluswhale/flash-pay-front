import { create } from 'zustand'
import type { MarketRate, Operator } from '../types'

interface OperatorState {
  operator: Operator
  shiftActive: boolean
  marketRates: MarketRate[]
  showRatesModal: boolean

  startShift: () => void
  endShift: () => void
  setShowRatesModal: (show: boolean) => void
  updateRate: (pair: string, rate: Partial<MarketRate>) => void
}

const MOCK_RATES: MarketRate[] = [
  { pair: 'USDT/RUB', bid: 91.8, ask: 92.5, source: 'bybit', updatedAt: new Date() },
  { pair: 'BTC/USDT', bid: 94850, ask: 95200, source: 'bybit', updatedAt: new Date() },
  { pair: 'ETH/USDT', bid: 3420, ask: 3460, source: 'bybit', updatedAt: new Date() },
  { pair: 'TON/USDT', bid: 6.18, ask: 6.25, source: 'rapira', updatedAt: new Date() },
  { pair: 'BTC/RUB', bid: 8720000, ask: 8780000, source: 'rapira', updatedAt: new Date() },
]

export const useOperatorStore = create<OperatorState>((set) => ({
  operator: {
    id: 'op1',
    name: 'Alex Volkov',
    avatar: 'AV',
    shiftActive: false,
    activeDeals: 0,
  },
  shiftActive: false,
  marketRates: MOCK_RATES,
  showRatesModal: false,

  startShift: () =>
    set((s) => ({
      shiftActive: true,
      operator: { ...s.operator, shiftActive: true },
    })),

  endShift: () =>
    set((s) => ({
      shiftActive: false,
      operator: { ...s.operator, shiftActive: false },
    })),

  setShowRatesModal: (show) => set({ showRatesModal: show }),

  updateRate: (pair, rate) =>
    set((s) => ({
      marketRates: s.marketRates.map((r) =>
        r.pair === pair ? { ...r, ...rate, updatedAt: new Date() } : r
      ),
    })),
}))
