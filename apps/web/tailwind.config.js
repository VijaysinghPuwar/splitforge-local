/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#0c0e14",
          card:    "#13161f",
          border:  "#1e2333",
          hover:   "#181c28",
        },
        brand: {
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      animation: {
        "fade-in":        "fadeIn 0.18s ease-out",
        "slide-up":       "slideUp 0.2s ease-out",
        "slide-in-right": "slideInRight 0.22s ease-out",
      },
      keyframes: {
        fadeIn:       { "0%": { opacity: "0" },                                "100%": { opacity: "1" } },
        slideUp:      { "0%": { opacity: "0", transform: "translateY(6px)" },  "100%": { opacity: "1", transform: "translateY(0)" } },
        slideInRight: { "0%": { opacity: "0", transform: "translateX(14px)" }, "100%": { opacity: "1", transform: "translateX(0)" } },
      },
    },
  },
  plugins: [],
};
