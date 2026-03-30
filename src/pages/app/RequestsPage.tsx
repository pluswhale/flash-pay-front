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
 * Active request is stored in the URL (?requestId=xxx) so that:
 *  - navigating to the full chat and pressing Back restores the panel
 *  - refreshing the page keeps the panel visible
 *  - the URL can be bookmarked / shared
 */
import { useEffect, useState }         from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence }     from 'framer-motion'
import { ClipboardList, ArrowRight, Zap } from 'lucide-react'

import {
  useMyRequestsViewModel,
  useCreateRequestViewModel,
  useRequestDetailViewModel,
} from '../../hooks/view-models/useRequestViewModel'
import { RequestList }      from '../../components/request/RequestList'
import { RequestForm }      from '../../components/request/RequestForm'
import { RequestInfoPanel } from '../../components/client/RequestInfoPanel'
import type { CreateRequestDto, OtcRequest } from '../../types/api'

export function RequestsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const listVm   = useMyRequestsViewModel()
  const createVm = useCreateRequestViewModel()

  // The active request ID lives in the URL so it survives navigation.
  const requestIdParam = searchParams.get('requestId') ?? ''

  // Eagerly hold the just-created request object so the right panel
  // appears immediately before the detail query resolves.
  const [eagerRequest, setEagerRequest] = useState<OtcRequest | null>(null)

  // Load the request from the server when requestId is in the URL
  // (covers "user navigated back from the chat page" scenario).
  const savedDetail = useRequestDetailViewModel(requestIdParam)

  // The active request is either the live server data or the eager local copy.
  const activeRequest = requestIdParam
    ? (savedDetail.request ?? eagerRequest)
    : null

  // When a new request is successfully created:
  //  1. Store the response object immediately (no round-trip delay)
  //  2. Update the URL so the state is bookmarkable
  useEffect(() => {
    if (createVm.isSuccess && createVm.createdRequest) {
      setEagerRequest(createVm.createdRequest)
      setSearchParams({ requestId: createVm.createdRequest.id }, { replace: true })
    }
  }, [createVm.isSuccess, createVm.createdRequest, setSearchParams])

  // Clear the eager copy once the server data is available.
  useEffect(() => {
    if (savedDetail.request) setEagerRequest(null)
  }, [savedDetail.request])

  // Clear eager copy when URL param is removed.
  useEffect(() => {
    if (!requestIdParam) setEagerRequest(null)
  }, [requestIdParam])

  const handleCreate = (data: CreateRequestDto) => createVm.handleCreate(data)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-xl font-bold text-primary">
          <Zap size={18} className="text-brand shrink-0" />
          Создать заявку
        </h1>
        <p className="text-sm text-muted mt-0.5">
          Заполните форму — оператор ответит в течение нескольких минут
        </p>
      </div>

      {/* ── Main: 2-col (form left + info panel right) ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-10">

        {/* Left: Form */}
        <div className="glass rounded-2xl p-5 sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-4">
            Заявка на обмен
          </p>
          <RequestForm
            onSubmit={handleCreate}
            isSubmitting={createVm.isSubmitting}
            errorMessage={createVm.errorMessage}
          />
        </div>

        {/* Right: Info panel or placeholder */}
        <AnimatePresence mode="wait">
          {activeRequest ? (
            <motion.div
              key="panel"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
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
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center dark:bg-white/5 bg-gray-50 border dark:border-white/8 border-gray-200">
                <ArrowRight size={22} className="text-muted" />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-semibold text-secondary">
                  Здесь появится ваша заявка
                </p>
                <p className="text-xs text-muted max-w-[200px] leading-relaxed">
                  После отправки формы вы сможете сразу написать оператору
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Операторы онлайн
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom: Request history ───────────────────────────────────────── */}
      <div>
        {/* Title + inline counter — no justify-between, they sit together */}
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList size={15} className="text-muted shrink-0" />
          <h2 className="text-sm font-semibold text-secondary">
            История заявок
            {listVm.requests.length > 0 && (
              <span className="ml-1.5 font-normal text-muted">
                ({listVm.requests.length})
              </span>
            )}
          </h2>
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
