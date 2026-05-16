/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['Clash Display', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        sans:    ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        'eld-navy':  '#0a1628',
        'eld-amber': '#f5c518',
        'eld-blue':  '#2563eb',
      },
      screens: { xs: '480px' },
    },
  },
  plugins: [],
}