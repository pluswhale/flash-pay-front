import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from './cn'

type CardVariant = 'default' | 'elevated' | 'subtle' | 'inset' | 'highlight'

interface GlassCardProps extends HTMLMotionProps<'div'> {
  variant?: CardVariant
  noPadding?: boolean
  glow?: 'brand' | 'cyan' | 'emerald' | 'rose' | 'amber' | false
}

const variantStyles: Record<CardVariant, string> = {
  // Light: white card / Dark: deep glass panel
  default: 'glass-card rounded-3xl',

  // Light: bright white elevated / Dark: bright glass
  elevated: 'glass-bright rounded-3xl',

  // Light: very subtle / Dark: faint overlay
  subtle: [
    'rounded-3xl border',
    'bg-white/70 border-gray-100 shadow-sm',
    'dark:bg-white/4 dark:border-white/6',
  ].join(' '),

  // Light: inset well / Dark: darker inset
  inset: [
    'rounded-2xl border',
    'bg-gray-50 border-gray-200',
    'dark:bg-black/25 dark:border-white/6',
  ].join(' '),

  // Branded tint — works in both themes
  highlight: [
    'rounded-3xl border',
    'bg-blue-50 border-blue-100',
    'dark:bg-[#5B8CFF]/8 dark:border-[#5B8CFF]/20 dark:shadow-glass',
  ].join(' '),
}

const glowStyles = {
  brand:   'dark:shadow-glow-brand',
  cyan:    'dark:shadow-glow-cyan',
  emerald: 'dark:shadow-glow-emerald',
  rose:    'dark:shadow-glow-rose',
  amber:   'dark:shadow-glow-amber',
}

export function GlassCard({
  children,
  className,
  variant = 'default',
  noPadding = false,
  glow = false,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        !noPadding && 'p-5 sm:p-6',
        variantStyles[variant],
        glow && glowStyles[glow],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}
