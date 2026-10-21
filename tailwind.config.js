/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blush: {
          50: '#fff5f7',
          100: '#ffe4ea',
          200: '#fecdd7',
          300: '#fda4b8',
          400: '#fb7193',
          500: '#f43f6e', // main pink
          600: '#e11d59',
          700: '#be1248',
          800: '#9f123e',
          900: '#841338',
        }
      }
    },
  },
  plugins: [],
}
