import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui'),],
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
} satisfies Config;
