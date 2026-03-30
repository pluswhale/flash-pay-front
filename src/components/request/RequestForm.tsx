/**
 * Pure component — single-page OTC request form. Russian labels.
 */
import { useState } from 'react'
import { ArrowRight, MapPin, MessageSquare } from 'lucide-react'
import type { CreateRequestDto } from '../../types/api'
import { Button } from '../../ui'
import { GlassSelect, type SelectOption } from '../../shared/ui/GlassSelect'

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

const PHYSICAL_METHODS = new Set(['Банкомат', 'Наличными (курьер)'])

// Module-level option arrays — stable references (AGENTS.md 5.4)
const CURRENCY_OPTIONS: SelectOption[] = CURRENCIES.map((c) => ({ value: c, label: c }))
const PAYOUT_OPTIONS: SelectOption[]   = PAYOUT_METHODS.map((m) => ({ value: m, label: m }))

// Shared control styles using design-system tokens
const INPUT_CLS =
  'px-4 py-3 rounded-xl input-surface ' +
  'focus:outline-none focus:ring-2 focus:ring-brand/40 ' +
  'transition-shadow w-full'

const LABEL_CLS =
  'flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ' +
  'text-muted mb-2'

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
                    ? 'border-brand bg-brand/10 text-brand shadow-[0_0_0_1px_rgba(91,140,255,0.4)]'
                    : 'dark:border-white/10 border-gray-200 text-secondary dark:hover:border-white/20 hover:border-gray-300 dark:hover:bg-white/5 hover:bg-gray-50',
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
          {/* Currency selector — compact fixed-width (AGENTS.md 5.4: stable CURRENCY_OPTIONS ref) */}
          <GlassSelect
            options={CURRENCY_OPTIONS}
            value={currency}
            onChange={setCurrency}
            className="w-[100px] shrink-0"
          />
        </div>
      </div>

      {/* ── Способ получения ───────────────────────────────────────── */}
      <div>
        <p className={LABEL_CLS}>Способ получения</p>
        <GlassSelect
          options={PAYOUT_OPTIONS}
          value={payoutMethod}
          onChange={setPayoutMethod}
          placeholder="Выберите способ…"
        />
      </div>

      {/* ── Локация (условная) ─────────────────────────────────────── */}
      {showLocation ? (
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
      ) : null}

      {/* ── Комментарий ────────────────────────────────────────────── */}
      <div>
        <p className={LABEL_CLS}>
          <MessageSquare size={11} />
          Комментарий
          <span className="normal-case font-normal opacity-55 ml-0.5">— необязательно</span>
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
      {errorMessage !== null ? (
        <p className="text-sm text-red-400 bg-red-500/10 rounded-xl px-4 py-2.5 border border-red-500/20">
          {errorMessage}
        </p>
      ) : null}

      {/* ── Кнопка ─────────────────────────────────────────────────── */}
      <Button
        type="button"
        variant="primary"
        size="lg"
        fullWidth
        onClick={handleSubmit}
        disabled={!canSubmit}
        isLoading={isSubmitting}
        loadingLabel="Создание…"
      >
        Создать заявку
      </Button>
    </div>
  )
}
