/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Base backgrounds - Deep Navy
        base: {
          DEFAULT: '#0a0f1c',
          100: '#0f1629',
          200: '#151d32',
          300: '#1a2540',
          400: '#1e293b',
          500: '#243044',
        },
        // Primary accent - Orange (lighter, consistent #fb923c)
        primary: {
          DEFAULT: '#fb923c',
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#fb923c',
          600: '#f97316',
          700: '#ea580c',
          800: '#c2410c',
          900: '#9a3412',
          muted: 'rgba(251, 146, 60, 0.15)',
        },
        // Semantic: Safe/Success
        safe: {
          DEFAULT: '#22c55e',
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          muted: 'rgba(34, 197, 94, 0.12)',
        },
        // Semantic: Warning
        warning: {
          DEFAULT: '#f59e0b',
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          muted: 'rgba(245, 158, 11, 0.12)',
        },
        // Semantic: Danger/Error
        danger: {
          DEFAULT: '#ef4444',
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          muted: 'rgba(239, 68, 68, 0.12)',
        },
        // Text colors (using slate)
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      animation: {
        'scan': 'scan 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-status': 'pulse-status 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'spinner': 'spinner 0.8s linear infinite',
        'bracket-pulse': 'bracket-pulse 2s ease-in-out infinite',
        'map-pulse': 'map-pulse 2s ease-out infinite',
        'badge-pulse': 'badge-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': { top: '0%', opacity: '0.8' },
          '50%': { top: 'calc(100% - 2px)', opacity: '0.6' },
        },
        'pulse-status': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        spinner: {
          to: { transform: 'rotate(360deg)' },
        },
        'bracket-pulse': {
          '0%, 100%': { borderColor: '#fb923c', opacity: '0.8' },
          '50%': { borderColor: '#fdba74', opacity: '1' },
        },
        'map-pulse': {
          '0%': { transform: 'scale(0.5)', opacity: '0.8' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        'badge-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.4)' },
          '50%': { boxShadow: '0 0 0 6px rgba(239, 68, 68, 0)' },
        },
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
        'md': '0 4px 12px rgba(0, 0, 0, 0.4)',
        'lg': '0 8px 24px rgba(0, 0, 0, 0.5)',
        'xl': '0 16px 48px rgba(0, 0, 0, 0.6)',
      },
      borderRadius: {
        'sm': '6px',
        'DEFAULT': '8px',
        'md': '10px',
        'lg': '12px',
        'xl': '16px',
      },
    },
  },
  plugins: [],
}
