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
        accent: {
          cyan: "#00d4ff",
          yellow: "#ffd600",
          green: "#00d46a",
          red: "#ff3b30",
          purple: "#af52de",
          grey: "#a0a0a0",
        },
        bg: {
          dark: "#0F1419",
          panel: "rgba(20, 30, 45, 0.95)",
        },
        border: "rgba(0, 206, 209, 0.15)",
        "text-muted": "#7C8490",
      },
    },
  },
  plugins: [],
};

export default config;
