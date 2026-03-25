/**
 * Page: Client — Мои заявки
 * Route: /app/requests
 *
 * Layout:
 *  ┌──────────────────┬──────────────────┐
 *  │  Form (left)     │  Info panel      │
 *  │  always visible  │  after creation  │
 *  └──────────────────┴──────────────────┘
 *  ─────────── History list ────────────
 *
 * Flow:
 *  Submit form → right panel shows the new request (no navigation).
 *  Click list item → navigate to full chat page.
 */
import { useEffect, useState }  from 'react'
import { useNavigate }          from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardList, ArrowRight, Zap } from 'lucide-react'

import {
  useMyRequestsViewModel,
  useCreateRequestViewModel,
} from '../../hooks/view-models/useRequestViewModel'
import { RequestList }      from '../../components/request/RequestList'
import { RequestForm }      from '../../components/request/RequestForm'
import { RequestInfoPanel } from '../../components/client/RequestInfoPanel'
import type { CreateRequestDto, OtcRequest } from '../../types/api'

export function RequestsPage() {
  const navigate = useNavigate()
  const listVm   = useMyRequestsViewModel()
  const createVm = useCreateRequestViewModel()

  const [activeRequest, setActiveRequest] = useState<OtcRequest | null>(null)

  // After successful creation — show in right panel, do not navigate
  useEffect(() => {
    if (createVm.isSuccess && createVm.createdRequest) {
      setActiveRequest(createVm.createdRequest)
    }
  }, [createVm.isSuccess, createVm.createdRequest])

  const handleCreate = (data: CreateRequestDto) => createVm.handleCreate(data)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* ── Page header ────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-xl font-bold dark:text-white text-gray-900">
          <Zap size={18} className="text-blue-500 shrink-0" />
          Создать заявку
        </h1>
        <p className="text-sm dark:text-gray-400 text-gray-500 mt-0.5">
          Заполните форму — оператор ответит в течение нескольких минут
        </p>
      </div>

      {/* ── Main: 2-col (form left + info panel right) ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-10">

        {/* Left: Form (always visible) */}
        <div className="rounded-2xl border dark:border-white/10 border-gray-200 dark:bg-white/5 bg-white p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-widest dark:text-gray-500 text-gray-400 mb-4">
            Заявка на обмен
          </p>
          <RequestForm
            onSubmit={handleCreate}
            isSubmitting={createVm.isSubmitting}
            errorMessage={createVm.errorMessage}
          />
        </div>

        {/* Right: Info panel (appears after creation) */}
        <AnimatePresence mode="wait">
          {activeRequest ? (
            <motion.div
              key="panel"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              <RequestInfoPanel request={activeRequest} />
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={[
                'hidden lg:flex flex-col items-center justify-center text-center',
                'rounded-2xl border-2 border-dashed',
                'dark:border-white/8 border-gray-200',
                'min-h-[420px] gap-4 p-8',
              ].join(' ')}
            >
              <div className={[
                'w-16 h-16 rounded-2xl flex items-center justify-center',
                'dark:bg-white/5 bg-gray-50 border dark:border-white/8 border-gray-200',
              ].join(' ')}>
                <ArrowRight size={22} className="dark:text-gray-600 text-gray-300" />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-semibold dark:text-gray-400 text-gray-500">
                  Здесь появится ваша заявка
                </p>
                <p className="text-xs dark:text-gray-600 text-gray-400 max-w-[200px] leading-relaxed">
                  После отправки формы вы сможете сразу написать оператору
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs dark:text-gray-600 text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Операторы онлайн
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom: Request history ─────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList size={15} className="dark:text-gray-500 text-gray-400 shrink-0" />
          <h2 className="text-sm font-semibold dark:text-gray-300 text-gray-700">
            История заявок
          </h2>
          {listVm.requests.length > 0 && (
            <span className="ml-auto text-xs dark:text-gray-600 text-gray-400">
              {listVm.requests.length}
            </span>
          )}
        </div>

        {listVm.isError && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {listVm.errorMessage}
          </div>
        )}

        <RequestList
          requests={listVm.requests}
          isLoading={listVm.isLoading}
          onSelect={(id) => navigate(`/app/requests/${id}`)}
        />
      </div>
    </div>
  )
}
