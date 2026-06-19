/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: "#f0f4f8",
          100: "#d9e2ec",
          200: "#bcccdc",
          300: "#9fb3c8",
          400: "#829ab1",
          500: "#627d98",
          600: "#486581",
          700: "#334e68",
          800: "#243b53",
          900: "#102a43",
        },
        accent: {
          50: "#fff1f0",
          100: "#ffd9d6",
          200: "#ffb3ad",
          300: "#ff8a80",
          400: "#ff6b5f",
          500: "#e63946",
          600: "#c62828",
          700: "#a01f25",
          800: "#7a181d",
          900: "#551014",
        },
        gold: {
          50: "#fdf8f0",
          100: "#f6e6cf",
          200: "#edd1aa",
          300: "#e2b985",
          400: "#d4a574",
          500: "#c08a58",
          600: "#a06f42",
          700: "#7d5632",
          800: "#5a3d23",
          900: "#3d2917",
        },
        paper: "#faf8f5",
        ink: "#2d2d2d",
      },
      fontFamily: {
        serif: ['"Source Serif Pro"', 'Georgia', 'Cambria', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 165, 116, 0.7)' },
          '50%': { boxShadow: '0 0 0 12px rgba(212, 165, 116, 0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
