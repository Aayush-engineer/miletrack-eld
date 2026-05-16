/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Prefix with 'eld-' to avoid clashing with Tailwind built-ins like amber/navy
        'eld-navy':   '#0f1c35',
        'eld-amber':  '#f5c518',
        'eld-blue':   '#1e6eb5',
        'eld-green':  '#10b981',
        'eld-red':    '#ef4444',
        'eld-orange': '#f97316',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        mono:    ['DM Mono', 'monospace'],
      },
      screens: {
        xs: '480px',
      },
    },
  },
  plugins: [],
}