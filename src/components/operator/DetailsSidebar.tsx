/**
 * DetailsSidebar — right column of the operator CRM (desktop only).
 * Exports `DetailsContent` for reuse in DetailsDrawer (mobile).
 *
 * Pure UI: receives pre-loaded data and callbacks. No hooks, no state.
 */
import { User, Clock, X }         from 'lucide-react'
import { RequestStatusBadge }     from '../request/RequestStatusBadge'
import { StatusTransitionButton } from '../request/StatusTransitionButton'
import { cn }                     from '../shared/cn'
import { RequestStatus }          from '../../types/api'
import type { OtcRequest, EventLog } from '../../types/api'

// ── Prop types (explicit interfaces avoid importing hooks into components) ──────

export interface DetailVm {
  request:      OtcRequest | undefined
  events:       EventLog[]
  isLoading:    boolean
  isError:      boolean
  errorMessage: string | null
}

export interface TransitionVm {
  getAllowedTransitions: (status: RequestStatus) => RequestStatus[]
  handleTransition:     (status: RequestStatus) => void
  isTransitioning:      boolean
  transitionError:      string | null
}

interface ContentProps {
  detail:     DetailVm
  transition: TransitionVm
  onClose?:   () => void
}

// ── Shared panel content — used by both sidebar and drawer ────────────────────

export function DetailsContent({ detail, transition, onClose }: ContentProps) {
  const req = detail.request

  if (!req) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4 py-8">
        <User size={24} className="text-white/15" />
        <p className="text-xs text-white/25 leading-relaxed">
          Выберите заявку, чтобы увидеть детали
        </p>
      </div>
    )
  }

  const nextStatuses = transition.getAllowedTransitions(req.status)

  return (
    <div className="flex flex-col h-full overflow-y-auto">

      {/* Panel header */}
      <div className="shrink-0 flex items-center justify-between px-3 pt-3 pb-2 border-b border-white/6">
        <span className="text-xs font-black text-white/40 uppercase tracking-widest">Детали</span>
        {onClose && (
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/10 transition-all"
          >
            <X size={11} />
          </button>
        )}
      </div>

      <div className="flex-1 p-3 space-y-3 overflow-y-auto">

        {/* Client card */}
        <DetailSection title="Клиент">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#5B8CFF]/10 to-[#7C5CFF]/8 border border-[#5B8CFF]/15">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5B8CFF] to-[#7C5CFF] flex items-center justify-center text-sm font-black text-white shrink-0">
              {req.client.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-white truncate">{req.client.name}</p>
              <p className="text-[11px] text-white/40">{req.client.user?.phone}</p>
              {req.client.level && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/8 text-white/40 capitalize">
                  {req.client.level}
                </span>
              )}
            </div>
          </div>
        </DetailSection>

        {/* Request info */}
        <DetailSection title="Заявка">
          <InfoRow label="Направление" value={`${req.directionFrom} → ${req.directionTo}`} />
          <InfoRow
            label="Сумма"
            value={`${Number(req.amount).toLocaleString('ru-RU')} ${req.currency}`}
            highlight
          />
          {req.payoutMethod && <InfoRow label="Способ"  value={req.payoutMethod} />}
          {req.city          && <InfoRow label="Город"  value={req.city} />}
          {req.country       && <InfoRow label="Страна" value={req.country} />}
          {req.comment && (
            <div className="pt-2 border-t border-white/8">
              <p className="text-[10px] text-white/30 mb-1 uppercase tracking-wide">Комментарий</p>
              <p className="text-xs text-white/60 leading-relaxed">{req.comment}</p>
            </div>
          )}
          <div className="pt-2 border-t border-white/8">
            <RequestStatusBadge status={req.status} />
          </div>
        </DetailSection>

        {/* Status transitions */}
        {nextStatuses.length > 0 && (
          <DetailSection title="Действия">
            <div className="flex flex-col gap-2">
              {nextStatuses.map((status) => (
                <StatusTransitionButton
                  key={status}
                  targetStatus={status}
                  onClick={transition.handleTransition}
                  isLoading={transition.isTransitioning}
                />
              ))}
            </div>
            {transition.transitionError && (
              <p className="mt-2 text-xs text-red-400">{transition.transitionError}</p>
            )}
          </DetailSection>
        )}

        {/* Event log */}
        {detail.events.length > 0 && (
          <DetailSection title="Журнал">
            <ul className="space-y-2">
              {(detail.events as EventLog[]).map((ev) => (
                <li key={ev.id} className="flex items-start gap-2 text-xs">
                  <Clock size={11} className="shrink-0 mt-0.5 text-white/30" />
                  <div>
                    <span className="text-white/55">{ev.eventType}</span>
                    <span className="text-white/25 ml-2">
                      {new Date(ev.createdAt).toLocaleTimeString('ru-RU', {
                        hour:   '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </DetailSection>
        )}
      </div>
    </div>
  )
}

// ── Desktop sidebar wrapper ───────────────────────────────────────────────────

interface SidebarProps {
  detail:     DetailVm
  transition: TransitionVm
}

export function DetailsSidebar({ detail, transition }: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-72 shrink-0 bg-[#0f1726]/80 backdrop-blur-xl border-l border-white/6 overflow-y-auto">
      <DetailsContent detail={detail} transition={transition} />
    </aside>
  )
}

// ── Local helper components ───────────────────────────────────────────────────

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 overflow-hidden">
      <div className="px-3 pt-2.5 pb-1">
        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{title}</p>
      </div>
      <div className="px-3 pb-3 space-y-2">{children}</div>
    </div>
  )
}

function InfoRow({
  label,
  value,
  highlight = false,
}: {
  label:      string
  value:      string
  highlight?: boolean
}) {
  return (
    <div className="flex justify-between items-center text-xs gap-2">
      <span className="text-white/35 shrink-0">{label}</span>
      <span className={cn(
        'font-semibold text-right',
        highlight ? 'text-[#7AAEFF]' : 'text-white/65',
      )}>
        {value}
      </span>
    </div>
  )
}
