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
        // Deep Ink Canvas Palette
        ink: {
          950: "#0E0D0C", // Deep background canvas
          900: "#151311", // Card & surface background
          850: "#191614",
          800: "#1D1A17", // Elevated cards & components
          700: "#2A2622", // Borders & separators
          600: "#3A352F", // Dividers & subtle strokes
          500: "#524C44",
        },
        // Bone Precision Typography & Accents
        bone: {
          100: "#EDE7DA", // Primary text, solid buttons, sacred lines
          200: "#DDD6C7", // Hovered buttons, secondary highlights
          300: "#C4BCAB",
          400: "#A39B8B", // Secondary text, inactive states
          500: "#827B6E",
        },
        // Clay: Exclusively for Violations & Critical Alerts
        clay: {
          DEFAULT: "#D2603F",
          600: "#B84E30",
          500: "#D2603F",
          400: "#DF7B5D",
          300: "#ECA590",
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
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
        dock: "0 -4px 24px -2px rgba(0, 0, 0, 0.65)",
      },
    },
  },
  plugins: [],
};
export default config;
