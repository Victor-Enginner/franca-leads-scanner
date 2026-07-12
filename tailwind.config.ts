import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#090909",
        "void-2": "#111111",
        panel: "#171717",
        grid: "#2a2a2a",
        cyan: "#f5f5f5",
        "cyan-dim": "#a3a3a3",
        magenta: "#d4d4d4",
        amber: "#e5e5e5",
        lime: "#d4d4d4",
        "text-primary": "#fafafa",
        "text-dim": "#a3a3a3",
        danger: "#d4d4d4",
      },
      fontFamily: {
        display: ["Arial", "sans-serif"],
        body: ["Arial", "sans-serif"],
        mono: ["ui-monospace", "monospace"],
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        btnsweep: {
          to: { left: "200%" },
        },
        spin360: {
          to: { transform: "rotate(360deg)" },
        },
        targetIn: {
          to: { opacity: "1", transform: "translateX(0)" },
        },
        fadeLn: {
          to: { opacity: "1" },
        },
      },
      animation: {
        blink: "blink 1.4s infinite",
        "blink-slow": "blink 2s infinite",
        btnsweep: "btnsweep 1.2s infinite",
        "spin-slow": "spin360 24s linear infinite",
        "spin-rev": "spin360 16s linear infinite reverse",
        "target-in": "targetIn .4s forwards",
        "fade-ln": "fadeLn .3s forwards",
      },
    },
  },
  plugins: [],
};

export default config;
