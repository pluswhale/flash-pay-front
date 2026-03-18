import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/shared/Navbar'
import { ClientPage } from './pages/ClientPage'
import { OperatorPage } from './pages/OperatorPage'
import { useUIStore } from './store/uiStore'
import { useEffect } from 'react'

export default function App() {
  const theme = useUIStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/operator"
          element={<OperatorPage />}
        />
        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <ClientPage />
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
