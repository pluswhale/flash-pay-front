/**
 * UI Kit — Input
 *
 * Labeled input field with optional leading icon (prefix), trailing element (suffix),
 * error message, and hint text. Supports all standard HTML input attributes.
 *
 * Usage:
 *   <Input
 *     label="Номер телефона"
 *     prefix={<Phone size={16} />}
 *     placeholder="+7 999 000 00 00"
 *     value={phone}
 *     onChange={(e) => setPhone(e.target.value)}
 *     error={error}
 *   />
 */
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../components/shared/cn'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?:     string
  prefix?:    ReactNode
  suffix?:    ReactNode
  error?:     string
  hint?:      string
  /** Larger text size — useful for amount/number inputs */
  large?:     boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, prefix, suffix, error, hint, large, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full min-w-0">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium mb-1.5 select-none text-secondary"
          >
            {label}
          </label>
        )}

        <div className={cn(
          'relative flex items-center w-full transition-all duration-200',
          'input-surface rounded-xl',
          error && [
            'border-red-400/70 dark:border-red-500/50',
            'focus-within:border-red-500 focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]',
          ],
        )}>
          {prefix && (
            <div className="flex items-center pl-3.5 pr-2 shrink-0 text-gray-400 dark:text-white/35 pointer-events-none">
              {prefix}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              'flex-1 min-w-0 w-full bg-transparent outline-none caret-brand',
              'text-gray-900 placeholder-gray-400',
              'dark:text-white dark:placeholder-white/30',
              large ? 'text-xl font-bold py-4 px-4' : 'text-sm py-3 px-4',
              prefix && 'pl-0',
              suffix && 'pr-0',
              'disabled:opacity-50',
              className,
            )}
            {...props}
          />

          {suffix && (
            <div className="flex items-center pr-3.5 pl-2 shrink-0 text-gray-400 dark:text-white/40">
              {suffix}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-muted">{hint}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
