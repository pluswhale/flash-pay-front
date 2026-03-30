/**
 * UI Kit — Button
 *
 * Variants : primary (brand gradient) · secondary (cyan) · ghost · glass · outline · danger · success
 * Sizes    : xs · sm · md · lg · xl
 *
 * Usage:
 *   <Button variant="primary" size="lg" fullWidth isLoading={pending} loadingLabel="Отправка…">
 *     Отправить
 *   </Button>
 */
import { motion, type HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '../components/shared/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'glass' | 'outline' | 'danger' | 'success'
export type ButtonSize    = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?:      ButtonVariant
  size?:         ButtonSize
  isLoading?:    boolean
  loadingLabel?: string
  fullWidth?:    boolean
}

const variantCls: Record<ButtonVariant, string> = {
  primary: [
    'bg-gradient-brand text-white font-semibold',
    'shadow-[0_2px_14px_rgba(91,140,255,0.40)]',
    'hover:shadow-[0_4px_22px_rgba(91,140,255,0.55)] hover:brightness-110',
    'active:brightness-95',
  ].join(' '),

  secondary: [
    'bg-gradient-cyan text-white font-semibold',
    'shadow-[0_2px_12px_rgba(0,212,255,0.3)]',
    'hover:shadow-[0_4px_20px_rgba(0,212,255,0.45)] hover:brightness-110',
  ].join(' '),

  ghost: [
    'font-medium',
    'bg-gray-100 text-gray-700 border border-gray-200',
    'hover:bg-gray-200 hover:border-gray-300',
    'dark:bg-white/8 dark:text-white/75 dark:border-white/10',
    'dark:hover:bg-white/14 dark:hover:border-white/18',
  ].join(' '),

  glass: [
    'font-medium',
    'bg-white text-gray-700 border border-gray-200 shadow-sm',
    'hover:bg-gray-50 hover:border-gray-300',
    'dark:bg-white/8 dark:text-white/80 dark:border-white/10',
    'dark:hover:bg-white/14 dark:hover:border-white/18',
  ].join(' '),

  outline: [
    'font-semibold bg-transparent',
    'text-brand border-2 border-brand/50',
    'hover:bg-brand/8 hover:border-brand',
  ].join(' '),

  danger: [
    'bg-gradient-rose text-white font-semibold',
    'shadow-[0_2px_12px_rgba(239,68,68,0.3)]',
    'hover:brightness-110 active:brightness-95',
  ].join(' '),

  success: [
    'bg-gradient-emerald text-white font-semibold',
    'shadow-[0_2px_12px_rgba(34,197,94,0.3)]',
    'hover:brightness-110 active:brightness-95',
  ].join(' '),
}

const sizeCls: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1    text-xs  rounded-lg',
  sm: 'px-3.5 py-1.5  text-xs  rounded-xl',
  md: 'px-5   py-2.5  text-sm  rounded-xl',
  lg: 'px-6   py-3    text-sm  rounded-xl',
  xl: 'px-7   py-3.5  text-base rounded-2xl',
}

export function Button({
  children,
  className,
  variant      = 'primary',
  size         = 'md',
  isLoading    = false,
  loadingLabel = 'Загрузка…',
  fullWidth    = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.975 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      disabled={disabled || isLoading}
      className={cn(
        'relative inline-flex items-center justify-center gap-2',
        'cursor-pointer transition-all duration-200 select-none',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-1',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
        fullWidth && 'w-full',
        variantCls[variant],
        sizeCls[size],
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 size={15} className="animate-spin shrink-0" />
          <span>{loadingLabel}</span>
        </>
      ) : children}
    </motion.button>
  )
}
