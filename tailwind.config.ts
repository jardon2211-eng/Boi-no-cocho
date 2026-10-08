import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7ec",
          100: "#dcedd0",
          400: "#6e9a5e",
          500: "#4c7a3e",
          600: "#3a6030",
          700: "#2e4c2e",
          900: "#1f3d14",
        },
      },
    },
  },
  plugins: [],
};
export default config;
