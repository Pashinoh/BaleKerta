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
        ink: {
          950: "#0E0D0C", // Canvas background
          900: "#151311", // Card & surface background
          800: "#1D1A17", // Elevated cards & hover
          700: "#2A2622", // Borders & separators
          600: "#3A352F", // Subtle dividers & disabled
          500: "#524C44",
        },
        bone: {
          100: "#EDE7DA", // Primary text, solid buttons, sacred zone line
          200: "#DDD6C7",
          400: "#A39B8B", // Secondary text, inactive states
          500: "#827B6E",
        },
        clay: {
          DEFAULT: "#D2603F", // Exclusively for violations / issues
          500: "#D2603F",
          600: "#B84E30",
          400: "#DF7B5D",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "6px",
        lg: "8px",
      },
    },
  },
  plugins: [],
};
export default config;
