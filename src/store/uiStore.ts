import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Theme, Language } from '../types'

interface UIState {
  theme: Theme
  language: Language
  toggleTheme: () => void
  setLanguage: (lang: Language) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      language: 'en',
      toggleTheme: () =>
        set((s) => {
          const next = s.theme === 'light' ? 'dark' : 'light'
          document.documentElement.classList.toggle('dark', next === 'dark')
          return { theme: next }
        }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'qp-ui',
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.classList.toggle('dark', state.theme === 'dark')
        }
      },
    }
  )
)
