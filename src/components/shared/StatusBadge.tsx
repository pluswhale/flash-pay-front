import { cn } from './cn'
import type { DealStatus } from '../../types'
import { useTranslation } from '../../hooks/useTranslation'

interface StatusBadgeProps {
  status: DealStatus
  label?: string
  size?: 'xs' | 'sm' | 'md'
  pulse?: boolean
}

const statusConfig: Record<DealStatus, { bg: string; text: string; dot: string }> = {
  NEW: {
    bg:   'bg-blue-100   dark:bg-[#5B8CFF]/15',
    text: 'text-blue-700 dark:text-[#7AAEFF]',
    dot:  'bg-blue-500   dark:bg-[#5B8CFF]',
  },
  AWAITING_PAYMENT: {
    bg:   'bg-amber-100   dark:bg-amber-500/15',
    text: 'text-amber-700 dark:text-amber-300',
    dot:  'bg-amber-500   dark:bg-amber-400',
  },
  IN_PROGRESS: {
    bg:   'bg-amber-100    dark:bg-amber-500/15',
    text: 'text-amber-700  dark:text-amber-300',
    dot:  'bg-amber-500    dark:bg-amber-400',
  },
  PAYMENT_RECEIVED: {
    bg:   'bg-violet-100   dark:bg-[#7C5CFF]/15',
    text: 'text-violet-700 dark:text-[#9B82FF]',
    dot:  'bg-violet-500   dark:bg-[#7C5CFF]',
  },
  VERIFICATION: {
    bg:   'bg-sky-100   dark:bg-sky-500/15',
    text: 'text-sky-700  dark:text-sky-300',
    dot:  'bg-sky-500    dark:bg-sky-400',
  },
  PAYOUT_SENT: {
    bg:   'bg-indigo-100   dark:bg-indigo-500/15',
    text: 'text-indigo-700 dark:text-indigo-300',
    dot:  'bg-indigo-500   dark:bg-indigo-400',
  },
  COMPLETED: {
    bg:   'bg-emerald-100  dark:bg-emerald-500/15',
    text: 'text-emerald-700 dark:text-emerald-300',
    dot:  'bg-emerald-500  dark:bg-emerald-400',
  },
  CANCELLED: {
    bg:   'bg-red-100   dark:bg-red-500/15',
    text: 'text-red-700  dark:text-red-300',
    dot:  'bg-red-500    dark:bg-red-400',
  },
  REFUND: {
    bg:   'bg-orange-100   dark:bg-orange-500/15',
    text: 'text-orange-700 dark:text-orange-300',
    dot:  'bg-orange-500   dark:bg-orange-400',
  },
  EXPIRED: {
    bg:   'bg-gray-100   dark:bg-white/8',
    text: 'text-gray-500  dark:text-white/40',
    dot:  'bg-gray-400    dark:bg-white/30',
  },
}

const ACTIVE_STATUSES: DealStatus[] = ['AWAITING_PAYMENT', 'IN_PROGRESS', 'PAYMENT_RECEIVED', 'VERIFICATION', 'PAYOUT_SENT']

const sizeStyles = {
  xs: { wrap: 'px-1.5 py-0.5 text-[10px] rounded-md   gap-1',   dot: 'w-1   h-1' },
  sm: { wrap: 'px-2.5 py-1   text-xs     rounded-lg   gap-1.5', dot: 'w-1.5 h-1.5' },
  md: { wrap: 'px-3   py-1.5 text-sm     rounded-xl   gap-2',   dot: 'w-2   h-2' },
}

export function StatusBadge({ status, label, size = 'sm', pulse }: StatusBadgeProps) {
  const { t } = useTranslation()
  const cfg = statusConfig[status] ?? statusConfig.CANCELLED
  const sz = sizeStyles[size]
  const shouldPulse = pulse ?? ACTIVE_STATUSES.includes(status)
  const displayLabel = label ?? (t.status[status as keyof typeof t.status] ?? status)

  return (
    <span className={cn(
      'inline-flex items-center font-semibold',
      cfg.bg, cfg.text, sz.wrap,
    )}>
      <span className={cn('rounded-full shrink-0', sz.dot, cfg.dot, shouldPulse && 'animate-pulse')} />
      {displayLabel}
    </span>
  )
}
