/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nikah: {
          green: "#1F4A36",
          darkGreen: "#163828",
          deepGreen: "#0F261B",
          lightGreen: "#2B6349",
          cream: "#F3EFE6",
          warmCream: "#F5E9C8",
          cardBg: "#FAF7EF",
          borderCream: "#D9CDB8",
          brown: "#5A3D1A",
          darkBrown: "#3B2711",
          maroon: "#7A1414",
          goldDark: "#8a6d2f",
          goldLight: "#e6d08f",
          goldPrimary: "#c59d45",
          silverTop: "#f5f5f5",
          silverBottom: "#c0c0c0",
        }
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        tamil: ['"Noto Sans Tamil"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 12px -2px rgba(0, 0, 0, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.08)',
        'emboss': 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 2px 4px rgba(0, 0, 0, 0.25)',
        'gold': 'inset 0 1px 1px rgba(255, 255, 255, 0.7), 0 2px 4px rgba(70, 50, 10, 0.35)',
        'gold-active': 'inset 0 2px 4px rgba(50, 35, 5, 0.4), 0 1px 2px rgba(0,0,0,0.2)',
      }
    },
  },
  plugins: [],
}
