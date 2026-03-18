/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      colors: {
        // Core design system
        brand: '#5B8CFF',
        'brand-purple': '#7C5CFF',
        'brand-cyan': '#00D4FF',

        surface: {
          0: '#0B0F1A',
          1: '#111827',
          2: '#1a2235',
          3: '#1e2a40',
          border: 'rgba(255,255,255,0.07)',
          'border-bright': 'rgba(255,255,255,0.15)',
        },
        text: {
          primary: 'rgba(255,255,255,1)',
          secondary: 'rgba(255,255,255,0.7)',
          muted: 'rgba(255,255,255,0.4)',
        },
        status: {
          new: '#5B8CFF',
          progress: '#F59E0B',
          received: '#7C5CFF',
          completed: '#22C55E',
          cancelled: '#EF4444',
        },
      },
      backgroundImage: {
        // Animated gradient layers
        'app-dark': 'linear-gradient(135deg, #0B0F1A 0%, #0f1628 40%, #130d1f 70%, #0B0F1A 100%)',
        'app-light': 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 40%, #f4f0ff 70%, #f0f4ff 100%)',

        // Brand gradients
        'gradient-brand': 'linear-gradient(135deg, #5B8CFF 0%, #7C5CFF 100%)',
        'gradient-brand-h': 'linear-gradient(90deg, #5B8CFF 0%, #7C5CFF 100%)',
        'gradient-cyan': 'linear-gradient(135deg, #00D4FF 0%, #5B8CFF 100%)',
        'gradient-violet': 'linear-gradient(135deg, #7C5CFF 0%, #5B8CFF 100%)',
        'gradient-emerald': 'linear-gradient(135deg, #22C55E 0%, #16a34a 100%)',
        'gradient-amber': 'linear-gradient(135deg, #F59E0B 0%, #d97706 100%)',
        'gradient-rose': 'linear-gradient(135deg, #EF4444 0%, #dc2626 100%)',

        // Mesh overlays
        'mesh-brand': `
          radial-gradient(ellipse at 0% 0%, rgba(91,140,255,0.15) 0px, transparent 60%),
          radial-gradient(ellipse at 100% 100%, rgba(124,92,255,0.12) 0px, transparent 60%),
          radial-gradient(ellipse at 100% 0%, rgba(0,212,255,0.08) 0px, transparent 50%),
          radial-gradient(ellipse at 0% 100%, rgba(124,92,255,0.08) 0px, transparent 50%)
        `,
        'mesh-light': `
          radial-gradient(ellipse at 0% 0%, rgba(91,140,255,0.2) 0px, transparent 50%),
          radial-gradient(ellipse at 100% 100%, rgba(124,92,255,0.15) 0px, transparent 50%),
          radial-gradient(ellipse at 100% 0%, rgba(0,212,255,0.12) 0px, transparent 50%)
        `,

        // Glass shimmer
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
      },
      boxShadow: {
        // Glow effects
        'glow-brand': '0 0 24px rgba(91,140,255,0.5), 0 0 48px rgba(91,140,255,0.2)',
        'glow-brand-sm': '0 0 12px rgba(91,140,255,0.4)',
        'glow-purple': '0 0 24px rgba(124,92,255,0.5), 0 0 48px rgba(124,92,255,0.2)',
        'glow-cyan': '0 0 20px rgba(0,212,255,0.4)',
        'glow-emerald': '0 0 20px rgba(34,197,94,0.4)',
        'glow-rose': '0 0 20px rgba(239,68,68,0.4)',
        'glow-amber': '0 0 20px rgba(245,158,11,0.35)',

        // Surface shadows
        'glass': '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
        'glass-lg': '0 16px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        'panel': '0 4px 20px rgba(0,0,0,0.25)',
        'card': '0 2px 12px rgba(0,0,0,0.2)',
        'input-focus': '0 0 0 3px rgba(91,140,255,0.35)',
        'input-focus-error': '0 0 0 3px rgba(239,68,68,0.35)',
      },
      animation: {
        'gradient-shift': 'gradientShift 8s ease infinite',
        'gradient-pulse': 'gradientPulse 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'typing': 'typing 1.4s ease-in-out infinite',
        'bounce-subtle': 'bounceDot 1.4s ease-in-out infinite',
        'slide-up': 'slideUp 0.2s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        gradientPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        typing: {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '30%': { transform: 'translateY(-6px)', opacity: '1' },
        },
        bounceDot: {
          '0%, 80%, 100%': { transform: 'scale(0.8)', opacity: '0.5' },
          '40%': { transform: 'scale(1.2)', opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      transitionDuration: {
        '150': '150ms',
        '250': '250ms',
      },
    },
  },
  plugins: [],
}
