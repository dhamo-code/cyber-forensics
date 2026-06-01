/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        severity: {
          low: '#22c55e',
          medium: '#f59e0b',
          high: '#ef4444',
          critical: '#7c3aed',
        },
      },
    },
  },
  plugins: [],
}