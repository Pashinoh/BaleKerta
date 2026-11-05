import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Semantic Dual-Theme Surface Palette (Dark Obsidian Ink <-> Soft Warm Lontar Paper)
        ink: {
          950: "rgb(var(--ink-950) / <alpha-value>)",
          900: "rgb(var(--ink-900) / <alpha-value>)",
          850: "rgb(var(--ink-850) / <alpha-value>)",
          800: "rgb(var(--ink-800) / <alpha-value>)",
          700: "rgb(var(--ink-700) / <alpha-value>)",
          600: "rgb(var(--ink-600) / <alpha-value>)",
          500: "rgb(var(--ink-500) / <alpha-value>)",
        },
        // Semantic Dual-Theme Typography & Contrast Palette
        bone: {
          100: "rgb(var(--bone-100) / <alpha-value>)",
          200: "rgb(var(--bone-200) / <alpha-value>)",
          300: "rgb(var(--bone-300) / <alpha-value>)",
          400: "rgb(var(--bone-400) / <alpha-value>)",
          500: "rgb(var(--bone-500) / <alpha-value>)",
        },
        // Bata Bali Terracotta: Exclusively for Spatial Violations & Kaja Vector Accent
        clay: {
          DEFAULT: "rgb(var(--clay-500) / <alpha-value>)",
          600: "rgb(var(--clay-600) / <alpha-value>)",
          500: "rgb(var(--clay-500) / <alpha-value>)",
          400: "rgb(var(--clay-400) / <alpha-value>)",
          300: "rgb(var(--clay-300) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "10px",
        xl: "12px",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        dock: "var(--shadow-dock)",
      },
    },
  },
  plugins: [],
};
export default config;
