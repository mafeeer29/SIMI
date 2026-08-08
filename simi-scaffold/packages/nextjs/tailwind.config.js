/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './styles/**/*.{css}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef2ff',
          100: '#dfe7ff',
          200: '#c7d4ff',
          300: '#9db1ff',
          400: '#7390ff',
          500: '#4a71ff',
          600: '#2f59e0',
          700: '#2445b8',
          800: '#1a356f',
          900: '#13244d',
          950: '#0b1731',
        },
      },
      boxShadow: {
        card: '0 24px 80px -24px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.04)',
      },
    },
  },
  plugins: [],
};
