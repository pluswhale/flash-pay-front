/**
 * Shared UI — GlassSelect
 * /shared/ui/GlassSelect.tsx
 *
 * Custom dropdown with glass/input-surface styling.
 * Pure CSS transitions — no animation library dependency (AGENTS.md 2.3).
 * Fully theme-aware: light and dark via design-system tokens.
 *
 * Usage:
 *   <GlassSelect
 *     options={[{ value: 'a', label: 'Alpha' }]}
 *     value={val}
 *     onChange={setVal}
 *     placeholder="Pick one…"
 *   />
 *
 * AGENTS.md rules applied:
 *   5.6  — click-outside / escape effects narrow deps to [open]
 *   5.7  — toggle + select logic live entirely in event handlers
 *   5.9  — functional setState for toggle to avoid stale closure
 *   6.8  — explicit ternary conditional rendering (no &&)
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down'

export interface SelectOption {
  value: string
  label: string
}

// AGENTS.md 5.4 — stable default for non-primitive optional prop
const EMPTY_OPTIONS: SelectOption[] = []

interface Props {
  options:      SelectOption[]
  value:        string
  onChange:     (value: string) => void
  placeholder?: string
  className?:   string
  disabled?:    boolean
}

export function GlassSelect({
  options     = EMPTY_OPTIONS,
  value,
  onChange,
  placeholder = 'Выберите…',
  className   = '',
  disabled    = false,
}: Props) {
  const [open, setOpen]    = useState(false)
  const containerRef       = useRef<HTMLDivElement>(null)

  // Close on outside click — listener attached only while open (AGENTS.md 5.6)
  useEffect(() => {
    if (!open) return
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  // Close on Escape / Tab — attached only while open (AGENTS.md 5.6)
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Tab') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  // All interaction logic in handlers (AGENTS.md 5.7)
  // Functional setState prevents stale closure (AGENTS.md 5.9)
  const toggle = useCallback(() => {
    if (!disabled) setOpen((prev) => !prev)
  }, [disabled])

  const select = useCallback((val: string) => {
    onChange(val)
    setOpen(false)
  }, [onChange])

  const selectedLabel = options.find((o) => o.value === value)?.label

  return (
    <div ref={containerRef} className={`relative ${className}`}>

      {/* ── Trigger ──────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={[
          'w-full flex items-center justify-between gap-2',
          'px-4 py-3 rounded-xl text-sm text-left',
          'input-surface',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
          'transition-shadow duration-150',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        ].join(' ')}
      >
        {/* Label or placeholder */}
        <span className={selectedLabel !== undefined ? 'text-primary' : 'text-muted'}>
          {selectedLabel !== undefined ? selectedLabel : placeholder}
        </span>

        {/* Chevron rotates 180° when open */}
        <span className={`shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : 'rotate-0'}`}>
          <ChevronDown size={14} className="text-muted" />
        </span>
      </button>

      {/* ── Dropdown list ────────────────────────────────────────────────── */}
      {/* scale-y animates from top (origin-top), opacity fades in/out */}
      <div
        role="listbox"
        className={[
          'absolute z-50 w-full mt-1 rounded-xl overflow-hidden',
          'dropdown-surface',
          'origin-top transition-all duration-150 ease-out',
          open
            ? 'opacity-100 scale-y-100 pointer-events-auto'
            : 'opacity-0 scale-y-95 pointer-events-none',
        ].join(' ')}
      >
        {options.map((opt) => {
          const isSelected = opt.value === value
          return (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => select(opt.value)}
              className={[
                'w-full text-left px-4 py-2.5 text-sm',
                'transition-colors duration-100',
                isSelected
                  ? 'bg-brand/10 text-brand font-medium'
                  : [
                      'text-secondary hover:text-primary',
                      'hover:bg-gray-50 dark:hover:bg-white/5',
                    ].join(' '),
              ].join(' ')}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

    </div>
  )
}
