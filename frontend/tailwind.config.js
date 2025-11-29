/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'xrpl-blue': '#0066CC',
        'impact-green': '#10B981',
      },
    },
  },
  plugins: [],
}
