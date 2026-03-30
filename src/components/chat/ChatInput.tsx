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
    <div className="border-t dark:border-white/8 border-gray-200 dark:bg-surface-1 bg-white">
      {/* ── Quick reply chips ─────────────────────────────────────────────── */}
      {quickReplies && quickReplies.length > 0 && (
        <div className="px-4 pt-2 pb-1 flex flex-wrap gap-1.5">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              type="button"
              disabled={disabled}
              onClick={() => { onSend(reply) }}
              className="px-2.5 py-1 rounded-full text-xs border dark:border-blue-500/30 border-blue-300 dark:text-blue-400 text-blue-600 dark:bg-blue-500/10 bg-blue-50 hover:dark:bg-blue-500/20 hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

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
          className="flex-1 resize-none rounded-xl border dark:border-white/10 border-gray-200 dark:bg-white/5 bg-gray-50 px-4 py-2.5 text-sm dark:text-white text-gray-900 dark:placeholder-gray-500 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 max-h-[120px] overflow-y-auto"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <SendHorizonal size={16} />
        </button>
      </form>
    </div>
  )
}
