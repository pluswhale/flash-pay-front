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
        'w-full text-left rounded-2xl p-4 transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
        // Glass surface + hover lift
        'glass',
        'hover:border-brand/30 hover:shadow-[0_4px_20px_rgba(91,140,255,0.12)]',
        'hover:-translate-y-px',
      ].join(' ')}
    >
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
            {request.payoutMethod && <> · {request.payoutMethod}</>}
            {request.city && <> · {request.city}</>}
          </p>

          {request.comment && (
            <p className="mt-1 text-xs text-muted truncate">
              {request.comment}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-muted shrink-0">
          <Clock size={12} />
          <span>{createdAt}</span>
        </div>
      </div>
    </button>
  )
}
