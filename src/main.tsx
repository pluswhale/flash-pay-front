import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Apply persisted theme before first paint
const stored = localStorage.getItem('qp-ui')
try {
  const parsed = stored ? JSON.parse(stored) : null
  const theme = parsed?.state?.theme ?? 'dark'
  document.documentElement.classList.toggle('dark', theme === 'dark')
} catch {
  document.documentElement.classList.add('dark')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
