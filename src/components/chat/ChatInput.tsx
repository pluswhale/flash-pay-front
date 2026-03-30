/**
 * Pure component — chat message input with optional quick-reply chips.
 * quickReplies: array of Russian template strings shown above the input.
 */
import { useState, useRef, type FormEvent, type KeyboardEvent } from 'react'
import { SendHorizonal } from 'lucide-react'

interface Props {
  onSend:        (content: string) => void
  onTyping:      () => void
  disabled?:     boolean
  quickReplies?: string[]
}

export function ChatInput({ onSend, onTyping, disabled, quickReplies }: Props) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSend(trimmed)
    setValue('')
    if (inputRef.current) inputRef.current.style.height = 'auto'
  }

  const handleSubmit = (e: FormEvent) => { e.preventDefault(); submit() }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    onTyping()
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  return (
    // Container: subtle backdrop blur so it feels glassy above the message list
    <div className="border-t dark:border-white/8 border-gray-200
                    dark:bg-surface-1/95 bg-white/95 backdrop-blur-sm">

      {/* ── Quick reply chips ─────────────────────────────────────────────── */}
      {quickReplies !== undefined && quickReplies.length > 0 ? (
        <div className="px-4 pt-2.5 pb-1 flex flex-wrap gap-1.5">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              type="button"
              disabled={disabled}
              onClick={() => { onSend(reply) }}
              className="px-2.5 py-1 rounded-full text-xs font-medium transition-colors duration-150
                         border dark:border-brand/30 border-brand/40
                         dark:text-brand text-blue-600
                         dark:bg-brand/[0.08] bg-brand/[0.06]
                         hover:dark:bg-brand/[0.16] hover:bg-brand/[0.12]
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {reply}
            </button>
          ))}
        </div>
      ) : null}

      {/* ── Input bar ─────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2 px-4 py-3">
        <textarea
          ref={inputRef}
          rows={1}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Напишите сообщение… (Enter — отправить)"
          className="flex-1 resize-none rounded-xl text-sm max-h-[120px] overflow-y-auto
                     px-4 py-2.5
                     input-surface
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40
                     transition-shadow duration-150
                     dark:placeholder-white/30 placeholder-gray-400"
        />

        {/* Send button — brand gradient with glow on hover */}
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl
                     bg-gradient-brand text-white
                     shadow-[0_2px_10px_rgba(91,140,255,0.30)]
                     hover:brightness-110 hover:shadow-[0_4px_18px_rgba(91,140,255,0.45)]
                     transition-all duration-200
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
        >
          <SendHorizonal size={16} />
        </button>
      </form>
    </div>
  )
}
