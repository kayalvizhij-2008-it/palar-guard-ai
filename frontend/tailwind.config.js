/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#04100b',
          900: '#061811',
          850: '#0a241a',
          800: '#0f382a',
          700: '#144d3a',
          600: '#1a6b52',
          500: '#238a6a',
        },
        surface: {
          deep: '#071610',
          base: '#0c1f17',
          card: '#12271e',
          elevated: '#183327',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-highlight': 'rgba(16, 185, 129, 0.25)',
        },
        emerald: {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#059669',
        },
        ivory: {
          DEFAULT: '#fcfbf7',
          warm: '#f3f1ea',
          muted: '#d1dbd5',
        },
        stone: {
          DEFAULT: '#889890',
          muted: '#63756c',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Noto Sans Tamil"', 'system-ui', 'sans-serif'],
        serif: ['"Cormorant Garamond"', '"Noto Sans Tamil"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'forest-sm': '0 2px 8px rgba(0, 0, 0, 0.35)',
        'forest-md': '0 8px 24px rgba(4, 16, 11, 0.45)',
        'forest-lg': '0 16px 36px rgba(4, 16, 11, 0.65)',
        'emerald-glow': '0 0 20px rgba(16, 185, 129, 0.15)',
      }
    },
  },
  plugins: [],
}
