import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        surface: "#111111",
        "surface-2": "#1a1a1a",
        foreground: "#f5f0e8",
        muted: "#a89f94",
        accent: {
          DEFAULT: "#8B1A1A",
          hover: "#a01f1f",
          foreground: "#f5f0e8",
        },
        gold: "#c9a84c",
        border: "#2a2a2a",
        input: "#1a1a1a",
        ring: "#8B1A1A",
        card: {
          DEFAULT: "#111111",
          foreground: "#f5f0e8",
        },
        popover: {
          DEFAULT: "#111111",
          foreground: "#f5f0e8",
        },
        primary: {
          DEFAULT: "#8B1A1A",
          foreground: "#f5f0e8",
        },
        secondary: {
          DEFAULT: "#1a1a1a",
          foreground: "#a89f94",
        },
        destructive: {
          DEFAULT: "#7f1d1d",
          foreground: "#f5f0e8",
        },
        muted: {
          DEFAULT: "#1a1a1a",
          foreground: "#a89f94",
        },
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
        inter: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "0.375rem",
        md: "0.25rem",
        sm: "0.125rem",
      },
    },
  },
  plugins: [],
};

export default config;
