import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile, AuthMethod } from '../types'

function generateId(): string {
  return `U-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
}

function generateReferralCode(login: string): string {
  return `QP${login.slice(0, 3).toUpperCase()}${Math.floor(Math.random() * 9000) + 1000}`
}

interface AuthState {
  user: UserProfile | null
  isLoading: boolean

  login: (login: string, password: string) => Promise<boolean>
  loginWithPhone: (phone: string) => Promise<boolean>
  loginWithTelegram: (handle: string) => Promise<boolean>
  register: (params: { method: AuthMethod; login?: string; password?: string; phone?: string; telegram?: string }) => Promise<boolean>
  logout: () => void
  updateProfile: (partial: Partial<UserProfile>) => void
  incrementDeals: (volume: number) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,

      login: async (login, _password) => {
        set({ isLoading: true })
        await new Promise((r) => setTimeout(r, 700))
        // mock: any non-empty credentials succeed
        if (login.trim().length < 2) {
          set({ isLoading: false })
          return false
        }
        const user: UserProfile = {
          id: generateId(),
          name: login,
          login,
          kycStatus: 'none',
          createdAt: new Date(),
          referralCode: generateReferralCode(login),
          totalDeals: 0,
          totalVolume: 0,
        }
        set({ user, isLoading: false })
        return true
      },

      loginWithPhone: async (phone) => {
        set({ isLoading: true })
        await new Promise((r) => setTimeout(r, 800))
        if (phone.length < 7) {
          set({ isLoading: false })
          return false
        }
        const login = `user_${phone.slice(-4)}`
        const user: UserProfile = {
          id: generateId(),
          name: login,
          login,
          phone,
          kycStatus: 'none',
          createdAt: new Date(),
          referralCode: generateReferralCode(login),
          totalDeals: 0,
          totalVolume: 0,
        }
        set({ user, isLoading: false })
        return true
      },

      loginWithTelegram: async (handle) => {
        set({ isLoading: true })
        await new Promise((r) => setTimeout(r, 600))
        const login = handle.startsWith('@') ? handle.slice(1) : handle
        const user: UserProfile = {
          id: generateId(),
          name: login,
          login,
          telegram: handle,
          kycStatus: 'none',
          createdAt: new Date(),
          referralCode: generateReferralCode(login),
          totalDeals: 0,
          totalVolume: 0,
        }
        set({ user, isLoading: false })
        return true
      },

      register: async ({ method, login, password: _pw, phone, telegram }) => {
        set({ isLoading: true })
        await new Promise((r) => setTimeout(r, 800))
        let user: UserProfile | null = null

        if (method === 'credentials' && login) {
          if (login.trim().length < 2) { set({ isLoading: false }); return false }
          user = {
            id: generateId(), name: login, login,
            kycStatus: 'none', createdAt: new Date(),
            referralCode: generateReferralCode(login),
            totalDeals: 0, totalVolume: 0,
          }
        } else if (method === 'phone' && phone) {
          if (phone.length < 7) { set({ isLoading: false }); return false }
          const l = `user_${phone.slice(-4)}`
          user = {
            id: generateId(), name: l, login: l, phone,
            kycStatus: 'none', createdAt: new Date(),
            referralCode: generateReferralCode(l),
            totalDeals: 0, totalVolume: 0,
          }
        } else if (method === 'telegram' && telegram) {
          const l = telegram.startsWith('@') ? telegram.slice(1) : telegram
          user = {
            id: generateId(), name: l, login: l, telegram,
            kycStatus: 'none', createdAt: new Date(),
            referralCode: generateReferralCode(l),
            totalDeals: 0, totalVolume: 0,
          }
        }

        if (!user) { set({ isLoading: false }); return false }
        set({ user, isLoading: false })
        return true
      },

      logout: () => {
        set({ user: null })
      },

      updateProfile: (partial) => {
        const { user } = get()
        if (!user) return
        set({ user: { ...user, ...partial } })
      },

      incrementDeals: (volume) => {
        const { user } = get()
        if (!user) return
        set({
          user: {
            ...user,
            totalDeals: user.totalDeals + 1,
            totalVolume: user.totalVolume + volume,
          },
        })
      },
    }),
    {
      name: 'qp-auth',
      // Revive Date objects from JSON
      onRehydrateStorage: () => (state) => {
        if (state?.user) {
          state.user.createdAt = new Date(state.user.createdAt)
        }
      },
    }
  )
)
