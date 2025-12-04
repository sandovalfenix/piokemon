import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        shake: 'shake 0.5s ease-in-out',
        'shake-once': 'shake 0.5s ease-in-out 1',
        'shake-twice': 'shake 0.5s ease-in-out 2',
        'shake-thrice': 'shake 0.5s ease-in-out 3',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-20deg)' },
          '75%': { transform: 'rotate(20deg)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config

