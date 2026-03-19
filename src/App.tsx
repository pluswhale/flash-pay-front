import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { Navbar } from './components/shared/Navbar'
import { ClientPage } from './pages/ClientPage'
import { OperatorPage } from './pages/OperatorPage'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { DealPage } from './pages/DealPage'
import { CorridorsPage } from './pages/CorridorsPage'
import { FaqPage } from './pages/FaqPage'
import { LegalPage } from './pages/LegalPage'
import { useUIStore } from './store/uiStore'

// Layout wrapper shared by all client-facing pages
function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

export default function App() {
  const theme = useUIStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <BrowserRouter basename="/flash-pay-front">
      <Routes>
        {/* Operator CRM — no Navbar */}
        <Route path="/operator" element={<OperatorPage />} />

        {/* Auth — minimal chrome */}
        <Route path="/auth" element={<ClientLayout><AuthPage /></ClientLayout>} />

        {/* Full client pages */}
        <Route path="/dashboard" element={<ClientLayout><DashboardPage /></ClientLayout>} />
        <Route path="/deal/:id"  element={<ClientLayout><DealPage /></ClientLayout>} />
        <Route path="/corridors" element={<ClientLayout><CorridorsPage /></ClientLayout>} />
        <Route path="/faq"       element={<ClientLayout><FaqPage /></ClientLayout>} />
        <Route path="/legal"     element={<ClientLayout><LegalPage /></ClientLayout>} />

        {/* Default: exchange home */}
        <Route path="/*" element={<ClientLayout><ClientPage /></ClientLayout>} />
      </Routes>
    </BrowserRouter>
  )
}
