import daisyui from "daisyui"
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx, js, jsx}',
    './components/**/*.{ts,tsx, js, jsx}',
    './app/**/*.{ts,tsx, js, jsx}',
    './src/**/*.{ts,tsx, js, jsx}',
	],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      padding: {
        'full': '100%'
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [ daisyui, require("@tailwindcss/typography") ],
  daisyui: {
    themes: [
      "light", "dark", "pastel", {
        retro: {
          primary: "#ffffff",
          "primary-focus": "#f26d9b",
          "primary-content": "#ffffff",
          secondary: "#f4b1c9",
          "secondary-focus": "#f26d9b",
          "secondary-content": "#ffffff",
          accent: "#f4b1c9",
          "accent-focus": "#f26d9b",
          "accent-content": "#ffffff",
          neutral: "#f4b1c9",
          "neutral-focus": "#f26d9b",
          "neutral-content": "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#f4b1c9",
          "base-300": "#f4b1c9",
          "base-content": "#000000",
          info: "#f4b1c9",
          success: "#f4b1c9",
          warning: "#f4b1c9",
          error: "#f4b1c9",
      }
    }
    ],
    lightTheme: "light"
  }
} satisfies Config

export default config