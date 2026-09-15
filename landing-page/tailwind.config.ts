import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0071E3",
          light: "rgba(0, 113, 227, 0.1)",
          dark: "#005EC2",
        },
        success: "#1A7E3A",
        warning: "#FF9F0A",
        danger: "#D92D20",
      },
      fontFamily: {
        display: ["Inter", "Arial", "sans-serif"],
        body: ["Inter", "Arial", "sans-serif"],
        mono: ["ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;