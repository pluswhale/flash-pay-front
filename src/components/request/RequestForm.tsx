/**
 * Pure component — multi-step OTC request form (Russian labels).
 * Steps: Направление → Сумма → Способ получения → Комментарий
 */
import { useState } from 'react'
import { ArrowRight, ArrowLeft, Loader2, ChevronDown } from 'lucide-react'
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

const CURRENCIES = ['USDT', 'USD', 'RUB', 'THB', 'AED', 'CNY']

type Step = 'direction' | 'amount' | 'method' | 'comment'
const STEPS: Step[] = ['direction', 'amount', 'method', 'comment']

const STEP_LABELS: Record<Step, string> = {
  direction: 'Направление',
  amount:    'Сумма',
  method:    'Способ',
  comment:   'Детали',
}

export function RequestForm({ onSubmit, isSubmitting, errorMessage }: Props) {
  const [step, setStep] = useState<Step>('direction')

  const [directionFrom, setDirectionFrom] = useState('')
  const [directionTo,   setDirectionTo]   = useState('')
  const [amount,        setAmount]        = useState('')
  const [currency,      setCurrency]      = useState('USDT')
  const [city,          setCity]          = useState('')
  const [country,       setCountry]       = useState('')
  const [payoutMethod,  setPayoutMethod]  = useState('')
  const [comment,       setComment]       = useState('')

  const stepIndex = STEPS.indexOf(step)
  const goNext    = () => setStep(STEPS[stepIndex + 1])
  const goBack    = () => setStep(STEPS[stepIndex - 1])

  const handleSubmit = () => {
    onSubmit({
      directionFrom,
      directionTo,
      amount:      Number(amount),
      currency,
      city:        city        || undefined,
      country:     country     || undefined,
      payoutMethod: payoutMethod || undefined,
      comment:     comment     || undefined,
    })
  }

  return (
    <div className="flex flex-col gap-5">
      {/* ── Progress bar ──────────────────────────────────────────────────── */}
      <div className="flex gap-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1 flex flex-col items-center gap-1">
            <div className={`h-1 w-full rounded-full transition-colors ${i <= stepIndex ? 'bg-blue-500' : 'dark:bg-white/10 bg-gray-200'}`} />
            <span className={`text-xs transition-colors ${i === stepIndex ? 'dark:text-blue-400 text-blue-600 font-medium' : 'dark:text-gray-600 text-gray-400'}`}>
              {STEP_LABELS[s]}
            </span>
          </div>
        ))}
      </div>

      {/* ── Шаг 1: Направление ─────────────────────────────────────────────── */}
      {step === 'direction' && (
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold dark:text-white text-gray-900">Выберите направление обмена</h3>
          <div className="grid grid-cols-2 gap-2">
            {DIRECTIONS.map((d) => {
              const selected = directionFrom === d.from && directionTo === d.to
              return (
                <button
                  key={`${d.from}-${d.to}`}
                  type="button"
                  onClick={() => { setDirectionFrom(d.from); setDirectionTo(d.to) }}
                  className={`p-3 rounded-xl border text-sm font-medium transition-colors ${
                    selected
                      ? 'border-blue-500 bg-blue-500/10 dark:text-blue-400 text-blue-600'
                      : 'dark:border-white/10 border-gray-200 dark:text-gray-300 text-gray-700 dark:hover:border-white/20 hover:border-gray-300'
                  }`}
                >
                  {d.from} → {d.to}
                </button>
              )
            })}
          </div>
          <button
            type="button"
            onClick={goNext}
            disabled={!directionFrom || !directionTo}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Далее <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* ── Шаг 2: Сумма ───────────────────────────────────────────────────── */}
      {step === 'amount' && (
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold dark:text-white text-gray-900">Сумма и валюта</h3>
          <div className="flex gap-2">
            <input
              type="number" min="0" step="0.01" placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border dark:border-white/10 border-gray-200 dark:bg-white/5 bg-white dark:text-white text-gray-900 dark:placeholder-gray-500 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="appearance-none pl-4 pr-8 py-3 rounded-xl border dark:border-white/10 border-gray-200 dark:bg-white/5 bg-white dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none dark:text-gray-400 text-gray-500" />
            </div>
          </div>
          <input
            type="text" placeholder="Город (необязательно)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="px-4 py-3 rounded-xl border dark:border-white/10 border-gray-200 dark:bg-white/5 bg-white dark:text-white text-gray-900 dark:placeholder-gray-500 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <input
            type="text" placeholder="Страна (необязательно)"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="px-4 py-3 rounded-xl border dark:border-white/10 border-gray-200 dark:bg-white/5 bg-white dark:text-white text-gray-900 dark:placeholder-gray-500 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <div className="flex gap-2">
            <button type="button" onClick={goBack} className="flex items-center gap-1 px-4 py-3 rounded-xl border dark:border-white/10 border-gray-200 dark:text-gray-300 text-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <ArrowLeft size={16} />
            </button>
            <button
              type="button" onClick={goNext}
              disabled={!amount || Number(amount) <= 0}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Далее <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Шаг 3: Способ получения ─────────────────────────────────────────── */}
      {step === 'method' && (
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold dark:text-white text-gray-900">Способ получения</h3>
          <div className="flex flex-col gap-2">
            {PAYOUT_METHODS.map((m) => (
              <button
                key={m} type="button"
                onClick={() => setPayoutMethod(m)}
                className={`px-4 py-3 rounded-xl border text-sm font-medium text-left transition-colors ${
                  payoutMethod === m
                    ? 'border-blue-500 bg-blue-500/10 dark:text-blue-400 text-blue-600'
                    : 'dark:border-white/10 border-gray-200 dark:text-gray-300 text-gray-700 dark:hover:border-white/20 hover:border-gray-300'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={goBack} className="flex items-center gap-1 px-4 py-3 rounded-xl border dark:border-white/10 border-gray-200 dark:text-gray-300 text-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <ArrowLeft size={16} />
            </button>
            <button
              type="button" onClick={goNext}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors"
            >
              Далее <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Шаг 4: Комментарий + подтверждение ─────────────────────────────── */}
      {step === 'comment' && (
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold dark:text-white text-gray-900">Дополнительная информация</h3>
          <textarea
            rows={3} placeholder="Комментарий (необязательно)…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="px-4 py-3 rounded-xl border dark:border-white/10 border-gray-200 dark:bg-white/5 bg-white dark:text-white text-gray-900 dark:placeholder-gray-500 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
          />

          {/* Summary */}
          <div className="rounded-xl dark:bg-white/5 bg-gray-50 border dark:border-white/10 border-gray-200 p-4 space-y-1.5 text-sm">
            <Row label="Направление"      value={`${directionFrom} → ${directionTo}`} />
            <Row label="Сумма"            value={`${amount} ${currency}`} />
            {payoutMethod && <Row label="Способ получения" value={payoutMethod} />}
            {city          && <Row label="Город"           value={city} />}
          </div>

          {errorMessage && (
            <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-4 py-2">{errorMessage}</p>
          )}

          <div className="flex gap-2">
            <button type="button" onClick={goBack} className="flex items-center gap-1 px-4 py-3 rounded-xl border dark:border-white/10 border-gray-200 dark:text-gray-300 text-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <ArrowLeft size={16} />
            </button>
            <button
              type="button" onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting
                ? <><Loader2 size={16} className="animate-spin" /> Создание…</>
                : 'Сформировать заявку'
              }
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="dark:text-gray-400 text-gray-500">{label}</span>
      <span className="font-medium dark:text-gray-200 text-gray-800">{value}</span>
    </div>
  )
}
