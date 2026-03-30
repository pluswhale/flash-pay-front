/**
 * Page: Admin — Управление инвайтами
 * Route: /admin/invites
 */
import { useState }   from 'react'
import { Loader2, Plus } from 'lucide-react'
import { useInviteManagementViewModel } from '../../hooks/view-models/useAdminViewModel'
import { InviteCard }                   from '../../components/invite/InviteCard'
import { Role }                         from '../../types/api'
import { GlassSelect, type SelectOption } from '../../shared/ui/GlassSelect'

// Module-level option arrays — stable references (AGENTS.md 5.4)
const ROLE_OPTIONS: SelectOption[] = [
  { value: Role.CLIENT,   label: 'Клиент'   },
  { value: Role.OPERATOR, label: 'Оператор' },
]

const HOURS_OPTIONS: SelectOption[] = [
  { value: '24',  label: '24 часа'   },
  { value: '48',  label: '48 часов'  },
  { value: '72',  label: '72 часа'   },
  { value: '168', label: '1 неделя'  },
]

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
          {/* Role selector */}
          <GlassSelect
            options={ROLE_OPTIONS}
            value={role}
            onChange={(v) => setRole(v as Role.CLIENT | Role.OPERATOR)}
            className="flex-1 min-w-[140px]"
          />

          {/* Expiry selector — value/onChange convert between string and number */}
          <GlassSelect
            options={HOURS_OPTIONS}
            value={String(hours)}
            onChange={(v) => setHours(Number(v))}
            className="flex-1 min-w-[140px]"
          />

          <button
            type="button"
            onClick={() => vm.handleCreateInvite(role, hours)}
            disabled={vm.isCreating}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {vm.isCreating ? (
              <><Loader2 size={16} className="animate-spin" /> Создание…</>
            ) : (
              <><Plus size={16} /> Сгенерировать</>
            )}
          </button>
        </div>

        {vm.createError !== null && vm.createError !== undefined ? (
          <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{vm.createError}</p>
        ) : null}

        {/* Newly created invite — show URL for copying */}
        {vm.createdInvite !== null && vm.createdInvite !== undefined ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
            <p className="text-sm text-emerald-400 font-medium mb-1">Ссылка создана! Скопируйте и отправьте пользователю:</p>
            <p className="text-xs dark:text-gray-300 text-gray-700 break-all font-mono bg-black/10 rounded-lg px-3 py-2 mt-1 select-all">
              {vm.getInviteUrl(vm.createdInvite.code)}
            </p>
          </div>
        ) : null}
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
