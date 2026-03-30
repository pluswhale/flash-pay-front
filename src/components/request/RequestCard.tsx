/**
 * Pure component — single request summary card. Russian labels.
 */
import { Clock } from 'lucide-react'
import type { OtcRequest } from '../../types/api'
import { RequestStatusBadge } from './RequestStatusBadge'

interface Props {
  request: OtcRequest
  onClick?: (id: string) => void
}

// AGENTS.md 6.3 — hoisted static JSX to avoid recreation on every render
const hoverOverlay = (
  <div
    aria-hidden
    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-brand/[0.05] to-brand-purple/[0.03]"
  />
)

export function RequestCard({ request, onClick }: Props) {
  const amount = Number(request.amount).toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

  const createdAt = new Date(request.createdAt).toLocaleString('ru-RU', {
    day:    'numeric',
    month:  'short',
    hour:   '2-digit',
    minute: '2-digit',
  })

  return (
    <button
      type="button"
      onClick={() => onClick?.(request.id)}
      className={[
        // Group for hover-driven child animations (AGENTS.md 6.3 — overlay)
        'group relative overflow-hidden',
        'w-full text-left rounded-2xl p-4 transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
        // Glass surface
        'glass',
        // Hover: brand-tinted border + dual-layer glow shadow + slight lift
        'hover:border-brand/30',
        'hover:shadow-[0_8px_32px_rgba(91,140,255,0.18),0_2px_8px_rgba(0,0,0,0.06)]',
        'dark:hover:shadow-[0_8px_32px_rgba(91,140,255,0.25),0_2px_8px_rgba(0,0,0,0.25)]',
        'hover:-translate-y-0.5',
      ].join(' ')}
    >
      {/* Gradient shimmer overlay — fades in on hover */}
      {hoverOverlay}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-primary">
              {request.directionFrom} → {request.directionTo}
            </span>
            <RequestStatusBadge status={request.status} />
          </div>

          <p className="text-sm text-secondary">
            {amount} {request.currency}
            {request.payoutMethod !== null && request.payoutMethod !== undefined
              ? ` · ${request.payoutMethod}`
              : null}
            {request.city !== null && request.city !== undefined
              ? ` · ${request.city}`
              : null}
          </p>

          {request.comment !== null && request.comment !== undefined ? (
            <p className="mt-1 text-xs text-muted truncate">
              {request.comment}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-1 text-xs text-muted shrink-0">
          <Clock size={12} />
          <span>{createdAt}</span>
        </div>
      </div>
    </button>
  )
}
