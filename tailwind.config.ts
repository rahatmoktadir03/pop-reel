import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          pink:    "#ec4899",
          rose:    "#f43f5e",
          purple:  "#a855f7",
          cyan:    "#06b6d4",
        },
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
        "gradient-cool":  "linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)",
        "gradient-warm":  "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
      },
      boxShadow: {
        "pink-glow":  "0 0 20px rgba(236,72,153,0.4), 0 0 60px rgba(236,72,153,0.15)",
        "cyan-glow":  "0 0 20px rgba(6,182,212,0.4)",
        "card":       "0 8px 32px rgba(0,0,0,0.5)",
        "card-hover": "0 16px 48px rgba(0,0,0,0.7)",
      },
      animation: {
        "float-slow": "floatY 3s ease-in-out infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "spin-slow":  "spin 3s linear infinite",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
