/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          DEFAULT: '#E8792C',
          light: '#ff9c57',
          dark: '#c45d14',
        },
        maroon: {
          DEFAULT: '#7A2036',
          light: '#a1354e',
          dark: '#541221',
        },
        cream: {
          DEFAULT: '#FFF8F0',
          dark: '#F3E8DB',
        },
        charcoal: {
          DEFAULT: '#2B1B12',
        }
      },
      fontFamily: {
        sans: ['var(--font-primary)', 'sans-serif'],
        heading: ["'Baloo 2'", 'sans-serif'],
        body: ["'Noto Sans Devanagari'", "'Baloo 2'", 'sans-serif'],
        quicksand: ['var(--font-quicksand)', 'serif'],
        caveat: ['var(--font-caveat)', 'serif'],
      },
      borderRadius: {
        'card': '16px',
        'card-lg': '20px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(122, 32, 54, 0.08)',
        'soft-lg': '0 10px 30px -5px rgba(122, 32, 54, 0.12)',
      }
    },
  },
  plugins: [],
}
