/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: '#0F9E99',
          50: '#E1F5F4',
          100: '#B3E6E5',
          200: '#80D4D2',
          500: '#0F9E99',
          600: '#0C827E',
          700: '#0A6663',
          800: '#074C4A',
          900: '#053331',
          950: '#031F1D',
        },
        ivory: {
          DEFAULT: '#EFE9E0',
          50: '#FDFCF9',
          100: '#F6F2EC',
          200: '#EFE9E0',
          300: '#E2D6C6',
        },
        compliant: '#16A34A',
        violation: '#DC2626',
        warning: '#D97706',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
