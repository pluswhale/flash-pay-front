/**
 * Pure component — operator status transition button.
 * One button = one allowed next status. Russian labels.
 */
import { Loader2 } from 'lucide-react'
import { RequestStatus } from '../../types/api'

const CONFIG: Record<RequestStatus, { label: string; className: string }> = {
  [RequestStatus.NEW]:         { label: 'Сбросить в «Новую»',    className: 'bg-blue-600 hover:bg-blue-500 text-white' },
  [RequestStatus.ASSIGNED]:    { label: 'Взять в работу',        className: 'bg-violet-600 hover:bg-violet-500 text-white' },
  [RequestStatus.IN_PROGRESS]: { label: 'Начать обработку',      className: 'bg-amber-600 hover:bg-amber-500 text-white' },
  [RequestStatus.COMPLETED]:   { label: 'Завершить заявку',      className: 'bg-emerald-600 hover:bg-emerald-500 text-white' },
  [RequestStatus.CANCELLED]:   { label: 'Отменить заявку',       className: 'bg-red-600 hover:bg-red-500 text-white' },
}

interface Props {
  targetStatus: RequestStatus
  onClick:      (status: RequestStatus) => void
  isLoading:    boolean
}

export function StatusTransitionButton({ targetStatus, onClick, isLoading }: Props) {
  const cfg = CONFIG[targetStatus]
  return (
    <button
      type="button"
      onClick={() => onClick(targetStatus)}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${cfg.className}`}
    >
      {isLoading && <Loader2 size={14} className="animate-spin" />}
      {cfg.label}
    </button>
  )
}
