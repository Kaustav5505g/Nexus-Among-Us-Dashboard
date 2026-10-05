/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#070a13',
          900: '#0b0f19',
          800: '#131b2e',
          700: '#1e2942',
        },
        impostor: {
          red: '#ff1a53',
          glow: '#ff003c',
        },
        crew: {
          cyan: '#00f0ff',
          lime: '#10b981',
          gold: '#fbbf24',
        }
      },
      fontFamily: {
        mono: ['Fira Code', 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'spin 4s linear infinite',
      }
    },
  },
  plugins: [],
}
