/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Bio-Glass Agri Palette
        emerald: {
          deep: '#064E3B',     // primary brand
          DEFAULT: '#065F46',
          mid: '#047857',
          bright: '#059669',
        },
        mint: {
          DEFAULT: '#10B981',  // accent
          light: '#34D399',
          pale: '#A7F3D0',
        },
        alabaster: '#F4F7F4',  // page background
        amber: {
          DEFAULT: '#F59E0B',  // warnings
          light: '#FDE68A',
          dark: '#B45309',
        },
        coral: {
          DEFAULT: '#EF4444',  // alerts / critical
          light: '#FCA5A5',
          dark: '#B91C1C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(6, 78, 59, 0.15)',
        'glass-lg': '0 16px 48px 0 rgba(6, 78, 59, 0.20)',
        'glass-sm': '0 4px 16px 0 rgba(6, 78, 59, 0.10)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in':    'fadeIn 0.35s ease-out',
        'slide-up':   'slideUp 0.40s cubic-bezier(0.16,1,0.3,1)',
        'slide-down': 'slideDown 0.35s ease-out',
        'pulse-soft': 'pulseSoft 2.5s ease-in-out infinite',
        'spin-slow':  'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 },                   to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(24px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideDown: { from: { opacity: 0, transform: 'translateY(-16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseSoft: {
          '0%, 100%': { opacity: 1 },
          '50%':      { opacity: 0.6 },
        },
      },
    },
  },
  plugins: [],
}
