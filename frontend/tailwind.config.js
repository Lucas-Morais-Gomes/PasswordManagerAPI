/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#818cf8',
          DEFAULT: '#6366f1',
          dark: '#4f46e5',
        },
        dark: {
          bg: '#0f172a',
          card: 'rgba(30, 41, 59, 0.6)',
        }
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
      }
    },
  },
  plugins: [],
}
