import { motion }              from 'framer-motion'
import { RequestStatusBadge }  from '../request/RequestStatusBadge'
import { cn }                  from '../shared/cn'
import type { OtcRequest }     from '../../types/api'

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'только что'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}м`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}ч`
  return `${Math.floor(h / 24)}д`
}

interface Props {
  request:  OtcRequest
  isActive: boolean
  index:    number
  onSelect: (id: string) => void
}

export function QueueItem({ request: req, isActive, index, onSelect }: Props) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={() => onSelect(req.id)}
      className={cn(
        'w-full text-left p-3 rounded-2xl transition-all duration-200 border-l-2',
        isActive
          ? 'border-l-[#5B8CFF] bg-[#5B8CFF]/12'
          : 'border-l-transparent bg-white/3 hover:bg-white/6',
      )}
    >
      <div className="flex items-start justify-between gap-1.5 mb-1.5">
        <span className="font-bold text-xs text-white truncate">{req.client.name}</span>
        <span className="text-[10px] text-white/25 shrink-0">{timeAgo(req.createdAt)}</span>
      </div>
      <p className="text-[11px] text-white/40 mb-2">
        {req.directionFrom} → {req.directionTo}
        {' · '}
        {Number(req.amount).toLocaleString('ru-RU')} {req.currency}
      </p>
      <RequestStatusBadge status={req.status} />
    </motion.button>
  )
}
