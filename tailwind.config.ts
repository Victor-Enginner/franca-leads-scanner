import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#04070a",
        "void-2": "#070d14",
        panel: "#0a141e",
        grid: "#0e2436",
        cyan: "#00f0ff",
        "cyan-dim": "#0a8a95",
        magenta: "#ff2e97",
        amber: "#ffb800",
        lime: "#7dff5c",
        "text-primary": "#cfeef5",
        "text-dim": "#4a6f7d",
        danger: "#ff3b5c",
      },
      fontFamily: {
        display: ["var(--font-orbitron)", "sans-serif"],
        body: ["var(--font-rajdhani)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
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
