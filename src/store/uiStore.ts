import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Theme, Language } from '../types'

interface UIState {
  theme: Theme
  language: Language
  // Session-only: prefill exchange widget from corridor click
  pendingCorridor: { from: string; to: string } | null
  toggleTheme: () => void
  setLanguage: (lang: Language) => void
  setPendingCorridor: (c: { from: string; to: string } | null) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      language: 'en',
      pendingCorridor: null,
      toggleTheme: () =>
        set((s) => {
          const next = s.theme === 'light' ? 'dark' : 'light'
          document.documentElement.classList.toggle('dark', next === 'dark')
          return { theme: next }
        }),
      setLanguage: (language) => set({ language }),
      setPendingCorridor: (pendingCorridor) => set({ pendingCorridor }),
    }),
    {
      name: 'qp-ui',
      // Don't persist pendingCorridor — it's session-only
      partialize: (s) => ({ theme: s.theme, language: s.language }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.classList.toggle('dark', state.theme === 'dark')
        }
      },
    }
  )
)
