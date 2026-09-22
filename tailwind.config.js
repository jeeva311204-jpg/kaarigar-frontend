/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#FDFBF7',   // clean parchment base
          100: '#F9F5EC',  // soft parchment
          200: '#F4EFE6',  // card / container surface
          300: '#E8DEC8',  // border / subtle divider
          400: '#D8CAA8',  // muted accent
          500: '#B8A682',
        },
        indigo: {
          50: '#F0F4FA',
          100: '#DEE7F4',
          700: '#2A3F64',
          800: '#20314F',
          900: '#16233B',  // deep indigo brand structure
          950: '#0E1727',  // dark night indigo
        },
        terracotta: {
          50: '#FDF4F1',
          100: '#FCE7E0',
          200: '#F7C4B4',
          300: '#EE9B81',
          400: '#E07A5F',
          500: '#C25E3E',  // primary earthen clay accent
          600: '#A84A2C',  // rich baked terracotta
          700: '#893A21',
          800: '#6F301B',
        },
        turmeric: {
          50: '#FEF9EC',
          100: '#FDF2D1',
          200: '#FCE39E',
          400: '#F59E0B',
          500: '#D97706',  // warm raw turmeric gold
          600: '#B45309',
          700: '#92400E',
        },
        clay: {
          muted: '#8C7A6B',
          dark: '#4A3E36',
          light: '#EAE3DA'
        },
        paper2: '#F4EFE6',
        ink: '#0E1727',
        inkSoft: '#5A6275',
        indigoDeep: '#16233B',
        terracottaDeep: '#A84A2C',
        thread: '#D8CAA8'
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Work Sans"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'craft': '0 4px 20px -2px rgba(22, 35, 59, 0.06), 0 2px 6px -1px rgba(194, 94, 62, 0.04)',
        'craft-md': '0 8px 30px -4px rgba(22, 35, 59, 0.10), 0 4px 10px -2px rgba(194, 94, 62, 0.08)',
        'craft-lg': '0 16px 40px -6px rgba(22, 35, 59, 0.14), 0 8px 18px -4px rgba(194, 94, 62, 0.12)',
        'tactile': '0 3px 0 0 #A84A2C',
        'tactile-indigo': '0 3px 0 0 #0E1727',
      }
    },
  },
  plugins: [],
}
