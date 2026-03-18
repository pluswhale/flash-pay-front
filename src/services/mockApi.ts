import type { Deal, DealStatus } from '../types'

export const mockApi = {
  async fetchDeal(id: string): Promise<Deal | null> {
    await delay(300)
    return null
  },

  async requestRFQ(dealId: string): Promise<{ provider: string; rate: number }> {
    await delay(5000)
    return {
      provider: 'Rapira Exchange',
      rate: 92.3 + (Math.random() - 0.5) * 2,
    }
  },

  async updateDealStatus(id: string, status: DealStatus): Promise<void> {
    await delay(500)
  },

  async sendMessage(dealId: string, text: string): Promise<void> {
    await delay(100)
  },
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
