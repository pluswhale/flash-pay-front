/**
 * Pure component — scrollable list of request cards. Russian empty states.
 */
import { Loader2, InboxIcon } from 'lucide-react'
import { RequestCard } from './RequestCard'
import type { OtcRequest } from '../../types/api'

interface Props {
  requests:  OtcRequest[]
  isLoading: boolean
  onSelect:  (id: string) => void
}

export function RequestList({ requests, isLoading, onSelect }: Props) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin dark:text-blue-400 text-blue-600" />
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 dark:text-gray-500 text-gray-400">
        <InboxIcon size={40} strokeWidth={1} />
        <p className="text-sm">Заявок нет</p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {requests.map((req) => (
        <li key={req.id}>
          <RequestCard request={req} onClick={onSelect} />
        </li>
      ))}
    </ul>
  )
}
