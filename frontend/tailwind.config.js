/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef2fb",
          100: "#dbe4f7",
          200: "#b8c9ee",
          300: "#8aa6e0",
          400: "#5a7fd0",
          500: "#3a5fbf",
          600: "#2b4699",
          700: "#1f3478",
          800: "#162659",
          900: "#0f1c42",
          950: "#0a1430",
        },
        sky: {
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 10px -2px rgba(15, 28, 66, 0.08), 0 4px 24px -4px rgba(15, 28, 66, 0.06)",
        glow: "0 0 0 1px rgba(56, 189, 248, 0.25), 0 8px 32px -8px rgba(56, 189, 248, 0.25)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
