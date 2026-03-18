import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from './cn'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string
  prefix?: ReactNode
  suffix?: ReactNode
  error?: string
  hint?: string
  large?: boolean
  pill?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, prefix, suffix, error, hint, large, pill, className, ...props }, ref) => {
    return (
      <div className="w-full min-w-0">
        {label && (
          <label className="block text-xs font-medium mb-1.5 select-none text-gray-500 dark:text-white/50">
            {label}
          </label>
        )}
        <div className={cn(
          'relative flex items-center w-full transition-all duration-200 border',
          /* Light */
          'bg-white border-gray-300',
          'focus-within:border-[#5B8CFF] focus-within:shadow-[0_0_0_3px_rgba(91,140,255,0.15)]',
          /* Dark */
          'dark:bg-white/5 dark:border-white/10',
          'dark:focus-within:border-[#5B8CFF]/60 dark:focus-within:shadow-[0_0_0_3px_rgba(91,140,255,0.2)]',
          error && [
            'border-red-400 dark:border-red-500/60',
            'focus-within:border-red-500 focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]',
            'dark:focus-within:border-red-500/70 dark:focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.2)]',
          ],
          pill ? 'rounded-full' : large ? 'rounded-2xl' : 'rounded-xl',
        )}>
          {prefix && (
            <div className="flex items-center pl-3.5 pr-2 shrink-0 text-gray-400 dark:text-white/40">
              {prefix}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'flex-1 min-w-0 w-full bg-transparent outline-none caret-[#5B8CFF]',
              'text-gray-900 placeholder-gray-400',
              'dark:text-white dark:placeholder-white/30',
              large ? 'text-2xl font-bold py-4 px-4' : 'text-sm py-3 px-4',
              prefix && 'pl-0',
              suffix && 'pr-0',
              className
            )}
            {...props}
          />
          {suffix && (
            <div className="flex items-center pr-3.5 pl-2 shrink-0">
              {suffix}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-gray-400 dark:text-white/40">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
