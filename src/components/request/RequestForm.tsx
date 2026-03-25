/**
 * Pure component — single-page OTC request form. Russian labels.
 * Replaces the previous multi-step form.
 */
import { useState } from 'react'
import { ArrowRight, ChevronDown, Loader2, MapPin, MessageSquare } from 'lucide-react'
import type { CreateRequestDto } from '../../types/api'

interface Props {
  onSubmit:     (data: CreateRequestDto) => void
  isSubmitting: boolean
  errorMessage: string | null
}

const DIRECTIONS = [
  { from: 'USDT', to: 'RUB'  },
  { from: 'USDT', to: 'THB'  },
  { from: 'USDT', to: 'AED'  },
  { from: 'USDT', to: 'CNY'  },
  { from: 'RUB',  to: 'USDT' },
  { from: 'RUB',  to: 'THB'  },
  { from: 'USD',  to: 'THB'  },
  { from: 'RUB',  to: 'CNY'  },
]

const PAYOUT_METHODS = [
  'Банкомат',
  'На банковский счёт',
  'Наличными (курьер)',
  'Криптокошелёк',
  'Перевод по номеру телефона',
]

const CURRENCIES = ['USDT', 'USD', 'EUR', 'RUB', 'THB', 'AED', 'CNY']

// These methods imply a physical location is relevant
const PHYSICAL_METHODS = new Set(['Банкомат', 'Наличными (курьер)'])

const INPUT_CLS =
  'px-4 py-3 rounded-xl border dark:border-white/10 border-gray-200 ' +
  'dark:bg-white/5 bg-white dark:text-white text-gray-900 ' +
  'dark:placeholder-gray-500 placeholder-gray-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500/50 ' +
  'transition-shadow w-full'

const LABEL_CLS =
  'flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ' +
  'dark:text-gray-500 text-gray-400 mb-2'

export function RequestForm({ onSubmit, isSubmitting, errorMessage }: Props) {
  const [directionFrom, setDirectionFrom] = useState('')
  const [directionTo,   setDirectionTo]   = useState('')
  const [amount,        setAmount]        = useState('')
  const [currency,      setCurrency]      = useState('USDT')
  const [payoutMethod,  setPayoutMethod]  = useState('')
  const [country,       setCountry]       = useState('')
  const [city,          setCity]          = useState('')
  const [comment,       setComment]       = useState('')

  const showLocation = PHYSICAL_METHODS.has(payoutMethod) || Boolean(country || city)
  const canSubmit    = Boolean(directionFrom && directionTo && amount && Number(amount) > 0)

  const handleSubmit = () => {
    if (!canSubmit || isSubmitting) return
    onSubmit({
      directionFrom,
      directionTo,
      amount:       Number(amount),
      currency,
      payoutMethod: payoutMethod || undefined,
      country:      country      || undefined,
      city:         city         || undefined,
      comment:      comment      || undefined,
    })
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Направление ────────────────────────────────────────────── */}
      <div>
        <p className={LABEL_CLS}>Направление обмена</p>
        <div className="grid grid-cols-2 gap-2">
          {DIRECTIONS.map((d) => {
            const selected = directionFrom === d.from && directionTo === d.to
            return (
              <button
                key={`${d.from}-${d.to}`}
                type="button"
                onClick={() => {
                  setDirectionFrom(d.from)
                  setDirectionTo(d.to)
                  setCurrency(d.from)
                }}
                className={[
                  'flex items-center justify-center gap-1.5 p-3 rounded-xl border text-sm font-medium transition-all',
                  selected
                    ? 'border-blue-500 bg-blue-500/10 dark:text-blue-400 text-blue-600 shadow-[0_0_0_1px_rgba(59,130,246,0.4)]'
                    : 'dark:border-white/10 border-gray-200 dark:text-gray-300 text-gray-700 dark:hover:border-white/20 hover:border-gray-300 dark:hover:bg-white/5 hover:bg-gray-50',
                ].join(' ')}
              >
                <span>{d.from}</span>
                <ArrowRight size={11} className="opacity-50 shrink-0" />
                <span>{d.to}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Сумма ──────────────────────────────────────────────────── */}
      <div>
        <p className={LABEL_CLS}>Сумма</p>
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={INPUT_CLS + ' flex-1 min-w-0'}
          />
          <div className="relative shrink-0">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={[
                'appearance-none pl-4 pr-8 py-3 rounded-xl border',
                'dark:border-white/10 border-gray-200',
                'dark:bg-[#1a2235] bg-white dark:text-white text-gray-900',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
              ].join(' ')}
            >
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none dark:text-gray-400 text-gray-500" />
          </div>
        </div>
      </div>

      {/* ── Способ получения ───────────────────────────────────────── */}
      <div>
        <p className={LABEL_CLS}>Способ получения</p>
        <div className="relative">
          <select
            value={payoutMethod}
            onChange={(e) => setPayoutMethod(e.target.value)}
            className={[
              'w-full appearance-none pl-4 pr-9 py-3 rounded-xl border',
              'dark:border-white/10 border-gray-200',
              'dark:bg-[#1a2235] bg-white dark:text-white text-gray-900',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
            ].join(' ')}
          >
            <option value="">Выберите способ…</option>
            {PAYOUT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none dark:text-gray-400 text-gray-500" />
        </div>
      </div>

      {/* ── Локация (условная) ─────────────────────────────────────── */}
      {showLocation && (
        <div>
          <p className={LABEL_CLS}>
            <MapPin size={11} />
            Локация
          </p>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Страна"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className={INPUT_CLS}
            />
            <input
              type="text"
              placeholder="Город"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
        </div>
      )}

      {/* ── Комментарий ────────────────────────────────────────────── */}
      <div>
        <p className={LABEL_CLS}>
          <MessageSquare size={11} />
          Комментарий
          <span className="normal-case font-normal opacity-60 ml-0.5">— необязательно</span>
        </p>
        <textarea
          rows={2}
          placeholder="Любые уточнения по заявке…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className={INPUT_CLS + ' resize-none'}
        />
      </div>

      {/* ── Ошибка ─────────────────────────────────────────────────── */}
      {errorMessage && (
        <p className="text-sm text-red-400 bg-red-500/10 rounded-xl px-4 py-2.5 border border-red-500/20">
          {errorMessage}
        </p>
      )}

      {/* ── Кнопка ─────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit || isSubmitting}
        className={[
          'w-full flex items-center justify-center gap-2 py-3.5 rounded-xl',
          'bg-blue-600 text-white font-semibold text-sm',
          'hover:bg-blue-500 transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        ].join(' ')}
      >
        {isSubmitting
          ? <><Loader2 size={15} className="animate-spin" /> Создание…</>
          : 'Создать заявку'
        }
      </button>
    </div>
  )
}
