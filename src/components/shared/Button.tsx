import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from './cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'glass' | 'outline'
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  fullWidth?: boolean
}

const variants: Record<ButtonVariant, string> = {
  // Brand gradient — same in both themes, always readable
  primary: [
    'bg-gradient-brand text-white font-semibold',
    'shadow-[0_2px_12px_rgba(91,140,255,0.35)]',
    'hover:shadow-[0_4px_20px_rgba(91,140,255,0.5)] hover:brightness-110',
    'active:brightness-95',
  ].join(' '),

  secondary: [
    'bg-gradient-cyan text-white font-semibold',
    'shadow-[0_2px_12px_rgba(0,212,255,0.3)]',
    'hover:shadow-[0_4px_20px_rgba(0,212,255,0.45)] hover:brightness-110',
  ].join(' '),

  // Light: neutral card button / Dark: faint white overlay
  ghost: [
    'font-medium',
    'bg-gray-100 text-gray-700 border border-gray-200',
    'hover:bg-gray-200 hover:border-gray-300',
    'dark:bg-white/8 dark:text-white/75 dark:border-white/10',
    'dark:hover:bg-white/14 dark:hover:border-white/18',
  ].join(' '),

  // Outline — brand color border
  outline: [
    'font-semibold bg-transparent',
    'text-[#5B8CFF] border-2 border-[#5B8CFF]/50',
    'hover:bg-[#5B8CFF]/8 hover:border-[#5B8CFF]',
  ].join(' '),

  danger: [
    'bg-gradient-rose text-white font-semibold',
    'shadow-[0_2px_12px_rgba(239,68,68,0.3)]',
    'hover:brightness-110',
  ].join(' '),

  success: [
    'bg-gradient-emerald text-white font-semibold',
    'shadow-[0_2px_12px_rgba(34,197,94,0.3)]',
    'hover:brightness-110',
  ].join(' '),

  // Light: white with border / Dark: glass
  glass: [
    'font-medium',
    'bg-white text-gray-700 border border-gray-200 shadow-sm',
    'hover:bg-gray-50 hover:border-gray-300',
    'dark:bg-white/8 dark:text-white/80 dark:border-white/10',
    'dark:hover:bg-white/14 dark:hover:border-white/18',
  ].join(' '),
}

const sizes: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1    text-xs  rounded-lg',
  sm: 'px-3.5 py-1.5  text-xs  rounded-xl',
  md: 'px-5   py-2.5  text-sm  rounded-2xl',
  lg: 'px-6   py-3    text-base rounded-2xl',
  xl: 'px-8   py-4    text-base rounded-2xl',
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      disabled={disabled || isLoading}
      className={cn(
        'relative inline-flex items-center justify-center gap-2',
        'cursor-pointer transition-all duration-200 select-none',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8CFF]/50 focus-visible:ring-offset-1',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
        fullWidth && 'w-full',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Loading…</span>
        </>
      ) : children}
    </motion.button>
  )
}
