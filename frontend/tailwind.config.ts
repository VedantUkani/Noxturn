import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      keyframes: {
        reweaveEmphasis: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(45, 212, 191, 0)" },
          "50%": {
            boxShadow: "0 0 40px 4px rgba(45, 212, 191, 0.2)",
          },
        },
      },
      animation: {
        "reweave-emphasis": "reweaveEmphasis 2.4s ease-in-out 1",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        surface: {
          DEFAULT: "rgb(15 23 42)",
          raised: "rgb(30 41 59)",
          border: "rgb(51 65 85)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
