/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B1F3A',
          50: '#F0F4F8',
          100: '#D9E2EC',
          800: '#102A43',
          900: '#0B1F3A',
          950: '#061224',
        },
        saffron: {
          DEFAULT: '#F26B21',
          50: '#FDF3ED',
          100: '#FBE4D5',
          500: '#F26B21',
          600: '#D95208',
          700: '#B03C02',
        },
        cream: {
          DEFAULT: '#FDFBF4',
          50: '#FFFFFF',
          100: '#FDFBF4',
          200: '#F7F3E3',
        },
        compliant: '#16A34A',
        violation: '#DC2626',
        warning: '#D97706',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
