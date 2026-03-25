/**
 * Pure component — status badge for backend RequestStatus enum.
 * Labels are in Russian.
 */
import { RequestStatus } from '../../types/api'

const CONFIG: Record<RequestStatus, { label: string; className: string }> = {
  [RequestStatus.NEW]:         { label: 'Новая',      className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  [RequestStatus.ASSIGNED]:    { label: 'Назначена',  className: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
  [RequestStatus.IN_PROGRESS]: { label: 'В работе',   className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  [RequestStatus.COMPLETED]:   { label: 'Завершена',  className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  [RequestStatus.CANCELLED]:   { label: 'Отменена',   className: 'bg-red-500/20 text-red-400 border-red-500/30' },
}

interface Props { status: RequestStatus }

export function RequestStatusBadge({ status }: Props) {
  const cfg = CONFIG[status] ?? { label: status, className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}
