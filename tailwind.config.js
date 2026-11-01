/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#d6e0fd',
          300: '#b3c7fc',
          400: '#8ba6f8',
          500: '#6380f3',
          600: '#435eeb',
          700: '#3447d9',
          800: '#2c3ab0',
          900: '#28348c',
          950: '#1b2157',
        },
        dark: {
          bg: '#090b10',
          card: '#0f141f',
          cardHover: '#141b2a',
          border: '#1e293b',
          subtle: '#151b28',
          muted: '#94a3b8',
        }
      },
      boxShadow: {
        glow: '0 0 25px -5px rgba(99, 102, 241, 0.25)',
        glowEmerald: '0 0 25px -5px rgba(16, 185, 129, 0.25)',
        glowAmber: '0 0 25px -5px rgba(245, 158, 11, 0.25)',
        glowRose: '0 0 25px -5px rgba(244, 63, 94, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
