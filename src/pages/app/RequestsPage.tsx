/**
 * Page: Client — Мои заявки
 * Route: /app/requests
 *
 * Shows the request creation form prominently.
 * After successful creation → auto-navigates to the chat (request detail).
 */
import { useEffect, useState } from 'react'
import { useNavigate }         from 'react-router-dom'
import { Plus, X }             from 'lucide-react'
import { useMyRequestsViewModel, useCreateRequestViewModel } from '../../hooks/view-models/useRequestViewModel'
import { RequestList }  from '../../components/request/RequestList'
import { RequestForm }  from '../../components/request/RequestForm'
import type { CreateRequestDto } from '../../types/api'

export function RequestsPage() {
  const navigate  = useNavigate()
  const listVm    = useMyRequestsViewModel()
  const createVm  = useCreateRequestViewModel()
  const [showForm, setShowForm] = useState(false)

  // Navigate to chat immediately after request is created
  useEffect(() => {
    if (createVm.isSuccess && createVm.createdRequest) {
      navigate(`/app/requests/${createVm.createdRequest.id}`)
    }
  }, [createVm.isSuccess, createVm.createdRequest, navigate])

  const handleCreate = (data: CreateRequestDto) => {
    createVm.handleCreate(data)
  }

  const toggleForm = () => {
    setShowForm((v) => !v)
    createVm.reset()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold dark:text-white text-gray-900">Мои заявки</h1>
          {listVm.requests.length > 0 && (
            <p className="text-sm dark:text-gray-400 text-gray-500 mt-0.5">
              {listVm.requests.length} заявок
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={toggleForm}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            showForm
              ? 'border dark:border-white/10 border-gray-200 dark:text-gray-300 text-gray-700 dark:hover:bg-white/5 hover:bg-gray-100'
              : 'bg-blue-600 text-white hover:bg-blue-500'
          }`}
        >
          {showForm ? <><X size={16} /> Закрыть</> : <><Plus size={16} /> Новая заявка</>}
        </button>
      </div>

      {/* ── New request form ──────────────────────────────────────────────── */}
      {showForm && (
        <div className="mb-6 rounded-2xl border dark:border-white/10 border-gray-200 dark:bg-white/5 bg-white p-6">
          <RequestForm
            onSubmit={handleCreate}
            isSubmitting={createVm.isSubmitting}
            errorMessage={createVm.errorMessage}
          />
        </div>
      )}

      {/* ── Empty state with CTA ──────────────────────────────────────────── */}
      {!showForm && listVm.requests.length === 0 && !listVm.isLoading && (
        <div className="text-center py-16">
          <p className="dark:text-gray-400 text-gray-500 mb-4">У вас пока нет заявок</p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors"
          >
            <Plus size={16} /> Создать первую заявку
          </button>
        </div>
      )}

      {/* ── List errors ──────────────────────────────────────────────────── */}
      {listVm.isError && (
        <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {listVm.errorMessage}
        </div>
      )}

      {/* ── Request list ─────────────────────────────────────────────────── */}
      {!showForm && (
        <RequestList
          requests={listVm.requests}
          isLoading={listVm.isLoading}
          onSelect={(id) => navigate(`/app/requests/${id}`)}
        />
      )}
    </div>
  )
}
