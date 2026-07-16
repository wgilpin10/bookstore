import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf8f3",
          100: "#f9ede0",
          200: "#f2d9bd",
          300: "#e8bf94",
          400: "#dd9f68",
          500: "#d4834a",
          600: "#c66d3f",
          700: "#a55535",
          800: "#844531",
          900: "#6c3a2b",
          950: "#3a1c14",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
