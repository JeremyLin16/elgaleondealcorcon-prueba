import type { Config } from "tailwindcss";
import { THEME } from "./lib/theme";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: THEME,
      // CSS variables set by next/font in app/fonts.ts.
      fontFamily: {
        display: ["var(--font-display)", "Times New Roman", "serif"],
        text: ["var(--font-text)", "Georgia", "serif"],
        label: ["var(--font-label)", "Helvetica Neue", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
