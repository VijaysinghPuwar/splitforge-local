import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0f1117",
        surface: "#161b27",
        "surface-2": "#1e2535",
        border: "#2a3347",
        "border-hover": "#3a4560",
        accent: "#6366f1",
        "accent-hover": "#818cf8",
        "accent-dim": "rgba(99,102,241,0.12)",
        success: "#22c55e",
        error: "#ef4444",
        warning: "#f59e0b",
        "text-primary": "#e8eaf0",
        "text-secondary": "#8892a4",
        "text-dim": "#4a5568",
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
