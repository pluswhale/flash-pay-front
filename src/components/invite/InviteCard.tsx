/**
 * Pure component — single invite card with copy button. Russian labels.
 */
import { useState } from 'react'
import { Copy, Check, Clock, UserCheck } from 'lucide-react'
import type { Invite } from '../../types/api'

interface Props {
  invite:       Invite
  getInviteUrl: (code: string) => string
}

const ROLE_LABEL: Record<string, string> = {
  client:   'Клиент',
  operator: 'Оператор',
  admin:    'Администратор',
}

export function InviteCard({ invite, getInviteUrl }: Props) {
  const [copied, setCopied] = useState(false)
  const url       = getInviteUrl(invite.code)
  const expiresAt = new Date(invite.expiresAt)
  const isExpired = expiresAt < new Date()
  const isUsed    = Boolean(invite.usedAt)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  const statusClass = isUsed
    ? 'bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400 text-emerald-600'
    : isExpired
      ? 'bg-red-500/10 border-red-500/20 dark:text-red-400 text-red-600'
      : 'bg-blue-500/10 border-blue-500/20 dark:text-blue-400 text-blue-600'

  const statusLabel = isUsed ? 'Использован' : isExpired ? 'Истёк' : 'Активен'

  return (
    <div className="rounded-xl border dark:border-white/10 border-gray-200 dark:bg-white/5 bg-white p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="font-mono text-sm font-semibold dark:text-white text-gray-900">{invite.code}</span>
          <p className="text-xs dark:text-gray-500 text-gray-400 mt-0.5">
            Роль: <span className="font-medium">{ROLE_LABEL[invite.role] ?? invite.role}</span>
          </p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${statusClass}`}>
          {statusLabel}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs dark:text-gray-500 text-gray-400">
        <span className="flex items-center gap-1">
          <Clock size={11} />
          Истекает {expiresAt.toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </span>
        {isUsed && (
          <span className="flex items-center gap-1 dark:text-emerald-400 text-emerald-600">
            <UserCheck size={11} /> Использован
          </span>
        )}
      </div>

      {!isUsed && !isExpired && (
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg dark:bg-white/5 bg-gray-50 border dark:border-white/10 border-gray-200 dark:text-gray-300 text-gray-700 hover:border-blue-500/40 transition-colors"
        >
          {copied
            ? <><Check size={13} className="text-emerald-400" /> Скопировано!</>
            : <><Copy size={13} /> Скопировать ссылку</>
          }
        </button>
      )}
    </div>
  )
}
