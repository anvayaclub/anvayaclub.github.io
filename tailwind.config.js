/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        plum: {
          50: '#F5F3F8',
          100: '#EBE6F1',
          200: '#D5C9E1',
          300: '#BAA5CD',
          400: '#9B7DB4',
          500: '#7E5A9B',
          600: '#644280',
          700: '#4D3064',
          800: '#341F45',
          850: '#231331',
          900: '#190B24',
          950: '#0E0515',
        },
        ivory: {
          50: '#FDFBF7',
          100: '#F7F3EB',
          200: '#ECE4D4',
          300: '#DFD2BC',
          400: '#CCB997',
          500: '#B59E75',
          600: '#947D55',
          700: '#735F3C',
          800: '#524328',
          900: '#2D2415',
        },
        gold: {
          50: '#FDF9EC',
          100: '#F9F0D2',
          200: '#F2DF9F',
          300: '#E8CA66',
          400: '#DCB235',
          500: '#C9981B',
          600: '#A77712',
          700: '#83570F',
          800: '#674112',
          900: '#4F3112',
        },
        saffron: {
          500: '#E26D28',
          600: '#C65615',
          700: '#A13F0D',
        },
        peacock: {
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
