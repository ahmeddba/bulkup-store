// tailwind.config.ts
import type { Config } from "tailwindcss"
import animate from "tailwindcss-animate"

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx,mdx}",
    "./src/components/**/*.{ts,tsx,mdx}",
    "./src/lib/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1200px" },
    },
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",

        card: "hsl(var(--card) / <alpha-value>)",
        cardForeground: "hsl(var(--card-foreground) / <alpha-value>)",

        popover: "hsl(var(--popover) / <alpha-value>)",
        popoverForeground: "hsl(var(--popover-foreground) / <alpha-value>)",

        primary: "hsl(var(--primary) / <alpha-value>)",
        primaryForeground: "hsl(var(--primary-foreground) / <alpha-value>)",

        muted: "hsl(var(--muted) / <alpha-value>)",
        mutedForeground: "hsl(var(--muted-foreground) / <alpha-value>)",

        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
      },
      borderRadius: {
        lg: "var(--radius)",
      },
      boxShadow: {
        "glow-yellow": "0 0 20px rgba(242, 208, 13, 0.25)",
        "glow-yellow-strong": "0 8px 30px rgba(242, 208, 13, 0.28)",
      },
    },
  },
  plugins: [animate],
}

export default config
