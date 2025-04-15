/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'company': {
          'teal': '#64a4a4',
          'lime': '#b5c848',
          'sky': '#a9d8f4',
          'turquoise': '#459298',
        }
      }
    },
  },
  plugins: [],
}