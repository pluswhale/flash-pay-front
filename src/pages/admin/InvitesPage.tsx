/**
 * Page: Admin — Управление инвайтами
 * Route: /admin/invites
 */
import { useState }   from 'react'
import { Loader2, Plus, ChevronDown } from 'lucide-react'
import { useInviteManagementViewModel } from '../../hooks/view-models/useAdminViewModel'
import { InviteCard }                   from '../../components/invite/InviteCard'
import { Role }                         from '../../types/api'

export function InvitesPage() {
  const vm = useInviteManagementViewModel()
  const [role, setRole]   = useState<Role.CLIENT | Role.OPERATOR>(Role.CLIENT)
  const [hours, setHours] = useState(48)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold dark:text-white text-gray-900">Инвайт-ссылки</h1>
        <p className="text-sm dark:text-gray-400 text-gray-500 mt-0.5">
          Генерация одноразовых ссылок для регистрации клиентов и операторов
        </p>
      </div>

      {/* ── Generator ────────────────────────────────────────────────────── */}
      <div className="mb-8 rounded-2xl border dark:border-white/10 border-gray-200 dark:bg-white/5 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-sm font-semibold dark:text-white text-gray-900">Сгенерировать ссылку</h2>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[140px]">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role.CLIENT | Role.OPERATOR)}
              className="appearance-none w-full pl-4 pr-8 py-3 rounded-xl border dark:border-white/10 border-gray-200 dark:bg-white/5 bg-gray-50 dark:text-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value={Role.CLIENT}>Клиент</option>
              <option value={Role.OPERATOR}>Оператор</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none dark:text-gray-400 text-gray-500" />
          </div>

          <div className="relative flex-1 min-w-[140px]">
            <select
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="appearance-none w-full pl-4 pr-8 py-3 rounded-xl border dark:border-white/10 border-gray-200 dark:bg-white/5 bg-gray-50 dark:text-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value={24}>24 часа</option>
              <option value={48}>48 часов</option>
              <option value={72}>72 часа</option>
              <option value={168}>1 неделя</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none dark:text-gray-400 text-gray-500" />
          </div>

          <button
            type="button"
            onClick={() => vm.handleCreateInvite(role, hours)}
            disabled={vm.isCreating}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {vm.isCreating
              ? <><Loader2 size={16} className="animate-spin" /> Создание…</>
              : <><Plus size={16} /> Сгенерировать</>
            }
          </button>
        </div>

        {vm.createError && (
          <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{vm.createError}</p>
        )}

        {/* Newly created invite — show URL for copying */}
        {vm.createdInvite && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
            <p className="text-sm text-emerald-400 font-medium mb-1">Ссылка создана! Скопируйте и отправьте пользователю:</p>
            <p className="text-xs dark:text-gray-300 text-gray-700 break-all font-mono bg-black/10 rounded-lg px-3 py-2 mt-1 select-all">
              {vm.getInviteUrl(vm.createdInvite.code)}
            </p>
          </div>
        )}
      </div>

      {/* ── Invite list ──────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold dark:text-gray-300 text-gray-700 mb-4">
          Все инвайты ({vm.invites.length})
        </h2>

        {vm.isLoadingList ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin dark:text-blue-400 text-blue-600" />
          </div>
        ) : vm.listError ? (
          <p className="text-sm text-red-400">{vm.listError}</p>
        ) : vm.invites.length === 0 ? (
          <p className="text-sm dark:text-gray-500 text-gray-400 text-center py-12">Инвайтов пока нет</p>
        ) : (
          <div className="flex flex-col gap-3">
            {vm.invites.map((inv) => (
              <InviteCard key={inv.id} invite={inv} getInviteUrl={vm.getInviteUrl} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
