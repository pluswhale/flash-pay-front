/**
 * Page: Admin — Operators List
 * Route: /admin/operators
 *
 * ViewModel: useOperatorListViewModel
 */
import { Loader2, Phone, Calendar } from 'lucide-react'
import { useOperatorListViewModel } from '../../hooks/view-models/useAdminViewModel'

export function OperatorsPage() {
  const vm = useOperatorListViewModel()

  return (
    <div className="min-h-screen dark:bg-[#060d1f] bg-gray-50 pt-20 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-xl font-bold dark:text-white text-gray-900">Operators</h1>
          <p className="text-sm dark:text-gray-400 text-gray-500 mt-0.5">
            {vm.operators.length} registered operator{vm.operators.length !== 1 ? 's' : ''}
          </p>
        </div>

        {vm.isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin dark:text-blue-400 text-blue-600" />
          </div>
        ) : vm.isError ? (
          <p className="text-sm text-red-400">{vm.errorMessage}</p>
        ) : vm.operators.length === 0 ? (
          <p className="text-sm dark:text-gray-500 text-gray-400 text-center py-12">No operators registered yet</p>
        ) : (
          <div className="flex flex-col gap-3">
            {vm.operators.map((op) => (
              <div
                key={op.id}
                className="rounded-xl border dark:border-white/10 border-gray-200 dark:bg-white/5 bg-white p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-violet-600/20 flex items-center justify-center text-violet-400 font-semibold text-sm shrink-0">
                  {op?.phone?.slice(-2)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="dark:text-gray-500 text-gray-400" />
                    <span className="text-sm font-medium dark:text-white text-gray-900">{op.phone}</span>
                    {op.isPhoneVerified && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Verified
                      </span>
                    )}
                  </div>
                  {op.telegramUsername && (
                    <p className="text-xs dark:text-gray-500 text-gray-400 mt-0.5">@{op.telegramUsername}</p>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs dark:text-gray-500 text-gray-400 shrink-0">
                  <Calendar size={12} />
                  <span>{new Date(op.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
