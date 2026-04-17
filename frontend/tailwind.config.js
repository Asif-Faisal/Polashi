/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nawab: {
          light: '#fef08a', // yellow-200
          DEFAULT: '#eab308', // yellow-500
          dark: '#a16207', // yellow-800
        },
        eic: {
          light: '#fca5a5', // red-300
          DEFAULT: '#ef4444', // red-500
          dark: '#991b1b', // red-800
        },
        primary: {
          DEFAULT: '#6366f1', // indigo-500
          dark: '#4f46e5', // indigo-600
        }
      }
    },
  },
  plugins: [],
}
