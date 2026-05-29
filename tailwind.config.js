/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'gamer-bg': '#09090f',
        'gamer-purple': '#7c3aed',
        'gamer-red': '#dc2626',
        'gamer-purple-light': '#a78bfa',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(124, 58, 237, 0.4)',
        'glow-red': '0 0 12px rgba(220, 38, 38, 0.4)',
      },
    },
  },
  plugins: [],
}
