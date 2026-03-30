/**
 * UI Kit — Card
 *
 * Glass-morphism surface container. Three visual variants that automatically
 * adapt to light and dark mode using the centralized glass utility classes
 * defined in index.css.
 *
 * Usage:
 *   <Card variant="glass-bright" padding="lg" className="my-4">
 *     …content…
 *   </Card>
 */
import { cn } from '../components/shared/cn'

type CardVariant = 'glass' | 'glass-bright' | 'glass-card' | 'flat'
type CardPadding = 'none' | 'sm' | 'md' | 'lg'

interface CardProps {
  children:   React.ReactNode
  className?: string
  variant?:   CardVariant
  padding?:   CardPadding
  /** Accessible role / aria attrs forwarded to the outer div */
  [key: string]: unknown
}

const variantCls: Record<CardVariant, string> = {
  'glass':        'glass rounded-2xl',
  'glass-bright': 'glass-bright rounded-3xl',
  'glass-card':   'glass-card rounded-2xl',
  // Fallback: plain border card (no blur) — still uses design tokens
  'flat':         [
    'rounded-2xl border',
    'bg-white border-gray-200',
    'dark:bg-white/5 dark:border-white/8',
  ].join(' '),
}

const paddingCls: Record<CardPadding, string> = {
  none: '',
  sm:   'p-4',
  md:   'p-5 sm:p-6',
  lg:   'p-6 sm:p-8',
}

export function Card({
  children,
  className,
  variant = 'glass',
  padding = 'md',
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(variantCls[variant], paddingCls[padding], className)}
      {...rest}
    >
      {children}
    </div>
  )
}
